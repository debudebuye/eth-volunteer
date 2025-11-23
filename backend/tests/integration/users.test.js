const request = require('supertest');
const app = require('../../src/app');
const User = require('../../models/User');
const connectDB = require('../../config/db');
const jwt = require('jsonwebtoken');

jest.mock('../../config/db');
jest.mock('../../src/utils/logger');

// Set test timeout
jest.setTimeout(10000);

describe('Users API Integration Tests', () => {
  let authToken;
  let server;

  beforeAll(() => {
    connectDB.mockImplementation(() => Promise.resolve());
    // Create a test token
    authToken = jwt.sign(
      { userId: 'user123', role: 'user' },
      process.env.JWT_SECRET || 'test-secret'
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll((done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe('GET /api/v1/users/profile', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const response = await request(app)
        .get('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/v1/users/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/v1/users/profile', () => {
    it('should update user profile', async () => {
      const mockUser = {
        _id: 'user123',
        email: 'test@example.com',
      };

      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({
        ...mockUser,
        name: 'Updated Name',
      });

      const response = await request(app)
        .put('/api/v1/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          location: 'Addis Ababa',
        });

      expect(response.status).toBe(200);
    });
  });
});
