import mongoose, { Schema, Document } from 'mongoose';
import { LeafDiseaseRuntime } from '../runtime/types.js';

export interface ISession extends Document, Omit<LeafDiseaseRuntime, 'createdAt' | 'lastActivityAt'> {
    pastSessions?: PastSession[];
    createdAt: Date;
    lastActivityAt: Date;
}

export interface PastSession {
    date: Date;
    suggestions: string[];
}

const PastSessionSchema = new Schema<PastSession>({
    date: { type: Date },
    suggestions: [{ type: String }]
});

const SessionSchema: Schema = new Schema({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },

    conversation: {
        handle: { type: String, required: false }
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

    pastSessions: [PastSessionSchema],

    lastActivityAt: { type: Date, default: Date.now }
}, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'lastActivityAt' },
    collection: 'chatSessions'
});

// Compound index for fast querying by session and user
SessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const Session = mongoose.model<ISession>('chatSession', SessionSchema);
