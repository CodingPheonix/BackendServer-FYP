import { Router } from "express";
import multer from "multer";
import { ingestionService } from "../service/IngestionService.js";
import fs from "fs";

const router = Router();

// Configure multer for temporary storage
// The file will be saved in an 'uploads' directory
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const upload = multer({ dest: 'uploads/' });

router.post("/", upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const { type } = req.body;

        if (!file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        if (type !== "fertilizer" && type !== "disease") {
            // Cleanup file if invalid type
            fs.unlinkSync(file.path);
            return res.status(400).json({ error: "Invalid type. Must be 'fertilizer' or 'disease'" });
        }

        // Process and ingest the document
        await ingestionService.processAndIngest(file.path, type);

        res.status(200).json({ message: "File ingested successfully" });
    } catch (error) {
        console.error("Ingestion router error:", error);
        res.status(500).json({ error: "An error occurred during ingestion" });
    }
});

export default router;
