import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { diseaseRepository } from '../../repository/DiseaseRepository.js';
import { Disease } from '../../model/Disease.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Please create a .env file.");
  }
  await mongoose.connect(mongoUrl, { dbName: 'VitestIntegrationDB' });
});

beforeEach(async () => {
  await Disease.deleteMany({});
});

afterAll(async () => {
  // await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});

const mockCropId = new mongoose.Types.ObjectId();
const mockDiseaseData = {
  cropId: mockCropId,
  name: 'Powdery Mildew',
  scientificName: 'Podosphaera xanthii',
  type: 'Fungal' as const,
  symptoms: ['White powdery spots on leaves'],
  description: 'A fungal disease affecting a wide range of plants.',
  severityLevels: ['Medium', 'High'] as ('Low' | 'Medium' | 'High')[],
  deficiencyType: 'None' as const,
  prevention: ['Adequate spacing', 'Fungicides']
};

describe('DiseaseRepository Integration', () => {
  describe('create', () => {
    it('should create a new disease and return it', async () => {
      const result = await diseaseRepository.create(mockDiseaseData);

      expect(result._id).toBeDefined();
      expect(result.name).toBe(mockDiseaseData.name);
      
      const inDb = await Disease.findById(result._id);
      expect(inDb?.name).toBe(mockDiseaseData.name);
    });
  });

  describe('insertMany', () => {
    it('should insert multiple diseases', async () => {
      const diseasesData = [
        mockDiseaseData,
        { ...mockDiseaseData, name: 'Bacterial Spot', type: 'Bacterial' as const }
      ];
      
      const result = await diseaseRepository.insertMany(diseasesData);

      expect(result.length).toBe(2);
      expect(result[0]._id).toBeDefined();
      expect(result[1]._id).toBeDefined();

      const count = await Disease.countDocuments();
      expect(count).toBe(2);
    });
  });

  describe('findById', () => {
    it('should find a disease by id', async () => {
      const created = await Disease.create(mockDiseaseData);
      
      const result = await diseaseRepository.findById(created._id.toString());

      expect(result).not.toBeNull();
      expect(result?._id.toString()).toEqual(created._id.toString());
    });

    it('should return null if disease is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const result = await diseaseRepository.findById(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all diseases', async () => {
      await Disease.insertMany([
        mockDiseaseData,
        { ...mockDiseaseData, name: 'Bacterial Spot', type: 'Bacterial' as const }
      ]);
      
      const result = await diseaseRepository.findAll();

      expect(result.length).toBe(2);
    });
  });

  describe('findByCropId', () => {
    it('should return diseases for a specific cropId', async () => {
      const otherCropId = new mongoose.Types.ObjectId();
      await Disease.insertMany([
        mockDiseaseData,
        { ...mockDiseaseData, name: 'Other Disease', cropId: otherCropId }
      ]);
      
      const result = await diseaseRepository.findByCropId(mockCropId.toString());

      expect(result.length).toBe(1);
      expect(result[0].name).toBe(mockDiseaseData.name);
    });

    it('should return an empty array if no diseases match the cropId', async () => {
      const unknownCropId = new mongoose.Types.ObjectId().toString();
      
      const result = await diseaseRepository.findByCropId(unknownCropId);

      expect(result.length).toBe(0);
    });
  });

  describe('updateById', () => {
    it('should update a disease by id and return the updated disease', async () => {
      const created = await Disease.create(mockDiseaseData);
      
      const result = await diseaseRepository.updateById(created._id.toString(), { name: 'Updated Powdery Mildew' });

      expect(result?.name).toBe('Updated Powdery Mildew');

      const inDb = await Disease.findById(created._id);
      expect(inDb?.name).toBe('Updated Powdery Mildew');
    });

    it('should handle edge case where disease is not found on update', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const result = await diseaseRepository.updateById(fakeId, { name: 'Updated Name' });

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete a disease by id', async () => {
      const created = await Disease.create(mockDiseaseData);
      
      const result = await diseaseRepository.deleteById(created._id.toString());

      expect(result?.name).toBe(mockDiseaseData.name);
      
      const inDb = await Disease.findById(created._id);
      expect(inDb).toBeNull();
    });
  });
});
