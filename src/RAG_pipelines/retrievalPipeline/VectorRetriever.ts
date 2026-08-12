import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { getRAGCollection } from "../../utils/database.js";
import { createRoundRobinEmbeddingModel } from "../../utils/modelSelector.js";

export class VectorRetriever {
    private async searchInCollection(query: string, collectionName: string, k: number = 3): Promise<string[]> {
        const collection = getRAGCollection(collectionName);
        const embeddings = createRoundRobinEmbeddingModel();
        
        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collection as any,
            indexName: "vector_index", 
            textKey: "text",
            embeddingKey: "embedding",
        });

        const results = await vectorStore.similaritySearch(query, k);
        // Extract raw context from metadata, fallback to pageContent if metadata is missing
        return results.map(doc => doc.metadata.rawContent || doc.pageContent);
    }

    async retrieveContexts(queries: { query: string, destination: "fertilizer" | "disease" }[]): Promise<string[]> {
        const rawContexts: string[] = [];

        for (const q of queries) {
            if (q.destination === "fertilizer") {
                const results = await this.searchInCollection(q.query, "rag_fertilizers");
                rawContexts.push(...results);
            }
            if (q.destination === "disease") {
                const results = await this.searchInCollection(q.query, "rag_diseases");
                rawContexts.push(...results);
            }
        }

        // Deduplicate string contexts
        return Array.from(new Set(rawContexts));
    }
}
