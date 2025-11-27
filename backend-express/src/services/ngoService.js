const ngoRepository = require('../repositories/ngoRepository');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { NGO_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * NGO Service - Handles all NGO-related business logic
 */
class NGOService {
  /**
   * Get all NGOs
   */
  async getAllNGOs() {
    return await ngoRepository.findAll();
  }

  /**
   * Get NGO by ID
   */
  async getNGOById(ngoId) {
    const ngo = await ngoRepository.findById(ngoId);
    if (!ngo) {
      throw new NotFoundError('NGO not found');
    }
    return ngo;
  }

  /**
   * Delete NGO
   */
  async deleteNGO(ngoId) {
    const ngo = await ngoRepository.findById(ngoId);
    if (!ngo) {
      throw new NotFoundError('NGO not found');
    }

    await ngoRepository.delete(ngoId);
    logger.info(`NGO deleted: ${ngoId}`);

    return { message: 'NGO deleted successfully' };
  }

  /**
   * Update NGO status (block/unblock)
   */
  async updateNGOStatus(ngoId, status) {
    // Validate status
    if (!Object.values(NGO_STATUS).includes(status)) {
      throw new BadRequestError('Invalid status');
    }

    const ngo = await ngoRepository.findById(ngoId);
    if (!ngo) {
      throw new NotFoundError('NGO not found');
    }

    const updatedNGO = await ngoRepository.updateStatus(ngoId, status);
    logger.info(`NGO status updated to ${status}: ${ngoId}`);

    return updatedNGO;
  }
}

module.exports = new NGOService();
