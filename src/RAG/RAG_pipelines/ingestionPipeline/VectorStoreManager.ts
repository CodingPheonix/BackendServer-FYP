import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { Document } from "@langchain/core/documents";
import { getRAGCollection } from "../../../utils/database.js";

export class VectorStoreManager {
    private embeddings: GoogleGenerativeAIEmbeddings;

    constructor() {
        this.embeddings = new GoogleGenerativeAIEmbeddings({
            model: "text-embedding-004",
        });
    }

    async storeDocuments(documents: Document[], type: "fertilizer" | "disease"): Promise<void> {
        if (documents.length === 0) return;

        const collectionName = type === "fertilizer" ? "rag_fertilizers" : "rag_diseases";
        const collection = getRAGCollection(collectionName);

        const vectorStore = new MongoDBAtlasVectorSearch(this.embeddings, {
            collection: collection as any,
            indexName: "vector_index",
            textKey: "text",
            embeddingKey: "embedding",
        });

        await vectorStore.addDocuments(documents);
        console.log(`Successfully ingested ${documents.length} pages into ${collectionName}`);
    }
}
