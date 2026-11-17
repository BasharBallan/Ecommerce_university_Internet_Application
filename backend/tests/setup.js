const path = require('path');
const dotenv = require('dotenv');

// Load environment variables for tests
dotenv.config({ path: path.join(__dirname, '../config.env') });

process.env.NODE_ENV = 'test';

// Silence Winston internal logs so only structured test explanations and responses appear
try {
  const logger = require('../utils/logger');
  logger.silent = true;
  if (logger.transports) {
    logger.transports.forEach((t) => {
      t.silent = true;
    });
  }
} catch (e) {
  // Ignore if logger is not initialized yet
}
