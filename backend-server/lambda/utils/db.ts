import { Pool } from 'pg';

const connectionString = process.env.PG_CONNECTION_STRING;
if (!connectionString) {
    throw new Error('PG_CONNECTION_STRING is required');
}

// Reuse across Lambda invocations
export const pool = new Pool({
    connectionString,
    max: 5, // tune for Lambda concurrency
    // ssl: { rejectUnauthorized: false } // use if needed
});

export async function query<T = any>(text: string, params?: any[]) {
    const client = await pool.connect();
    try {
        const res = await client.query<T>(text, params);
        return res;
    } finally {
        client.release();
    }
}
