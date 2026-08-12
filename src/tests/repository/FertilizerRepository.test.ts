import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { fertilizerRepository } from '../../repository/FertilizerRepository.js';
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

describe('FertilizerRepository Integration', () => {
  describe('create', () => {
    it('should create a new fertilizer and return it', async () => {
      const result = await fertilizerRepository.create(mockFertilizerData);

      expect(result._id).toBeDefined();
      expect(result.basicInfo.name).toBe(mockFertilizerData.basicInfo.name);
      
      const inDb = await Fertilizer.findById(result._id);
      expect(inDb?.basicInfo.name).toBe(mockFertilizerData.basicInfo.name);
    });
  });

  describe('insertMany', () => {
    it('should insert multiple fertilizers', async () => {
      const fertilizersData = [
        mockFertilizerData,
        {
          ...mockFertilizerData,
          basicInfo: { ...mockFertilizerData.basicInfo, name: 'Eco Grow', type: 'Organic' as const }
        }
      ];
      
      const result = await fertilizerRepository.insertMany(fertilizersData);

      expect(result.length).toBe(2);
      expect(result[0]._id).toBeDefined();
      expect(result[1]._id).toBeDefined();

      const count = await Fertilizer.countDocuments();
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find a fertilizer by id', async () => {
      const created = await Fertilizer.create(mockFertilizerData);
      
      const result = await fertilizerRepository.findById(created._id.toString());

      expect(result).not.toBeNull();
      expect(result?._id.toString()).toEqual(created._id.toString());
    });

    it('should return null if fertilizer is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const result = await fertilizerRepository.findById(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all fertilizers', async () => {
      await Fertilizer.insertMany([
        mockFertilizerData,
        {
          ...mockFertilizerData,
          basicInfo: { ...mockFertilizerData.basicInfo, name: 'Eco Grow', type: 'Organic' as const }
        }
      ]);
      
      const result = await fertilizerRepository.findAll();

      expect(result.length).toBe(2);
    });
  });

  describe('updateById', () => {
    it('should update a fertilizer by id and return the updated fertilizer', async () => {
      const created = await Fertilizer.create(mockFertilizerData);
      
      const updateData = {
        'basicInfo.name': 'Super Grow Plus'
      };
      
      const result = await fertilizerRepository.updateById(created._id.toString(), updateData);

      expect(result?.basicInfo.name).toBe('Super Grow Plus');

      const inDb = await Fertilizer.findById(created._id);
      expect(inDb?.basicInfo.name).toBe('Super Grow Plus');
    });

    it('should handle edge case where fertilizer is not found on update', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const result = await fertilizerRepository.updateById(fakeId, { 'basicInfo.name': 'Updated Name' });

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete a fertilizer by id', async () => {
      const created = await Fertilizer.create(mockFertilizerData);
      
      const result = await fertilizerRepository.deleteById(created._id.toString());

      expect(result?.basicInfo.name).toBe(mockFertilizerData.basicInfo.name);
      
      const inDb = await Fertilizer.findById(created._id);
      expect(inDb).toBeNull();
    });
  });
});
