// import { drizzle } from 'drizzle-orm/postgres-js';
// const postgres = require('postgres');
// import * as dotenv from 'dotenv';

// dotenv.config();

// const DATABASE_URL = process.env.DATABASE_URL;

// if (!DATABASE_URL) {
//     throw new Error('DATABASE_URL is not defined');
// }

// export const migrationClient = postgres(DATABASE_URL, { max: 1 });
// export const queryClient = postgres(DATABASE_URL);
// export const db = drizzle(queryClient);