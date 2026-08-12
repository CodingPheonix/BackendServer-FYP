import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import fertilizerRoutes from '../../router/fertilizerRoutes.js';
import { Fertilizer } from '../../model/Fertilizer.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Please create a .env file.");
  }
  await mongoose.connect(mongoUrl, { dbName: 'VitestIntegrationDB' });
});

beforeEach(async () => {
  await Fertilizer.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});

const app = express();
app.use(express.json());
app.use('/api/fertilizers', fertilizerRoutes);

const mockFertilizerData = {
  basicInfo: {
    name: 'Super Grow',
    brand: 'AgriCorp',
    manufacturer: 'AgriCorp Inc',
    type: 'Chemical' as const,
    description: 'A powerful chemical fertilizer for rapid growth.',
    image: 'dummy_image_url'
  },
  composition: {
    primaryNutrients: { nitrogen: 20, phosphorus: 20, potassium: 20 },
    secondaryNutrients: { calcium: 5, magnesium: 2, sulfur: 5 },
    microNutrients: { zinc: 0.1, boron: 0.1, iron: 0.2, copper: 0.05, manganese: 0.1, molybdenum: 0.01, chlorine: 0.1 }
  },
  safety: {
    storage: 'Store in a cool, dry place',
    shelfLifeMonths: 24,
    toxicity: 'Medium' as const,
    manufacturingDate: Date.now()
  },
  pricing: {
    price: 50.00,
    currency: 'USD',
    packageWeight: '25kg',
    availability: true
  }
};

describe('Fertilizer Routes Integration (Real DB)', () => {
  describe('POST /api/fertilizers/bulk', () => {
    it('should insert fertilizers into the database and return 201 on success', async () => {
      const response = await request(app)
        .post('/api/fertilizers/bulk')
        .send([mockFertilizerData]);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Bulk intake successful');
      expect(response.body.count).toBe(1);
      expect(response.body.data[0].basicInfo.name).toBe('Super Grow');

      const count = await Fertilizer.countDocuments();
      expect(count).toBe(1);
    });

    it('should return 400 if body is not an array', async () => {
      const response = await request(app)
        .post('/api/fertilizers/bulk')
        .send({ not: 'an array' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Expected an array of fertilizers');
      
      const count = await Fertilizer.countDocuments();
      expect(count).toBe(0);
    });
  });

  describe('PATCH /api/fertilizers/:id/image', () => {
    it('should update fertilizer image and return 200 on success', async () => {
      const created = await Fertilizer.create(mockFertilizerData);

      const response = await request(app)
        .patch(`/api/fertilizers/${created._id}/image`)
        .send({ imageUrl: 'http://example.com/new_image.png' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Image added successfully');
      expect(response.body.data.basicInfo.image).toBe('http://example.com/new_image.png');

      const inDb = await Fertilizer.findById(created._id);
      expect(inDb?.basicInfo?.image).toBe('http://example.com/new_image.png');
    });

    it('should return 400 if imageUrl is missing', async () => {
      const created = await Fertilizer.create(mockFertilizerData);

      const response = await request(app)
        .patch(`/api/fertilizers/${created._id}/image`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('imageUrl is required');
    });

    it('should return 404 if fertilizer is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .patch(`/api/fertilizers/${fakeId}/image`)
        .send({ imageUrl: 'url' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Fertilizer not found');
    });
  });

  describe('GET /api/fertilizers/', () => {
    it('should return all fertilizers', async () => {
      await Fertilizer.create(mockFertilizerData);
      
      const response = await request(app).get('/api/fertilizers/');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].basicInfo.name).toBe('Super Grow');
    });
  });

  describe('GET /api/fertilizers/:id', () => {
    it('should return fertilizer by id', async () => {
      const created = await Fertilizer.create(mockFertilizerData);

      const response = await request(app).get(`/api/fertilizers/${created._id}`);

      expect(response.status).toBe(200);
      expect(response.body._id).toBe(created._id.toString());
      expect(response.body.basicInfo.name).toBe('Super Grow');
    });

    it('should return 404 if fertilizer is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app).get(`/api/fertilizers/${fakeId}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Fertilizer not found');
    });
  });
});
