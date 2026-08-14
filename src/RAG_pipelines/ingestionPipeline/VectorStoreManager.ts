import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Document } from "@langchain/core/documents";
import { getRAGCollection } from "../../utils/database.js";
import { createRoundRobinEmbeddingModel } from "../../utils/modelSelector.js";

export class VectorStoreManager {
    async storeDocuments(documents: Document[], type: "fertilizer" | "disease"): Promise<void> {
        if (documents.length === 0) return;

        const embeddings = createRoundRobinEmbeddingModel();
        const collectionName = type === "fertilizer" ? "rag_fertilizers" : "rag_diseases";
        const collection = getRAGCollection(collectionName);

        const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
            collection: collection as any,
            indexName: "vector_index",
            textKey: "text",
            embeddingKey: "embedding",
        });

        await vectorStore.addDocuments(documents);
        console.log(`Successfully ingested ${documents.length} pages into ${collectionName}`);
    }
}
