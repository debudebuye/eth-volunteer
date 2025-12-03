const logger = require('./logger');

/**
 * Validates that all required environment variables are set
 * Exits the process if any required variables are missing
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'MONGO_URI',
    'JWT_SECRET',
    'NODE_ENV',
    'PORT',
    'FRONTEND_URL',
    'BACKEND_BASEURL',
    'EMAIL_USER',
    'EMAIL_PASSWORD'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      logger.error(`   - ${varName}`);
    });
    logger.error('\nPlease check your .env file and ensure all required variables are set.');
    logger.error('See .env.example for reference.');
    process.exit(1);
  }

  // Validate JWT_SECRET strength (should be at least 32 characters)
  if (process.env.JWT_SECRET.length < 32) {
    logger.warn('⚠️  JWT_SECRET is too short. Recommended: 64+ characters for production.');
  }

  // Validate NODE_ENV
  const validEnvs = ['development', 'production', 'test'];
  if (!validEnvs.includes(process.env.NODE_ENV)) {
    logger.warn(`⚠️  NODE_ENV should be one of: ${validEnvs.join(', ')}`);
  }

  logger.info('✅ Environment variables validated successfully');
};

module.exports = validateEnv;
