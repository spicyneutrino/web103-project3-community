import 'dotenv/config';
import pg from 'pg';
const host = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL).hostname : process.env.PGHOST;
const privateRender = process.env.RENDER === 'true' && /^dpg-[a-z0-9-]+$/.test(host || '');
export const pool = new pg.Pool({
  ...(process.env.DATABASE_URL ? { connectionString: process.env.DATABASE_URL } : {}),
  ...(process.env.PGSSLMODE === 'require' || process.env.NODE_ENV === 'production' ? { ssl: { rejectUnauthorized: !privateRender } } : {}),
  max: 10, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000
});
