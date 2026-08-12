import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { fertilizerService } from '../../service/FertilizerService.js';
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

describe('FertilizerService Integration', () => {
  describe('bulkIntake', () => {
    it('should force image to be a dummy string and insert into db', async () => {
      const mockFertilizers = [
        { ...mockFertilizerData, basicInfo: { ...mockFertilizerData.basicInfo, name: 'Fert A', image: 'real_image_1.png' } },
        { ...mockFertilizerData, basicInfo: { ...mockFertilizerData.basicInfo, name: 'Fert B', image: undefined as any } }
      ];

      const result = await fertilizerService.bulkIntake(mockFertilizers);

      expect(result.length).toBe(2);
      expect(result[0].basicInfo.name).toBe('Fert A');
      expect(result[0].basicInfo.image).toBe('dummy_string');
      expect(result[1].basicInfo.name).toBe('Fert B');
      expect(result[1].basicInfo.image).toBe('dummy_string');

      const inDb = await Fertilizer.find();
      expect(inDb.length).toBe(2);
      expect(inDb[0].basicInfo.image).toBe('dummy_string');
    });
  });

  describe('addImage', () => {
    it('should update the basicInfo image if fertilizer is found', async () => {
      const created = await Fertilizer.create(mockFertilizerData);
      const mockImageUrl = 'http://example.com/new-image.png';

      const result = await fertilizerService.addImage(created._id.toString(), mockImageUrl);

      expect(result?.basicInfo?.image).toBe(mockImageUrl);

      const inDb = await Fertilizer.findById(created._id);
      expect(inDb?.basicInfo?.image).toBe(mockImageUrl);
    });

    it('should throw an error if fertilizer is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(fertilizerService.addImage(fakeId, 'url')).rejects.toThrow('Fertilizer not found');
    });
  });

  describe('createFertilizer', () => {
    it('should create fertilizer in the database', async () => {
      const result = await fertilizerService.createFertilizer(mockFertilizerData);

      expect(result._id).toBeDefined();
      expect(result.basicInfo.name).toBe(mockFertilizerData.basicInfo.name);

      const inDb = await Fertilizer.findById(result._id);
      expect(inDb).not.toBeNull();
    });
  });

  describe('getFertilizerById', () => {
    it('should retrieve fertilizer from database', async () => {
      const created = await Fertilizer.create(mockFertilizerData);

      const result = await fertilizerService.getFertilizerById(created._id.toString());

      expect(result?.basicInfo.name).toBe(mockFertilizerData.basicInfo.name);
    });
  });

  describe('getAllFertilizers', () => {
    it('should retrieve all fertilizers', async () => {
      await Fertilizer.create(mockFertilizerData);
      await Fertilizer.create({ ...mockFertilizerData, basicInfo: { ...mockFertilizerData.basicInfo, name: 'Fert B' } });

      const result = await fertilizerService.getAllFertilizers();

      expect(result.length).toBe(2);
    });
  });

  describe('updateFertilizer', () => {
    it('should update fertilizer using the repository', async () => {
      const created = await Fertilizer.create(mockFertilizerData);
      
      const updateData = { 'basicInfo.name': 'Updated Name' };

      const result = await fertilizerService.updateFertilizer(created._id.toString(), updateData);

      expect(result?.basicInfo.name).toBe('Updated Name');

      const inDb = await Fertilizer.findById(created._id);
      expect(inDb?.basicInfo.name).toBe('Updated Name');
    });
  });

  describe('deleteFertilizer', () => {
    it('should delete fertilizer from the database', async () => {
      const created = await Fertilizer.create(mockFertilizerData);

      const result = await fertilizerService.deleteFertilizer(created._id.toString());

      expect(result?._id.toString()).toBe(created._id.toString());

      const inDb = await Fertilizer.findById(created._id);
      expect(inDb).toBeNull();
    });
  });
});
