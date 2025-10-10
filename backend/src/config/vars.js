const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const number = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const list = (value, fallback) => {
  if (!value) return fallback;
  return value.split(',').map((item) => item.trim()).filter(Boolean);
};

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: number(process.env.PORT, 4000),
  logLevel: process.env.LOG_LEVEL || 'dev',
  corsOrigins: list(process.env.CORS_ORIGIN, ['http://localhost:5173']),
  database: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: number(process.env.MYSQL_PORT, 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD ?? 'secret',
    name: process.env.MYSQL_DB || 'endurancehub'
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'change-me-access',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
    accessExpiresIn: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_TTL || '7d'
  }
};
