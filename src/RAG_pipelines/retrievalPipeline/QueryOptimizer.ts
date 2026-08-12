import { z } from "zod";
import { PromptTemplate } from "@langchain/core/prompts";
import { createRoundRobinTextModel } from "../../utils/modelSelector.js";

const OptimizerOutputSchema = z.object({
    queries: z.array(z.object({
        query: z.string().describe("The optimized sub-query"),
        destination: z.enum(["fertilizer", "disease"]).describe("The targeted resource for this query")
    }))
});

export class QueryOptimizer {
    async optimize(query: string): Promise<{ query: string, destination: "fertilizer" | "disease" }[]> {
        const llm = createRoundRobinTextModel({ maxOutputTokens: 512 });
        const structuredLlm = llm.withStructuredOutput(OptimizerOutputSchema);

        const prompt = PromptTemplate.fromTemplate(`
You are an expert agriculture retrieval optimizer.
The user is asking a query about plant diseases or fertilizers.
Your job is to optimize the query by deciding whether the query has a single answerable meaning or multiple. 
If it has multiple meanings that should be searched separately (e.g., "what is this disease and how can i cure it"), break it down into multiple meaningful queries.
Do NOT break down queries if they mean the same thing (e.g., "what is this disease" and "what can i know about this disease" should be ONE query).
Also, determine the destination for each query: "fertilizer" or "disease".

User Query: {query}
`);

        const optimizerChain = prompt.pipe(structuredLlm);
        const result = await optimizerChain.invoke({ query });
        return result.queries;
    }
}
