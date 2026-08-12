import { QueryOptimizer } from "../RAG_pipelines/retrievalPipeline/QueryOptimizer.js";
import { VectorRetriever } from "../RAG_pipelines/retrievalPipeline/VectorRetriever.js";
import { ContextCompressor } from "../RAG_pipelines/retrievalPipeline/ContextCompressor.js";
import { runtimeService } from "./runtimeService.js";

export class RetrievalService {
    private optimizer: QueryOptimizer;
    private retriever: VectorRetriever;
    private compressor: ContextCompressor;

    constructor() {
        this.optimizer = new QueryOptimizer();
        this.retriever = new VectorRetriever();
        this.compressor = new ContextCompressor();
    }

    async processRetrieval(userId: string, sessionId: string, rawQuery: string): Promise<string> {
        try {
            // 1. Optimize query
            console.log(`Optimizing query: "${rawQuery}"`);
            const optimizedQueries = await this.optimizer.optimize(rawQuery);
            console.log("Optimized queries:", optimizedQueries);

            // 2. Retrieve contexts
            const rawContexts = await this.retriever.retrieveContexts(optimizedQueries);
            console.log(`Retrieved ${rawContexts.length} raw contexts.`);

            // 3. Compress contexts
            const stringQueries = optimizedQueries.map(q => q.query);
            const compressedContext = await this.compressor.compress(stringQueries, rawContexts);

            // 4. Update session runtime
            await runtimeService.updateSession(userId, sessionId, {
                rag: {
                    queries: stringQueries,
                    context: compressedContext,
                    retrievedAt: new Date()
                }
            });

            return compressedContext;
        } catch (error) {
            console.error("Error in RetrievalService:", error);
            throw error;
        }
    }
}

export const retrievalService = new RetrievalService();
