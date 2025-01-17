import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

export default {
    out: './drizzle',
    dialect: "postgresql",
    schema: './db/schema.ts',
    dbCredentials: {
        url: `${process.env.DATABASE_URL}`
    },
    verbose: true,
    strict: true,
    // migrations: {
    //     schema: 'public',
    // }
} satisfies Config;