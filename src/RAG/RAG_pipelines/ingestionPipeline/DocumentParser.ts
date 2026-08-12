import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Document } from "@langchain/core/documents";

export class DocumentParser {
    async parsePDF(filePath: string): Promise<Document[]> {
        const loader = new PDFLoader(filePath, {
            splitPages: true,
        });
        return await loader.load();
    }
}
