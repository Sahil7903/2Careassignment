import pkg from 'pg';
const { Pool } = pkg;

// Use a singleton for the connection pool
let pool: any;

export function getPool() {
  if (!pool) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await getPool().query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}
