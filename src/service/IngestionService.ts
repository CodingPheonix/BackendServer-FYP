import { Document } from "@langchain/core/documents";
import { DocumentParser } from "../RAG_pipelines/ingestionPipeline/DocumentParser.js";
import { Summarizer } from "../RAG_pipelines/ingestionPipeline/Summarizer.js";
import { VectorStoreManager } from "../RAG_pipelines/ingestionPipeline/VectorStoreManager.js";
import fs from "fs";

export class IngestionService {
    private parser: DocumentParser;
    private summarizer: Summarizer;
    private vectorStoreManager: VectorStoreManager;

    constructor() {
        this.parser = new DocumentParser();
        this.summarizer = new Summarizer();
        this.vectorStoreManager = new VectorStoreManager();
    }

    async processAndIngest(filePath: string, type: "fertilizer" | "disease"): Promise<void> {
        try {
            // 1. Load Document
            const rawDocs = await this.parser.parsePDF(filePath);
            const documentsToIngest: Document[] = [];

            // 2. Process and summarize each page
            for (const doc of rawDocs) {
                console.log(`Processing page ${doc.metadata.loc?.pageNumber}...`);
                const summary = await this.summarizer.summarizePage(doc.pageContent);

                const enrichedMetadata = {
                    ...doc.metadata,
                    rawContent: doc.pageContent,
                    docType: type,
                    isSummary: true
                };

                const summaryDoc = new Document({
                    pageContent: summary,
                    metadata: enrichedMetadata,
                });

                documentsToIngest.push(summaryDoc);
            }

            // 3. Store in Vector Database
            await this.vectorStoreManager.storeDocuments(documentsToIngest, type);

        } catch (error) {
            console.error("Error during document ingestion:", error);
            throw error;
        } finally {
            // 4. Cleanup file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Cleaned up temp file: ${filePath}`);
            }
        }
    }
}

export const ingestionService = new IngestionService();
