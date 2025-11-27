// Set environment before requiring modules
process.env.JWT_SECRET = 'test-secret-for-testing-purposes-only';

const jwt = require('jsonwebtoken');
const { verifyToken, verifyAdmin, verifyNGO } = require('../../../middleware/authMiddleware');
const Admin = require('../../../models/admin');
const NGO = require('../../../models/NGO');

jest.mock('../../../models/admin');
jest.mock('../../../models/NGO');
jest.mock('../../../src/utils/logger');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
      headers: {},
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('verifyToken', () => {
    it('should authenticate valid token', () => {
      const token = jwt.sign({ userId: 'user123', role: 'user' }, process.env.JWT_SECRET);
      req.header.mockReturnValue(`Bearer ${token}`);

      verifyToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.userId).toBe('user123');
      expect(next).toHaveBeenCalled();
    });

    it('should reject request without token', () => {
      req.header.mockReturnValue(null);

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', () => {
      req.header.mockReturnValue('Bearer invalid-token');

      verifyToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyAdmin', () => {
    it('should verify admin successfully', async () => {
      const mockAdmin = {
        _id: 'admin123',
        role: 'admin',
        select: jest.fn().mockReturnThis(),
      };

      req.user = { id: 'admin123' };
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockAdmin),
      });

      await verifyAdmin(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockAdmin);
    });

    it('should reject when no user in request', async () => {
      req.user = null;

      await verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject non-admin user', async () => {
      req.user = { id: 'user123' };
      Admin.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await verifyAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyNGO', () => {
    it('should verify NGO successfully', async () => {
      const mockNGO = {
        _id: 'ngo123',
        role: 'ngo',
        status: 'active',
      };

      req.user = { id: 'ngo123' };
      NGO.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockNGO),
      });

      await verifyNGO(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.ngo).toEqual(mockNGO);
    });

    it('should reject when no user in request', async () => {
      req.user = null;

      await verifyNGO(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject blocked NGO', async () => {
      const mockNGO = {
        _id: 'ngo123',
        status: 'blocked',
      };

      req.user = { id: 'ngo123' };
      NGO.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockNGO),
      });

      await verifyNGO(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
