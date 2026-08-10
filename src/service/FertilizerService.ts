import { fertilizerRepository } from '../repository/FertilizerRepository.js';
import { IFertilizer } from '../model/Fertilizer.js';

export class FertilizerService {
  async bulkIntake(fertilizers: Partial<IFertilizer>[]) {
    // Force image to be a dummy string for each item
    const formattedData = fertilizers.map(item => {
      return {
        ...item,
        basicInfo: {
          ...item.basicInfo,
          image: "dummy_string"
        }
      } as Partial<IFertilizer>;
    });

    return await fertilizerRepository.insertMany(formattedData);
  }

  async addImage(id: string, imageUrl: string) {
    const fertilizer = await fertilizerRepository.findById(id);
    if (!fertilizer) {
      throw new Error('Fertilizer not found');
    }

    fertilizer.basicInfo.image = imageUrl;
    return await fertilizerRepository.updateById(id, { basicInfo: fertilizer.basicInfo });
  }

  // Other standard CRUD services
  async createFertilizer(data: Partial<IFertilizer>) {
    return await fertilizerRepository.create(data);
  }

  async getFertilizerById(id: string) {
    return await fertilizerRepository.findById(id);
  }

  async getAllFertilizers() {
    return await fertilizerRepository.findAll();
  }

  async updateFertilizer(id: string, data: Partial<IFertilizer>) {
    return await fertilizerRepository.updateById(id, data);
  }

  async deleteFertilizer(id: string) {
    return await fertilizerRepository.deleteById(id);
  }
}

export const fertilizerService = new FertilizerService();
