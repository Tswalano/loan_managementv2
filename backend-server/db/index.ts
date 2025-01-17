import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
const postgres = require('postgres');
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const DATABASE_URL = process.env.DATABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!DATABASE_URL || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing required environment variables for Supabase configuration');
}

const client = postgres(DATABASE_URL, { prepare: false })
const db = drizzle({ client })

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default db;