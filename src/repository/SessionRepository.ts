import { Session, ISession } from '../model/Session.js';
import mongoose from 'mongoose';

export class SessionRepository {
    async create(data: Partial<ISession>): Promise<ISession> {
        const session = new Session(data);
        return await session.save();
    }

    async findById(id: string): Promise<ISession | null> {
        return await Session.findById(id);
    }

    async findByUserIdAndSessionId(userId: string, sessionId: string): Promise<ISession | null> {
        return await Session.findOne({ userId, sessionId });
    }

    async findByUserId(userId: string): Promise<ISession[]> {
        return await Session.find({ userId }).sort({ lastActivityAt: -1 });
    }

    async addPastSession(userId: string, sessionId: string, suggestions: string[]): Promise<ISession | null> {
        return await Session.findOneAndUpdate(
            { userId, sessionId },
            {
                $push: {
                    pastSessions: {
                        date: new Date(),
                        suggestions
                    }
                },
                $set: { lastActivityAt: new Date() }
            },
            { returnDocument: 'after' }
        );
    }

    async updateById(id: string, data: mongoose.UpdateQuery<ISession>): Promise<ISession | null> {
        data.lastActivityAt = new Date();
        return await Session.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }

    async updateBySessionAndUserId(userId: string, sessionId: string, data: mongoose.UpdateQuery<ISession>): Promise<ISession | null> {
        data.lastActivityAt = new Date();
        return await Session.findOneAndUpdate({ userId, sessionId }, data, { returnDocument: 'after' });
    }

    async deleteById(id: string): Promise<ISession | null> {
        return await Session.findByIdAndDelete(id);
    }

    async deleteBySessionAndUserId(userId: string, sessionId: string): Promise<ISession | null> {
        return await Session.findOneAndDelete({ userId, sessionId });
    }
}

export const sessionRepository = new SessionRepository();
