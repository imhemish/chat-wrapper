import { MongoClient } from "mongodb"

const uri = "mongodb+srv://hemish:0BggroGVBYEJhjPq@fuzzie-backend.w37k2.mongodb.net/?retryWrites=true&w=majority&appName=fuzzie-backend";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToDatabase() {
    if (!client.isConnected) {
        await client.connect();
    }
    return client.db("chatWrapper"); // Replace with your database name
}

export default connectToDatabase;