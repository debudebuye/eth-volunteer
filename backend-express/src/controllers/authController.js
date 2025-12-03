const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { successResponse } = require('../utils/response');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Helper function to set auth cookies
 */
const setAuthCookies = (res, token, refreshToken, isAdmin = false) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  };

  res.cookie('token', token, {
    ...cookieOptions,
    maxAge: isAdmin ? 2 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 2h for admin, 24h for others
  });
  
  res.cookie('refreshToken', refreshToken, {
    ...cookieOptions,
    maxAge: isAdmin ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // 24h for admin, 7d for others
  });
};

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
    
    // Set tokens in HttpOnly cookies
    setAuthCookies(res, result.token, result.refreshToken);
    
    // Send response WITHOUT tokens
    successResponse(res, { user: result.user }, 'Login successful');
  });

  /**
   * Login NGO
   * POST /api/auth/login-ngo
   */
  loginNGO = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginNGO(email, password);
    
    console.log('NGO Login - Setting cookies for:', email);
    
    // Set tokens in HttpOnly cookies
    setAuthCookies(res, result.token, result.refreshToken);
    
    console.log('NGO Login - Sending response');
    
    // Send response WITHOUT tokens (use 'user' key for consistency)
    successResponse(res, { user: result.ngo }, 'Login successful');
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  refreshToken = asyncHandler(async (req, res) => {
    // Try to get refresh token from cookie first, then body
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }
    
    const result = await authService.refreshAccessToken(refreshToken);
    
    // Set new token in cookie
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000
    });
    
    successResponse(res, { user: result.user }, 'Token refreshed successfully');
  });

  /**
   * Login Admin
   * POST /api/admin/login
   */
  loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await authService.loginAdmin(email, password);
    
    // Set tokens in HttpOnly cookies (shorter expiration for admin)
    setAuthCookies(res, result.token, result.refreshToken, true);
    
    // Send response WITHOUT tokens (use 'user' key for consistency)
    successResponse(res, { user: result.admin }, 'Login successful');
  });

  /**
   * Logout
   * POST /api/auth/logout
   */
  logout = asyncHandler(async (req, res) => {
    // Clear cookies
    res.clearCookie('token');
    res.clearCookie('refreshToken');
    
    successResponse(res, null, 'Logged out successfully');
  });

  /**
   * Check email availability
   * GET /api/auth/check-email?email=test@example.com
   */
  checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await authService.checkEmailExists(email);
    
    if (result.exists) {
      return res.status(200).json({
        success: true,
        data: {
          available: false,
          message: 'This email is already registered. Please use a different email or login with your existing account.',
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        available: true,
        message: 'Email is available',
      },
    });
  });
}

module.exports = new AuthController();
