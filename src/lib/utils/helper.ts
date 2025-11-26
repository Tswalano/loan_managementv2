// import { TransactionType } from "@/types";
// import { formalize, generateReferenceNumber } from "../utils/formatters";

// // Helper functions
// export function formatTransactionType(type: string): string {
//     return type.replace('_', ' ').toLowerCase()
//         .split(' ')
//         .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(' ');
// }

// export function extractBorrowerName(description: string): string {
//     return description.split('-')[0].trim() || 'Unknown Borrower';
// }

// export function calculateEndDate(startDate: string): string {
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + 12); // Default to 12 months
//     return endDate.toISOString();
// }

// export function calculateTotalInterest(amount: number, interestRate: number, term: number): number {
//     return (amount * (interestRate / 100) * (term / 12));
// }

// // export const generateTransactionData = (data: FormTransactionData, type: TransactionType) => {
// //     // const interestRate = data.interestRate ?? 0; // Default to 0 if interestRate is undefined
// //     // const totalInterest = (data.amount * interestRate) / 100; // Correct calculation
// //     // const remainingBalance = data.amount + totalInterest; // Add the calculated interest to amount

// //     return {
// //         //   loanStatus: type === "LOAN_DISBURSEMENT" ? "ACTIVE" : null as LoanStatus | null,
// //         //   paymentsMade: type === "LOAN_PAYMENT" ? String(data.amount) : "0",
// //         //   totalInterest: totalInterest.toFixed(2), // Ensure totalInterest is a string with 2 decimal places
// //         //   remainingBalance: remainingBalance.toFixed(2), // Ensure remainingBalance is a string with 2 decimal places
// //         //   interestRate: 30, // Convert interestRate to string
// //         fromBalanceId: type === "INCOME" || type === "LOAN_PAYMENT" ? null : data.fromBalanceId,
// //         toBalanceId: type === "INCOME" || type === "LOAN_PAYMENT" ? data.fromBalanceId : null,
// //         date: data.date || new Date(),
// //         type: type,
// //         category: `${data.description} - ${formalize(type)}`,
// //         amount: data.amount.toString(),
// //         reference: generateReferenceNumber(type),
// //         description: `${data.description} - ${formalize(type)}`,
// //         isLoanDisbursement: type === "LOAN_DISBURSEMENT" ? true : false,
// //         isLoanPayment: type === "LOAN_PAYMENT" ? true : false
// //     };
// // };

// export const generateTransactionData = (
//     data: FormTransactionData,
//     type: TransactionType,
//     userId: string,
//     loanId?: string
// ) => {
//     return {
//         userId,
//         amount: data.amount.toString(),
//         type,
//         category: `${data.description} - ${formalize(type)}`,
//         description: `${data.description} - ${formalize(type)}`,
//         reference: generateReferenceNumber(type),
//         fromBalanceId:
//             type === 'INCOME' || type === 'LOAN_PAYMENT'
//                 ? undefined
//                 : data.fromBalanceId,
//         toBalanceId:
//             type === 'INCOME' || type === 'LOAN_PAYMENT'
//                 ? data.fromBalanceId
//                 : data.toBalanceId,
//         loanId: loanId ?? undefined,
//         isLoanDisbursement: type === 'LOAN_DISBURSEMENT',
//         isLoanPayment: type === 'LOAN_PAYMENT',
//     };
// };

// // export const generateTransactionData = (
// //     data: FormTransactionData,
// //     type: TransactionType,
// //     userId: string,
// //     loanId?: string
// // ) => {

// //     return {
// //         userId,
// //         amount: data.amount.toString(), // ✅ decimal expects string
// //         type,
// //         category: `${data.description} - ${formalize(type)}`,
// //         description: `${data.description} - ${formalize(type)}`,
// //         reference: generateReferenceNumber(type),
// //         fromBalanceId:
// //             type === 'INCOME' || type === 'LOAN_PAYMENT'
// //                 ? undefined
// //                 : data.fromBalanceId,
// //         toBalanceId:
// //             type === 'INCOME' || type === 'LOAN_PAYMENT'
// //                 ? data.fromBalanceId
// //                 : undefined,
// //         loanId: loanId ?? undefined, // ✅ optional
// //         // date: parsedDate, // ✅ timestamp expects Date
// //         isLoanDisbursement: type === 'LOAN_DISBURSEMENT',
// //         isLoanPayment: type === 'LOAN_PAYMENT',
// //     };
// // };