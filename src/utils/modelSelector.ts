import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let textCount = 0;
let embeddingCount = 0;

export const createRoundRobinTextModel = (options?: any) => {
    const models = [
        process.env.GOOGLE_TEXT_MODEL1,
        process.env.GOOGLE_TEXT_MODEL2
    ].filter(Boolean) as string[];

    if (models.length === 0) {
        models.push("gemini-2.5-flash"); // Fallback
    }

    const modelName = models[textCount % models.length];
    textCount++;

    return new ChatGoogleGenerativeAI({
        model: modelName,
        apiKey: process.env.GOOGLE_API_KEY,
        ...options
    });
};

// Wrapper to truncate embeddings to a specific dimension for MongoDB Atlas free tier (max 2048)
// class TruncatedGoogleEmbeddings extends GoogleGenerativeAIEmbeddings {
//     private targetDimension: number;

//     constructor(fields: any, targetDimension: number = 768) {
//         super(fields);
//         this.targetDimension = targetDimension;
//     }

//     async embedQuery(text: string): Promise<number[]> {
//         const result = await super.embedQuery(text);
//         return result.slice(0, this.targetDimension);
//     }

//     async embedDocuments(texts: string[]): Promise<number[][]> {
//         const results = await super.embedDocuments(texts);
//         return results.map(r => r.slice(0, this.targetDimension));
//     }
// }

export const createRoundRobinEmbeddingModel = (options?: any) => {
    const models = [
        process.env.GOOGLE_EMBEDDING_MODEL1
    ].filter(Boolean) as string[];

    if (models.length === 0) {
        models.push("text-embedding-004"); // Fallback
    }

    const modelName = models[embeddingCount % models.length];
    embeddingCount++;

    return new GoogleGenerativeAIEmbeddings({
        model: modelName,
        apiKey: process.env.GOOGLE_API_KEY,
        ...options
    });
};
