import { pgTable, text, timestamp, uuid, decimal, pgEnum, boolean, index, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// ENUMS
// ============================================

export const accountStatusEnum = pgEnum('account_status', ['ACTIVE', 'INACTIVE', 'SUSPENDED']);
export const accountTypeEnum = pgEnum('account_type', [
    'SAVINGS',
    'CHECKING',
    'LOAN',
    'INVESTMENT',
    'CASH',
    'BANK',
    'MOBILE_MONEY',
    'LOAN_RECEIVABLE'
]);
export const transactionTypeEnum = pgEnum('transaction_type', [
    'INCOME',
    'EXPENSE',
    'LOAN_PAYMENT',
    'LOAN_DISBURSEMENT',
    'TRANSFER',
    'DEPOSIT',
    'WITHDRAWAL',
    'FEE',
    'INTEREST'
]);
export const loanStatusEnum = pgEnum('loan_status', [
    'PENDING',
    'ACTIVE',
    'PAID',
    'DEFAULTED',
    'CANCELLED'
]);
export const userRoleEnum = pgEnum('user_role', [
    'OWNER',        // Full access to everything
    'ADMIN',        // Can manage users and most resources
    'MANAGER',      // Can manage loans and transactions
    'ACCOUNTANT',   // Can view and create transactions
    'VIEWER'        // Read-only access
]);
export const invitationStatusEnum = pgEnum('invitation_status', [
    'PENDING',
    'ACCEPTED',
    'DECLINED',
    'EXPIRED'
]);

// ============================================
// ORGANIZATIONS TABLE
// ============================================

export const organizations = pgTable('organizations', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    settings: jsonb('settings').default('{}'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    nameIdx: index('organizations_name_idx').on(table.name),
}));

// ============================================
// USERS TABLE (Enhanced)
// ============================================

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    phoneNumber: text('phone_number'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    emailIdx: index('users_email_idx').on(table.email),
}));

// ============================================
// ORGANIZATION MEMBERS (Junction Table)
// ============================================

export const organizationMembers = pgTable('organization_members', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    role: userRoleEnum('role').notNull().default('VIEWER'),
    permissions: jsonb('permissions').default('{}'), // Additional granular permissions
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgUserIdx: index('org_members_org_user_idx').on(table.organizationId, table.userId),
    userIdx: index('org_members_user_idx').on(table.userId),
}));

// ============================================
// INVITATIONS TABLE
// ============================================

export const invitations = pgTable('invitations', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: userRoleEnum('role').notNull().default('VIEWER'),
    invitedBy: uuid('invited_by').notNull().references(() => users.id),
    status: invitationStatusEnum('status').default('PENDING').notNull(),
    token: text('token').notNull().unique(),
    expiresAt: timestamp('expires_at').notNull(),
    acceptedAt: timestamp('accepted_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    orgEmailIdx: index('invitations_org_email_idx').on(table.organizationId, table.email),
    tokenIdx: index('invitations_token_idx').on(table.token),
}));

// ============================================
// BALANCES TABLE (Enhanced with Organization)
// ============================================

export const balances = pgTable('balances', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: accountTypeEnum('type').notNull(),
    bankName: text('bank_name'),
    accountStatus: accountStatusEnum('account_status').default('ACTIVE').notNull(),
    accountNumber: text('account_number').unique(),
    accountName: text('account_name'),
    balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
    previousBalance: decimal('previous_balance', { precision: 15, scale: 2 }),
    currency: text('currency').default('ZAR').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgIdx: index('balances_org_idx').on(table.organizationId),
    userIdIdx: index('balances_user_id_idx').on(table.userId),
    accountStatusIdx: index('balances_account_status_idx').on(table.accountStatus),
}));

// ============================================
// TRANSACTIONS TABLE (Enhanced)
// ============================================

export const transactions = pgTable('transactions', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
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
    metadata: jsonb('metadata').default('{}'), // For additional transaction data
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    orgIdx: index('transactions_org_idx').on(table.organizationId),
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    dateIdx: index('transactions_date_idx').on(table.date),
    loanIdIdx: index('transactions_loan_id_idx').on(table.loanId),
    typeIdx: index('transactions_type_idx').on(table.type),
}));

// ============================================
// LOANS TABLE (Enhanced with Access Control)
// ============================================

export const loans = pgTable('loans', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    balanceId: uuid('balance_id').notNull().references(() => balances.id),
    borrowerName: text('borrower_name').notNull(),
    borrowerEmail: text('borrower_email'),
    borrowerPhone: text('borrower_phone'),
    principalAmount: decimal('principal_amount', { precision: 15, scale: 2 }).notNull(),
    interestRate: decimal('interest_rate', { precision: 5, scale: 2 }).notNull(),
    termMonths: text('term_months').notNull(),
    status: loanStatusEnum('status').default('PENDING').notNull(),
    disbursementDate: timestamp('disbursement_date'),
    maturityDate: timestamp('maturity_date'),
    outstandingBalance: decimal('outstanding_balance', { precision: 15, scale: 2 }),
    totalPaid: decimal('total_paid', { precision: 15, scale: 2 }).default('0.00'),
    metadata: jsonb('metadata').default('{}'), // For additional loan data
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
    orgIdx: index('loans_org_idx').on(table.organizationId),
    userIdIdx: index('loans_user_id_idx').on(table.userId),
    statusIdx: index('loans_status_idx').on(table.status),
}));

// ============================================
// LOAN ACCESS CONTROL
// ============================================

export const loanAccess = pgTable('loan_access', {
    id: uuid('id').defaultRandom().primaryKey(),
    loanId: uuid('loan_id').notNull().references(() => loans.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    canView: boolean('can_view').default(true).notNull(),
    canEdit: boolean('can_edit').default(false).notNull(),
    canDelete: boolean('can_delete').default(false).notNull(),
    grantedBy: uuid('granted_by').notNull().references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    loanUserIdx: index('loan_access_loan_user_idx').on(table.loanId, table.userId),
}));

// ============================================
// AUDIT LOG
// ============================================

export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id').notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').notNull().references(() => users.id),
    action: text('action').notNull(), // e.g., 'CREATE_TRANSACTION', 'UPDATE_LOAN'
    entityType: text('entity_type').notNull(), // e.g., 'transaction', 'loan', 'balance'
    entityId: uuid('entity_id'),
    oldValues: jsonb('old_values'),
    newValues: jsonb('new_values'),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
    orgIdx: index('audit_logs_org_idx').on(table.organizationId),
    userIdx: index('audit_logs_user_idx').on(table.userId),
    createdAtIdx: index('audit_logs_created_at_idx').on(table.createdAt),
}));

// ============================================
// RELATIONS
// ============================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
    members: many(organizationMembers),
    balances: many(balances),
    transactions: many(transactions),
    loans: many(loans),
    invitations: many(invitations),
    auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
    organizationMemberships: many(organizationMembers),
    balances: many(balances),
    transactions: many(transactions),
    loans: many(loans),
    loanAccess: many(loanAccess),
    invitationsSent: many(invitations),
    auditLogs: many(auditLogs),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
    organization: one(organizations, {
        fields: [organizationMembers.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [organizationMembers.userId],
        references: [users.id],
    }),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
    organization: one(organizations, {
        fields: [invitations.organizationId],
        references: [organizations.id],
    }),
    inviter: one(users, {
        fields: [invitations.invitedBy],
        references: [users.id],
    }),
}));

export const balancesRelations = relations(balances, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [balances.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [balances.userId],
        references: [users.id],
    }),
    loans: many(loans),
    transactionsFrom: many(transactions, { relationName: 'fromBalance' }),
    transactionsTo: many(transactions, { relationName: 'toBalance' }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
    organization: one(organizations, {
        fields: [transactions.organizationId],
        references: [organizations.id],
    }),
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
    organization: one(organizations, {
        fields: [loans.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [loans.userId],
        references: [users.id],
    }),
    balance: one(balances, {
        fields: [loans.balanceId],
        references: [balances.id],
    }),
    transactions: many(transactions),
    accessGrants: many(loanAccess),
}));

export const loanAccessRelations = relations(loanAccess, ({ one }) => ({
    loan: one(loans, {
        fields: [loanAccess.loanId],
        references: [loans.id],
    }),
    user: one(users, {
        fields: [loanAccess.userId],
        references: [users.id],
    }),
    grantor: one(users, {
        fields: [loanAccess.grantedBy],
        references: [users.id],
    }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    organization: one(organizations, {
        fields: [auditLogs.organizationId],
        references: [organizations.id],
    }),
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}));