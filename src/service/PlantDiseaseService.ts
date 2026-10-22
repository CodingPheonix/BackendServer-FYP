import { z } from 'zod';
import mongoose from 'mongoose';
import { createRoundRobinTextModel } from '../utils/modelSelector.js';
import { cropRepository } from '../repository/CropRepository.js';
import { diseaseRepository } from '../repository/DiseaseRepository.js';
import { ICrop } from '../model/Crop.js';
import { IDisease } from '../model/Disease.js';

export const DiseaseGenerationInputSchema = z.object({
  plantName: z.string().trim().min(1, 'Plant name is required'),
  diseaseName: z.string().trim().min(1, 'Disease name is required')
});

export type DiseaseGenerationInput = z.infer<typeof DiseaseGenerationInputSchema>;

export const LLMCropSchema = z.object({
  name: z.string().min(1),
  scientificName: z.string().min(1),
  category: z.enum(['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Plantation', 'Flower', 'Other'])
});

export const LLMDiseaseSchema = z.object({
  name: z.string().min(1),
  scientificName: z.string().min(1),
  type: z.enum(['Fungal', 'Bacterial', 'Viral', 'NutrientDeficiency', 'Pest', 'Other']),
  symptoms: z.array(z.string().min(1)).min(1),
  description: z.string().min(1),
  severityLevels: z.array(z.enum(['Low', 'Medium', 'High'])).min(1),
  deficiencyType: z.enum([
    'Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Magnesium', 'Sulfur',
    'Zinc', 'Boron', 'Iron', 'Copper', 'Manganese', 'Molybdenum', 'Chlorine', 'None'
  ]),
  prevention: z.array(z.string().min(1)).min(1)
});

export const LLMPlantDiseaseResponseSchema = z.object({
  crop: LLMCropSchema,
  disease: LLMDiseaseSchema
});

export type LLMPlantDiseaseResponse = z.infer<typeof LLMPlantDiseaseResponseSchema>;

export interface GenerateAndStoreResult {
  message: string;
  isNewCrop: boolean;
  isNewDisease: boolean;
  crop: ICrop;
  disease: IDisease;
}

export class PlantDiseaseService {
  async generateAndStore(input: DiseaseGenerationInput): Promise<GenerateAndStoreResult> {
    const validatedInput = DiseaseGenerationInputSchema.parse(input);
    const { plantName, diseaseName } = validatedInput;

    // 1. Fetch LLM with structured output
    const structuredData = await this.generatePlantDiseaseInfo(plantName, diseaseName);

    // 2. Find or create Crop
    let crop = await cropRepository.findByName(plantName);
    let isNewCrop = false;

    if (!crop) {
      crop = await cropRepository.create({
        name: structuredData.crop.name || plantName,
        scientificName: structuredData.crop.scientificName,
        category: structuredData.crop.category,
        image: ''
      });
      isNewCrop = true;
    }

    // 3. Find or create/update Disease
    let disease = await diseaseRepository.findByNameAndCropId(
      structuredData.disease.name || diseaseName,
      crop._id as mongoose.Types.ObjectId
    );
    let isNewDisease = false;

    if (!disease) {
      disease = await diseaseRepository.create({
        cropId: crop._id as mongoose.Types.ObjectId,
        name: structuredData.disease.name,
        scientificName: structuredData.disease.scientificName,
        type: structuredData.disease.type,
        symptoms: structuredData.disease.symptoms,
        description: structuredData.disease.description,
        severityLevels: structuredData.disease.severityLevels,
        deficiencyType: structuredData.disease.deficiencyType,
        prevention: structuredData.disease.prevention
      });
      isNewDisease = true;
    }

    return {
      message: isNewDisease ? 'Plant and disease information generated and saved successfully' : 'Disease already exists for this plant',
      isNewCrop,
      isNewDisease,
      crop,
      disease
    };
  }

  async generatePlantDiseaseInfo(plantName: string, diseaseName: string): Promise<LLMPlantDiseaseResponse> {
    const model = createRoundRobinTextModel({
      temperature: 0.2
    });

    const structuredLlm = model.withStructuredOutput(LLMPlantDiseaseResponseSchema);

    const prompt = `You are an expert plant pathologist and agronomist.
Generate scientifically accurate, comprehensive details for the following crop/plant and disease.

Plant / Crop Name: ${plantName}
Disease Name: ${diseaseName}

Follow these exact specifications:
- Crop Category must be one of: 'Vegetable', 'Fruit', 'Grain', 'Pulse', 'Plantation', 'Flower', 'Other'
- Disease Type must be one of: 'Fungal', 'Bacterial', 'Viral', 'NutrientDeficiency', 'Pest', 'Other'
- Severity Levels must be an array chosen from: 'Low', 'Medium', 'High'
- Deficiency Type must be one of: 'Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Magnesium', 'Sulfur', 'Zinc', 'Boron', 'Iron', 'Copper', 'Manganese', 'Molybdenum', 'Chlorine', 'None' (use 'None' if it is not a nutrient deficiency)
- Symptoms and Prevention must be detailed lists of actionable, descriptive strings.`;

    const result = await structuredLlm.invoke(prompt);
    return result as LLMPlantDiseaseResponse;
  }
}

export const plantDiseaseService = new PlantDiseaseService();
