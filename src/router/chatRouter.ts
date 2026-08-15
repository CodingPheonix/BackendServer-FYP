import { Router } from "express";
import { chatService } from "../service/chatService.js";

const router = Router();

router.get("/:userId/:sessionId", async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        if (!userId || !sessionId) {
            return res.status(400).json({ error: "userId and sessionId are required" });
        }

        const messages = await chatService.getHistory(userId, sessionId);
        res.status(200).json({ data: messages });
    } catch (error: any) {
        console.error("Chat router error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.delete("/:userId/:sessionId", async (req, res) => {
    try {
        const { userId, sessionId } = req.params;

        if (!userId || !sessionId) {
            return res.status(400).json({ error: "userId and sessionId are required" });
        }

        await chatService.clearHistory(userId, sessionId);
        res.status(200).json({ message: "Chat history cleared successfully" });
    } catch (error: any) {
        console.error("Chat delete error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
