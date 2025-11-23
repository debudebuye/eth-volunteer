const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Auth Controller - Handles authentication HTTP requests
 */
class AuthController {
  /**
   * Register volunteer
   * POST /api/auth/register/volunteer
   */
  registerVolunteer = asyncHandler(async (req, res) => {
    const result = await authService.registerVolunteer(req.body);
    successResponse(res, result, result.message, HTTP_STATUS.CREATED);
  });

  /**
   * Register NGO
   * POST /api/auth/register/ngo
   */
  registerNGO = asyncHandler(async (req, res) => {
    const result = await authService.registerNGO(req.body);
    successResponse(res, result, result.message, HTTP_STATUS.CREATED);
  });

  /**
   * Login volunteer
   * POST /api/auth/login
   */
  loginVolunteer = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginVolunteer(email, password);
    successResponse(res, result, 'Login successful');
  });

  /**
   * Login NGO
   * POST /api/auth/login-ngo
   */
  loginNGO = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginNGO(email, password);
    successResponse(res, result, 'Login successful');
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    successResponse(res, result, 'Token refreshed successfully');
  });
}

module.exports = new AuthController();
