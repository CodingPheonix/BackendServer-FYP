import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import { connectDB, closeDB, clearDB } from '../db.js';
import fertilizerRoutes from '../../src/router/fertilizerRoutes.js';
import { IFertilizer } from '../../src/model/Fertilizer.js';

const app = express();
app.use(express.json());
app.use('/api/fertilizers', fertilizerRoutes);

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const sampleData: Partial<IFertilizer> = {
  basicInfo: {
    name: 'Test Fertilizer Route',
    brand: 'Route Brand',
    manufacturer: 'Route Manufacturer',
    type: 'Organic',
    description: 'A test fertilizer',
    image: 'will_be_replaced'
  },
  composition: {
    primaryNutrients: { nitrogen: 10, phosphorus: 10, potassium: 10 },
    secondaryNutrients: { calcium: 1, magnesium: 1, sulfur: 1 },
    microNutrients: { zinc: 0.1, boron: 0.1, iron: 0.1, copper: 0.1, manganese: 0.1, molybdenum: 0.1, chlorine: 0.1 }
  },
  safety: {
    storage: 'Cool dry place',
    shelfLifeMonths: 12,
    toxicity: 'Low',
    manufacturingDate: Date.now()
  },
  pricing: {
    price: 100,
    currency: 'USD',
    packageWeight: '1kg',
    availability: true
  }
};

describe('Fertilizer Routes', () => {
  it('POST /api/fertilizers/bulk should intake fertilizers', async () => {
    const res = await request(app)
      .post('/api/fertilizers/bulk')
      .send([sampleData]);
      
    expect(res.status).toBe(201);
    expect(res.body.count).toBe(1);
    expect(res.body.data[0].basicInfo.image).toBe('dummy_string');
  });
  
  it('PATCH /api/fertilizers/:id/image should add image', async () => {
    // First insert one
    const insertRes = await request(app)
      .post('/api/fertilizers/bulk')
      .send([sampleData]);
      
    const id = insertRes.body.data[0]._id;
    
    // Then patch it
    const patchRes = await request(app)
      .patch(`/api/fertilizers/${id}/image`)
      .send({ imageUrl: 'https://example.com/test-image.png' });
      
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.basicInfo.image).toBe('https://example.com/test-image.png');
  });

  it('PATCH /api/fertilizers/:id/image should return 400 if no imageUrl is provided', async () => {
    const res = await request(app)
      .patch('/api/fertilizers/507f1f77bcf86cd799439011/image')
      .send({});
      
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('imageUrl is required');
  });

  it('PATCH /api/fertilizers/:id/image should return 404 if not found', async () => {
    const res = await request(app)
      .patch('/api/fertilizers/507f1f77bcf86cd799439011/image')
      .send({ imageUrl: 'https://example.com' });
      
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Fertilizer not found');
  });
});
