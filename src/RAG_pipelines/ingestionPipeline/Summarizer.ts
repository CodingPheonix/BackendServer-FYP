import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";
import { createRoundRobinTextModel } from "../../utils/modelSelector.js";

export class Summarizer {
    async summarizePage(pageContent: string): Promise<string> {
        const llm = createRoundRobinTextModel({ maxOutputTokens: 512 });

        const summarizePrompt = PromptTemplate.fromTemplate(`
You are an expert agriculture assistant. Summarize the following document page.
Extract the most important keywords, concepts, and meaningful relevant words for retrieval.
Make the summary concise but highly descriptive of the page's core content.

Page Content:
{page_content}

Summary:
`);

        const summarizeChain = summarizePrompt.pipe(llm).pipe(new StringOutputParser());

        return await summarizeChain.invoke({
            page_content: pageContent,
        });
    }
}
