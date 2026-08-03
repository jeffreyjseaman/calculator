require('dotenv').config();

const config = {
  port: Number(process.env.PORT) || 3001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  isTest: process.env.NODE_ENV === 'test',
};

module.exports = config;
