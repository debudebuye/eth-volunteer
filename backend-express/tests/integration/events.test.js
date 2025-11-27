const request = require('supertest');
const app = require('../../src/app');
const Event = require('../../models/Event');
const connectDB = require('../../config/db');

jest.mock('../../config/db');
jest.mock('../../src/utils/logger');

// Set test timeout
jest.setTimeout(10000);

describe('Events API Integration Tests', () => {
  let server;

  beforeAll(() => {
    connectDB.mockImplementation(() => Promise.resolve());
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

  describe('GET /api/v1/events', () => {
    it('should return approved events', async () => {
      const mockEvents = [
        {
          _id: 'event1',
          name: 'Test Event 1',
          status: 'approved',
          date: new Date(),
        },
      ];

      jest.spyOn(Event, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvents),
      });

      const response = await request(app).get('/api/v1/events');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/v1/events/:id', () => {
    it('should return event by ID', async () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        status: 'approved',
      };

      jest.spyOn(Event, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockEvent),
      });

      const response = await request(app).get('/api/v1/events/event123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent event', async () => {
      jest.spyOn(Event, 'findById').mockReturnValue({
        populate: jest.fn().mockResolvedValue(null),
      });

      const response = await request(app).get('/api/v1/events/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
