import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { connectDB, closeDB, clearDB } from '../db.js';
import { fertilizerRepository } from '../../src/repository/FertilizerRepository.js';
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
    image: 'dummy_image_url'
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

describe('FertilizerRepository', () => {
  it('should create a new fertilizer', async () => {
    const fertilizer = await fertilizerRepository.create(sampleData);
    expect(fertilizer._id).toBeDefined();
    expect(fertilizer.basicInfo.name).toBe('Test Fertilizer');
  });

  it('should find a fertilizer by ID', async () => {
    const created = await fertilizerRepository.create(sampleData);
    const found = await fertilizerRepository.findById(created._id as unknown as string);
    expect(found).toBeDefined();
    expect(found?._id?.toString()).toBe(created._id?.toString());
  });

  it('should find all fertilizers', async () => {
    await fertilizerRepository.create(sampleData);
    await fertilizerRepository.create({ ...sampleData, basicInfo: { ...sampleData.basicInfo, name: 'Test 2' } } as any);

    const all = await fertilizerRepository.findAll();
    expect(all.length).toBe(2);
  });

  it('should update a fertilizer', async () => {
    const created = await fertilizerRepository.create(sampleData);

    const updated = await fertilizerRepository.updateById(created._id as unknown as string, {
      'basicInfo.name': 'Updated Name'
    } as any);

    expect(updated?.basicInfo.name).toBe('Updated Name');
  });

  it('should delete a fertilizer', async () => {
    const created = await fertilizerRepository.create(sampleData);

    await fertilizerRepository.deleteById(created._id as unknown as string);
    const found = await fertilizerRepository.findById(created._id as unknown as string);

    expect(found).toBeNull();
  });

  it('should insert multiple fertilizers', async () => {
    const result = await fertilizerRepository.insertMany([sampleData, sampleData]);
    expect(result.length).toBe(2);
  });
});
