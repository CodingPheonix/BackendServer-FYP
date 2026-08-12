import 'dotenv/config';
import mongoose from "mongoose";
import { MongoClient } from "mongodb";

export const connectDatabase = async () => {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error("MONGO_URL environment variable is not defined");
    }

    try {
        await mongoose.connect(mongoUrl);
        console.log("Connected to MongoDB successfully.");
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

let ragMongoClient: MongoClient | null = null;

export const connectRAGDatabase = async () => {
    const mongoUrl = process.env.MONGO_URL_RAG;
    if (!mongoUrl) {
        throw new Error("MONGO_URL_RAG environment variable is not defined");
    }

    try {
        ragMongoClient = new MongoClient(mongoUrl);
        await ragMongoClient.connect();
        console.log("Connected to RAG MongoDB successfully.");
    } catch (error) {
        console.error("Failed to connect to RAG MongoDB:", error);
        process.exit(1);
    }
}

export const getRAGCollection = (collectionName: string) => {
    if (!ragMongoClient) {
        throw new Error("RAG MongoDB client not initialized");
    }
    return ragMongoClient.db().collection(collectionName);
}