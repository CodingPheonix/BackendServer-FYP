import { Router } from "express";
import { retrievalService } from "../service/RetrievalService.js";

const router = Router();

router.post("/", async (req, res) => {
    try {
        const { query, userId, sessionId } = req.body;

        if (!query || !userId || !sessionId) {
            return res.status(400).json({ error: "query, userId, and sessionId are required fields" });
        }

        const compressedContext = await retrievalService.processRetrieval(userId, sessionId, query);

        res.status(200).json({
            message: "Retrieval successful",
            context: compressedContext
        });
    } catch (error) {
        console.error("Retrieval router error:", error);
        res.status(500).json({ error: "An error occurred during retrieval" });
    }
});

export default router;
