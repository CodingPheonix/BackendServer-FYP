import mongoose, { Schema, Document } from 'mongoose';

export interface IDisease extends Document {
  cropId: mongoose.Types.ObjectId;
  name: string;
  scientificName: string;
  type: 'Fungal' | 'Bacterial' | 'Viral' | 'NutrientDeficiency' | 'Pest' | 'Other';
  symptoms: string[];
  description: string;
  severityLevels: ('Low' | 'Medium' | 'High')[];
  deficiencyType: 'Nitrogen' | 'Phosphorus' | 'Potassium' | 'Calcium' | 'Magnesium' | 'Sulfur' | 'Zinc' | 'Boron' | 'Iron' | 'Copper' | 'Manganese' | 'Molybdenum' | 'Chlorine' | 'None';
  prevention: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DiseaseSchema: Schema = new Schema({
  cropId: { type: Schema.Types.ObjectId, ref: 'Crop', required: true },
  name: { type: String, required: true },
  scientificName: { type: String, required: true },
  type: {
    type: String,
    enum: ['Fungal', 'Bacterial', 'Viral', 'NutrientDeficiency', 'Pest', 'Other'],
    required: true
  },
  symptoms: [{ type: String }],
  description: { type: String, required: true },
  severityLevels: [{
    type: String,
    enum: ['Low', 'Medium', 'High']
  }],
  deficiencyType: {
    type: String,
    enum: [
      'Nitrogen', 'Phosphorus', 'Potassium', 'Calcium', 'Magnesium', 'Sulfur',
      'Zinc', 'Boron', 'Iron', 'Copper', 'Manganese', 'Molybdenum', 'Chlorine', 'None'
    ],
    required: true
  },
  prevention: [{ type: String }]
}, {
  timestamps: true
});

export const Disease = mongoose.model<IDisease>('Disease', DiseaseSchema);
