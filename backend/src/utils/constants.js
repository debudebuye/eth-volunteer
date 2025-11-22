// User roles
const USER_ROLES = {
  ADMIN: 'admin',
  NGO: 'ngo',
  VOLUNTEER: 'volunteer',
};

// Event status
const EVENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// NGO status
const NGO_STATUS = {
  ACTIVE: 'active',
  BLOCKED: 'blocked',
};

// HTTP status codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};

// Token expiration
const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '24h',
  REFRESH_TOKEN: '7d',
};

// Validation constraints
const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  COMMENT_MAX_LENGTH: 500,
};

// Rate limiting
const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000,
    MAX_REQUESTS: 5,
  },
  REGISTRATION: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 3,
  },
};

module.exports = {
  USER_ROLES,
  EVENT_STATUS,
  NGO_STATUS,
  HTTP_STATUS,
  TOKEN_EXPIRY,
  VALIDATION,
  RATE_LIMITS,
};
