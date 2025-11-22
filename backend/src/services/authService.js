const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const ngoRepository = require('../repositories/ngoRepository');
const adminRepository = require('../repositories/adminRepository');
const { 
  BadRequestError, 
  UnauthorizedError, 
  ConflictError,
  ForbiddenError 
} = require('../utils/errors');
const { USER_ROLES, TOKEN_EXPIRY } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Authentication Service - Handles all authentication logic
 */
class AuthService {
  /**
   * Generate JWT token
   */
  generateToken(payload) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY.ACCESS_TOKEN,
    });
  }

  /**
   * Hash password
   */
  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Compare password
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Register volunteer
   */
  async registerVolunteer(userData) {
    const { name, email, password, location } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = await userRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      location: location || 'Not specified',
      role: USER_ROLES.VOLUNTEER,
    });

    logger.info(`Volunteer registered: ${email}`);

    return {
      message: 'Volunteer registered successfully',
      userId: user._id,
    };
  }

  /**
   * Register NGO
   */
  async registerNGO(ngoData) {
    const { name, email, password, organization } = ngoData;

    // Check if NGO already exists
    const existingNGO = await ngoRepository.findByEmail(email);
    if (existingNGO) {
      throw new ConflictError('NGO with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create NGO
    const ngo = await ngoRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      organization,
      role: USER_ROLES.NGO,
    });

    logger.info(`NGO registered: ${email}`);

    return {
      message: 'NGO registered successfully',
      ngoId: ngo._id,
    };
  }

  /**
   * Register Admin (Limited to 2 admins)
   */
  async registerAdmin(adminData) {
    const { name, email, password } = adminData;

    // Check admin limit (maximum 2 admins allowed)
    const adminCount = await adminRepository.findAll();
    if (adminCount.length >= 2) {
      throw new BadRequestError('Admin registration limit reached. Maximum 2 admins allowed.');
    }

    // Check if admin already exists
    const existingAdmin = await adminRepository.findByEmail(email);
    if (existingAdmin) {
      throw new ConflictError('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create admin
    const admin = await adminRepository.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: USER_ROLES.ADMIN,
    });

    logger.info(`Admin registered: ${email} (${adminCount.length + 1}/2)`);

    return {
      message: 'Admin registered successfully',
      adminId: admin._id,
    };
  }

  /**
   * Login volunteer
   */
  async loginVolunteer(email, password) {
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if user is blocked
    if (user.isBlocked) {
      throw new ForbiddenError('Your account has been blocked. Please contact support.');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      id: user._id,
      role: user.role,
    });

    logger.info(`Volunteer logged in: ${email}`);

    return {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
        isBlocked: user.isBlocked,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Login NGO
   */
  async loginNGO(email, password) {
    // Find NGO
    const ngo = await ngoRepository.findByEmail(email);
    if (!ngo) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if NGO is blocked
    if (ngo.status === 'blocked') {
      throw new ForbiddenError('Your account has been blocked. Please contact support.');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, ngo.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      id: ngo._id,
      email: ngo.email,
      role: ngo.role,
    });

    logger.info(`NGO logged in: ${email}`);

    return {
      token,
      ngo: {
        _id: ngo._id,
        name: ngo.name,
        email: ngo.email,
        organization: ngo.organization,
        role: ngo.role,
        status: ngo.status,
      },
    };
  }

  /**
   * Login Admin
   */
  async loginAdmin(email, password) {
    // Find admin
    const admin = await adminRepository.findByEmail(email);
    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await this.comparePassword(password, admin.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate token
    const token = this.generateToken({
      id: admin._id,
      email: admin.email,
      role: admin.role,
    });

    logger.info(`Admin logged in: ${email}`);

    return {
      token,
      admin: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    };
  }
}

module.exports = new AuthService();
