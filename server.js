const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Ensure unique filenames by adding timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept only .txt files
        if (path.extname(file.originalname) !== '.txt') {
            return cb(new Error('Only .txt files are allowed'));
        }
        cb(null, true);
    }
});

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// File upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ 
            success: false, 
            message: "No file uploaded" 
        });
    }
    res.json({ 
        success: true, 
        filename: req.file.filename,
        originalName: req.file.originalname 
    });
});

// Get list of uploaded files
app.get("/files", (req, res) => {
    fs.readdir(uploadsDir, (err, files) => {
        if (err) {
            console.error("Error reading uploads directory:", err);
            return res.status(500).json({ 
                success: false, 
                message: "Error reading files" 
            });
        }
        res.json(files.filter(file => path.extname(file) === '.txt'));
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});