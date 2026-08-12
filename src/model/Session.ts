import mongoose, { Schema, Document } from 'mongoose';
import { LeafDiseaseRuntime } from '../runtime/types.js';

export interface ISession extends Document, Omit<LeafDiseaseRuntime, 'createdAt' | 'lastActivityAt'> {
    createdAt: Date;
    lastActivityAt: Date;
}

const SessionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    
    conversation: {
        handle: { type: String, required: true }
    },
    
    plant: {
        cropId: { type: String, required: true },
        cropName: { type: String, required: true },
        diseaseId: { type: String },
        diseaseName: { type: String },
        confidence: { type: Number }
    },
    
    rag: {
        queries: [{ type: String }],
        context: { type: String },
        retrievedAt: { type: Date }
    },
    
    lastActivityAt: { type: Date, default: Date.now }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastActivityAt' },
    collection: 'session'
});

// Compound index for fast querying by session and user
SessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const Session = mongoose.model<ISession>('Session', SessionSchema);
