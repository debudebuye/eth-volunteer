const authService = require('../../src/services/authService');
const userRepository = require('../../src/repositories/userRepository');
const { ConflictError, UnauthorizedError } = require('../../src/utils/errors');

// Mock repositories
jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/utils/logger');

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.NODE_ENV = 'test';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerVolunteer', () => {
    it('should register a new volunteer successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
        location: 'Addis Ababa',
      };

      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        _id: '123',
        ...userData,
        role: 'volunteer',
      });

      const result = await authService.registerVolunteer(userData);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('userId');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should throw ConflictError if email already exists', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123',
      };

      userRepository.findByEmail.mockResolvedValue({ email: userData.email });

      await expect(authService.registerVolunteer(userData)).rejects.toThrow(ConflictError);
    });
  });

  describe('loginVolunteer', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'john@example.com';
      const password = 'Password123';
      const hashedPassword = await authService.hashPassword(password);

      const mockUser = {
        _id: '123',
        email,
        password: hashedPassword,
        role: 'volunteer',
        isBlocked: false,
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await authService.loginVolunteer(email, password);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(email);
    });

    it('should throw UnauthorizedError with invalid credentials', async () => {
      userRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.loginVolunteer('wrong@example.com', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedError);
    });
  });
});
