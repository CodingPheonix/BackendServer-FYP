import { Router } from 'express';
import { runtimeService } from '../service/runtimeService.js';
import { Runtime } from '../runtime/Runtime.js';

const router = Router();

// POST /api/sessions/init
// Initializes an existing session into runtime memory
router.post('/init', async (req, res) => {
    try {
        const { userId, sessionId } = req.body;
        console.log(userId, sessionId);

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

// GET /api/sessions/check?plantName=...&diseaseName=...
// Validates if the plant and disease exist in database
router.get('/check', async (req, res) => {
    try {
        const plantName = (req.query.plantName as string || '').trim();
        const diseaseName = (req.query.diseaseName as string || '').trim();

        if (!plantName || !diseaseName) {
            res.status(400).json({ error: 'plantName and diseaseName query params are required' });
            return;
        }

        const { Crop } = await import('../model/Crop.js');
        const { Disease } = await import('../model/Disease.js');

        const crop = await Crop.findOne({ name: { $regex: new RegExp(`^${plantName}$`, 'i') } });
        if (!crop) {
            res.status(404).json({
                found: false,
                message: `We don't have information about the plant "${plantName}".`
            });
            return;
        }

        const disease = await Disease.findOne({
            cropId: crop._id,
            name: { $regex: new RegExp(`^${diseaseName}$`, 'i') }
        });

        if (!disease) {
            res.status(404).json({
                found: false,
                message: `We don't have information about "${diseaseName}" for plant "${plantName}".`
            });
            return;
        }

        res.status(200).json({
            found: true,
            crop: { id: crop._id, name: crop.name },
            disease: { id: disease._id, name: disease.name }
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/sessions/user/:userId
// Returns all sessions for a given user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const sessions = await runtimeService.getUserSessions(userId);
        res.status(200).json(sessions);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/sessions/suggestions
// Saves 3-5 suggestions with current date to session in DB and memory
router.post('/suggestions', async (req, res) => {
    try {
        const { userId, sessionId, suggestions } = req.body;
        if (!userId || !sessionId || !Array.isArray(suggestions)) {
            res.status(400).json({ error: 'userId, sessionId, and suggestions array are required' });
            return;
        }

        const updated = await runtimeService.addSessionSuggestions(userId, sessionId, suggestions);
        
        // Also update runtime in memory if active
        const runtime = await Runtime.getInstance(userId, sessionId);
        runtime.addSuggestions(suggestions);

        res.status(200).json({ message: 'Suggestions saved successfully', data: updated });
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
        const runtime = await Runtime.getInstance(userId, sessionId);

        res.status(201).json({ message: 'Session started', data: runtime });
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
