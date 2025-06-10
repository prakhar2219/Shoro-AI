import request from 'supertest';
import app from '../server';
import User from '../models/user.model';
import mongoose from 'mongoose';
import { CONFIG } from '../config/config';

describe('Auth Controller', () => {
  beforeAll(async () => {
    await mongoose.connect(CONFIG.MONGODB_URI);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should signup a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.data.user).toHaveProperty('email', 'test@test.com');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
  });
}); 