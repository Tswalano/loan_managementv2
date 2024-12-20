import { drizzle } from "drizzle-orm/postgres-js";
import { transactions } from "../db/schema";

const db = drizzle(import.meta.env.DATABASE_URL!);

// fect all loans from supabase
export const loanData = await db.select().from(transactions);