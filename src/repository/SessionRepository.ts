import { Session, ISession } from '../model/Session.js';

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

    async updateById(id: string, data: Partial<ISession>): Promise<ISession | null> {
        data.lastActivityAt = new Date();
        return await Session.findByIdAndUpdate(id, data, { returnDocument: 'after' });
    }

    async updateBySessionAndUserId(userId: string, sessionId: string, data: Partial<ISession>): Promise<ISession | null> {
        data.lastActivityAt = new Date();
        return await Session.findOneAndUpdate({ userId, sessionId }, data, { returnDocument: 'after' });
    }

    async deleteById(id: string): Promise<ISession | null> {
        return await Session.findByIdAndDelete(id);
    }
}

export const sessionRepository = new SessionRepository();
