import 'dotenv/config';
import { createHmac, randomBytes } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
    users,
    organizations,
    organizationMembers,
    balances,
    loans,
    transactions,
    stokvels,
    stokvelMembers,
    stokvelPayments,
} from './schema';

type StokvelMemberInsert = typeof stokvelMembers.$inferInsert;
type StokvelPaymentInsert = typeof stokvelPayments.$inferInsert;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = createHmac('sha256', salt).update(password).digest('hex');
    return `${salt}:${hash}`;
}

function d(dateStr: string): Date {
    return new Date(dateStr);
}

async function firstOrInsert<T>(
    finder: () => Promise<T | undefined>,
    inserter: () => Promise<T>
): Promise<T> {
    const existing = await finder();
    if (existing) return existing;
    return inserter();
}

// ──────────────────────────────────────────────
// Main seed
// ──────────────────────────────────────────────

const runSeed = async () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not defined');
    }

    const connection = postgres(process.env.DATABASE_URL, { max: 1 });
    const db = drizzle(connection);

    console.log('🌱  Seeding database…');

    // ── 1. Users ──────────────────────────────

    console.log('  → inserting users');

    const [insertedAdminUser] = await db
        .insert(users)
        .values({
            email: 'moganegb@gmail.com',
            passwordHash: hashPassword('Tswalano@42'),
            firstName: 'Glen',
            lastName: 'Mogane',
            isActive: true,
        })
        .onConflictDoNothing()
        .returning();

    const [insertedDemoUser] = await db
        .insert(users)
        .values({
            email: 'email@financeco.com',
            passwordHash: hashPassword('Admin123'),
            firstName: 'Finance',
            lastName: 'Demo',
            isActive: true,
        })
        .onConflictDoNothing()
        .returning();

    const [existingAdminUser] = insertedAdminUser
        ? [insertedAdminUser]
        : await db.select().from(users).where(eq(users.email, 'moganegb@gmail.com')).limit(1);

    const [existingDemoUser] = insertedDemoUser
        ? [insertedDemoUser]
        : await db.select().from(users).where(eq(users.email, 'email@financeco.com')).limit(1);

    const adminUser = existingAdminUser;
    const demoUser = existingDemoUser;

    if (!adminUser || !demoUser) {
        throw new Error('Failed to resolve seed users');
    }

    // ── 2. Organizations ──────────────────────

    console.log('  → inserting organizations');

    const adminOrg = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(organizations).where(eq(organizations.name, 'Glen Mogane Finance')).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db
                .insert(organizations)
                .values({
                    name: 'Glen Mogane Finance',
                    description: 'Personal finance management',
                })
                .returning();
            return created;
        }
    );

    const demoOrg = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(organizations).where(eq(organizations.name, 'Finance Co')).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db
                .insert(organizations)
                .values({
                    name: 'Finance Co',
                    description: 'Demo organisation with historical 2024 data',
                })
                .returning();
            return created;
        }
    );

    // ── 3. Memberships ────────────────────────

    console.log('  → inserting memberships');

    const [adminMembership] = await db.select().from(organizationMembers).where(
        and(
            eq(organizationMembers.organizationId, adminOrg.id),
            eq(organizationMembers.userId, adminUser.id),
        )
    ).limit(1);

    if (!adminMembership) {
        await db.insert(organizationMembers).values({
            organizationId: adminOrg.id,
            userId: adminUser.id,
            role: 'OWNER',
        });
    }

    const [demoMembership] = await db.select().from(organizationMembers).where(
        and(
            eq(organizationMembers.organizationId, demoOrg.id),
            eq(organizationMembers.userId, demoUser.id),
        )
    ).limit(1);

    if (!demoMembership) {
        await db.insert(organizationMembers).values({
            organizationId: demoOrg.id,
            userId: demoUser.id,
            role: 'OWNER',
        });
    }

    // ── 4. Balances (accounts) ────────────────

    console.log('  → inserting balances');

    // Admin user – simple personal accounts
    const adminChecking = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(balances).where(eq(balances.accountNumber, '62001234567')).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db
                .insert(balances)
                .values({
                    organizationId: adminOrg.id,
                    userId: adminUser.id,
                    type: 'CHECKING',
                    bankName: 'FNB',
                    accountName: 'FNB Cheque',
                    accountNumber: '62001234567',
                    balance: '45000.00',
                    currency: 'ZAR',
                })
                .returning();
            return created;
        }
    );

    // Demo user – richer set for 2024 demo
    const demoChecking = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(balances).where(eq(balances.accountNumber, '001234567890')).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db
                .insert(balances)
                .values({
                    organizationId: demoOrg.id,
                    userId: demoUser.id,
                    type: 'CHECKING',
                    bankName: 'Standard Bank',
                    accountName: 'Business Current Account',
                    accountNumber: '001234567890',
                    balance: '238500.00',
                    currency: 'ZAR',
                })
                .returning();
            return created;
        }
    );

    const demoSavings = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(balances).where(eq(balances.accountNumber, '1987654321')).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db
                .insert(balances)
                .values({
                    organizationId: demoOrg.id,
                    userId: demoUser.id,
                    type: 'SAVINGS',
                    bankName: 'Nedbank',
                    accountName: 'Business Savings',
                    accountNumber: '1987654321',
                    balance: '520000.00',
                    currency: 'ZAR',
                })
                .returning();
            return created;
        }
    );

    const demoLoanFund = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(balances).where(eq(balances.accountNumber, 'LC-LOAN-2024')).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db
                .insert(balances)
                .values({
                    organizationId: demoOrg.id,
                    userId: demoUser.id,
                    type: 'LOAN_RECEIVABLE',
                    bankName: 'Finance Co',
                    accountName: 'Loan Portfolio Fund',
                    accountNumber: 'LC-LOAN-2024',
                    balance: '1250000.00',
                    currency: 'ZAR',
                })
                .returning();
            return created;
        }
    );

    // ── 5. Loans (2024 data) ──────────────────

    console.log('  → inserting loans');

    const loansData = [
        // Q1 2024 – Paid off
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Sipho Dlamini',
            borrowerEmail: 'sipho.dlamini@email.com',
            borrowerPhone: '+27712345678',
            principalAmount: '50000.00',
            interestRate: '18.00',
            termMonths: '12',
            status: 'PAID' as const,
            disbursementDate: d('2024-01-15'),
            maturityDate: d('2025-01-15'),
            outstandingBalance: '0.00',
            totalPaid: '59000.00',
            createdAt: d('2024-01-10'),
            updatedAt: d('2024-12-20'),
        },
        // Q1 2024 – Active
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Nomsa Khumalo',
            borrowerEmail: 'nomsa.khumalo@gmail.com',
            borrowerPhone: '+27823456789',
            principalAmount: '120000.00',
            interestRate: '15.50',
            termMonths: '24',
            status: 'ACTIVE' as const,
            disbursementDate: d('2024-02-01'),
            maturityDate: d('2026-02-01'),
            outstandingBalance: '68400.00',
            totalPaid: '51600.00',
            createdAt: d('2024-01-28'),
            updatedAt: d('2024-12-31'),
        },
        // Q2 2024 – Active
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Thabo Mokoena',
            borrowerEmail: 'thabo.mokoena@outlook.com',
            borrowerPhone: '+27734567890',
            principalAmount: '200000.00',
            interestRate: '20.00',
            termMonths: '36',
            status: 'ACTIVE' as const,
            disbursementDate: d('2024-04-10'),
            maturityDate: d('2027-04-10'),
            outstandingBalance: '168000.00',
            totalPaid: '32000.00',
            createdAt: d('2024-04-05'),
            updatedAt: d('2024-12-31'),
        },
        // Q2 2024 – Defaulted
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Lerato Sithole',
            borrowerEmail: 'lerato.sithole@yahoo.com',
            borrowerPhone: '+27845678901',
            principalAmount: '30000.00',
            interestRate: '22.00',
            termMonths: '6',
            status: 'DEFAULTED' as const,
            disbursementDate: d('2024-05-20'),
            maturityDate: d('2024-11-20'),
            outstandingBalance: '24000.00',
            totalPaid: '6000.00',
            createdAt: d('2024-05-15'),
            updatedAt: d('2024-10-30'),
        },
        // Q3 2024 – Active
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Pieter van der Merwe',
            borrowerEmail: 'pieter.vdm@business.co.za',
            borrowerPhone: '+27656789012',
            principalAmount: '350000.00',
            interestRate: '14.00',
            termMonths: '48',
            status: 'ACTIVE' as const,
            disbursementDate: d('2024-07-01'),
            maturityDate: d('2028-07-01'),
            outstandingBalance: '318000.00',
            totalPaid: '32000.00',
            createdAt: d('2024-06-25'),
            updatedAt: d('2024-12-31'),
        },
        // Q3 2024 – Paid
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Ayanda Zulu',
            borrowerEmail: 'ayanda.zulu@email.com',
            borrowerPhone: '+27767890123',
            principalAmount: '15000.00',
            interestRate: '25.00',
            termMonths: '3',
            status: 'PAID' as const,
            disbursementDate: d('2024-08-05'),
            maturityDate: d('2024-11-05'),
            outstandingBalance: '0.00',
            totalPaid: '18750.00',
            createdAt: d('2024-08-01'),
            updatedAt: d('2024-11-10'),
        },
        // Q4 2024 – Pending
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Fatima Osman',
            borrowerEmail: 'fatima.osman@gmail.com',
            borrowerPhone: '+27878901234',
            principalAmount: '80000.00',
            interestRate: '17.50',
            termMonths: '18',
            status: 'PENDING' as const,
            disbursementDate: null,
            maturityDate: null,
            outstandingBalance: '80000.00',
            totalPaid: '0.00',
            createdAt: d('2024-11-20'),
            updatedAt: d('2024-11-20'),
        },
        // Q4 2024 – Active
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            balanceId: demoLoanFund.id,
            borrowerName: 'Bongani Nkosi',
            borrowerEmail: 'bongani.nkosi@mail.com',
            borrowerPhone: '+27789012345',
            principalAmount: '250000.00',
            interestRate: '16.00',
            termMonths: '30',
            status: 'ACTIVE' as const,
            disbursementDate: d('2024-12-01'),
            maturityDate: d('2027-06-01'),
            outstandingBalance: '245000.00',
            totalPaid: '5000.00',
            createdAt: d('2024-11-25'),
            updatedAt: d('2024-12-31'),
        },
    ];

    const insertedLoans = [];
    for (const loanData of loansData) {
        const [existingLoan] = await db.select().from(loans).where(
            and(
                eq(loans.organizationId, loanData.organizationId),
                eq(loans.borrowerName, loanData.borrowerName),
                eq(loans.createdAt, loanData.createdAt),
            )
        ).limit(1);

        if (existingLoan) {
            insertedLoans.push(existingLoan);
            continue;
        }

        const [createdLoan] = await db.insert(loans).values(loanData).returning();
        insertedLoans.push(createdLoan);
    }

    // ── 6. Transactions (2024) ────────────────

    console.log('  → inserting transactions');

    const txData = [
        // ── Income / Deposits ──
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '150000.00',
            type: 'DEPOSIT' as const,
            category: 'Investor Capital',
            description: 'Q1 capital injection from investor',
            reference: 'DEP-2024-001',
            toBalanceId: demoChecking.id,
            date: d('2024-01-05'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '200000.00',
            type: 'DEPOSIT' as const,
            category: 'Investor Capital',
            description: 'Q2 capital injection',
            reference: 'DEP-2024-002',
            toBalanceId: demoChecking.id,
            date: d('2024-04-02'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '9000.00',
            type: 'INTEREST' as const,
            category: 'Loan Interest',
            description: 'Monthly interest collection – Sipho Dlamini',
            reference: 'INT-2024-001',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[0].id,
            date: d('2024-02-15'),
            isLoanPayment: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '9000.00',
            type: 'INTEREST' as const,
            category: 'Loan Interest',
            description: 'Monthly interest collection – Sipho Dlamini',
            reference: 'INT-2024-002',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[0].id,
            date: d('2024-03-15'),
            isLoanPayment: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '5600.00',
            type: 'LOAN_PAYMENT' as const,
            category: 'Loan Repayment',
            description: 'Monthly repayment – Nomsa Khumalo',
            reference: 'PMT-2024-001',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[1].id,
            date: d('2024-03-01'),
            isLoanPayment: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '5600.00',
            type: 'LOAN_PAYMENT' as const,
            category: 'Loan Repayment',
            description: 'Monthly repayment – Nomsa Khumalo',
            reference: 'PMT-2024-002',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[1].id,
            date: d('2024-04-01'),
            isLoanPayment: true,
        },
        // ── Loan Disbursements ──
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '50000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Sipho Dlamini',
            reference: 'DISB-2024-001',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[0].id,
            date: d('2024-01-15'),
            isLoanDisbursement: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '120000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Nomsa Khumalo',
            reference: 'DISB-2024-002',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[1].id,
            date: d('2024-02-01'),
            isLoanDisbursement: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '200000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Thabo Mokoena',
            reference: 'DISB-2024-003',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[2].id,
            date: d('2024-04-10'),
            isLoanDisbursement: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '30000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Lerato Sithole',
            reference: 'DISB-2024-004',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[3].id,
            date: d('2024-05-20'),
            isLoanDisbursement: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '350000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Pieter van der Merwe',
            reference: 'DISB-2024-005',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[4].id,
            date: d('2024-07-01'),
            isLoanDisbursement: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '15000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Ayanda Zulu',
            reference: 'DISB-2024-006',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[5].id,
            date: d('2024-08-05'),
            isLoanDisbursement: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '250000.00',
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: 'Loan disbursed to Bongani Nkosi',
            reference: 'DISB-2024-007',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoLoanFund.id,
            loanId: insertedLoans[7].id,
            date: d('2024-12-01'),
            isLoanDisbursement: true,
        },
        // ── Expenses / Operational ──
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '12000.00',
            type: 'EXPENSE' as const,
            category: 'Salaries',
            description: 'Staff salaries January 2024',
            reference: 'EXP-2024-001',
            fromBalanceId: demoChecking.id,
            date: d('2024-01-28'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '12000.00',
            type: 'EXPENSE' as const,
            category: 'Salaries',
            description: 'Staff salaries February 2024',
            reference: 'EXP-2024-002',
            fromBalanceId: demoChecking.id,
            date: d('2024-02-28'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '3500.00',
            type: 'EXPENSE' as const,
            category: 'Rent',
            description: 'Office rent Q1 2024',
            reference: 'EXP-2024-003',
            fromBalanceId: demoChecking.id,
            date: d('2024-01-03'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '3500.00',
            type: 'EXPENSE' as const,
            category: 'Rent',
            description: 'Office rent Q2 2024',
            reference: 'EXP-2024-004',
            fromBalanceId: demoChecking.id,
            date: d('2024-04-03'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '3500.00',
            type: 'EXPENSE' as const,
            category: 'Rent',
            description: 'Office rent Q3 2024',
            reference: 'EXP-2024-005',
            fromBalanceId: demoChecking.id,
            date: d('2024-07-03'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '3500.00',
            type: 'EXPENSE' as const,
            category: 'Rent',
            description: 'Office rent Q4 2024',
            reference: 'EXP-2024-006',
            fromBalanceId: demoChecking.id,
            date: d('2024-10-03'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '8200.00',
            type: 'FEE' as const,
            category: 'Bank Charges',
            description: 'Annual banking fees 2024',
            reference: 'FEE-2024-001',
            fromBalanceId: demoChecking.id,
            date: d('2024-01-10'),
        },
        // ── Transfer to savings ──
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '100000.00',
            type: 'TRANSFER' as const,
            category: 'Internal Transfer',
            description: 'Transfer surplus to savings – H1',
            reference: 'TRF-2024-001',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoSavings.id,
            date: d('2024-06-28'),
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '120000.00',
            type: 'TRANSFER' as const,
            category: 'Internal Transfer',
            description: 'Transfer surplus to savings – H2',
            reference: 'TRF-2024-002',
            fromBalanceId: demoChecking.id,
            toBalanceId: demoSavings.id,
            date: d('2024-12-20'),
        },
        // ── Additional repayments Q3/Q4 ──
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '18750.00',
            type: 'LOAN_PAYMENT' as const,
            category: 'Loan Repayment',
            description: 'Full repayment – Ayanda Zulu',
            reference: 'PMT-2024-003',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[5].id,
            date: d('2024-11-05'),
            isLoanPayment: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '59000.00',
            type: 'LOAN_PAYMENT' as const,
            category: 'Loan Repayment',
            description: 'Full repayment – Sipho Dlamini',
            reference: 'PMT-2024-004',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[0].id,
            date: d('2024-12-15'),
            isLoanPayment: true,
        },
        {
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '5000.00',
            type: 'LOAN_PAYMENT' as const,
            category: 'Loan Repayment',
            description: 'First repayment – Bongani Nkosi',
            reference: 'PMT-2024-005',
            fromBalanceId: demoLoanFund.id,
            toBalanceId: demoChecking.id,
            loanId: insertedLoans[7].id,
            date: d('2024-12-31'),
            isLoanPayment: true,
        },
    ];

    for (const tx of txData) {
        const [existingTx] = await db.select().from(transactions).where(eq(transactions.reference, tx.reference)).limit(1);
        if (!existingTx) {
            await db.insert(transactions).values(tx);
        }
    }

    // ── 7. Stokvels, members, and payments ───

    console.log('  → inserting stokvels');

    const familyStokvel = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(stokvels).where(
                and(
                    eq(stokvels.organizationId, demoOrg.id),
                    eq(stokvels.name, 'Family Savings Circle'),
                )
            ).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db.insert(stokvels).values({
                organizationId: demoOrg.id,
                userId: demoUser.id,
                name: 'Family Savings Circle',
                description: 'Monthly family contributions for school fees, emergencies, and year-end goals.',
                contributionAmount: '1000.00',
                frequency: 'monthly',
                startDate: d('2024-01-01'),
                targetDate: d('2026-12-01'),
                status: 'active',
                targetAmount: '50000.00',
                metadata: { theme: 'family' },
            }).returning();
            return created;
        }
    );

    const groceryStokvel = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(stokvels).where(
                and(
                    eq(stokvels.organizationId, demoOrg.id),
                    eq(stokvels.name, 'Township Grocery Club'),
                )
            ).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db.insert(stokvels).values({
                organizationId: demoOrg.id,
                userId: demoUser.id,
                name: 'Township Grocery Club',
                description: 'Bulk grocery stokvel helping members stock up before month-end.',
                contributionAmount: '750.00',
                frequency: 'monthly',
                startDate: d('2024-03-01'),
                targetDate: d('2027-02-01'),
                status: 'active',
                targetAmount: '36000.00',
                metadata: { theme: 'groceries' },
            }).returning();
            return created;
        }
    );

    const january2026Stokvel = await firstOrInsert(
        async () => {
            const [existing] = await db.select().from(stokvels).where(
                and(
                    eq(stokvels.organizationId, demoOrg.id),
                    eq(stokvels.name, 'January 2026 Goal Stokvel'),
                )
            ).limit(1);
            return existing;
        },
        async () => {
            const [created] = await db.insert(stokvels).values({
                organizationId: demoOrg.id,
                userId: demoUser.id,
                name: 'January 2026 Goal Stokvel',
                description: '2026 demo stokvel showing current members, catch-up payments, and skipped months clearly.',
                contributionAmount: '1000.00',
                frequency: 'monthly',
                startDate: d('2026-01-01'),
                targetDate: d('2026-12-01'),
                status: 'active',
                targetAmount: '12000.00',
                metadata: { theme: '2026-demo' },
            }).returning();
            return created;
        }
    );

    console.log('  → inserting stokvel members');

    const familyMemberSeeds: StokvelMemberInsert[] = [
        {
            stokvelId: familyStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Kabelo Maseko',
            email: 'kabelo.maseko@example.com',
            phone: '+27711230001',
            joinedDate: d('2024-01-01'),
            totalPaid: '3000.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: familyStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Nandi Mokoena',
            email: 'nandi.mokoena@example.com',
            phone: '+27711230002',
            joinedDate: d('2024-01-01'),
            totalPaid: '3000.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: familyStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Thuso Mbele',
            email: 'thuso.mbele@example.com',
            phone: '+27711230003',
            joinedDate: d('2024-01-01'),
            totalPaid: '2000.00',
            totalOwed: '1000.00',
            status: 'active',
        },
        {
            stokvelId: familyStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Zanele Dube',
            email: 'zanele.dube@example.com',
            phone: '+27711230004',
            joinedDate: d('2024-01-15'),
            totalPaid: '3000.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: familyStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Brian Ndlovu',
            email: 'brian.ndlovu@example.com',
            phone: '+27711230005',
            joinedDate: d('2024-02-01'),
            totalPaid: '1000.00',
            totalOwed: '2000.00',
            status: 'active',
        },
        {
            stokvelId: familyStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Lindiwe Khosa',
            email: 'lindiwe.khosa@example.com',
            phone: '+27711230006',
            joinedDate: d('2024-02-01'),
            totalPaid: '2000.00',
            totalOwed: '1000.00',
            status: 'active',
        },
    ];

    const familyMembers = [];
    for (const member of familyMemberSeeds) {
        const [existingMember] = await db.select().from(stokvelMembers).where(
            and(
                eq(stokvelMembers.stokvelId, member.stokvelId),
                eq(stokvelMembers.name, member.name),
            )
        ).limit(1);

        if (existingMember) {
            familyMembers.push(existingMember);
            continue;
        }

        const [createdMember] = await db.insert(stokvelMembers).values(member).returning();
        familyMembers.push(createdMember);
    }

    const groceryMemberSeeds: StokvelMemberInsert[] = [
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Precious Hadebe',
            email: 'precious.hadebe@example.com',
            phone: '+27711230101',
            joinedDate: d('2024-03-01'),
            totalPaid: '2250.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Sizwe Mthembu',
            email: 'sizwe.mthembu@example.com',
            phone: '+27711230102',
            joinedDate: d('2024-03-01'),
            totalPaid: '1500.00',
            totalOwed: '750.00',
            status: 'active',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Boitumelo Seabi',
            email: 'boitumelo.seabi@example.com',
            phone: '+27711230103',
            joinedDate: d('2024-03-01'),
            totalPaid: '2250.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Anele Tshabalala',
            email: 'anele.tshabalala@example.com',
            phone: '+27711230104',
            joinedDate: d('2024-03-08'),
            totalPaid: '2250.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Lebo Radebe',
            email: 'lebo.radebe@example.com',
            phone: '+27711230105',
            joinedDate: d('2024-03-15'),
            totalPaid: '1500.00',
            totalOwed: '750.00',
            status: 'active',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Yandiswa Gqirana',
            email: 'yandiswa.gqirana@example.com',
            phone: '+27711230106',
            joinedDate: d('2024-03-15'),
            totalPaid: '2250.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Mpho Pheko',
            email: 'mpho.pheko@example.com',
            phone: '+27711230107',
            joinedDate: d('2024-03-22'),
            totalPaid: '750.00',
            totalOwed: '1500.00',
            status: 'inactive',
        },
        {
            stokvelId: groceryStokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Karabo Mohlala',
            email: 'karabo.mohlala@example.com',
            phone: '+27711230108',
            joinedDate: d('2024-03-22'),
            totalPaid: '2250.00',
            totalOwed: '0.00',
            status: 'active',
        },
    ];

    const groceryMembers = [];
    for (const member of groceryMemberSeeds) {
        const [existingMember] = await db.select().from(stokvelMembers).where(
            and(
                eq(stokvelMembers.stokvelId, member.stokvelId),
                eq(stokvelMembers.name, member.name),
            )
        ).limit(1);

        if (existingMember) {
            groceryMembers.push(existingMember);
            continue;
        }

        const [createdMember] = await db.insert(stokvelMembers).values(member).returning();
        groceryMembers.push(createdMember);
    }

    const january2026MemberSeeds: StokvelMemberInsert[] = [
        {
            stokvelId: january2026Stokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Lerato Mokoena',
            email: 'lerato.mokoena2026@example.com',
            phone: '+27711230201',
            joinedDate: d('2026-01-01'),
            totalPaid: '3000.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: january2026Stokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Sipho Ndlovu',
            email: 'sipho.ndlovu2026@example.com',
            phone: '+27711230202',
            joinedDate: d('2026-01-01'),
            totalPaid: '2000.00',
            totalOwed: '1000.00',
            status: 'active',
        },
        {
            stokvelId: january2026Stokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Ayanda Khumalo',
            email: 'ayanda.khumalo2026@example.com',
            phone: '+27711230203',
            joinedDate: d('2026-01-01'),
            totalPaid: '3000.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: january2026Stokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Mpho Pheko',
            email: 'mpho.pheko2026@example.com',
            phone: '+27711230204',
            joinedDate: d('2026-01-01'),
            totalPaid: '1000.00',
            totalOwed: '2000.00',
            status: 'active',
        },
        {
            stokvelId: january2026Stokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Zanele Dube',
            email: 'zanele.dube2026@example.com',
            phone: '+27711230205',
            joinedDate: d('2026-01-01'),
            totalPaid: '3000.00',
            totalOwed: '0.00',
            status: 'active',
        },
        {
            stokvelId: january2026Stokvel.id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            name: 'Thando Molefe',
            email: 'thando.molefe2026@example.com',
            phone: '+27711230206',
            joinedDate: d('2026-01-01'),
            totalPaid: '2000.00',
            totalOwed: '1000.00',
            status: 'active',
        },
    ];

    const january2026Members = [];
    for (const member of january2026MemberSeeds) {
        const [existingMember] = await db.select().from(stokvelMembers).where(
            and(
                eq(stokvelMembers.stokvelId, member.stokvelId),
                eq(stokvelMembers.name, member.name),
            )
        ).limit(1);

        if (existingMember) {
            january2026Members.push(existingMember);
            continue;
        }

        const [createdMember] = await db.insert(stokvelMembers).values(member).returning();
        january2026Members.push(createdMember);
    }

    const familyMemberMap = Object.fromEntries(familyMembers.map((member) => [member.name, member]));
    const groceryMemberMap = Object.fromEntries(groceryMembers.map((member) => [member.name, member]));
    const january2026MemberMap = Object.fromEntries(january2026Members.map((member) => [member.name, member]));

    console.log('  → inserting stokvel payments');

    const stokvelPaymentSeeds: StokvelPaymentInsert[] = [
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Kabelo Maseko'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-09-01'),
            period: 'September 2024',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Kabelo Maseko'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-10-01'),
            period: 'October 2024',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Kabelo Maseko'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-11-01'),
            period: 'November 2024',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Nandi Mokoena'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-09-02'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Paid via EFT',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Nandi Mokoena'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-10-02'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Paid via EFT',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Nandi Mokoena'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-11-02'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Paid via EFT',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Thuso Mbele'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-09-05'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Cash deposit',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Thuso Mbele'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-10-05'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Cash deposit',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Zanele Dube'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-09-03'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Salary day contribution',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Zanele Dube'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-10-03'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Salary day contribution',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Zanele Dube'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-11-03'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Salary day contribution',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Brian Ndlovu'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-09-12'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Only contribution received this quarter',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Lindiwe Khosa'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-09-08'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Paid at meeting',
        },
        {
            stokvelId: familyStokvel.id,
            memberId: familyMemberMap['Lindiwe Khosa'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2024-10-08'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Paid at meeting',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Precious Hadebe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-04'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Bulk grocery cycle',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Precious Hadebe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-10-04'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Bulk grocery cycle',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Precious Hadebe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-04'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Bulk grocery cycle',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Sizwe Mthembu'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-06'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Late but received',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Sizwe Mthembu'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-06'),
            period: 'November 2024',
            status: 'paid',
            notes: 'October missed',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Boitumelo Seabi'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-07'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Standing order',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Boitumelo Seabi'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-10-07'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Standing order',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Boitumelo Seabi'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-07'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Standing order',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Anele Tshabalala'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-09'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Paid before meeting',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Anele Tshabalala'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-10-09'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Paid before meeting',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Anele Tshabalala'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-09'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Paid before meeting',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Lebo Radebe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-11'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Partial season participation',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Lebo Radebe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-11'),
            period: 'November 2024',
            status: 'paid',
            notes: 'October missed',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Yandiswa Gqirana'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-13'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Paid in cash',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Yandiswa Gqirana'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-10-13'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Paid in cash',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Yandiswa Gqirana'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-13'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Paid in cash',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Mpho Pheko'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-20'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Stopped after first cycle',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Karabo Mohlala'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-09-21'),
            period: 'September 2024',
            status: 'paid',
            notes: 'Standing order',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Karabo Mohlala'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-10-21'),
            period: 'October 2024',
            status: 'paid',
            notes: 'Standing order',
        },
        {
            stokvelId: groceryStokvel.id,
            memberId: groceryMemberMap['Karabo Mohlala'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '750.00',
            date: d('2024-11-21'),
            period: 'November 2024',
            status: 'paid',
            notes: 'Standing order',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Lerato Mokoena'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-01-03'),
            period: 'January 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Lerato Mokoena'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-02-03'),
            period: 'February 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Lerato Mokoena'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-03-03'),
            period: 'March 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Sipho Ndlovu'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-02-05'),
            period: 'February 2026',
            status: 'paid',
            notes: 'Skipped January, paid February',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Sipho Ndlovu'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-03-05'),
            period: 'March 2026',
            status: 'paid',
            notes: 'Paid current cycle',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Ayanda Khumalo'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-03-10'),
            period: 'January 2026',
            status: 'paid',
            notes: 'January settled in March',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Ayanda Khumalo'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-03-10'),
            period: 'February 2026',
            status: 'paid',
            notes: 'February settled in March',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Ayanda Khumalo'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-03-10'),
            period: 'March 2026',
            status: 'paid',
            notes: 'March settled together with arrears',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Mpho Pheko'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-01-08'),
            period: 'January 2026',
            status: 'paid',
            notes: 'Paid January only',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Zanele Dube'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-01-04'),
            period: 'January 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Zanele Dube'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-02-04'),
            period: 'February 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Zanele Dube'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-03-04'),
            period: 'March 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Thando Molefe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-01-12'),
            period: 'January 2026',
            status: 'paid',
            notes: 'On-time contribution',
        },
        {
            stokvelId: january2026Stokvel.id,
            memberId: january2026MemberMap['Thando Molefe'].id,
            organizationId: demoOrg.id,
            userId: demoUser.id,
            amount: '1000.00',
            date: d('2026-02-12'),
            period: 'February 2026',
            status: 'paid',
            notes: 'March still outstanding',
        },
    ];

    for (const payment of stokvelPaymentSeeds) {
        const [existingPayment] = await db.select().from(stokvelPayments).where(
            and(
                eq(stokvelPayments.stokvelId, payment.stokvelId),
                eq(stokvelPayments.memberId, payment.memberId),
                eq(stokvelPayments.period, payment.period),
                eq(stokvelPayments.date, payment.date),
            )
        ).limit(1);

        if (!existingPayment) {
            await db.insert(stokvelPayments).values(payment);
        }
    }

    // ── 8. Simple admin user transaction ─────

    const [adminSeedTx] = await db.select().from(transactions).where(eq(transactions.reference, 'DEP-ADMIN-001')).limit(1);
    if (!adminSeedTx) {
        await db.insert(transactions).values({
            organizationId: adminOrg.id,
            userId: adminUser.id,
            amount: '45000.00',
            type: 'DEPOSIT',
            category: 'Salary',
            description: 'Initial account deposit',
            reference: 'DEP-ADMIN-001',
            toBalanceId: adminChecking.id,
            date: d('2024-01-01'),
        });
    }

    console.log('✅  Seed complete!');
    console.log('');
    console.log('  Admin user  : moganegb@gmail.com   / Tswalano@42');
    console.log('  Demo user   : email@financeco.com  / Admin123');
    console.log('');

    await connection.end();
    process.exit(0);
};

runSeed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
