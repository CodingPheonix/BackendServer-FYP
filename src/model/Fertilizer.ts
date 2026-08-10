import mongoose, { Schema, Document } from 'mongoose';

export interface IFertilizer extends Document {
  basicInfo: {
    name: string;
    brand: string;
    manufacturer: string;
    type: 'Organic' | 'Chemical' | 'Biofertilizer' | 'Liquid' | 'Granular' | 'Foliar';
    description: string;
    image: string;
  };
  composition: {
    primaryNutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
    secondaryNutrients: {
      calcium: number;
      magnesium: number;
      sulfur: number;
    };
    microNutrients: {
      zinc: number;
      boron: number;
      iron: number;
      copper: number;
      manganese: number;
      molybdenum: number;
      chlorine: number;
    };
  };
  safety: {
    storage: string;
    shelfLifeMonths: number;
    toxicity: 'Low' | 'Medium' | 'High';
    manufacturingDate: number;
  };
  pricing: {
    price: number;
    currency: string;
    packageWeight: string;
    availability: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const FertilizerSchema: Schema = new Schema({
  basicInfo: {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    manufacturer: { type: String, required: true },
    type: {
      type: String,
      enum: ['Organic', 'Chemical', 'Biofertilizer', 'Liquid', 'Granular', 'Foliar'],
      required: true
    },
    description: { type: String, required: true },
    image: { type: String, default: 'dummy_image_url' }
  },
  composition: {
    primaryNutrients: {
      nitrogen: { type: Number, required: true },
      phosphorus: { type: Number, required: true },
      potassium: { type: Number, required: true }
    },
    secondaryNutrients: {
      calcium: { type: Number, required: true },
      magnesium: { type: Number, required: true },
      sulfur: { type: Number, required: true }
    },
    microNutrients: {
      zinc: { type: Number, required: true },
      boron: { type: Number, required: true },
      iron: { type: Number, required: true },
      copper: { type: Number, required: true },
      manganese: { type: Number, required: true },
      molybdenum: { type: Number, required: true },
      chlorine: { type: Number, required: true }
    }
  },
  safety: {
    storage: { type: String, required: true },
    shelfLifeMonths: { type: Number, required: true },
    toxicity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true
    },
    manufacturingDate: { type: Number, required: true }
  },
  pricing: {
    price: { type: Number, required: true },
    currency: { type: String, required: true },
    packageWeight: { type: String, required: true },
    availability: { type: Boolean, required: true }
  }
}, {
  timestamps: true
});

export const Fertilizer = mongoose.model<IFertilizer>('Fertilizer', FertilizerSchema);
