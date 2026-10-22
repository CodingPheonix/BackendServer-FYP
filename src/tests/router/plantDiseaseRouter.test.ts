import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import plantDiseaseRouter from '../../router/plantDiseaseRouter.js';
import { plantDiseaseService } from '../../service/PlantDiseaseService.js';

const app = express();
app.use(express.json());
app.use('/api/plant-diseases', plantDiseaseRouter);

describe('Plant Disease Router Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 when plantName is missing', async () => {
    const response = await request(app)
      .post('/api/plant-diseases/generate')
      .send({ diseaseName: 'Early Blight' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });

  it('should return 400 when diseaseName is empty', async () => {
    const response = await request(app)
      .post('/api/plant-diseases/generate')
      .send({ plantName: 'Tomato', diseaseName: '   ' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Validation Error');
  });

  it('should return 201 when new disease is created', async () => {
    vi.spyOn(plantDiseaseService, 'generateAndStore').mockResolvedValue({
      message: 'Plant and disease information generated and saved successfully',
      isNewCrop: true,
      isNewDisease: true,
      crop: { name: 'Tomato' } as any,
      disease: { name: 'Early Blight' } as any
    });

    const response = await request(app)
      .post('/api/plant-diseases/generate')
      .send({ plantName: 'Tomato', diseaseName: 'Early Blight' });

    expect(response.status).toBe(201);
    expect(response.body.isNewDisease).toBe(true);
    expect(response.body.crop.name).toBe('Tomato');
  });

  it('should return 200 when disease already exists', async () => {
    vi.spyOn(plantDiseaseService, 'generateAndStore').mockResolvedValue({
      message: 'Disease already exists for this plant',
      isNewCrop: false,
      isNewDisease: false,
      crop: { name: 'Tomato' } as any,
      disease: { name: 'Early Blight' } as any
    });

    const response = await request(app)
      .post('/api/plant-diseases/generate')
      .send({ plantName: 'Tomato', diseaseName: 'Early Blight' });

    expect(response.status).toBe(200);
    expect(response.body.isNewDisease).toBe(false);
  });
});
