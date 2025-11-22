const request = require('supertest');
const app = require('../../src/app');
const User = require('../../models/User');
const connectDB = require('../../config/db');

// Mock database connection
jest.mock('../../config/db');
jest.mock('../../src/utils/logger');

describe('Auth Integration Tests', () => {
  beforeAll(() => {
    connectDB.mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register/volunteer', () => {
    it('should register a new volunteer with valid data', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      
      // Mock User.prototype.save
      jest.spyOn(User.prototype, 'save').mockResolvedValue({
        _id: '123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'volunteer',
      });

      const response = await request(app)
        .post('/api/auth/register/volunteer')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          location: 'Addis Ababa',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register/volunteer')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'Password123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should return 400 with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
        });

      expect(response.status).toBe(400);
    });
  });
});
