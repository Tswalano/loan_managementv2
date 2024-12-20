import { z } from 'zod';

export const loanSchema = z.object({
    borrowerName: z.string().min(2, 'Borrower name is required'),
    amount: z.number().positive('Amount must be positive'),
    interestRate: z.number().min(0).max(100),
    term: z.number().positive('Term must be positive'),
    startDate: z.date(),
    paymentFrequency: z.enum(['WEEKLY', 'MONTHLY']),
    contactPhone: z.string().optional(),
    contactEmail: z.string().email().optional(),
    collateral: z.string().optional(),
});

export const transactionSchema = z.object({
    date: z.date(),
    type: z.enum(['INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT']),
    category: z.string(),
    amount: z.number().positive('Amount must be positive'),
    description: z.string(),
    loanId: z.string().optional(),
    paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'MOBILE_MONEY']).optional(),
    reference: z.string().optional(),
    receiptNumber: z.string().optional()
});
