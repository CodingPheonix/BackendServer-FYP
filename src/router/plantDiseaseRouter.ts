import { Router } from 'express';
import { plantDiseaseService, DiseaseGenerationInputSchema } from '../service/PlantDiseaseService.js';
import { ZodError } from 'zod';

const router = Router();

/**
 * POST /api/plant-diseases/generate
 * Body: { plantName: string, diseaseName: string }
 * Generates crop and disease info using LLM according to schema and saves to DB.
 */
router.post('/generate', async (req, res) => {
  try {
    const input = DiseaseGenerationInputSchema.parse(req.body);
    const result = await plantDiseaseService.generateAndStore(input);
    
    res.status(result.isNewDisease ? 201 : 200).json(result);
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Validation Error',
        details: error.issues.map(e => ({ path: e.path.join('.'), message: e.message }))
      });
      return;
    }

    console.error('Error in /api/plant-diseases/generate:', error);
    res.status(500).json({
      error: error.message || 'Internal server error while generating plant disease information'
    });
  }
});

export default router;
