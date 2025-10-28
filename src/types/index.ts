// -----------------------------------------------------------------------------
// ENUMS
// -----------------------------------------------------------------------------

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type AccountType = 'SAVINGS' | 'CHECKING' | 'LOAN' | 'INVESTMENT' | 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'LOAN_RECEIVABLE';
export type TransactionType =
    | 'INCOME'
    | 'EXPENSE'
    | 'TRANSFER'
    | 'LOAN_DISBURSEMENT'
    | 'LOAN_PAYMENT'
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'FEE'
    | 'INTEREST';
export type LoanStatus = 'PENDING' | 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'CANCELLED';
export type Status = 'PENDING' | 'COMPLETED' | 'FAILED';
export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';

// Extended transaction categories for UI organization
export const TransactionCategories = {
    INCOME: ['Interest', 'Late Fees', 'Other Income'],
    EXPENSE: ['Office Rent', 'Utilities', 'Salary', 'Marketing', 'Office Supplies', 'Other Expenses'],
    LOAN_PAYMENT: ['Principal Payment', 'Interest Payment', 'Late Fee Payment'],
    LOAN_DISBURSEMENT: ['New Loan', 'Loan Renewal'],
} as const;

// -----------------------------------------------------------------------------
// USERS
// -----------------------------------------------------------------------------

export interface User {
    id: string;
    email: string;
    passwordHash?: string;
    firstName?: string | null;
    lastName?: string | null;
    phoneNumber?: string | null;
    name?: string | null; // Alias for combined display
    role?: 'ADMIN' | 'USER';
    settings?: Record<string, unknown>;
    createdAt: string | Date;
    updatedAt: string | Date;
}

// -----------------------------------------------------------------------------
// BALANCES
// -----------------------------------------------------------------------------

export interface Balance {
    id: string;
    userId: string;
    type: AccountType;
    accountReference?: string;
    bankName?: string;
    accountName?: string;
    currentBalance: string;
    previousBalance?: string;
    lastTransactionId?: string | null;
    accountStatus: AccountStatus;
    createdAt: string;
    updatedAt: string;
}

export interface NewBalance {
    userId: string;
    type: AccountType;
    accountReference?: string;
    bankName?: string;
    accountName?: string;
    currentBalance?: string;
    accountStatus?: AccountStatus;
}

// -----------------------------------------------------------------------------
// TRANSACTIONS
// -----------------------------------------------------------------------------

export interface Transaction {
    id: string;
    userId: string;
    date: string;
    type: TransactionType;
    category: string;
    amount: number | string;
    description?: string;
    reference: string;
    fromBalanceId?: string;
    toBalanceId?: string;
    balanceAfterTransaction?: number;
    loanStatus?: LoanStatus;
    paymentsMade?: number;
    totalInterest?: number;
    remainingBalance?: number;
    interestRate?: number;
    isLoanPayment?: boolean;
    isLoanDisbursement?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface NewTransaction {
    amount: string | number;
    type: TransactionType;
    category: string;
    description?: string;
    reference: string;
    fromBalanceId?: string;
    toBalanceId?: string;
    date: string | Date;
    loanStatus?: LoanStatus;
    paymentsMade?: number;
    totalInterest?: number;
    remainingBalance?: number;
    interestRate?: number;
    isLoanPayment?: boolean;
    isLoanDisbursement?: boolean;
    loanTrackingId?: string;
    borrowerName?: string;
}

// -----------------------------------------------------------------------------
// LOANS
// -----------------------------------------------------------------------------

export interface Loan {
    id: string;
    userId: string;
    balanceId: string;
    borrowerName: string;
    principalAmount: string;
    interestRate: string;
    termMonths: string;
    status: LoanStatus;
    disbursementDate?: string | null;
    maturityDate?: string | null;
    outstandingBalance?: string | null;
    totalPaid: string;
    createdAt: string;
    updatedAt: string;

    // Relations
    balance?: Balance;
    transactions?: Transaction[];
}

export interface NewLoan {
    userId: string;
    balanceId: string;
    borrowerName: string;
    principalAmount: string;
    interestRate: string;
    termMonths: string;
    status?: LoanStatus;
    disbursementDate?: string;
    maturityDate?: string;
    outstandingBalance?: string;
    totalPaid?: string;
}

// -----------------------------------------------------------------------------
// LOAN TRACKING & PAYMENTS
// -----------------------------------------------------------------------------

export interface LoanTracking {
    id: string;
    userId: string;
    initialAmount: number;
    totalInterest: number;
    totalAmount: number;
    amountPaid: number;
    remainingBalance: number;
    interestRate: number;
    startDate: string;
    dueDate: string;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
    isFullyPaid: boolean;
    lastPaymentDate?: string;
    borrowerName: string;
    createdAt: string;
    updatedAt: string;
}

export interface LoanPayment {
    amount: number | null;
    loanId: string;
    accountId?: string;
    description: string;
}

export interface LoanTransactionResult {
    success: boolean;
    transaction?: Transaction;
    error?: string;
}

// -----------------------------------------------------------------------------
// FORMS / UI
// -----------------------------------------------------------------------------

export type FormTransactionData = {
    description: string;
    amount: number;
    interestRate: number;
    fromBalanceId: string;
    date: Date;
};

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}
