import { describe, it, expect, vi, beforeEach } from 'vitest';
import { plantDiseaseService, LLMPlantDiseaseResponse } from '../../service/PlantDiseaseService.js';
import { cropRepository } from '../../repository/CropRepository.js';
import { diseaseRepository } from '../../repository/DiseaseRepository.js';
import mongoose from 'mongoose';

describe('PlantDiseaseService Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockLLMOutput: LLMPlantDiseaseResponse = {
    crop: {
      name: 'Tomato',
      scientificName: 'Solanum lycopersicum',
      category: 'Vegetable'
    },
    disease: {
      name: 'Early Blight',
      scientificName: 'Alternaria solani',
      type: 'Fungal',
      symptoms: ['Brown spots on lower leaves', 'Concentric rings'],
      description: 'A common fungal disease of tomato and potato crops.',
      severityLevels: ['Medium', 'High'],
      deficiencyType: 'None',
      prevention: ['Crop rotation', 'Fungicide spray', 'Drip irrigation']
    }
  };

  it('should generate and save new crop and new disease if neither exists', async () => {
    vi.spyOn(plantDiseaseService, 'generatePlantDiseaseInfo').mockResolvedValue(mockLLMOutput);
    vi.spyOn(cropRepository, 'findByName').mockResolvedValue(null);

    const mockSavedCrop: any = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Tomato',
      scientificName: 'Solanum lycopersicum',
      category: 'Vegetable',
      image: ''
    };
    vi.spyOn(cropRepository, 'create').mockResolvedValue(mockSavedCrop);

    vi.spyOn(diseaseRepository, 'findByNameAndCropId').mockResolvedValue(null);

    const mockSavedDisease: any = {
      _id: new mongoose.Types.ObjectId(),
      cropId: mockSavedCrop._id,
      name: 'Early Blight',
      scientificName: 'Alternaria solani',
      type: 'Fungal',
      symptoms: ['Brown spots on lower leaves'],
      description: 'A common fungal disease.',
      severityLevels: ['Medium', 'High'],
      deficiencyType: 'None',
      prevention: ['Crop rotation']
    };
    vi.spyOn(diseaseRepository, 'create').mockResolvedValue(mockSavedDisease);

    const result = await plantDiseaseService.generateAndStore({
      plantName: 'Tomato',
      diseaseName: 'Early Blight'
    });

    expect(result.isNewCrop).toBe(true);
    expect(result.isNewDisease).toBe(true);
    expect(result.crop.name).toBe('Tomato');
    expect(result.disease.name).toBe('Early Blight');
    expect(cropRepository.create).toHaveBeenCalledOnce();
    expect(diseaseRepository.create).toHaveBeenCalledOnce();
  });

  it('should reuse existing crop and only create new disease if crop already exists', async () => {
    vi.spyOn(plantDiseaseService, 'generatePlantDiseaseInfo').mockResolvedValue(mockLLMOutput);
    
    const existingCrop: any = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Tomato',
      scientificName: 'Solanum lycopersicum',
      category: 'Vegetable'
    };
    vi.spyOn(cropRepository, 'findByName').mockResolvedValue(existingCrop);
    const createCropSpy = vi.spyOn(cropRepository, 'create');

    vi.spyOn(diseaseRepository, 'findByNameAndCropId').mockResolvedValue(null);
    const mockSavedDisease: any = {
      _id: new mongoose.Types.ObjectId(),
      cropId: existingCrop._id,
      name: 'Early Blight'
    };
    vi.spyOn(diseaseRepository, 'create').mockResolvedValue(mockSavedDisease);

    const result = await plantDiseaseService.generateAndStore({
      plantName: 'Tomato',
      diseaseName: 'Early Blight'
    });

    expect(result.isNewCrop).toBe(false);
    expect(result.isNewDisease).toBe(true);
    expect(createCropSpy).not.toHaveBeenCalled();
    expect(diseaseRepository.create).toHaveBeenCalledOnce();
  });

  it('should validate input and throw when input is empty', async () => {
    await expect(
      plantDiseaseService.generateAndStore({ plantName: '', diseaseName: 'Blight' })
    ).rejects.toThrow();

    await expect(
      plantDiseaseService.generateAndStore({ plantName: 'Tomato', diseaseName: '' })
    ).rejects.toThrow();
  });
});
