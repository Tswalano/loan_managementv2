import { getCurrentOrganization } from '@/lib/auth';
import type { AppPermissionMap, OrganizationPermissionSet, UserRole } from '@/types';
import { RolePermissions } from '@/types';

type OrganizationMembership = {
    id: string;
    name: string;
    role: UserRole;
    permissions: Partial<OrganizationPermissionSet>;
    joinedAt?: string;
};

export type PermissionKey = keyof AppPermissionMap;

export const permissionSections: Array<{
    title: string;
    permissions: Array<{ key: PermissionKey; label: string; description: string }>;
}> = [
    {
        title: 'Page Access',
        permissions: [
            { key: 'canViewDashboard', label: 'View Dashboard', description: 'Open the dashboard and summary charts.' },
            { key: 'canViewTransactions', label: 'View Transactions', description: 'Open the transactions page and review transaction history.' },
            { key: 'canViewLoans', label: 'View Loans', description: 'Open loans and review borrower balances.' },
            { key: 'canViewBankAccounts', label: 'View Bank Accounts', description: 'Open bank accounts and see balances.' },
            { key: 'canViewStokvels', label: 'View Stokvels', description: 'Open stokvel pages and member progress.' },
        ],
    },
    {
        title: 'Action Access',
        permissions: [
            { key: 'canManageTransactions', label: 'Manage Transactions', description: 'Create income and expense transactions.' },
            { key: 'canManageLoans', label: 'Manage Loans', description: 'Create loans, disburse them, and manage loan records.' },
            { key: 'canManageBankAccounts', label: 'Manage Bank Accounts', description: 'Create or remove organization bank accounts.' },
            { key: 'canTransferFunds', label: 'Transfer Funds', description: 'Move money between accounts.' },
            { key: 'canManageStokvels', label: 'Manage Stokvels', description: 'Create and update stokvel groups.' },
            { key: 'canAddStokvelMembers', label: 'Add Stokvel Members', description: 'Add members into stokvel groups.' },
            { key: 'canRecordStokvelPayments', label: 'Record Stokvel Payments', description: 'Capture stokvel contributions and arrears.' },
            { key: 'canManageUsers', label: 'Manage Users', description: 'Invite members, update roles, and assign permissions.' },
            { key: 'canManageSettings', label: 'Manage Settings', description: 'Open settings and configure organization access.' },
        ],
    },
];

export function resolveOrganizationPermissions(
    role: UserRole,
    overrides?: Partial<OrganizationPermissionSet> | null
): AppPermissionMap {
    const basePermissions = RolePermissions[role];

    return {
        ...basePermissions,
        ...Object.fromEntries(
            Object.entries(overrides || {}).filter(([, value]) => typeof value === 'boolean')
        ),
    } as AppPermissionMap;
}

export function getActiveOrganization<T extends OrganizationMembership>(organizations?: T[] | null): T | undefined {
    if (!organizations?.length) {
        return undefined;
    }

    const storedOrganization = getCurrentOrganization();
    return organizations.find((organization) => organization.id === storedOrganization?.id) || organizations[0];
}
