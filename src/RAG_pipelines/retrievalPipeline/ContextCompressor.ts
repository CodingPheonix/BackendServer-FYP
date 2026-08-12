import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export class ContextCompressor {
    private compressChain: any;

    constructor() {
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-1.5-flash", 
            maxOutputTokens: 1024,
        });

        const compressPrompt = PromptTemplate.fromTemplate(`
You are an expert agricultural assistant.
You have been provided with several raw contexts retrieved from a database, and the user's original query.
Your goal is to compress these raw contexts into shorter, precise, and high-value information that answers the original queries.
Filter out noise and irrelevant data. 

Original Queries:
{queries}

Raw Contexts:
{contexts}

Compressed High-Value Context:
`);

        this.compressChain = compressPrompt.pipe(llm).pipe(new StringOutputParser());
    }

    async compress(queries: string[], rawContexts: string[]): Promise<string> {
        if (rawContexts.length === 0) {
            return "No relevant context found.";
        }

        const combinedQueries = queries.join("\n- ");
        const combinedContexts = rawContexts.join("\n\n---\n\n");

        return await this.compressChain.invoke({
            queries: combinedQueries,
            contexts: combinedContexts
        });
    }
}
