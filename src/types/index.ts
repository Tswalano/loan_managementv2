// import { balances, transactions } from "@/lib/db/schema";

import { balances, loans, transactions } from "@/lib/db/schema";

export type LoanStatus = 'ACTIVE' | 'PAID' | 'DEFAULTED';

export type LoanTransactionType = 'INCOME' | 'EXPENSE' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT';

export type Status = 'PENDING' | 'COMPLETED' | 'FAILED';

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'MOBILE_MONEY';


// Extended categories for better organization
export const TransactionCategories = {
    INCOME: ['Interest', 'Late Fees', 'Other Income'],
    EXPENSE: ['Office Rent', 'Utilities', 'Salary', 'Marketing', 'Office Supplies', 'Other Expenses'],
    LOAN_PAYMENT: ['Principal Payment', 'Interest Payment', 'Late Fee Payment'],
    LOAN_DISBURSEMENT: ['New Loan', 'Loan Renewal']
} as const;

export interface User {
    id: string;
    email: string;
    createdAt: Date;
    name?: string;
    role?: 'ADMIN' | 'USER';
    settings?: Record<string, unknown>;
}

export type FormTransactionData = {
    description: string;
    amount: number;
    interestRate: number;
    fromBalanceId: string;
    date: Date;
}

// // export type Loan = typeof loans.$inferSelect;
// export type Transaction = typeof transactions.$inferSelect;
// // export type NewLoan = Omit<typeof loans.$inferInsert, 'id' | 'createdAt'>;
export type NewTransaction = Omit<typeof transactions.$inferInsert, 'id' | 'createdAt' | 'updatedAt' | 'userId'>;
export type Loan = typeof loans.$inferSelect & {
    transactions: typeof transactions.$inferSelect[]
    balance: typeof balances.$inferSelect
};
// export type NewBalance = Omit<typeof balances.$inferInsert, 'id' | 'createdAt'>;

export interface Balance {
    id: string;
    userId: string;
    type: 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'LOAN_RECEIVABLE';
    accountReference: string;
    bankName: string;
    accountName: string;
    currentBalance: string;
    previousBalance: string;
    lastTransactionId: string | null;
    accountStatus: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface NewBalance {
    userId: string;
    type: 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'LOAN_RECEIVABLE';
    accountReference: string;
    bankName: string;
    accountName: string;
    currentBalance: string;
    accountStatus: 'ACTIVE' | 'INACTIVE';
}

export interface Balance {
    id: string;
    userId: string;
    type: 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'LOAN_RECEIVABLE';
    accountReference: string;
    bankName: string;
    accountName: string;
    currentBalance: string;
    previousBalance: string;
    lastTransactionId: string | null;
    accountStatus: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    userId: string;
    date: string;
    type: 'INCOME' | 'EXPENSE' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT';
    category: string;
    amount: number;
    description?: string;
    reference: string;
    fromBalanceId?: string;
    toBalanceId?: string;
    balanceAfterTransaction?: number;
    loanStatus?: 'ACTIVE' | 'PAID' | 'DEFAULTED';
    paymentsMade?: number;
    totalInterest?: number;
    remainingBalance?: number;
    interestRate?: number;
    createdAt: string;
    updatedAt: string;
}

// export interface NewTransaction {
//     amount: number;
//     type: 'INCOME' | 'EXPENSE' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT';
//     category: string;
//     description?: string;
//     reference: string;
//     fromBalanceId?: string;
//     toBalanceId?: string;
//     date: string;
//     // loan data
//     loanStatus?: 'ACTIVE' | 'PAID' | 'DEFAULTED';
//     paymentsMade?: number;
//     totalInterest?: number;
//     remainingBalance?: number;
//     // Add loan-specific fields
//     isLoanPayment?: boolean;
//     isLoanDisbursement?: boolean;
//     loanTrackingId?: string; 
//     borrowerName?: string;
//     interestRate?: number;
// }

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

// export type RequiredLoanData = {
//     loanStatus: LoanStatus | null | undefined,
//     paymentsMade: number,
//     totalInterest: number,
//     remainingBalance: number,
//     interestRate: number,
//     fromBalanceId: string | null,
//     toBalanceId: string | null,
//     description: string,
//     date: Date,
//     // userId: string,
//     type: LoanTransactionType,
//     category: string,
//     amount: string,
//     reference: string
// }

export interface LoanPayment {
    amount: number | null;
    loanId: string;
    accountId: string | undefined;
    description: string;
}

export interface LoanTransactionResult {
    success: boolean;
    transaction?: Transaction;
    error?: string;
}