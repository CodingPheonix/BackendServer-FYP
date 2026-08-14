import { LeafDiseaseRuntime } from "./types.js";
import { runtimeService } from "../service/runtimeService.js";

export class Runtime implements LeafDiseaseRuntime {
    // In-memory store of active sessions for O(1) fetch
    private static activeRuntimes = new Map<string, Runtime>();

    public userId!: string;
    public sessionId!: string;
    public conversation!: { handle: string };
    public plant!: { cropId: string; cropName: string; diseaseId?: string; diseaseName?: string; confidence?: number };
    public rag?: { queries: string[]; context: string; retrievedAt: Date };
    public createdAt!: Date;
    public lastActivityAt!: Date;

    /**
     * Private constructor to enforce the use of the async factory method.
     */
    private constructor(userId: string, sessionId: string) {
        this.userId = userId;
        this.sessionId = sessionId;
        this.createdAt = new Date();
        this.lastActivityAt = new Date();
        
        // Initialize default nested structures to prevent undefined errors
        this.conversation = { handle: '' };
        this.plant = { cropId: '', cropName: '' };
    }

    /**
     * Fetches an existing Runtime from memory or database.
     * If it is a new session, it initializes the state and immediately brings it into the runtime.
     */
    public static async getInstance(userId: string, sessionId: string): Promise<Runtime> {
        const key = `${userId}:${sessionId}`;
        const existingRuntime = Runtime.activeRuntimes.get(key);

        // If the runtime already exists in memory, return the existing instance
        if (existingRuntime) {
            return existingRuntime;
        }

        const runtime = new Runtime(userId, sessionId);

        // Try to fetch the session from the database
        const dbSession = await runtimeService.loadSession(userId, sessionId);

        if (dbSession) {
            // Restore state from database
            runtime.conversation = dbSession.conversation;
            runtime.plant = dbSession.plant;
            runtime.rag = dbSession.rag;
            runtime.createdAt = dbSession.createdAt;
            runtime.lastActivityAt = dbSession.lastActivityAt;
        }
        
        // Immediately bring the session into the runtime memory
        Runtime.activeRuntimes.set(key, runtime);
        return runtime;
    }

    /**
     * Retrieves the plant details in O(1) time complexity.
     */
    public getPlantDetails() {
        return this.plant;
    }

    /**
     * Retrieves the disease name in O(1) time complexity.
     */
    public getDiseaseName(): string | undefined {
        return this.plant.diseaseName;
    }

    /**
     * Retrieves the RAG details in O(1) time complexity.
     */
    public getRagDetails() {
        return this.rag;
    }

    /**
     * Updates the last activity timestamp.
     */
    private updateActivity() {
        this.lastActivityAt = new Date();
    }
}
