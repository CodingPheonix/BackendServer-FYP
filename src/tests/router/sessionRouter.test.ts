import { describe, it, expect, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import sessionRouter from '../../router/sessionRouter.js';
import { Session } from '../../model/Session.js';
import mongoose from 'mongoose';
import { Runtime } from '../../runtime/Runtime.js';

beforeAll(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL is missing. Please create a .env file.");
  }
  await mongoose.connect(mongoUrl, { dbName: 'VitestIntegrationDB' });
});

beforeEach(async () => {
  await Session.deleteMany({});
  // We cannot easily clear the private static activeRuntimes map from outside,
  // but we can remove specific instances we test via the newly added method.
});

afterAll(async () => {
  await mongoose.connection.db?.dropDatabase();
  await mongoose.connection.close();
});

const app = express();
app.use(express.json());
app.use('/api/sessions', sessionRouter);

describe('Session Router Integration', () => {
  
  describe('POST /api/sessions/init', () => {
    it('should initialize an existing session into memory and return 200', async () => {
      // First create a session in DB manually
      await Session.create({
        userId: 'user-1',
        sessionId: 'sess-1',
        conversation: { handle: 'handle-1' },
        plant: { cropId: 'crop-1', cropName: 'Crop1' }
      });

      const response = await request(app)
        .post('/api/sessions/init')
        .send({ userId: 'user-1', sessionId: 'sess-1' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Session initialized');
      expect(response.body.data.userId).toBe('user-1');
      expect(response.body.data.sessionId).toBe('sess-1');

      // Cleanup runtime map
      Runtime.removeInstance('user-1', 'sess-1');
    });

    it('should return 400 if userId or sessionId is missing', async () => {
      const response = await request(app)
        .post('/api/sessions/init')
        .send({ userId: 'user-1' }); // missing sessionId

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId and sessionId are required');
    });
  });

  describe('POST /api/sessions/start', () => {
    it('should create a new session, load it to memory, and return 201', async () => {
      const initialData = {
        conversation: { handle: 'handle-new' },
        plant: { cropId: 'crop-2', cropName: 'Crop2' }
      };

      const response = await request(app)
        .post('/api/sessions/start')
        .send({ userId: 'user-2', sessionId: 'sess-2', initialData });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Session started');
      expect(response.body.data.userId).toBe('user-2');
      expect(response.body.data.sessionId).toBe('sess-2');

      const count = await Session.countDocuments({ userId: 'user-2', sessionId: 'sess-2' });
      expect(count).toBe(1);

      Runtime.removeInstance('user-2', 'sess-2');
    });

    it('should return 400 if initialData is missing', async () => {
      const response = await request(app)
        .post('/api/sessions/start')
        .send({ userId: 'user-3', sessionId: 'sess-3' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId, sessionId, and initialData are required');
    });
  });

  describe('DELETE /api/sessions', () => {
    it('should delete an existing session from DB and memory', async () => {
      await Session.create({
        userId: 'user-del',
        sessionId: 'sess-del',
        conversation: { handle: 'handle-del' },
        plant: { cropId: 'crop-del', cropName: 'CropDel' }
      });

      const response = await request(app)
        .delete('/api/sessions')
        .send({ userId: 'user-del', sessionId: 'sess-del' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Session deleted successfully');

      const count = await Session.countDocuments({ userId: 'user-del', sessionId: 'sess-del' });
      expect(count).toBe(0);
    });

    it('should return 404 if session does not exist', async () => {
      const response = await request(app)
        .delete('/api/sessions')
        .send({ userId: 'user-missing', sessionId: 'sess-missing' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Session not found');
    });

    it('should return 400 if userId or sessionId is missing', async () => {
      const response = await request(app)
        .delete('/api/sessions')
        .send({ sessionId: 'sess-del' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('userId and sessionId are required in the body');
    });
  });
});
