import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export default {
  port: Number(process.env.PORT) || 4000,
  env: process.env.NODE_ENV || 'development',
  redis: {
    enabled: (process.env.REDIS_ENABLED === 'true'),
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379)
  },
  db: {
    connection: process.env.DB_CONNECTION || './data/chatbot.db'
  },
  contextTTLSeconds: Number(process.env.CONTEXT_TTL_SECONDS || 3600),
  logLevel: process.env.LOG_LEVEL || 'info',
  languageTool: {
    url: process.env.LANGUAGETOOL_URL || 'https://api.languagetool.org/v2/check',
    language: process.env.LANGUAGE || 'en-US'
  }
};
