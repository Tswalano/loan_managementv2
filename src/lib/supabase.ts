import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres'
// import * as schema from './db/schema'

const DATABASE_URL = import.meta.env.VITE_DATABASE_URL;
const SUPERBASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUPERBASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!DATABASE_URL) {
    throw new Error('DATABASE_URL is not set')
}

// export const client = postgres(DATABASE_URL, { prepare: false, ssl: { rejectUnauthorized: false }, })

// const db = drizzle(client);
const client = postgres(DATABASE_URL, { prepare: false })
const db = drizzle({ client })

export const supabase = createClient(SUPERBASE_URL, SUPERBASE_ANON_KEY)

export default db;