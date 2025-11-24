/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { BACKEND_API_URL } from '@/lib/utils/consts';

// ============================================
// TYPES
// ============================================

import type {
    Balance,
    Transaction,
    Loan,
    Organization,
    OrganizationMember,
    Invitation,
    AuditLog,
    User,
    UserRole,
    AccountType,
    TransactionType,
    LoanStatus,
} from '@/types';

// Request types
export interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    organizationName?: string;
    organizationDescription?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface CreateBalanceRequest {
    type: AccountType;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    balance?: string;
    currency?: string;
}

export interface CreateTransactionRequest {
    amount: string | number;
    type: TransactionType;
    category: string;
    description?: string;
    fromBalanceId?: string;
    toBalanceId?: string;
    loanId?: string;
    date?: string;
    isLoanDisbursement?: boolean;
    isLoanPayment?: boolean;
    metadata?: Record<string, any>;
}

export interface CreateLoanRequest {
    balanceId: string;
    borrowerName: string;
    borrowerEmail?: string;
    borrowerPhone?: string;
    principalAmount: string | number;
    interestRate: string | number;
    termMonths: string | number;
    metadata?: Record<string, any>;
}

export interface DisburseLoandRequest {
    amount: string | number;
    fromBalanceId: string;
    description?: string;
}

export interface LoanPaymentRequest {
    amount: string | number;
    toBalanceId: string;
    description?: string;
}

export interface InviteUserRequest {
    email: string;
    role: UserRole;
}

export interface UpdateOrganizationRequest {
    name?: string;
    description?: string;
    settings?: Record<string, any>;
}

export interface UpdateMemberRoleRequest {
    role: UserRole;
}

export interface GrantLoanAccessRequest {
    targetUserId: string;
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export interface TransferRequest {
    amount: number;
    fromBalanceId: string;
    toBalanceId: string;
    description?: string;
}

// Response types
export interface AuthResponse {
    success: boolean;
    message: string;
    token: string;
    user: User;
    organization?: {
        id: string;
        name: string;
        role: UserRole;
    };
}

export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
    [key: string]: any;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

const handleResponse = async <T,>(response: Response): Promise<T> => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || error.message || 'Request failed');
    }
    return response.json();
};

// ============================================
// API CLIENT CLASS
// ============================================

class FinanceAPI {
    private baseUrl: string;
    private queryClient: QueryClient | null = null;

    constructor(baseUrl: string = BACKEND_API_URL) {
        this.baseUrl = baseUrl;
    }

    // Set query client for cache invalidation
    setQueryClient(client: QueryClient) {
        this.queryClient = client;
    }

    private invalidateQueries(keys: string[][]) {
        if (this.queryClient) {
            keys.forEach(key => {
                this.queryClient!.invalidateQueries({ queryKey: key });
            });
        }
    }

    // ============================================
    // AUTHENTICATION
    // ============================================

    async register(data: RegisterRequest): Promise<AuthResponse> {
        const res = await fetch(`${this.baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await handleResponse<AuthResponse>(res);

        if (result.token) {
            sessionStorage.setItem('authToken', result.token);
        }

        this.invalidateQueries([['currentUser']]);
        return result;
    }

    async login(data: LoginRequest): Promise<AuthResponse> {
        const res = await fetch(`${this.baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await handleResponse<AuthResponse>(res);

        if (result.token) {
            sessionStorage.setItem('authToken', result.token);
        }

        this.invalidateQueries([['currentUser']]);
        return result;
    }

    logout() {
        sessionStorage.removeItem('authToken');
        if (this.queryClient) {
            this.queryClient.clear();
        }
    }

    async getCurrentUser(): Promise<ApiResponse<{ user: User; organizations: any[] }>> {
        const res = await fetch(`${this.baseUrl}/me`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    // ============================================
    // ORGANIZATIONS
    // ============================================

    async getOrganization(organizationId: string): Promise<ApiResponse<{ organization: Organization }>> {
        const res = await fetch(`${this.baseUrl}/organizations/${organizationId}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async updateOrganization(organizationId: string, data: UpdateOrganizationRequest): Promise<ApiResponse<{ organization: Organization }>> {
        const res = await fetch(`${this.baseUrl}/organizations/${organizationId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ organization: Organization }>>(res);
        this.invalidateQueries([['organization', organizationId]]);
        return result;
    }

    async inviteUser(organizationId: string, data: InviteUserRequest): Promise<ApiResponse<{ invitation: Invitation }>> {
        const res = await fetch(`${this.baseUrl}/organizations/${organizationId}/invite`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ invitation: Invitation }>>(res);
        this.invalidateQueries([['organization', organizationId]]);
        return result;
    }

    async acceptInvitation(token: string): Promise<ApiResponse> {
        const res = await fetch(`${this.baseUrl}/invitations/${token}/accept`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        const result = await handleResponse<ApiResponse>(res);
        this.invalidateQueries([['currentUser']]);
        return result;
    }

    async updateMemberRole(organizationId: string, memberId: string, data: UpdateMemberRoleRequest): Promise<ApiResponse<{ member: OrganizationMember }>> {
        const res = await fetch(
            `${this.baseUrl}/organizations/${organizationId}/members/${memberId}/role`,
            {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(data),
            }
        );
        const result = await handleResponse<ApiResponse<{ member: OrganizationMember }>>(res);
        this.invalidateQueries([['organization', organizationId]]);
        return result;
    }

    // ============================================
    // BALANCES
    // ============================================

    async getBalances(): Promise<ApiResponse<{ balances: Balance[] }>> {
        const res = await fetch(`${this.baseUrl}/balances`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async createBalance(data: CreateBalanceRequest): Promise<ApiResponse<{ balance: Balance }>> {
        const res = await fetch(`${this.baseUrl}/balances`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ balance: Balance }>>(res);
        this.invalidateQueries([['balances'], ['dashboard']]);
        return result;
    }

    async deleteBalance(balanceId: string): Promise<ApiResponse> {
        const res = await fetch(`${this.baseUrl}/balances/${balanceId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const result = await handleResponse<ApiResponse>(res);
        this.invalidateQueries([['balances'], ['dashboard']]);
        return result;
    }

    // ============================================
    // TRANSACTIONS
    // ============================================

    async getTransactions(filters?: {
        limit?: number;
        offset?: number;
        type?: TransactionType;
        startDate?: string;
        endDate?: string;
    }): Promise<ApiResponse<{ transactions: Transaction[] }>> {
        const params = new URLSearchParams();
        if (filters?.limit) params.append('limit', String(filters.limit));
        if (filters?.offset) params.append('offset', String(filters.offset));
        if (filters?.type) params.append('type', filters.type);
        if (filters?.startDate) params.append('startDate', filters.startDate);
        if (filters?.endDate) params.append('endDate', filters.endDate);

        const url = `${this.baseUrl}/transactions${params.toString() ? `?${params}` : ''}`;
        const res = await fetch(url, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async getTransaction(transactionId: string): Promise<ApiResponse<{ transaction: Transaction }>> {
        const res = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async createTransaction(data: CreateTransactionRequest): Promise<ApiResponse<{ transaction: Transaction }>> {
        const res = await fetch(`${this.baseUrl}/transactions`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ transaction: Transaction }>>(res);
        this.invalidateQueries([['transactions'], ['balances'], ['dashboard']]);
        return result;
    }

    async deleteTransaction(transactionId: string): Promise<ApiResponse> {
        const res = await fetch(`${this.baseUrl}/transactions/${transactionId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        const result = await handleResponse<ApiResponse>(res);
        this.invalidateQueries([['transactions'], ['balances'], ['dashboard']]);
        return result;
    }

    // Helper methods for specific transaction types
    async recordIncome(data: Omit<CreateTransactionRequest, 'type'>): Promise<ApiResponse<{ transaction: Transaction }>> {
        return this.createTransaction({ ...data, type: 'INCOME' as TransactionType });
    }

    async recordExpense(data: Omit<CreateTransactionRequest, 'type'>): Promise<ApiResponse<{ transaction: Transaction }>> {
        return this.createTransaction({ ...data, type: 'EXPENSE' as TransactionType });
    }

    async transferFunds(data: TransferRequest): Promise<ApiResponse<{ transaction: Transaction }>> {
        const tx: CreateTransactionRequest = {
            amount: String(data.amount),
            type: 'TRANSFER' as TransactionType,
            category: 'Transfer',
            description: data.description,
            fromBalanceId: data.fromBalanceId,
            toBalanceId: data.toBalanceId,
        };
        return this.createTransaction(tx);
    }

    // ============================================
    // LOANS
    // ============================================

    async getLoans(filters?: { status?: LoanStatus }): Promise<ApiResponse<{ loans: Loan[] }>> {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);

        const url = `${this.baseUrl}/loans${params.toString() ? `?${params}` : ''}`;
        const res = await fetch(url, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async getLoan(loanId: string): Promise<ApiResponse<{ loan: Loan }>> {
        const res = await fetch(`${this.baseUrl}/loans/${loanId}`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async createLoan(data: CreateLoanRequest): Promise<ApiResponse<{ loan: Loan }>> {
        const res = await fetch(`${this.baseUrl}/loans`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ loan: Loan }>>(res);
        this.invalidateQueries([['loans'], ['dashboard']]);
        return result;
    }

    async updateLoan(loanId: string, data: Partial<CreateLoanRequest>): Promise<ApiResponse<{ loan: Loan }>> {
        const res = await fetch(`${this.baseUrl}/loans/${loanId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ loan: Loan }>>(res);
        this.invalidateQueries([['loan', loanId], ['loans']]);
        return result;
    }

    async disburseLoan(loanId: string, data: DisburseLoandRequest): Promise<ApiResponse<{ transaction: Transaction }>> {
        const res = await fetch(`${this.baseUrl}/loans/${loanId}/disburse`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ transaction: Transaction }>>(res);
        this.invalidateQueries([
            ['loan', loanId],
            ['loans'],
            ['balances'],
            ['transactions'],
            ['dashboard']
        ]);
        return result;
    }

    async recordLoanPayment(loanId: string, data: LoanPaymentRequest): Promise<ApiResponse<{ transaction: Transaction }>> {
        const res = await fetch(`${this.baseUrl}/loans/${loanId}/payment`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse<{ transaction: Transaction }>>(res);
        this.invalidateQueries([
            ['loan', loanId],
            ['loans'],
            ['balances'],
            ['transactions'],
            ['dashboard']
        ]);
        return result;
    }

    async grantLoanAccess(loanId: string, data: GrantLoanAccessRequest): Promise<ApiResponse> {
        const res = await fetch(`${this.baseUrl}/loans/${loanId}/grant-access`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse<ApiResponse>(res);
        this.invalidateQueries([['loan', loanId]]);
        return result;
    }

    async revokeLoanAccess(loanId: string, accessId: string): Promise<ApiResponse> {
        const res = await fetch(
            `${this.baseUrl}/loans/${loanId}/revoke-access/${accessId}`,
            {
                method: 'DELETE',
                headers: getAuthHeaders(),
            }
        );
        const result = await handleResponse<ApiResponse>(res);
        this.invalidateQueries([['loan', loanId]]);
        return result;
    }

    // ============================================
    // REPORTS & ANALYTICS
    // ============================================

    async getDashboard(): Promise<ApiResponse<{
        dashboard: {
            totalBalance: string;
            totalLoaned: string;
            totalOutstanding: string;
            activeLoansCount: number;
            balanceAccounts: number;
            recentTransactions: Transaction[];
        };
    }>> {
        const res = await fetch(`${this.baseUrl}/reports/dashboard`, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    async getAuditLogs(limit?: number): Promise<ApiResponse<{ logs: AuditLog[] }>> {
        const params = new URLSearchParams();
        if (limit) params.append('limit', String(limit));

        const url = `${this.baseUrl}/audit-logs${params.toString() ? `?${params}` : ''}`;
        const res = await fetch(url, {
            headers: getAuthHeaders(),
        });
        return handleResponse(res);
    }

    // ============================================
    // HEALTH CHECK
    // ============================================

    async healthCheck(): Promise<{ status: string; timestamp: string }> {
        const res = await fetch(`${this.baseUrl}/health`);
        return handleResponse(res);
    }
}

// ============================================
// CREATE SINGLETON INSTANCE
// ============================================

export const api = new FinanceAPI();

// ============================================
// REACT HOOKS FOR QUERIES
// ============================================

export function useAPI() {
    const queryClient = useQueryClient();

    // Set query client on the api instance
    if (!api['queryClient']) {
        api.setQueryClient(queryClient);
    }

    return api;
}

// Query hooks that use the api instance
export function useCurrentUser() {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => api.getCurrentUser(),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

export function useBalances() {
    const { data: userData } = useCurrentUser();

    return useQuery({
        queryKey: ['balances'],
        queryFn: () => api.getBalances(),
        enabled: !!userData?.user,
    });
}

export function useTransactions(filters?: {
    limit?: number;
    offset?: number;
    type?: TransactionType;
    startDate?: string;
    endDate?: string;
}) {
    const { data: userData } = useCurrentUser();

    return useQuery({
        queryKey: ['transactions', filters],
        queryFn: () => api.getTransactions(filters),
        enabled: !!userData?.user,
    });
}

export function useTransaction(transactionId?: string) {
    return useQuery({
        queryKey: ['transaction', transactionId],
        queryFn: () => api.getTransaction(transactionId!),
        enabled: !!transactionId,
    });
}

export function useLoans(filters?: { status?: LoanStatus }) {
    const { data: userData } = useCurrentUser();

    return useQuery({
        queryKey: ['loans', filters],
        queryFn: () => api.getLoans(filters),
        enabled: !!userData?.user,
    });
}

export function useLoan(loanId?: string) {
    return useQuery({
        queryKey: ['loan', loanId],
        queryFn: () => api.getLoan(loanId!),
        enabled: !!loanId,
    });
}

export function useOrganization(organizationId?: string) {
    return useQuery({
        queryKey: ['organization', organizationId],
        queryFn: () => api.getOrganization(organizationId!),
        enabled: !!organizationId,
    });
}

export function useDashboard() {
    const { data: userData } = useCurrentUser();

    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => api.getDashboard(),
        enabled: !!userData?.user,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useAuditLogs(limit?: number) {
    const { data: userData } = useCurrentUser();

    return useQuery({
        queryKey: ['auditLogs', limit],
        queryFn: () => api.getAuditLogs(limit),
        enabled: !!userData?.user,
    });
}

// ============================================
// COMBINED HOOK FOR ALL DATA
// ============================================

export function useFinanceData() {
    const { data: userData, isLoading: userLoading } = useCurrentUser();
    const { data: balancesData, isLoading: balancesLoading } = useBalances();
    const { data: transactionsData, isLoading: transactionsLoading } = useTransactions();
    const { data: loansData, isLoading: loansLoading } = useLoans();
    const { data: dashboardData, isLoading: dashboardLoading } = useDashboard();

    return {
        user: userData?.user,
        organizations: userData?.organizations || [],
        balances: balancesData?.balances || [],
        transactions: transactionsData?.transactions || [],
        loans: loansData?.loans || [],
        dashboard: dashboardData?.dashboard,
        isLoading: userLoading || balancesLoading || transactionsLoading || loansLoading || dashboardLoading,
    };
}

// ============================================
// DEFAULT EXPORT
// ============================================

export default api;