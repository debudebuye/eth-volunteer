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
    
    // Set tokens in HttpOnly cookies (shorter expiration for admin)
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes for admin (shorter than regular users)
    };
    
    res.cookie('token', result.token, cookieOptions);
    res.cookie('refreshToken', result.refreshToken, {
      ...cookieOptions,
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day for admin refresh token
    });
    
    // Send response WITHOUT tokens (use 'user' key for consistency)
    successResponse(res, { user: result.admin }, 'Login successful');
  });
}

module.exports = new AdminController();
