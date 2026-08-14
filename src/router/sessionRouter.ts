import { Router } from 'express';
import { runtimeService } from '../service/runtimeService.js';
import { Runtime } from '../runtime/Runtime.js';

const router = Router();

// POST /api/sessions/init
// Initializes an existing session into runtime memory
router.post('/init', async (req, res) => {
    try {
        const { userId, sessionId } = req.body;

        if (!userId || !sessionId) {
            res.status(400).json({ error: 'userId and sessionId are required' });
            return;
        }

        // getInstance loads from DB via loadSession and caches in memory
        const runtime = await Runtime.getInstance(userId, sessionId);
        console.log("Runtime after init:", runtime);
        res.status(200).json({ message: 'Session initialized', data: runtime });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/sessions/start
// Creates a new session with initialData
router.post('/start', async (req, res) => {
    try {
        const { userId, sessionId, initialData } = req.body as {
            userId: string;
            sessionId: string;
            initialData: {
                plantName: string;
                diseaseName?: string;
            };
        };

        if (!userId || !sessionId || !initialData || !initialData.plantName) {
            res.status(400).json({ error: 'userId, sessionId, and initialData.plantName are required' });
            return;
        }

        await runtimeService.startSessionWithNames(
            userId,
            sessionId,
            initialData.plantName,
            initialData?.diseaseName
        );

        // Load into memory
        await Runtime.getInstance(userId, sessionId);

        res.status(201).json({ message: 'Session started' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api/sessions
// Deletes a session from DB and memory
router.delete('/', async (req, res) => {
    try {
        const { userId, sessionId } = req.body;

        if (!userId || !sessionId) {
            res.status(400).json({ error: 'userId and sessionId are required in the body' });
            return;
        }

        // Delete from DB
        const deleted = await runtimeService.deleteSession(userId, sessionId);

        // Remove from memory
        Runtime.removeInstance(userId, sessionId);

        if (!deleted) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        res.status(200).json({ message: 'Session deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
