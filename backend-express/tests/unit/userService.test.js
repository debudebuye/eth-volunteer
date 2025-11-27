const userService = require('../../src/services/userService');
const userRepository = require('../../src/repositories/userRepository');
const { NotFoundError, BadRequestError } = require('../../src/utils/errors');

jest.mock('../../src/repositories/userRepository');
jest.mock('../../src/utils/logger');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        _id: 'user123',
        name: 'John Doe',
        email: 'john@test.com',
      };

      userRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundError when user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const email = 'john@test.com';
      const mockUser = {
        _id: 'user123',
        email,
        name: 'Old Name',
      };
      const updateData = {
        name: 'New Name',
        location: 'Addis Ababa',
      };

      userRepository.findByEmail.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await userService.updateProfile(email, updateData);

      expect(result.name).toBe('New Name');
      expect(result.location).toBe('Addis Ababa');
    });
  });

  describe('toggleBlockUser', () => {
    it('should block user successfully', async () => {
      const mockUser = {
        _id: 'user123',
        isBlocked: false,
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.toggleBlock.mockResolvedValue({
        ...mockUser,
        isBlocked: true,
      });

      const result = await userService.toggleBlockUser('user123', true);

      expect(result.message).toContain('blocked');
      expect(result.user.isBlocked).toBe(true);
    });
  });

  describe('joinEvent', () => {
    it('should join event successfully', async () => {
      const mockUser = {
        _id: 'user123',
        joinedEvents: [],
      };

      userRepository.findById.mockResolvedValue(mockUser);
      userRepository.addJoinedEvent.mockResolvedValue({
        ...mockUser,
        joinedEvents: ['event123'],
      });

      const result = await userService.joinEvent('user123', 'event123');

      expect(result.message).toContain('joined');
    });

    it('should throw BadRequestError if already joined', async () => {
      const mockUser = {
        _id: 'user123',
        joinedEvents: ['event123'],
      };

      userRepository.findById.mockResolvedValue(mockUser);

      await expect(userService.joinEvent('user123', 'event123')).rejects.toThrow(BadRequestError);
    });
  });
});
