import { Router, Request, Response } from 'express';
import { Runtime } from '../runtime/Runtime.js';
import { retrievalService } from '../service/RetrievalService.js';

const router = Router();

// POST /api/live/tools/execute
// Executes backend tools triggered by frontend GeminiLive wrapper
router.post('/execute', async (req: Request, res: Response) => {
    try {
        const { name, args, userId = 'default-user', sessionId = 'default-session' } = req.body;

        const effectiveUserId = args?.userId || userId;
        const effectiveSessionId = args?.sessionId || sessionId;

        let result: any = {};

        switch (name) {
            case 'fetch_rag_details': {
                const runtime = await Runtime.getInstance(effectiveUserId, effectiveSessionId);
                result = runtime.getRagDetails() || { status: 'No RAG details found.' };
                break;
            }
            case 'fetch_plant_details': {
                const runtime = await Runtime.getInstance(effectiveUserId, effectiveSessionId);
                result = runtime.getPlantDetails();
                break;
            }
            case 'fetch_plant_disease': {
                const runtime = await Runtime.getInstance(effectiveUserId, effectiveSessionId);
                result = { diseaseName: runtime.getDiseaseName() || 'Unknown' };
                break;
            }
            case 'fetch_userId_sessionId': {
                result = { userId: effectiveUserId, sessionId: effectiveSessionId };
                break;
            }
            case 'perform_rag_search': {
                const { query } = args || {};
                let ragContext = '';
                if (query) {
                    try {
                        await retrievalService.processRetrieval(effectiveUserId, effectiveSessionId, query);
                        const updatedRuntime = await Runtime.getInstance(effectiveUserId, effectiveSessionId);
                        ragContext = updatedRuntime.getRagDetails()?.context || '';
                    } catch (err) {
                        console.error('Background RAG error:', err);
                    }
                }
                result = {
                    status: 'success',
                    message: `RAG search completed for query "${query}".`,
                    query,
                    context: ragContext
                };
                break;
            }
            case 'fetch_past_sessions': {
                const runtime = await Runtime.getInstance(effectiveUserId, effectiveSessionId);
                const past = runtime.getPastSessions();
                result = {
                    hasPastSessions: past.length > 0,
                    pastSessionsCount: past.length,
                    pastSessions: past
                };
                break;
            }
            case 'save_session_suggestions': {
                const { suggestions } = args || {};
                if (Array.isArray(suggestions) && suggestions.length > 0) {
                    const { runtimeService } = await import('../service/runtimeService.js');
                    await runtimeService.addSessionSuggestions(effectiveUserId, effectiveSessionId, suggestions);

                    const runtime = await Runtime.getInstance(effectiveUserId, effectiveSessionId);
                    runtime.addSuggestions(suggestions);

                    result = {
                        status: 'success',
                        message: `${suggestions.length} suggestions saved.`
                    };
                } else {
                    result = { error: 'suggestions must be a non-empty array' };
                }
                break;
            }
            case 'close_consultation_session': {
                const farewell = args?.farewellMessage || "Thank you for your session. You can follow up in a 1-week interval. Take care!";
                result = {
                    status: 'session_closed',
                    redirect: '/plantscan',
                    message: farewell
                };
                break;
            }
            default:
                result = { error: `Unknown tool: ${name}` };
        }

        res.status(200).json({ result });
    } catch (error: any) {
        console.error('Error executing tool via REST:', error);
        res.status(500).json({ error: error?.message || 'Tool execution failed' });
    }
});

export default router;
