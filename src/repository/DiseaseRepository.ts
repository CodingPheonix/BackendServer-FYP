import { Disease, IDisease } from '../model/Disease.js';
import mongoose from 'mongoose';

export class DiseaseRepository {
  async create(data: Partial<IDisease>): Promise<IDisease> {
    const disease = new Disease(data);
    return await disease.save();
  }

  async insertMany(data: Partial<IDisease>[]): Promise<IDisease[]> {
    return await Disease.insertMany(data) as unknown as IDisease[];
  }

  async findById(id: string): Promise<IDisease | null> {
    return await Disease.findById(id);
  }

  async findAll(): Promise<IDisease[]> {
    return await Disease.find();
  }

  async findByCropId(cropId: string): Promise<IDisease[]> {
    return await Disease.find({ cropId });
  }

  async findByNameAndCropId(name: string, cropId: string | mongoose.Types.ObjectId): Promise<IDisease | null> {
    return await Disease.findOne({
      cropId,
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }
    });
  }

  async updateById(id: string, data: mongoose.UpdateQuery<IDisease>): Promise<IDisease | null> {
    return await Disease.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async deleteById(id: string): Promise<IDisease | null> {
    return await Disease.findByIdAndDelete(id);
  }
}

export const diseaseRepository = new DiseaseRepository();
