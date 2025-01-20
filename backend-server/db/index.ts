import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const SUPERBASE_URL = process.env.SUPERBASE_URL;
const SUPERBASE_ANON_KEY = process.env.SUPERBASE_ANON_KEY;

if (!DATABASE_URL || !SUPERBASE_URL || !SUPERBASE_ANON_KEY) {
    throw new Error('Missing required environment variables for Supabase configuration');
}

const client = postgres(DATABASE_URL, { prepare: false })
const db = drizzle({ client })

export const supabase = createClient(SUPERBASE_URL, SUPERBASE_ANON_KEY)

export default db;