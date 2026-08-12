import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { cropRepository } from '../../repository/CropRepository.js';
import { Crop } from '../../model/Crop.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Please create a .env file.");
  }
  // Connect to a specific test database on the real cluster to avoid wiping production data
  await mongoose.connect(mongoUrl, { dbName: 'VitestIntegrationDB' });
});

beforeEach(async () => {
  // Clean up the collection before each test
  await Crop.deleteMany({});
});

afterAll(async () => {
  // Drop the test database and close connection
  await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});

describe('CropRepository Integration', () => {
  describe('create', () => {
    it('should create a new crop and return it', async () => {
      const cropData = { name: 'Tomato', scientificName: 'Solanum lycopersicum', category: 'Vegetable' as const };

      const result = await cropRepository.create(cropData);

      expect(result._id).toBeDefined();
      expect(result.name).toBe(cropData.name);

      const inDb = await Crop.findById(result._id);
      expect(inDb?.name).toBe(cropData.name);
    });
  });

  describe('insertMany', () => {
    it('should insert multiple crops', async () => {
      const cropsData = [
        { name: 'Tomato', scientificName: 'S. lycopersicum', category: 'Vegetable' as const },
        { name: 'Potato', scientificName: 'S. tuberosum', category: 'Vegetable' as const }
      ];

      const result = await cropRepository.insertMany(cropsData);

      expect(result.length).toBe(2);
      expect(result[0]._id).toBeDefined();
      expect(result[1]._id).toBeDefined();

      const count = await Crop.countDocuments();
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find a crop by id', async () => {
      const created = await Crop.create({ name: 'Tomato', scientificName: 'S', category: 'Vegetable' });

      const result = await cropRepository.findById(created._id.toString());

      expect(result).not.toBeNull();
      expect(result?._id.toString()).toEqual(created._id.toString());
    });

    it('should return null if crop is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const result = await cropRepository.findById(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all crops', async () => {
      await Crop.insertMany([
        { name: 'Tomato', scientificName: 'S. lycopersicum', category: 'Vegetable' },
        { name: 'Potato', scientificName: 'S. tuberosum', category: 'Vegetable' }
      ]);

      const result = await cropRepository.findAll();

      expect(result.length).toBe(2);
    });
  });

  describe('updateById', () => {
    it('should update a crop by id and return the updated crop', async () => {
      const created = await Crop.create({ name: 'Tomato', scientificName: 'S', category: 'Vegetable' });

      const result = await cropRepository.updateById(created._id.toString(), { name: 'Updated Tomato' });

      expect(result?.name).toBe('Updated Tomato');

      const inDb = await Crop.findById(created._id);
      expect(inDb?.name).toBe('Updated Tomato');
    });

    it('should handle edge case where crop is not found on update', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const result = await cropRepository.updateById(fakeId, { name: 'Updated Tomato' });

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete a crop by id', async () => {
      const created = await Crop.create({ name: 'Tomato', scientificName: 'S', category: 'Vegetable' });

      const result = await cropRepository.deleteById(created._id.toString());

      expect(result?.name).toBe('Tomato');

      const inDb = await Crop.findById(created._id);
      expect(inDb).toBeNull();
    });
  });
});
