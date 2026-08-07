import mongoose from "mongoose";

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
