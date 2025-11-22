const ngoService = require('../services/ngoService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');

/**
 * NGO Controller - Handles NGO HTTP requests
 */
class NGOController {
  /**
   * Get all NGOs
   * GET /api/ngo/ngo-users
   */
  getAllNGOs = asyncHandler(async (req, res) => {
    const ngos = await ngoService.getAllNGOs();
    successResponse(res, { ngos }, 'NGOs fetched successfully');
  });

  /**
   * Delete NGO
   * DELETE /api/ngo/ngo-users/:id
   */
  deleteNGO = asyncHandler(async (req, res) => {
    const result = await ngoService.deleteNGO(req.params.id);
    successResponse(res, result, result.message);
  });

  /**
   * Update NGO status (block/unblock)
   * PATCH /api/ngo/ngo-users/:id
   */
  updateNGOStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const ngo = await ngoService.updateNGOStatus(req.params.id, status);
    successResponse(res, { ngo }, 'NGO status updated successfully');
  });
}

module.exports = new NGOController();
