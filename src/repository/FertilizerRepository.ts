import { Fertilizer, IFertilizer } from '../model/Fertilizer.js';

export class FertilizerRepository {
  async create(data: Partial<IFertilizer>): Promise<IFertilizer> {
    const fertilizer = new Fertilizer(data);
    return await fertilizer.save();
  }

  async insertMany(data: Partial<IFertilizer>[]): Promise<IFertilizer[]> {
    // Need to cast to any due to mongoose types for insertMany returning documents
    return await Fertilizer.insertMany(data) as unknown as IFertilizer[];
  }

  async findById(id: string): Promise<IFertilizer | null> {
    return await Fertilizer.findById(id);
  }

  async findAll(): Promise<IFertilizer[]> {
    return await Fertilizer.find();
  }

  async updateById(id: string, data: Partial<IFertilizer>): Promise<IFertilizer | null> {
    return await Fertilizer.findByIdAndUpdate(id, data, { new: true });
  }

  async deleteById(id: string): Promise<IFertilizer | null> {
    return await Fertilizer.findByIdAndDelete(id);
  }
}

export const fertilizerRepository = new FertilizerRepository();
