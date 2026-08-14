import { sessionRepository } from '../repository/SessionRepository.js';
import { ISession } from '../model/Session.js';
import { Crop } from '../model/Crop.js';
import { Disease } from '../model/Disease.js';

export class RuntimeService {
    /**
     * Loads a session from the database by userId and sessionId.
     */
    async loadSession(userId: string, sessionId: string): Promise<ISession | null> {
        return await sessionRepository.findByUserIdAndSessionId(userId, sessionId);
    }

    /**
     * Starts a new session by resolving crop and disease names to their IDs.
     */
    async startSessionWithNames(userId: string, sessionId: string, plantName: string, diseaseName?: string): Promise<ISession> {
        const crop = await Crop.findOne({ name: plantName });
        const cropId = crop ? crop._id.toString() : 'unknown';
        
        let diseaseId;
        if (diseaseName) {
            const disease = await Disease.findOne({ name: diseaseName });
            if (disease) {
                diseaseId = disease._id.toString();
            }
        }

        const sessionInitialData = {
            conversation: { handle: 'uninitialized' },
            plant: {
                cropId,
                cropName: plantName,
                ...(diseaseId ? { diseaseId } : {}),
                ...(diseaseName ? { diseaseName } : {})
            }
        };

        return await this.startSession(userId, sessionId, sessionInitialData);
    }

    /**
     * Initializes a new session if it doesn't exist, otherwise returns the existing one.
     */
    async startSession(userId: string, sessionId: string, initialData?: Partial<ISession>): Promise<ISession> {
        let session = await this.loadSession(userId, sessionId);
        
        if (!session) {
            if (!initialData) {
                throw new Error("Cannot create a new session without initialData (plant and conversation context required)");
            }
            session = await sessionRepository.create({
                userId,
                sessionId,
                ...initialData
            });
        } else {
            // Update lastActivityAt on load
            session = await sessionRepository.updateBySessionAndUserId(userId, sessionId, { lastActivityAt: new Date() });
        }

        return session!;
    }

    /**
     * Updates an existing session with new data (e.g. RAG results, confidence updates)
     */
    async updateSession(userId: string, sessionId: string, data: Partial<ISession>): Promise<ISession | null> {
        return await sessionRepository.updateBySessionAndUserId(userId, sessionId, data);
    }

    /**
     * Deletes a session from the database.
     */
    async deleteSession(userId: string, sessionId: string): Promise<ISession | null> {
        return await sessionRepository.deleteBySessionAndUserId(userId, sessionId);
    }
}

export const runtimeService = new RuntimeService();
