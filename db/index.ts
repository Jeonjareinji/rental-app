// db/index.ts
import postgres from 'pg'; // Default import
const { Pool } = postgres; // Destructure Pool

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const pool = new Pool({
  host: process.env.DB_HOST as string,
  port: parseInt(process.env.DB_PORT as string),
  user: process.env.DB_USER as string,
  password: process.env.DB_PASSWORD as string, // Explicit string casting
  database: process.env.DB_NAME as string,
});

console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Check type
  database: process.env.DB_NAME
});

// Tambahkan validasi
if (!process.env.DB_PASSWORD) {
  throw new Error('DB_PASSWORD is not defined in environment variables');
}

pool.query('SELECT 1')
  .then(() => console.log('✅ DB connected'))
  .catch((err) => console.error('❌ DB connection error:', err));

export const db = drizzle(pool, { schema });
export { pool };