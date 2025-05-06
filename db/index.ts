// db/index.ts
import postgres from 'pg'; // Default import
const { Pool } = postgres; // Destructure Pool

import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query('SELECT 1')
  .then(() => console.log('✅ DB connected'))
  .catch((err) => console.error('❌ DB connection error:', err));


export const db = drizzle(pool, { schema });
export { pool };