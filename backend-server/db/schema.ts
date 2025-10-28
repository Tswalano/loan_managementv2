import { pgTable, text, timestamp, uuid, decimal, pgEnum, boolean, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const accountStatusEnum = pgEnum('account_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const accountTypeEnum = pgEnum('account_type', ['SAVINGS', 'CHECKING', 'LOAN', 'INVESTMENT']);
export const transactionTypeEnum = pgEnum('transaction_type', [
    'DEPOSIT',
    'WITHDRAWAL',
    'TRANSFER',
    'LOAN_DISBURSEMENT',
    'LOAN_PAYMENT',
    'FEE',
    'INTEREST'
]);
export const loanStatusEnum = pgEnum('loan_status', ['PENDING', 'ACTIVE', 'PAID', 'DEFAULTED', 'CANCELLED']);

// Users table
export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phoneNumber: text('phone_number'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
}));

// Balances table
export const balances = pgTable('balances', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: accountTypeEnum('type').notNull(),
    accountStatus: accountStatusEnum('account_status').default('ACTIVE').notNull(),
    balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
    accountNumber: text('account_number').unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('balances_user_id_idx').on(table.userId),
    accountStatusIdx: index('balances_account_status_idx').on(table.accountStatus),
}));

// Transactions table
export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
    type: transactionTypeEnum('type').notNull(),
    category: text('category').notNull(),
    description: text('description'),
    reference: text('reference').unique(),
    fromBalanceId: uuid('from_balance_id').references(() => balances.id),
    toBalanceId: uuid('to_balance_id').references(() => balances.id),
    loanId: uuid('loan_id').references(() => loans.id),
    date: timestamp('date').defaultNow().notNull(),
    isLoanDisbursement: boolean('is_loan_disbursement').default(false),
    isLoanPayment: boolean('is_loan_payment').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    dateIdx: index('transactions_date_idx').on(table.date),
    loanIdIdx: index('transactions_loan_id_idx').on(table.loanId),
}));

// Loans table
export const loans = pgTable('loans', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    balanceId: uuid('balance_id').notNull().references(() => balances.id),
    borrowerName: text('borrower_name').notNull(),
    principalAmount: decimal('principal_amount', { precision: 15, scale: 2 }).notNull(),
    interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
    termMonths: text('term_months').notNull(),
    status: loanStatusEnum('status').default('PENDING').notNull(),
    disbursementDate: timestamp('disbursement_date'),
    maturityDate: timestamp('maturity_date'),
    outstandingBalance: decimal('outstanding_balance', { precision: 15, scale: 2 }),
    totalPaid: decimal('total_paid', { precision: 15, scale: 2 }).default('0.00'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    userIdIdx: index('loans_user_id_idx').on(table.userId),
    statusIdx: index('loans_status_idx').on(table.status),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
    balances: many(balances),
    transactions: many(transactions),
    loans: many(loans),
}));

export const balancesRelations = relations(balances, ({ one, many }) => ({
    user: one(users, {
        fields: [balances.userId],
        references: [users.id],
    }),
    loans: many(loans),
    transactionsFrom: many(transactions, { relationName: 'fromBalance' }),
    transactionsTo: many(transactions, { relationName: 'toBalance' }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    user: one(users, {
        fields: [transactions.userId],
        references: [users.id],
    }),
    fromBalance: one(balances, {
        fields: [transactions.fromBalanceId],
        references: [balances.id],
        relationName: 'fromBalance',
    }),
    toBalance: one(balances, {
        fields: [transactions.toBalanceId],
        references: [balances.id],
        relationName: 'toBalance',
    }),
    loan: one(loans, {
        fields: [transactions.loanId],
        references: [loans.id],
    }),
}));

export const loansRelations = relations(loans, ({ one, many }) => ({
    user: one(users, {
        fields: [loans.userId],
        references: [users.id],
    }),
    balance: one(balances, {
        fields: [loans.balanceId],
        references: [balances.id],
    }),
    transactions: many(transactions),
}));