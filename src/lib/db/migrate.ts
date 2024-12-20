// src/db/migrate.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrationClient } from './config';
import { sql } from 'drizzle-orm';
// import { rls_policies } from '@/lib/db/schema';
// import { allPolicies } from './policies';
import { rls_policies } from './schema';

async function dropAllTables() {
    const db = drizzle(migrationClient);
    try {
        console.log('Dropping all tables and types...');

        // Check existing tables
        const existingTables = await migrationClient`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `;

        const tableNames = existingTables.map(t => t.tablename);
        console.log('Existing tables:', tableNames);

        // Drop tables and types
        await db.execute(sql`
            DO $$ 
            DECLARE
                r RECORD;
            BEGIN
                -- Disable triggers
                SET session_replication_role = 'replica';
                
                -- Drop all tables in the correct order
                FOR r IN (
                    SELECT tablename 
                    FROM pg_tables 
                    WHERE schemaname = 'public'
                    AND tablename != '_prisma_migrations'
                    AND tablename != 'migrations'
                ) LOOP
                    EXECUTE format('DROP TABLE IF EXISTS %I CASCADE', r.tablename);
                END LOOP;

                -- Drop types if they exist
                DROP TYPE IF EXISTS "loanStatus" CASCADE;
                DROP TYPE IF EXISTS "transactionType" CASCADE;
                DROP TYPE IF EXISTS "balanceType" CASCADE;

                -- Re-enable triggers
                SET session_replication_role = 'origin';
            END $$;
        `);

        console.log('Successfully dropped all tables and types');
    } catch (error) {
        console.error('Error dropping tables:', error);
        throw error;
    }
}

async function applyRLSPolicies() {
    try {
        console.log('Applying RLS policies...');
        const db = drizzle(migrationClient);
        await db.execute(sql.raw(rls_policies));
        console.log('Successfully applied RLS policies');
    } catch (error) {
        console.error('Error applying RLS policies:', error);
        throw error;
    }
}

async function runMigrations() {
    try {
        const db = drizzle(migrationClient);
        
        console.log('Starting migrations...');
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('Migrations completed successfully');

        // Apply RLS policies after migrations
        console.log('Applying RLS policies...');
        await applyRLSPolicies();
        console.log('RLS policies applied successfully');
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

// async function applyPolicies() {
//     try {
//         console.log('Applying policies...');
//         const db = drizzle(migrationClient);
//         await db.execute(sql.raw(allPolicies));
//         console.log('Successfully applied policies');
//     } catch (error) {
//         console.error('Error applying policies:', error);
//         throw error;
//     }
// }

// async function runMigrations() {
//     try {
//         const db = drizzle(migrationClient);
        
//         console.log('Starting migrations...');
//         await migrate(db, { migrationsFolder: './drizzle' });
//         console.log('Migrations completed successfully');

//         // Apply policies after migrations
//         await applyPolicies();
//         console.log('Policies applied successfully');
//     } catch (error) {
//         console.error('Migration failed:', error);
//         throw error;
//     }
// }

async function main() {
    const args = process.argv.slice(2);

    try {
        if (args.includes('--fresh')) {
            console.log('Running fresh migrations (dropping all tables first)...');
            await dropAllTables();
            console.log('Tables dropped successfully');
        }

        console.log('Running migrations...');
        await runMigrations();
        console.log('All operations completed successfully');
    } catch (error) {
        console.error('Error during migration process:', error);
    } finally {
        await migrationClient.end();
        process.exit(0);
    }
}

// Run migrations
main().catch(async (error) => {
    console.error('Fatal error during migration:', error);
    await migrationClient.end();
    process.exit(1);
});