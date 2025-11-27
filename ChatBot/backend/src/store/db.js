import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import config from '../config/config.js';

const dbFile = config.db.connection;
const dir = path.dirname(dbFile);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(dbFile);

db.prepare(`
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  created_at TEXT,
  messages TEXT
)
`).run();

export default db;
