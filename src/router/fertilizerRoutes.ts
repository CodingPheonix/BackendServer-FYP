import { Router } from 'express';
import { fertilizerService } from '../service/FertilizerService.js';

const router = Router();

// 1. Bulk data intake
router.post('/bulk', async (req, res) => {
  try {
    const fertilizers = req.body;
    if (!Array.isArray(fertilizers)) {
      res.status(400).json({ error: 'Expected an array of fertilizers' });
      return;
    }

    const result = await fertilizerService.bulkIntake(fertilizers);
    res.status(201).json({ message: 'Bulk intake successful', count: result.length, data: result });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Add image
router.patch('/:id/image', async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: 'imageUrl is required' });
      return;
    }

    const updatedFertilizer = await fertilizerService.addImage(id, imageUrl);
    res.status(200).json({ message: 'Image added successfully', data: updatedFertilizer });
  } catch (error: any) {
    if (error.message === 'Fertilizer not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: error.message });
  }
});

// Other CRUD routes (optional based on prompt but good for completeness)
router.get('/', async (req, res) => {
  try {
    const fertilizers = await fertilizerService.getAllFertilizers();
    res.status(200).json(fertilizers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const fertilizer = await fertilizerService.getFertilizerById(req.params.id);
    if (!fertilizer) {
      res.status(404).json({ error: 'Fertilizer not found' });
      return;
    }
    res.status(200).json(fertilizer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
