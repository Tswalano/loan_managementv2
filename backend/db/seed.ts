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
} from './schema';

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
