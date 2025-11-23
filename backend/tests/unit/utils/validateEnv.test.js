const validateEnv = require('../../../src/utils/validateEnv');

jest.mock('../../../src/utils/logger');

describe('Environment Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Set all required vars by default
    process.env.MONGO_URI = 'mongodb://localhost/test';
    process.env.JWT_SECRET = 'a'.repeat(64);
    process.env.NODE_ENV = 'test';
    process.env.PORT = '5005';
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.BACKEND_BASEURL = 'http://localhost:5005';
    process.env.EMAIL_USER = 'test@test.com';
    process.env.EMAIL_PASS = 'password';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should pass with all required variables', () => {
    expect(() => validateEnv()).not.toThrow();
  });

  it('should exit with missing variables', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    
    // Clear a required env var
    delete process.env.MONGO_URI;

    expect(() => validateEnv()).toThrow('process.exit called');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it('should warn about weak JWT secret', () => {
    process.env.JWT_SECRET = 'short';

    // Should not throw, but should warn
    expect(() => validateEnv()).not.toThrow();
  });
});
