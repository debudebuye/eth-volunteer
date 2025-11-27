const eventService = require('../../src/services/eventService');
const eventRepository = require('../../src/repositories/eventRepository');
const emailService = require('../../src/services/emailService');
const { NotFoundError, BadRequestError, ForbiddenError } = require('../../src/utils/errors');
const { EVENT_STATUS } = require('../../src/utils/constants');

jest.mock('../../src/repositories/eventRepository');
jest.mock('../../src/services/emailService');
jest.mock('../../src/utils/logger');

describe('EventService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const eventData = {
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(Date.now() + 86400000), // Tomorrow
        location: 'Addis Ababa',
        creatorEmail: 'ngo@test.com',
        creatorName: 'Test NGO',
      };
      const ngoId = 'ngo123';

      eventRepository.create.mockResolvedValue({
        _id: 'event123',
        ...eventData,
        status: EVENT_STATUS.PENDING,
        createdBy: ngoId,
      });

      const result = await eventService.createEvent(eventData, ngoId);

      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('event');
      expect(eventRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestError for past date', async () => {
      const eventData = {
        name: 'Test Event',
        date: new Date(Date.now() - 86400000), // Yesterday
        location: 'Addis Ababa',
      };

      await expect(eventService.createEvent(eventData, 'ngo123')).rejects.toThrow(BadRequestError);
    });
  });

  describe('getEventById', () => {
    it('should return event when found', async () => {
      const mockEvent = { _id: 'event123', name: 'Test Event' };
      eventRepository.findById.mockResolvedValue(mockEvent);

      const result = await eventService.getEventById('event123');

      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundError when event not found', async () => {
      eventRepository.findById.mockResolvedValue(null);

      await expect(eventService.getEventById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('approveEvent', () => {
    it('should approve event and send email', async () => {
      const mockEvent = {
        _id: 'event123',
        name: 'Test Event',
        creatorEmail: 'ngo@test.com',
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.updateStatus.mockResolvedValue({
        ...mockEvent,
        status: EVENT_STATUS.APPROVED,
      });
      emailService.sendEventApprovalEmail.mockResolvedValue(true);

      const result = await eventService.approveEvent('event123');

      expect(result.message).toContain('approved');
      expect(eventRepository.updateStatus).toHaveBeenCalledWith('event123', EVENT_STATUS.APPROVED);
      expect(emailService.sendEventApprovalEmail).toHaveBeenCalled();
    });
  });

  describe('updateEvent', () => {
    it('should update event when NGO owns it', async () => {
      const ngoId = 'ngo123';
      const mockEvent = {
        _id: 'event123',
        createdBy: ngoId,
        name: 'Old Name',
      };
      const updateData = { name: 'New Name' };

      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.update.mockResolvedValue({
        ...mockEvent,
        ...updateData,
      });

      const result = await eventService.updateEvent('event123', updateData, ngoId);

      expect(result.event.name).toBe('New Name');
    });

    it('should throw ForbiddenError when NGO does not own event', async () => {
      const mockEvent = {
        _id: 'event123',
        createdBy: 'ngo123',
      };

      eventRepository.findById.mockResolvedValue(mockEvent);

      await expect(
        eventService.updateEvent('event123', {}, 'differentNgo')
      ).rejects.toThrow(ForbiddenError);
    });
  });

  describe('likeEvent', () => {
    it('should like event successfully', async () => {
      const mockEvent = {
        _id: 'event123',
        likedBy: [],
      };

      eventRepository.findById.mockResolvedValue(mockEvent);
      eventRepository.addLike.mockResolvedValue({
        ...mockEvent,
        likes: 1,
        likedBy: ['user123'],
      });

      const result = await eventService.likeEvent('event123', 'user123');

      expect(result.message).toContain('liked');
    });

    it('should throw BadRequestError if already liked', async () => {
      const mockEvent = {
        _id: 'event123',
        likedBy: ['user123'],
      };

      eventRepository.findById.mockResolvedValue(mockEvent);

      await expect(eventService.likeEvent('event123', 'user123')).rejects.toThrow(BadRequestError);
    });
  });
});
