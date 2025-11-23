const ngoService = require('../../src/services/ngoService');
const ngoRepository = require('../../src/repositories/ngoRepository');
const { NotFoundError, BadRequestError } = require('../../src/utils/errors');
const { NGO_STATUS } = require('../../src/utils/constants');

jest.mock('../../src/repositories/ngoRepository');
jest.mock('../../src/utils/logger');

describe('NGOService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getNGOById', () => {
    it('should return NGO when found', async () => {
      const mockNGO = {
        _id: 'ngo123',
        name: 'Test NGO',
        organization: 'Test Org',
      };

      ngoRepository.findById.mockResolvedValue(mockNGO);

      const result = await ngoService.getNGOById('ngo123');

      expect(result).toEqual(mockNGO);
    });

    it('should throw NotFoundError when NGO not found', async () => {
      ngoRepository.findById.mockResolvedValue(null);

      await expect(ngoService.getNGOById('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('deleteNGO', () => {
    it('should delete NGO successfully', async () => {
      const mockNGO = { _id: 'ngo123' };

      ngoRepository.findById.mockResolvedValue(mockNGO);
      ngoRepository.delete.mockResolvedValue(true);

      const result = await ngoService.deleteNGO('ngo123');

      expect(result.message).toContain('deleted');
      expect(ngoRepository.delete).toHaveBeenCalledWith('ngo123');
    });
  });

  describe('updateNGOStatus', () => {
    it('should update NGO status successfully', async () => {
      const mockNGO = {
        _id: 'ngo123',
        status: NGO_STATUS.ACTIVE,
      };

      ngoRepository.findById.mockResolvedValue(mockNGO);
      ngoRepository.updateStatus.mockResolvedValue({
        ...mockNGO,
        status: NGO_STATUS.BLOCKED,
      });

      const result = await ngoService.updateNGOStatus('ngo123', NGO_STATUS.BLOCKED);

      expect(result.status).toBe(NGO_STATUS.BLOCKED);
    });

    it('should throw BadRequestError for invalid status', async () => {
      await expect(ngoService.updateNGOStatus('ngo123', 'invalid')).rejects.toThrow(BadRequestError);
    });
  });

  describe('getAllNGOs', () => {
    it('should return all NGOs', async () => {
      const mockNGOs = [
        { _id: 'ngo1', name: 'NGO 1' },
        { _id: 'ngo2', name: 'NGO 2' },
      ];

      ngoRepository.findAll.mockResolvedValue(mockNGOs);

      const result = await ngoService.getAllNGOs();

      expect(result).toEqual(mockNGOs);
      expect(result).toHaveLength(2);
    });
  });
});
