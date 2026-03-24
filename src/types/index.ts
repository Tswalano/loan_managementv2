/* eslint-disable @typescript-eslint/no-explicit-any */

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    SUSPENDED = 'SUSPENDED'
}

export enum AccountType {
    SAVINGS = 'SAVINGS',
    CHECKING = 'CHECKING',
    LOAN = 'LOAN',
    INVESTMENT = 'INVESTMENT',
    CASH = 'CASH',
    BANK = 'BANK',
    MOBILE_MONEY = 'MOBILE_MONEY',
    LOAN_RECEIVABLE = 'LOAN_RECEIVABLE'
}

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
    LOAN_PAYMENT = 'LOAN_PAYMENT',
    LOAN_DISBURSEMENT = 'LOAN_DISBURSEMENT',
    TRANSFER = 'TRANSFER',
    DEPOSIT = 'DEPOSIT',
    WITHDRAWAL = 'WITHDRAWAL',
    FEE = 'FEE',
    INTEREST = 'INTEREST'
}

export enum LoanStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    PAID = 'PAID',
    DEFAULTED = 'DEFAULTED',
    CANCELLED = 'CANCELLED'
}

export enum UserRole {
    OWNER = 'OWNER',
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    ACCOUNTANT = 'ACCOUNTANT',
    VIEWER = 'VIEWER'
}

export enum InvitationStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    DECLINED = 'DECLINED',
    EXPIRED = 'EXPIRED'
}

export enum StokvelFrequency {
    WEEKLY = 'weekly',
    MONTHLY = 'monthly',
    QUARTERLY = 'quarterly'
}

export enum StokvelStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    PAUSED = 'paused'
}

export enum StokvelMemberStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

export enum StokvelPaymentStatus {
    PAID = 'paid',
    PENDING = 'pending',
    LATE = 'late'
}

// ============================================
// BASE ENTITIES
// ============================================

export interface User {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phoneNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    fullName?: string; // Computed field
}

export interface Organization {
    id: string;
    name: string;
    description: string | null;
    settings: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationMember {
    id: string;
    organizationId: string;
    userId: string;
    role: UserRole;
    permissions: Record<string, any>;
    joinedAt: string;
    createdAt: string;
    updatedAt: string;
}

export interface OrganizationPermissionSet {
    canViewStokvels?: boolean;
    canManageStokvels?: boolean;
    canAddStokvelMembers?: boolean;
    canRecordStokvelPayments?: boolean;
}

export interface Invitation {
    id: string;
    organizationId: string;
    email: string;
    role: UserRole;
    invitedBy: string;
    status: InvitationStatus;
    token: string;
    expiresAt: string;
    acceptedAt: string | null;
    createdAt: string;
}

export interface Balance {
    id: string;
    organizationId: string;
    userId: string;
    type: AccountType;
    bankName: string;
    accountStatus: AccountStatus;
    accountNumber: string;
    accountName: string;
    balance: string;
    previousBalance: string | null;
    currency: string;
    createdAt: string;
    updatedAt: string;
}

export interface Transaction {
    id: string;
    organizationId: string;
    userId: string;
    amount: string;
    type: TransactionType;
    category: string;
    description: string;
    reference: string;

    fromBalanceId: string | null;
    toBalanceId: string | null;
    loanId: string | null;

    date: string; // ISO timestamp
    isLoanDisbursement: boolean;
    isLoanPayment: boolean;

    metadata: Record<string, any>;
    createdAt: string;

    fromBalance: Balance | null;
    toBalance: Balance | null;
    loan: Loan | null;
}

export interface Loan {
    id: string;
    organizationId: string;
    userId: string;
    balanceId: string;
    borrowerName: string;
    borrowerEmail: string | null;
    borrowerPhone: string | null;
    principalAmount: string;
    interestRate: string;
    termMonths: string;
    status: LoanStatus;
    disbursementDate: string | null;
    maturityDate: string | null;
    outstandingBalance: string | null;
    totalPaid: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    balance?: Balance;
}

export interface LoanAccess {
    id: string;
    loanId: string;
    userId: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    grantedBy: string;
    createdAt: string;
}

export interface StokvelMember {
    id: string;
    stokvelId: string;
    organizationId: string;
    userId: string;
    name: string;
    email: string | null;
    phone: string | null;
    joinedDate: string;
    totalPaid: string;
    totalOwed: string;
    status: StokvelMemberStatus;
    createdAt: string;
    updatedAt: string;
}

export interface StokvelPayment {
    id: string;
    stokvelId: string;
    memberId: string;
    organizationId: string;
    userId: string;
    amount: string;
    date: string;
    period: string;
    status: StokvelPaymentStatus;
    notes: string | null;
    createdAt: string;
    member?: StokvelMember | null;
    memberName?: string;
}

export interface Stokvel {
    id: string;
    organizationId: string;
    userId: string;
    name: string;
    description: string | null;
    contributionAmount: string;
    frequency: StokvelFrequency;
    startDate: string;
    targetDate: string;
    status: StokvelStatus;
    targetAmount: string | null;
    totalCollected: string;
    metadata: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    members: StokvelMember[];
    payments: StokvelPayment[];
}

export interface AuditLog {
    id: string;
    organizationId: string;
    userId: string;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValues: Record<string, any> | null;
    newValues: Record<string, any> | null;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    error?: string;
    data?: T;
}

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

export interface MeResponse {
    success: boolean;
    user: User;
    organizations: Array<{
        id: string;
        name: string;
        role: UserRole;
        permissions: OrganizationPermissionSet;
        joinedAt: string;
    }>;
}

export interface OrganizationResponse {
    success: boolean;
    organization: Organization & {
        currentMember?: {
            id: string;
            userId: string;
            role: UserRole;
            permissions: OrganizationPermissionSet;
            joinedAt: string;
        } | null;
        members: Array<{
            id: string;
            userId: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            role: UserRole;
            permissions: OrganizationPermissionSet;
            joinedAt: string;
        }>;
    };
}

export interface BalanceResponse {
    success: boolean;
    balance?: Balance;
    balances?: Balance[];
    message?: string;
}

export interface TransactionResponse {
    success: boolean;
    transaction?: Transaction & {
        fromBalance?: Balance | null;
        toBalance?: Balance | null;
        loan?: Loan | null;
        user?: User;
    };
    transactions?: Array<Transaction & {
        fromBalance?: Balance | null;
        toBalance?: Balance | null;
        loan?: Loan | null;
    }>;
    message?: string;
}

export interface LoanResponse {
    success: boolean;
    loan?: Loan & {
        balance?: Balance;
        transactions?: Transaction[];
    };
    loans?: Array<Loan & {
        balance?: Balance;
        transactions?: Transaction[];
    }>;
    message?: string;
}

export interface StokvelResponse {
    success: boolean;
    stokvel?: Stokvel;
    stokvels?: Stokvel[];
    member?: StokvelMember;
    payment?: StokvelPayment;
    message?: string;
}

export interface DashboardResponse {
    success: boolean;
    dashboard: {
        totalBalance: string;
        totalLoaned: string;
        totalOutstanding: string;
        activeLoansCount: number;
        balanceAccounts: number;
        recentTransactions: Transaction[];
    };
}

export interface AuditLogResponse {
    success: boolean;
    logs: Array<AuditLog & {
        user: Omit<User, 'passwordHash'>;
    }>;
}

// ============================================
// REQUEST TYPES
// ============================================

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
    loanId: string;
    description?: string;
}

export interface CreateStokvelRequest {
    name: string;
    description?: string;
    contributionAmount: string | number;
    frequency: StokvelFrequency;
    startDate: string;
    targetDate: string;
    status?: StokvelStatus;
    targetAmount: string | number;
    metadata?: Record<string, any>;
}

export interface AddStokvelMemberRequest {
    name: string;
    email?: string;
    phone?: string;
    joinedDate: string;
}

export interface RecordStokvelPaymentRequest {
    memberId: string;
    amount: string | number;
    date: string;
    period: string;
    status?: StokvelPaymentStatus;
    notes?: string;
}

export interface InviteUserRequest {
    email: string;
    role: UserRole;
}

export interface GrantLoanAccessRequest {
    targetUserId: string;
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
}

export interface UpdateOrganizationRequest {
    name?: string;
    description?: string;
    settings?: Record<string, any>;
}

export interface UpdateMemberRoleRequest {
    role: UserRole;
}

export interface UpdateMemberPermissionsRequest {
    permissions: OrganizationPermissionSet;
}

// ============================================
// UTILITY TYPES
// ============================================

export interface PaginationParams {
    limit?: number;
    offset?: number;
    page?: number;
}

export interface DateRangeParams {
    startDate?: string;
    endDate?: string;
}

export interface FilterParams {
    type?: TransactionType;
    status?: LoanStatus;
    accountStatus?: AccountStatus;
}

export type TransactionFilters = PaginationParams & DateRangeParams & FilterParams;

// ============================================
// PERMISSION HELPERS
// ============================================

export const RolePermissions: Record<UserRole, {
    canManageOrg: boolean;
    canManageUsers: boolean;
    canManageLoans: boolean;
    canManageTransactions: boolean;
    canView: boolean;
    canViewStokvels: boolean;
    canManageStokvels: boolean;
    canAddStokvelMembers: boolean;
    canRecordStokvelPayments: boolean;
}> = {
    [UserRole.OWNER]: {
        canManageOrg: true,
        canManageUsers: true,
        canManageLoans: true,
        canManageTransactions: true,
        canView: true,
        canViewStokvels: true,
        canManageStokvels: true,
        canAddStokvelMembers: true,
        canRecordStokvelPayments: true
    },
    [UserRole.ADMIN]: {
        canManageOrg: false,
        canManageUsers: true,
        canManageLoans: true,
        canManageTransactions: true,
        canView: true,
        canViewStokvels: true,
        canManageStokvels: true,
        canAddStokvelMembers: true,
        canRecordStokvelPayments: true
    },
    [UserRole.MANAGER]: {
        canManageOrg: false,
        canManageUsers: false,
        canManageLoans: true,
        canManageTransactions: true,
        canView: true,
        canViewStokvels: true,
        canManageStokvels: true,
        canAddStokvelMembers: true,
        canRecordStokvelPayments: true
    },
    [UserRole.ACCOUNTANT]: {
        canManageOrg: false,
        canManageUsers: false,
        canManageLoans: false,
        canManageTransactions: true,
        canView: true,
        canViewStokvels: true,
        canManageStokvels: false,
        canAddStokvelMembers: false,
        canRecordStokvelPayments: true
    },
    [UserRole.VIEWER]: {
        canManageOrg: false,
        canManageUsers: false,
        canManageLoans: false,
        canManageTransactions: false,
        canView: true,
        canViewStokvels: true,
        canManageStokvels: false,
        canAddStokvelMembers: false,
        canRecordStokvelPayments: false
    }
};

// ============================================
// TYPE GUARDS
// ============================================

export function isSuccessResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
    return response.success === true;
}

export function isErrorResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } {
    return response.success === false && !!response.error;
}

// ============================================
// CONSTANTS
// ============================================

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
    [AccountType.SAVINGS]: 'Savings Account',
    [AccountType.CHECKING]: 'Checking Account',
    [AccountType.LOAN]: 'Loan Account',
    [AccountType.INVESTMENT]: 'Investment Account',
    [AccountType.CASH]: 'Cash',
    [AccountType.BANK]: 'Bank Account',
    [AccountType.MOBILE_MONEY]: 'Mobile Money',
    [AccountType.LOAN_RECEIVABLE]: 'Loan Receivable'
};

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
    [TransactionType.INCOME]: 'Income',
    [TransactionType.EXPENSE]: 'Expense',
    [TransactionType.LOAN_PAYMENT]: 'Loan Payment',
    [TransactionType.LOAN_DISBURSEMENT]: 'Loan Disbursement',
    [TransactionType.TRANSFER]: 'Transfer',
    [TransactionType.DEPOSIT]: 'Deposit',
    [TransactionType.WITHDRAWAL]: 'Withdrawal',
    [TransactionType.FEE]: 'Fee',
    [TransactionType.INTEREST]: 'Interest'
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
    [LoanStatus.PENDING]: 'Pending',
    [LoanStatus.ACTIVE]: 'Active',
    [LoanStatus.PAID]: 'Paid',
    [LoanStatus.DEFAULTED]: 'Defaulted',
    [LoanStatus.CANCELLED]: 'Cancelled'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    [UserRole.OWNER]: 'Owner',
    [UserRole.ADMIN]: 'Administrator',
    [UserRole.MANAGER]: 'Manager',
    [UserRole.ACCOUNTANT]: 'Accountant',
    [UserRole.VIEWER]: 'Viewer'
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatCurrency(amount: string | number, currency: string = 'ZAR'): string {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: currency
    }).format(numAmount);
}

export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
    return new Intl.DateTimeFormat('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

export function calculateLoanProgress(loan: Loan): number {
    const principal = parseFloat(loan.principalAmount);
    const paid = parseFloat(loan.totalPaid);
    return (paid / principal) * 100;
}

export function getRoleColor(role: UserRole): string {
    const colors: Record<UserRole, string> = {
        [UserRole.OWNER]: 'purple',
        [UserRole.ADMIN]: 'blue',
        [UserRole.MANAGER]: 'green',
        [UserRole.ACCOUNTANT]: 'yellow',
        [UserRole.VIEWER]: 'gray'
    };
    return colors[role];
}

export function getStatusColor(status: LoanStatus): string {
    const colors: Record<LoanStatus, string> = {
        [LoanStatus.PENDING]: 'gray',
        [LoanStatus.ACTIVE]: 'blue',
        [LoanStatus.PAID]: 'green',
        [LoanStatus.DEFAULTED]: 'red',
        [LoanStatus.CANCELLED]: 'orange'
    };
    return colors[status];
}

export function getTransactionTypeColor(type: TransactionType): string {
    const colors: Record<TransactionType, string> = {
        [TransactionType.INCOME]: 'green',
        [TransactionType.EXPENSE]: 'red',
        [TransactionType.LOAN_PAYMENT]: 'blue',
        [TransactionType.LOAN_DISBURSEMENT]: 'purple',
        [TransactionType.TRANSFER]: 'gray',
        [TransactionType.DEPOSIT]: 'green',
        [TransactionType.WITHDRAWAL]: 'orange',
        [TransactionType.FEE]: 'yellow',
        [TransactionType.INTEREST]: 'teal'
    };
    return colors[type];
}

// ============================================
// VALIDATION HELPERS
// ============================================

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}

export function isValidAmount(amount: string | number): boolean {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return !isNaN(numAmount) && numAmount > 0;
}

// ============================================
// API CLIENT HELPER
// ============================================

export interface ApiClientConfig {
    baseUrl: string;
    token?: string;
}

export class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(config: ApiClientConfig) {
        this.baseUrl = config.baseUrl;
        this.token = config.token || null;
    }

    setToken(token: string) {
        this.token = token;
    }

    clearToken() {
        this.token = null;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headersInit: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const headers = new Headers(headersInit);

        if (this.token) {
            headers.set('Authorization', `Bearer ${this.token}`);
        }

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export default ApiClient;
