import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { PromptTemplate } from "@langchain/core/prompts";

export class Summarizer {
    private summarizeChain: any;

    constructor() {
        const llm = new ChatGoogleGenerativeAI({
            model: "gemini-3.1-flash-lite",
            maxOutputTokens: 512,
        });

        const summarizePrompt = PromptTemplate.fromTemplate(`
You are an expert agriculture assistant. Summarize the following document page.
Extract the most important keywords, concepts, and meaningful relevant words for retrieval.
Make the summary concise but highly descriptive of the page's core content.

Page Content:
{page_content}

Summary:
`);

        this.summarizeChain = summarizePrompt.pipe(llm).pipe(new StringOutputParser());
    }

    async summarizePage(pageContent: string): Promise<string> {
        return await this.summarizeChain.invoke({
            page_content: pageContent,
        });
    }
}
