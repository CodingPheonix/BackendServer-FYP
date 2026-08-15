import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
    sender: 'user' | 'ai' | 'system' | 'rag';
    content: string;
    timestamp: Date;
}

export interface IChatSession extends Document {
    userId: string;
    sessionId: string;
    messages: IMessage[];
    createdAt: Date;
    updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
    sender: { type: String, enum: ['user', 'ai', 'system', 'rag'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const ChatSessionSchema = new Schema<IChatSession>({
    userId: { type: String, required: true },
    sessionId: { type: String, required: true },
    messages: [MessageSchema]
}, {
    timestamps: true,
    collection: 'chats'
});

// Compound index for quick querying
ChatSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

export const Chat = mongoose.model<IChatSession>('Chat', ChatSessionSchema);
