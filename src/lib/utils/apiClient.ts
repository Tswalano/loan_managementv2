// import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// import axios, { AxiosError } from 'axios';

// // Types
// export interface User {
//     id: string;
//     email: string;
//     firstName?: string;
//     lastName?: string;
//     phoneNumber?: string;
//     fullName?: string;
// }

// export interface Balance {
//     id: string;
//     userId: string;
//     type: 'SAVINGS' | 'CHECKING' | 'LOAN' | 'INVESTMENT' | 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'LOAN_RECEIVABLE';
//     bankName?: string;
//     accountStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
//     accountNumber?: string;
//     accountName?: string;
//     balance: string;
//     previousBalance?: string;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface Transaction {
//     id: string;
//     userId: string;
//     amount: string;
//     type: 'INCOME' | 'EXPENSE' | 'LOAN_PAYMENT' | 'LOAN_DISBURSEMENT' | 'TRANSFER' | 'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'INTEREST';
//     category: string;
//     description?: string;
//     reference?: string;
//     fromBalanceId?: string;
//     toBalanceId?: string;
//     loanId?: string;
//     date: string;
//     isLoanDisbursement?: boolean;
//     isLoanPayment?: boolean;
//     createdAt: string;
// }

// export interface Loan {
//     id: string;
//     userId: string;
//     balanceId: string;
//     borrowerName: string;
//     principalAmount: string;
//     interestRate: string;
//     termMonths: string;
//     status: 'PENDING' | 'ACTIVE' | 'PAID' | 'DEFAULTED' | 'CANCELLED';
//     disbursementDate?: string;
//     maturityDate?: string;
//     outstandingBalance?: string;
//     totalPaid?: string;
//     createdAt: string;
//     updatedAt: string;
// }

// export interface LoanWithRelations extends Loan {
//     balance: Balance;
//     transactions: Transaction[];
// }

// // API Configuration
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://8bp49x30ql.execute-api.af-south-1.amazonaws.com';

// const apiClient = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// // Request interceptor to add auth token
// apiClient.interceptors.request.use(
//     (config) => {
//         const token = localStorage.getItem('authToken');
//         if (token) {
//             config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//     },
//     (error) => Promise.reject(error)
// );

// // Response interceptor for error handling
// apiClient.interceptors.response.use(
//     (response) => response,
//     (error: AxiosError) => {
//         if (error.response?.status === 401) {
//             localStorage.removeItem('authToken');
//             window.location.href = '/login';
//         }
//         return Promise.reject(error);
//     }
// );

// // Query Keys
// export const queryKeys = {
//     user: ['user'] as const,
//     balances: (userId: string) => ['balances', userId] as const,
//     transactions: (userId: string) => ['transactions', userId] as const,
//     loans: (userId: string) => ['loans', userId] as const,
//     loanDetail: (loanId: string) => ['loan', loanId] as const,
// };

// // ============================================
// // AUTH API
// // ============================================

// interface LoginRequest {
//     email: string;
//     password: string;
// }

// interface RegisterRequest extends LoginRequest {
//     firstName?: string;
//     lastName?: string;
//     phoneNumber?: string;
// }

// interface AuthResponse {
//     success: boolean;
//     message: string;
//     token: string;
//     user: User;
// }

// export const useLogin = () => {
//     return useMutation<AuthResponse, AxiosError, LoginRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/login', data);
//             return response.data;
//         },
//         onSuccess: (data) => {
//             localStorage.setItem('authToken', data.token);
//         },
//     });
// };

// export const useRegister = () => {
//     return useMutation<AuthResponse, AxiosError, RegisterRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/register', data);
//             return response.data;
//         },
//         onSuccess: (data) => {
//             localStorage.setItem('authToken', data.token);
//         },
//     });
// };

// export const useLogout = () => {
//     const queryClient = useQueryClient();

//     return useMutation({
//         mutationFn: async () => {
//             await apiClient.post('/logout');
//         },
//         onSuccess: () => {
//             localStorage.removeItem('authToken');
//             queryClient.clear();
//         },
//     });
// };

// export const useCurrentUser = () => {
//     return useQuery<{ success: boolean; user: User }, AxiosError>({
//         queryKey: queryKeys.user,
//         queryFn: async () => {
//             const response = await apiClient.get('/me');
//             return response.data;
//         },
//         retry: false,
//         staleTime: 5 * 60 * 1000, // 5 minutes
//     });
// };

// export const useUpdateUser = () => {
//     const queryClient = useQueryClient();

//     return useMutation<AuthResponse, AxiosError, { userId: string; data: Partial<User> }>({
//         mutationFn: async ({ userId, data }) => {
//             const response = await apiClient.put(`/users/${userId}`, data);
//             return response.data;
//         },
//         onSuccess: () => {
//             queryClient.invalidateQueries({ queryKey: queryKeys.user });
//         },
//     });
// };

// // ============================================
// // BALANCES API
// // ============================================

// interface CreateBalanceRequest {
//     userId: string;
//     type: Balance['type'];
//     bankName?: string;
//     accountName?: string;
//     accountNumber?: string;
//     balance?: string;
//     previousBalance?: string;
// }

// export const useBalances = (userId: string) => {
//     return useQuery<Balance[], AxiosError>({
//         queryKey: queryKeys.balances(userId),
//         queryFn: async () => {
//             const response = await apiClient.get(`/balances/${userId}`);
//             return response.data;
//         },
//         enabled: !!userId,
//     });
// };

// export const useCreateBalance = () => {
//     const queryClient = useQueryClient();

//     return useMutation<{ success: boolean; message: string; balance: Balance }, AxiosError, CreateBalanceRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/balances', data);
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.userId) });
//         },
//     });
// };

// export const useDeleteBalance = () => {
//     const queryClient = useQueryClient();

//     return useMutation<{ success: boolean; message: string }, AxiosError, { balanceId: string; userId: string }>({
//         mutationFn: async ({ balanceId }) => {
//             const response = await apiClient.delete(`/balances/${balanceId}`);
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.userId) });
//         },
//     });
// };

// // ============================================
// // TRANSACTIONS API
// // ============================================

// interface CreateTransactionRequest {
//     userId: string;
//     amount: string | number;
//     type: Transaction['type'];
//     category: string;
//     description?: string;
//     reference?: string;
//     fromBalanceId?: string;
//     toBalanceId?: string;
//     loanId?: string;
//     date?: Date | string;
//     isLoanDisbursement?: boolean;
//     isLoanPayment?: boolean;
// }

// export const useTransactions = (userId: string) => {
//     return useQuery<Transaction[], AxiosError>({
//         queryKey: queryKeys.transactions(userId),
//         queryFn: async () => {
//             const response = await apiClient.get(`/transactions/${userId}`);
//             return response.data;
//         },
//         enabled: !!userId,
//     });
// };

// export const useCreateTransaction = () => {
//     const queryClient = useQueryClient();

//     return useMutation<Transaction, AxiosError, CreateTransactionRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/transactions', {
//                 ...data,
//                 amount: String(data.amount),
//                 date: data.date || new Date(),
//             });
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             // Invalidate all related queries
//             queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.userId) });
//             if (variables.loanId) {
//                 queryClient.invalidateQueries({ queryKey: queryKeys.loanDetail(variables.loanId) });
//                 queryClient.invalidateQueries({ queryKey: queryKeys.loans(variables.userId) });
//             }
//         },
//     });
// };

// export const useDeleteTransaction = () => {
//     const queryClient = useQueryClient();

//     return useMutation<{ success: boolean; message: string }, AxiosError, { transactionId: string; userId: string }>({
//         mutationFn: async ({ transactionId }) => {
//             const response = await apiClient.delete(`/transactions/${transactionId}`);
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.loans(variables.userId) });
//         },
//     });
// };

// // ============================================
// // LOANS API
// // ============================================

// interface CreateLoanRequest {
//     userId: string;
//     balanceId: string;
//     borrowerName: string;
//     principalAmount: string | number;
//     interestRate: string | number;
//     termMonths: string | number;
//     disbursementDate?: Date | string;
//     maturityDate?: Date | string;
// }

// interface UpdateLoanRequest {
//     status?: Loan['status'];
//     outstandingBalance?: string | number;
//     totalPaid?: string | number;
//     [key: string]: any;
// }

// export const useLoans = (userId: string) => {
//     return useQuery<LoanWithRelations[], AxiosError>({
//         queryKey: queryKeys.loans(userId),
//         queryFn: async () => {
//             const response = await apiClient.get(`/loans/${userId}`);
//             return response.data;
//         },
//         enabled: !!userId,
//     });
// };

// export const useLoanDetail = (loanId: string) => {
//     return useQuery<LoanWithRelations, AxiosError>({
//         queryKey: queryKeys.loanDetail(loanId),
//         queryFn: async () => {
//             const response = await apiClient.get(`/loans/detail/${loanId}`);
//             return response.data;
//         },
//         enabled: !!loanId,
//     });
// };

// export const useCreateLoan = () => {
//     const queryClient = useQueryClient();

//     return useMutation<{ success: boolean; message: string; loan: Loan }, AxiosError, CreateLoanRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/loans', {
//                 ...data,
//                 principalAmount: String(data.principalAmount),
//                 interestRate: String(data.interestRate),
//                 termMonths: String(data.termMonths),
//                 outstandingBalance: String(data.principalAmount),
//             });
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             queryClient.invalidateQueries({ queryKey: queryKeys.loans(variables.userId) });
//         },
//     });
// };

// export const useUpdateLoan = () => {
//     const queryClient = useQueryClient();

//     return useMutation<{ success: boolean; message: string; loan: Loan }, AxiosError, { loanId: string; userId: string; data: UpdateLoanRequest }>({
//         mutationFn: async ({ loanId, data }) => {
//             const response = await apiClient.put(`/loans/${loanId}`, data);
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             queryClient.invalidateQueries({ queryKey: queryKeys.loanDetail(variables.loanId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.loans(variables.userId) });
//         },
//     });
// };

// // ============================================
// // LOAN OPERATIONS (Transaction-based)
// // ============================================

// interface DisburseLoanRequest {
//     loanId: string;
//     userId: string;
//     amount: string | number;
//     fromBalanceId: string; // The account from which loan is disbursed
//     description?: string;
// }

// interface LoanPaymentRequest {
//     loanId: string;
//     userId: string;
//     amount: string | number;
//     toBalanceId: string; // The account receiving the payment (loan receivable account)
//     description?: string;
// }

// export const useDisburseLoan = () => {
//     const queryClient = useQueryClient();

//     return useMutation<Transaction, AxiosError, DisburseLoanRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/loans/disburse', {
//                 ...data,
//                 amount: String(data.amount),
//             });
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             // Invalidate all related queries
//             queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.loanDetail(variables.loanId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.loans(variables.userId) });
//         },
//     });
// };

// export const useMakeLoanPayment = () => {
//     const queryClient = useQueryClient();

//     return useMutation<Transaction, AxiosError, LoanPaymentRequest>({
//         mutationFn: async (data) => {
//             const response = await apiClient.post('/loans/payment', {
//                 ...data,
//                 amount: String(data.amount),
//             });
//             return response.data;
//         },
//         onSuccess: (_, variables) => {
//             // Invalidate all related queries
//             queryClient.invalidateQueries({ queryKey: queryKeys.transactions(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.balances(variables.userId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.loanDetail(variables.loanId) });
//             queryClient.invalidateQueries({ queryKey: queryKeys.loans(variables.userId) });
//         },
//     });
// };

// // ============================================
// // UTILITY HOOKS
// // ============================================

// // Hook to calculate total balance across all accounts
// export const useTotalBalance = (userId: string) => {
//     const { data: balances } = useBalances(userId);

//     const totalBalance = balances?.reduce((total, balance) => {
//         return total + parseFloat(balance.balance || '0');
//     }, 0) || 0;

//     return { totalBalance };
// };

// // Hook to get balance by type
// export const useBalancesByType = (userId: string, type?: Balance['type']) => {
//     const { data: balances, ...rest } = useBalances(userId);

//     const filteredBalances = type
//         ? balances?.filter(b => b.type === type)
//         : balances;

//     return { data: filteredBalances, ...rest };
// };

// // Hook to calculate loan statistics
// export const useLoanStatistics = (userId: string) => {
//     const { data: loans } = useLoans(userId);

//     const statistics = {
//         totalLoaned: loans?.reduce((total, loan) => {
//             return total + parseFloat(loan.principalAmount || '0');
//         }, 0) || 0,
//         totalOutstanding: loans?.reduce((total, loan) => {
//             return total + parseFloat(loan.outstandingBalance || '0');
//         }, 0) || 0,
//         totalPaid: loans?.reduce((total, loan) => {
//             return total + parseFloat(loan.totalPaid || '0');
//         }, 0) || 0,
//         activeLoans: loans?.filter(l => l.status === 'ACTIVE').length || 0,
//         defaultedLoans: loans?.filter(l => l.status === 'DEFAULTED').length || 0,
//     };

//     return statistics;
// };

// export default apiClient;