const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Admin Controller - Handles admin HTTP requests
 */
class AdminController {
  /**
   * Register admin (Limited to 2 admins)
   * POST /api/admin/register
   */
  register = asyncHandler(async (req, res) => {
    const result = await authService.registerAdmin(req.body);
    successResponse(res, result, result.message, HTTP_STATUS.CREATED);
  });

  /**
   * Login admin
   * POST /api/admin/login
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    successResponse(res, result, 'Login successful');
  });
}

module.exports = new AdminController();
