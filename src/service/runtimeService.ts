import { sessionRepository } from '../repository/SessionRepository.js';
import { ISession } from '../model/Session.js';

export class RuntimeService {
    /**
     * Loads a session from the database by userId and sessionId.
     */
    async loadSession(userId: string, sessionId: string): Promise<ISession | null> {
        return await sessionRepository.findByUserIdAndSessionId(userId, sessionId);
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
}

export const runtimeService = new RuntimeService();
