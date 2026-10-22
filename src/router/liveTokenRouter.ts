import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { systemPrompt } from '../GeminiAdapter/prompt.js';

const router = Router();

// POST /api/live/token
// Generates a short-lived ephemeral token for direct client-to-Gemini Live WebSocket connection
router.post('/token', async (req: Request, res: Response) => {
    try {
        const apiKey = process.env.GOOGLE_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: 'GOOGLE_API_KEY is not configured on the server' });
            return;
        }

        const model = process.env.GOOGLE_LIVE_API || 'gemini-3.1-flash-live-preview';
        const ai = new GoogleGenAI({ apiKey });

        const now = Date.now();
        // expireTime: 30 minutes from now (session lifespan)
        const expireTime = new Date(now + 30 * 60 * 1000).toISOString();
        // newSessionExpireTime: 1 minute window to initiate the WebSocket connection
        const newSessionExpireTime = new Date(now + 60 * 1000).toISOString();

        const token = await ai.authTokens.create({
            config: {
                uses: 1,
                expireTime,
                newSessionExpireTime,
                httpOptions: {
                    apiVersion: 'v1alpha'
                }
            }
        });

        res.status(200).json({
            token: token.name,
            model,
            systemPrompt
        });
    } catch (error: any) {
        console.error('Failed to generate ephemeral token:', error);
        res.status(500).json({
            error: 'Failed to generate ephemeral token',
            details: error?.message || String(error)
        });
    }
});

export default router;
