import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { runtimeService } from '../../service/runtimeService.js';
import { Session } from '../../model/Session.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Please create a .env file.");
  }
  await mongoose.connect(mongoUrl, { dbName: 'VitestIntegrationDB' });
});

beforeEach(async () => {
  await Session.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});

const mockUserId = 'user-test-123';
const mockSessionId = 'session-test-456';
const mockInitialData = {
  conversation: { handle: 'conv-handle' },
  plant: { cropId: 'crop-789', cropName: 'Tomato' }
};

describe('RuntimeService Integration', () => {
  describe('loadSession', () => {
    it('should load an existing session by userId and sessionId', async () => {
      await Session.create({
        userId: mockUserId,
        sessionId: mockSessionId,
        ...mockInitialData
      });

      const session = await runtimeService.loadSession(mockUserId, mockSessionId);

      expect(session).not.toBeNull();
      expect(session?.userId).toBe(mockUserId);
      expect(session?.sessionId).toBe(mockSessionId);
    });

    it('should return null if the session does not exist', async () => {
      const session = await runtimeService.loadSession(mockUserId, mockSessionId);

      expect(session).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should create a new session if it does not exist and initialData is provided', async () => {
      const session = await runtimeService.startSession(mockUserId, mockSessionId, mockInitialData);

      expect(session).not.toBeNull();
      expect(session.userId).toBe(mockUserId);
      expect(session.sessionId).toBe(mockSessionId);
      expect(session.plant?.cropName).toBe('Tomato');

      const inDb = await Session.findOne({ userId: mockUserId, sessionId: mockSessionId });
      expect(inDb).not.toBeNull();
    });

    it('should throw an error if the session does not exist and initialData is NOT provided', async () => {
      await expect(runtimeService.startSession(mockUserId, mockSessionId))
        .rejects
        .toThrow('Cannot create a new session without initialData');
    });

    it('should update lastActivityAt and return the existing session if it already exists', async () => {
      const created = await Session.create({
        userId: mockUserId,
        sessionId: mockSessionId,
        ...mockInitialData,
        lastActivityAt: new Date(Date.now() - 100000) // old date
      });

      const session = await runtimeService.startSession(mockUserId, mockSessionId);

      expect(session).not.toBeNull();
      expect(session.userId).toBe(mockUserId);
      expect(session.lastActivityAt?.getTime()).toBeGreaterThan(created.lastActivityAt?.getTime() ?? 0);
    });
  });

  describe('updateSession', () => {
    it('should update an existing session with new data', async () => {
      await Session.create({
        userId: mockUserId,
        sessionId: mockSessionId,
        ...mockInitialData
      });

      const updateData = {
        'plant.confidence': 0.95
      } as any; // Cast as any since Partial<ISession> doesn't support dot notation natively

      const updated = await runtimeService.updateSession(mockUserId, mockSessionId, updateData);

      expect(updated).not.toBeNull();
      expect(updated?.plant?.confidence).toBe(0.95);

      const inDb = await Session.findOne({ userId: mockUserId, sessionId: mockSessionId });
      expect(inDb?.plant?.confidence).toBe(0.95);
    });
  });
});
