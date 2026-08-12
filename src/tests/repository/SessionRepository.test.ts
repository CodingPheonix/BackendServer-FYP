import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import { sessionRepository } from '../../repository/SessionRepository.js';
import { Session } from '../../model/Session.js';
import mongoose from 'mongoose';

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Please create a .env file.");
  }
  // Connect to a specific test database on the real cluster to avoid wiping production data
  await mongoose.connect(mongoUrl, { dbName: 'VitestIntegrationDB' });
});

beforeEach(async () => {
  // Clean up the collection before each test
  await Session.deleteMany({});
});

afterAll(async () => {
  // We don't want to drop the database because other concurrent tests might be using it.
  // We'll just close the connection. Wait, the CropRepository drops it. Let's not drop it here to avoid flakiness, or we just stick to CropRepository pattern. 
  // Actually, deleteMany is enough to clean up the collection.
  // We will drop database if it's the last test running, but we can't guarantee that. 
  // For safety, we won't drop the whole DB here.
  // await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});

const mockSessionData = {
  userId: 'user-123',
  sessionId: 'session-456',
  conversation: { handle: 'conv-handle' },
  plant: { cropId: 'crop-789', cropName: 'Tomato' }
};

describe('SessionRepository Integration', () => {
  describe('create', () => {
    it('should create a new session and return it', async () => {
      const result = await sessionRepository.create(mockSessionData);

      expect(result._id).toBeDefined();
      expect(result.userId).toBe(mockSessionData.userId);
      expect(result.sessionId).toBe(mockSessionData.sessionId);

      const inDb = await Session.findById(result._id);
      expect(inDb?.userId).toBe(mockSessionData.userId);
    });
  });

  describe('findById', () => {
    it('should find a session by id', async () => {
      const created = await Session.create(mockSessionData);

      const result = await sessionRepository.findById(created._id.toString());

      expect(result?.userId).toBe(mockSessionData.userId);
    });

    it('should return null if session is not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await sessionRepository.findById(fakeId);

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndSessionId', () => {
    it('should find a session by userId and sessionId', async () => {
      await Session.create(mockSessionData);

      const result = await sessionRepository.findByUserIdAndSessionId('user-123', 'session-456');

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-123');
      expect(result?.sessionId).toBe('session-456');
    });

    it('should return null if userId and sessionId do not match', async () => {
      await Session.create(mockSessionData);

      const result = await sessionRepository.findByUserIdAndSessionId('user-123', 'wrong-session');

      expect(result).toBeNull();
    });
  });

  describe('updateById', () => {
    it('should update a session by id and return the updated session', async () => {
      const created = await Session.create(mockSessionData);
      
      const updateData = {
        'conversation.handle': 'updated-handle'
      };
      
      const result = await sessionRepository.updateById(created._id.toString(), updateData);

      expect(result?.conversation?.handle).toBe('updated-handle');

      const inDb = await Session.findById(created._id);
      expect(inDb?.conversation?.handle).toBe('updated-handle');
    });

    it('should handle edge case where session is not found on update', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      
      const result = await sessionRepository.updateById(fakeId, { 'conversation.handle': 'updated-handle' });

      expect(result).toBeNull();
    });
  });

  describe('updateBySessionAndUserId', () => {
    it('should update a session by userId and sessionId', async () => {
      await Session.create(mockSessionData);
      
      const updateData = {
        'conversation.handle': 'updated-handle-2'
      };
      
      const result = await sessionRepository.updateBySessionAndUserId('user-123', 'session-456', updateData);

      expect(result?.conversation?.handle).toBe('updated-handle-2');

      const inDb = await Session.findOne({ userId: 'user-123', sessionId: 'session-456' });
      expect(inDb?.conversation?.handle).toBe('updated-handle-2');
    });

    it('should return null if no matching session is found to update', async () => {
      const result = await sessionRepository.updateBySessionAndUserId('user-123', 'non-existent-session', { 'conversation.handle': 'updated-handle-2' });

      expect(result).toBeNull();
    });
  });

  describe('deleteById', () => {
    it('should delete a session by id', async () => {
      const created = await Session.create(mockSessionData);
      
      const result = await sessionRepository.deleteById(created._id.toString());

      expect(result?.userId).toBe('user-123');

      const inDb = await Session.findById(created._id);
      expect(inDb).toBeNull();
    });
  });
});
