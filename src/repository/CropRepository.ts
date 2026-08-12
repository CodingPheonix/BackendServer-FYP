import { Crop, ICrop } from '../model/Crop.js';

export class CropRepository {
  async create(data: Partial<ICrop>): Promise<ICrop> {
    const crop = new Crop(data);
    return await crop.save();
  }

  async insertMany(data: Partial<ICrop>[]): Promise<ICrop[]> {
    return await Crop.insertMany(data) as unknown as ICrop[];
  }

  async findById(id: string): Promise<ICrop | null> {
    return await Crop.findById(id);
  }

  async findAll(): Promise<ICrop[]> {
    return await Crop.find();
  }

  async updateById(id: string, data: Partial<ICrop>): Promise<ICrop | null> {
    return await Crop.findByIdAndUpdate(id, data, { returnDocument: 'after' });
  }

  async deleteById(id: string): Promise<ICrop | null> {
    return await Crop.findByIdAndDelete(id);
  }
}

export const cropRepository = new CropRepository();
