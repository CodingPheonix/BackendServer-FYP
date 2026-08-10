import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB, closeDB, clearDB } from '../db.js';
import { fertilizerService } from '../../src/service/FertilizerService.js';
import { IFertilizer } from '../../src/model/Fertilizer.js';

beforeAll(async () => await connectDB());
afterEach(async () => await clearDB());
afterAll(async () => await closeDB());

const sampleData: Partial<IFertilizer> = {
  basicInfo: {
    name: 'Test Fertilizer',
    brand: 'Test Brand',
    manufacturer: 'Test Manufacturer',
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

describe('FertilizerService', () => {
  it('should perform bulk intake and set dummy string for image', async () => {
    const result = await fertilizerService.bulkIntake([sampleData, sampleData]);

    expect(result.length).toBe(2);
    expect(result[0].basicInfo.image).toBe('dummy_string');
    expect(result[1].basicInfo.image).toBe('dummy_string');
  });

  it('should add an image to an existing fertilizer', async () => {
    const created = await fertilizerService.createFertilizer(sampleData);
    const updated = await fertilizerService.addImage(created._id as unknown as string, 'https://example.com/image.jpg');

    expect(updated?.basicInfo.image).toBe('https://example.com/image.jpg');
  });

  it('should throw an error if adding image to non-existent fertilizer', async () => {
    // 24 character hex string is required for valid ObjectId
    await expect(fertilizerService.addImage('507f1f77bcf86cd799439011', 'https://example.com/image.jpg'))
      .rejects
      .toThrow('Fertilizer not found');
  });
});
