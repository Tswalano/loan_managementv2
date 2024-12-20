// src/db/schema.ts
import { pgTable, varchar, numeric, text, uuid, pgEnum, timestamp, boolean } from "drizzle-orm/pg-core";

// Existing enums
export const loanStatusEnum = pgEnum('loanStatus', ['ACTIVE', 'PAID', 'DEFAULTED']);
export const transactionTypeEnum = pgEnum('transactionType', ['INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT']);
export const balanceTypeEnum = pgEnum('balanceType', ['CASH', 'BANK', 'MOBILE_MONEY', 'LOAN_RECEIVABLE']);

const timestamps = {
    createdAt: timestamp('createdAt').defaultNow(),
    updatedAt: timestamp('updatedAt').defaultNow().$onUpdate(() => new Date()),
}

// Users Table (Managed by Supabase Auth)
export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    ...timestamps
});

// Balances Table with RLS
export const balances = pgTable('balances', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    type: balanceTypeEnum('type').notNull(),
    accountReference: varchar('accountReference', { length: 255 }).notNull(),
    bankName: varchar('bankName', { length: 255 }).notNull(),
    accountName: varchar('accountName', { length: 255 }).notNull(),
    currentBalance: numeric('currentBalance').notNull().default('0'),
    previousBalance: numeric('previousBalance').notNull().default('0'),
    lastTransactionId: uuid('lastTransactionId'),
    accountStatus: varchar('accountStatus', { length: 255 }).notNull(),
    ...timestamps
});

// New Loans table to track loans separately
export const loans = pgTable('loans', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    borrowerName: varchar('borrowerName', { length: 255 }).notNull(),
    amount: numeric('amount').notNull(),
    interestRate: numeric('interestRate').notNull(),
    totalInterest: numeric('totalInterest').notNull(),
    remainingBalance: numeric('remainingBalance').notNull(),
    status: loanStatusEnum('status').notNull().default('ACTIVE'),
    accountId: uuid('accountId')
        .notNull()
        .references(() => balances.id, { onDelete: 'cascade' }),
    ...timestamps
});

// Updated Transactions Table
export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    date: timestamp('date').notNull(),
    type: transactionTypeEnum('type').notNull(),
    category: varchar('category', { length: 255 }).notNull(),
    amount: numeric('amount').notNull(),
    description: text('description'),
    reference: text('reference').notNull(),
    fromBalanceId: uuid('fromBalanceId')
        .references(() => balances.id),
    toBalanceId: uuid('toBalanceId')
        .references(() => balances.id),
    balanceAfterTransaction: numeric('balanceAfterTransaction'),

    // Updated loan related fields
    loanId: uuid('loanId')
        .references(() => loans.id),
    isLoanDisbursement: boolean('isLoanDisbursement').default(false),
    isLoanPayment: boolean('isLoanPayment').default(false),

    ...timestamps
});

// Reports tables remain the same
export const monthlyReports = pgTable('monthly_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    month: numeric('month').notNull(),
    year: numeric('year').notNull(),
    totalLoans: numeric('totalLoans').notNull(),
    totalPayments: numeric('totalPayments').notNull(),
    totalIncome: numeric('totalIncome').notNull(),
    totalExpenses: numeric('totalExpenses').notNull(),
    ...timestamps
});

export const yearlyReports = pgTable('yearly_reports', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('userId').notNull(),
    year: numeric('year').notNull(),
    totalLoans: numeric('totalLoans').notNull(),
    totalPayments: numeric('totalPayments').notNull(),
    totalIncome: numeric('totalIncome').notNull(),
    totalExpenses: numeric('totalExpenses').notNull(),
    ...timestamps
});

// Updated RLS policies and triggers - this is a tes
export const rls_policies = `

-- Create new type for loan status
-- DROP TYPE IF EXISTS "loanStatus";
-- CREATE TYPE "loanStatus" AS ENUM ('ACTIVE', 'PAID', 'DEFAULTED');

ALTER TABLE loans
ALTER COLUMN "status" TYPE "loanStatus"
USING "status"::"loanStatus";

-- Keep existing balance update trigger
CREATE OR REPLACE FUNCTION update_balance_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update source balance (for expenses/transfers)
    IF NEW."fromBalanceId" IS NOT NULL THEN
        UPDATE balances
        SET "previousBalance" = "currentBalance",
            "currentBalance" = "currentBalance" - NEW."amount",
            "lastTransactionId" = NEW."id"
        WHERE "id" = NEW."fromBalanceId";
    END IF;

    -- Update destination balance (for income/transfers)
    IF NEW."toBalanceId" IS NOT NULL THEN
        UPDATE balances
        SET "previousBalance" = "currentBalance",
            "currentBalance" = "currentBalance" + NEW."amount",
            "lastTransactionId" = NEW."id"
        WHERE "id" = NEW."toBalanceId";
    END IF;

    -- Store the resulting balance in the transaction record
    IF NEW."toBalanceId" IS NOT NULL THEN
        SELECT "currentBalance" INTO NEW."balanceAfterTransaction"
        FROM balances WHERE "id" = NEW."toBalanceId";
    ELSIF NEW."fromBalanceId" IS NOT NULL THEN
        SELECT "currentBalance" INTO NEW."balanceAfterTransaction"
        FROM balances WHERE "id" = NEW."fromBalanceId";
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Keep existing balance validation
CREATE OR REPLACE FUNCTION validate_transaction_balance()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if there's sufficient balance for outgoing transactions
    IF NEW."fromBalanceId" IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM balances 
            WHERE "id" = NEW."fromBalanceId" 
            AND "currentBalance" >= NEW."amount"
        ) THEN
            RAISE EXCEPTION 'Insufficient balance for transaction';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Add new function to handle loan calculations
CREATE OR REPLACE FUNCTION calculate_loan_details()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW."isLoanDisbursement" THEN
        -- Create new loan record
        WITH new_loan AS (
            INSERT INTO loans (
                "userId",
                "borrowerName",
                "amount",
                "interestRate",
                "totalInterest",
                "remainingBalance",
                "accountId"
            ) VALUES (
                NEW."userId",
                NEW."description",
                NEW."amount",
                30.00,
                ROUND((NEW."amount" * 30.00 * 12) / (12 * 100), 2),
                NEW."amount" + ROUND((NEW."amount" * 30.00 * 12) / (12 * 100), 2),
                NEW."fromBalanceId"
            ) RETURNING id
        )
        SELECT id INTO NEW."loanId" FROM new_loan;
    
        ELSIF NEW."isLoanPayment" AND NEW."loanId" IS NOT NULL THEN
            -- Update loan payment details
            UPDATE loans
            SET "remainingBalance" = "remainingBalance" - NEW."amount",
                "status" = CASE 
                    WHEN "remainingBalance" - NEW."amount" <= 0 THEN 'PAID'::"loanStatus"
                    ELSE 'ACTIVE'::"loanStatus"
                END,
                "updatedAt" = NOW()
            WHERE id = NEW."loanId";
        END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create or replace triggers
DROP TRIGGER IF EXISTS update_balances_on_transaction ON transactions;
DROP TRIGGER IF EXISTS validate_transaction_before_insert ON transactions;
DROP TRIGGER IF EXISTS handle_loan_calculations ON transactions;

CREATE TRIGGER update_balances_on_transaction
    AFTER INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_balance_after_transaction();

CREATE TRIGGER validate_transaction_before_insert
    BEFORE INSERT ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION validate_transaction_balance();

DROP TRIGGER IF EXISTS handle_loan_calculations ON transactions;
CREATE TRIGGER handle_loan_calculations
    BEFORE INSERT ON transactions
    FOR EACH ROW
    WHEN (NEW."isLoanDisbursement" OR NEW."isLoanPayment")
    EXECUTE FUNCTION calculate_loan_details();

-- Add index for loan payments
CREATE INDEX IF NOT EXISTS idx_transactions_loan_id
ON transactions ("loanId") WHERE "isLoanPayment" = true;

-- Function to update or create monthly report
CREATE OR REPLACE FUNCTION update_monthly_report()
RETURNS TRIGGER AS $$
DECLARE
    v_year integer;
    v_month integer;
    v_total_loans numeric;
    v_total_payments numeric;
    v_total_income numeric;
    v_total_expenses numeric;
BEGIN
    -- Extract year and month from transaction date
    v_year := EXTRACT(YEAR FROM NEW.date);
    v_month := EXTRACT(MONTH FROM NEW.date);

    -- Calculate totals for the month
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'LOAN_DISBURSEMENT' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'LOAN_PAYMENT' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0)
    INTO 
        v_total_loans,
        v_total_payments,
        v_total_income,
        v_total_expenses
    FROM transactions
    WHERE 
        "userId" = NEW."userId"
        AND EXTRACT(YEAR FROM date) = v_year
        AND EXTRACT(MONTH FROM date) = v_month;

    -- Update or insert monthly report
    INSERT INTO monthly_reports (
        "userId",
        "month",
        "year",
        "totalLoans",
        "totalPayments",
        "totalIncome",
        "totalExpenses"
    ) VALUES (
        NEW."userId",
        v_month,
        v_year,
        v_total_loans,
        v_total_payments,
        v_total_income,
        v_total_expenses
    )
    ON CONFLICT ("userId", year, month) 
    DO UPDATE SET
        "totalLoans" = EXCLUDED."totalLoans",
        "totalPayments" = EXCLUDED."totalPayments",
        "totalIncome" = EXCLUDED."totalIncome",
        "totalExpenses" = EXCLUDED."totalExpenses",
        "updatedAt" = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update or create yearly report
CREATE OR REPLACE FUNCTION update_yearly_report()
RETURNS TRIGGER AS $$
DECLARE
    v_year integer;
    v_total_loans numeric;
    v_total_payments numeric;
    v_total_income numeric;
    v_total_expenses numeric;
BEGIN
    -- Extract year from transaction date
    v_year := EXTRACT(YEAR FROM NEW.date);

    -- Calculate totals for the year
    SELECT 
        COALESCE(SUM(CASE WHEN type = 'LOAN_DISBURSEMENT' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'LOAN_PAYMENT' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END), 0)
    INTO 
        v_total_loans,
        v_total_payments,
        v_total_income,
        v_total_expenses
    FROM transactions
    WHERE 
        "userId" = NEW."userId"
        AND EXTRACT(YEAR FROM date) = v_year;

    -- Update or insert yearly report
    INSERT INTO yearly_reports (
        "userId",
        "year",
        "totalLoans",
        "totalPayments",
        "totalIncome",
        "totalExpenses"
    ) VALUES (
        NEW."userId",
        v_year,
        v_total_loans,
        v_total_payments,
        v_total_income,
        v_total_expenses
    )
    ON CONFLICT ("userId", year) 
    DO UPDATE SET
        "totalLoans" = EXCLUDED."totalLoans",
        "totalPayments" = EXCLUDED."totalPayments",
        "totalIncome" = EXCLUDED."totalIncome",
        "totalExpenses" = EXCLUDED."totalExpenses",
        "updatedAt" = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_date_type 
ON transactions (date, type);

CREATE INDEX IF NOT EXISTS idx_transactions_user_date 
ON transactions ("userId", date);

-- Add unique constraints for reports
ALTER TABLE monthly_reports DROP CONSTRAINT IF EXISTS unique_monthly_report;
ALTER TABLE monthly_reports ADD CONSTRAINT unique_monthly_report UNIQUE ("userId", year, month);

ALTER TABLE yearly_reports DROP CONSTRAINT IF EXISTS unique_yearly_report;
ALTER TABLE yearly_reports ADD CONSTRAINT unique_yearly_report UNIQUE ("userId", year);

-- Create triggers for report updates
DROP TRIGGER IF EXISTS trg_update_monthly_report ON transactions;
DROP TRIGGER IF EXISTS trg_update_yearly_report ON transactions;

CREATE TRIGGER trg_update_monthly_report
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_report();

CREATE TRIGGER trg_update_yearly_report
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_yearly_report();

-- Function to recalculate all reports
CREATE OR REPLACE FUNCTION recalculate_all_reports()
RETURNS void AS $$
DECLARE
    r RECORD;
BEGIN
    -- Clear existing reports
    DELETE FROM monthly_reports;
    DELETE FROM yearly_reports;
    
    -- Process each transaction to rebuild reports
    FOR r IN (SELECT * FROM transactions ORDER BY date) LOOP
        PERFORM update_monthly_report(r);
        PERFORM update_yearly_report(r);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper function to run report recalculation for specific user
CREATE OR REPLACE FUNCTION recalculate_user_reports(p_userId uuid)
RETURNS void AS $$
BEGIN
    -- Delete existing reports for user
    DELETE FROM monthly_reports WHERE "userId" = p_userId;
    DELETE FROM yearly_reports WHERE "userId" = p_userId;
    
    -- Reprocess all transactions for user
    INSERT INTO monthly_reports (
        "userId", month, year, 
        "totalLoans", "totalPayments", "totalIncome", "totalExpenses"
    )
    SELECT 
        "userId",
        EXTRACT(MONTH FROM date)::numeric as month,
        EXTRACT(YEAR FROM date)::numeric as year,
        SUM(CASE WHEN type = 'LOAN_DISBURSEMENT' THEN amount ELSE 0 END) as totalLoans,
        SUM(CASE WHEN type = 'LOAN_PAYMENT' THEN amount ELSE 0 END) as totalPayments,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as totalExpenses
    FROM transactions
    WHERE "userId" = p_userId
    GROUP BY "userId", EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date);

    -- Update yearly reports
    INSERT INTO yearly_reports (
        "userId", "year",
        "totalLoans", "totalPayments", "totalIncome", "totalExpenses"
    )
    SELECT 
        "userId",
        EXTRACT(YEAR FROM date)::numeric as year,
        SUM(CASE WHEN type = 'LOAN_DISBURSEMENT' THEN amount ELSE 0 END) as totalLoans,
        SUM(CASE WHEN type = 'LOAN_PAYMENT' THEN amount ELSE 0 END) as totalPayments,
        SUM(CASE WHEN type = 'INCOME' THEN amount ELSE 0 END) as totalIncome,
        SUM(CASE WHEN type = 'EXPENSE' THEN amount ELSE 0 END) as totalExpenses
    FROM transactions
    WHERE "userId" = p_userId
    GROUP BY "userId", EXTRACT(YEAR FROM date);
END;
$$ LANGUAGE 'plpgsql';
`;