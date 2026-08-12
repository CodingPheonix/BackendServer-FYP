import mongoose, { Schema, Document } from 'mongoose';

export interface ICrop extends Document {
  name: string;
  scientificName: string;
  category: 'Vegetable' | 'Fruit' | 'Grain' | 'Pulse' | 'Plantation' | 'Flower' | 'Other';
  image: string;
  createdAt: Date;
  updatedAt: Date;
}

const CropSchema: Schema = new Schema({
  name: { type: String, required: true },
  scientificName: { type: String, required: true },
  category: {
    type: String,
    enum: ['Vegetable', 'Fruit', 'Grain', 'Pulse', 'Plantation', 'Flower', 'Other'],
    required: true
  },
  image: { type: String }
}, {
  timestamps: true
});

export const Crop = mongoose.model<ICrop>('Crop', CropSchema);
