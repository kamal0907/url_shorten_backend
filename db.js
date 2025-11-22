// db.js
import { Pool } from 'pg';
import 'dotenv/config';

let connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not available');

connectionString = connectionString.trim();
// normalize provider URL if it starts with "postgresql://"
if (connectionString.startsWith('postgresql://')) {
  connectionString = connectionString.replace('postgresql://', 'postgres://');
}

function getHost(conn) {
  try {
    return new URL(conn).hostname;
  } catch (e) {
    const m = conn.match(/@([^:/?]+)(?::\d+)?\/?/);
    return m ? m[1] : null;
  }
}

const host = getHost(connectionString);
const useSsl = host && host !== 'localhost' && host !== '127.0.0.1';

const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
});

export async function query(text, params) {
  return pool.query(text, params);
}

export default pool;
