import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAPI, useCurrentUser, useOrganization } from '@/lib/api';
import { UserRole } from '@/types';
import type { OrganizationPermissionSet, OrganizationResponse } from '@/types';
import { getActiveOrganization, permissionSections, resolveOrganizationPermissions } from '@/lib/permissions';
import {
    KeyRound, Users, UserPlus, Loader2, ChevronDown, ChevronUp,
    Building2, ShieldCheck, Mail, Copy, CheckCheck,
} from 'lucide-react';

// ─── types ───────────────────────────────────────────────────────────────────

interface EditableMemberAccess {
    role: UserRole;
    permissions: OrganizationPermissionSet;
}

type Section = 'access' | 'team' | 'invite';

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDisplayName(member: { firstName?: string | null; lastName?: string | null; email: string }) {
    const full = [member.firstName, member.lastName].filter(Boolean).join(' ').trim();
    return full || member.email;
}

function getInitials(member: { firstName?: string | null; lastName?: string | null; email: string }) {
    if (member.firstName) return (member.firstName[0] + (member.lastName?.[0] ?? '')).toUpperCase();
    return member.email[0].toUpperCase();
}

const roleColors: Record<string, string> = {
    ADMIN: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    MANAGER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    ACCOUNTANT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
    OWNER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

// ─── sub-components ──────────────────────────────────────────────────────────

function SidebarButton({
    icon: Icon,
    label,
    badge,
    active,
    onClick,
}: {
    icon: typeof KeyRound;
    label: string;
    badge?: number;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 text-left',
                active
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 hover:text-gray-900 dark:hover:text-white'
            )}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className={cn(
                    'text-xs font-bold px-2 py-0.5 rounded-full',
                    active ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                )}>
                    {badge}
                </span>
            )}
        </button>
    );
}

function RoleAccessPreview({ role }: { role: UserRole }) {
    const permissions = resolveOrganizationPermissions(role);

    return (
        <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50/70 dark:bg-gray-800/40 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Predefined Role Access</p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{role}</p>
                </div>
                <span className={cn('text-xs font-bold px-3 py-1 rounded-full', roleColors[role])}>
                    Default RBAC
                </span>
            </div>

            {permissionSections.map((section) => {
                const allowed = section.permissions.filter((permission) => permissions[permission.key]);

                return (
                    <div key={section.title} className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                            {section.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {allowed.length > 0 ? allowed.map((permission) => (
                                <span
                                    key={permission.key}
                                    className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                >
                                    {permission.label}
                                </span>
                            )) : (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                                    No default access
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const { toast } = useToast();
    const api = useAPI();
    const { data: currentUserData } = useCurrentUser();
    const user = currentUserData?.user;
    const currentOrganization = getActiveOrganization(currentUserData?.organizations);
    const { data: organizationData } = useOrganization(currentOrganization?.id) as { data?: OrganizationResponse };

    const [activeSection, setActiveSection] = useState<Section>('access');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.VIEWER);
    const [inviteLoading, setInviteLoading] = useState(false);
    const [lastInvitation, setLastInvitation] = useState<{ email: string; role: UserRole; token: string } | null>(null);
    const [copiedToken, setCopiedToken] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [memberSavingId, setMemberSavingId] = useState<string | null>(null);
    const [memberDrafts, setMemberDrafts] = useState<Record<string, EditableMemberAccess>>({});
    const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const members = organizationData?.organization?.members || [];
        const nextDrafts = Object.fromEntries(
            members.map((m: OrganizationResponse['organization']['members'][number]) => [
                m.id,
                { role: m.role, permissions: resolveOrganizationPermissions(m.role, m.permissions) },
            ])
        );
        setMemberDrafts(nextDrafts);
    }, [organizationData]);

    const currentMember = organizationData?.organization?.currentMember;
    const canManageUsers = currentMember
        ? resolveOrganizationPermissions(currentMember.role, currentMember.permissions).canManageUsers
        : false;
    const currentPermissions = currentMember
        ? resolveOrganizationPermissions(currentMember.role, currentMember.permissions)
        : null;
    const inviteBaseUrl = typeof window !== 'undefined' ? `${window.location.origin}/app/invitations` : '/app/invitations';

    const sortedMembers = useMemo(() => {
        const members = organizationData?.organization?.members || [];
        return [...members].sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
    }, [organizationData]);

    // ─── handlers ──────────────────────────────────────────────────────────

    const handleInviteMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOrganization?.id) {
            toast({ title: 'No organization', description: 'No active organization was found.', variant: 'destructive' });
            return;
        }
        try {
            setInviteLoading(true);
            const result = await api.inviteUser(currentOrganization.id, { email: inviteEmail, role: inviteRole });
            toast({ title: 'Invitation sent', description: `Invitation sent to ${inviteEmail}.` });
            setLastInvitation({ email: inviteEmail, role: inviteRole, token: result.invitation?.token || '' });
            setInviteEmail('');
            setInviteRole(UserRole.VIEWER);
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to invite member.', variant: 'destructive' });
        } finally {
            setInviteLoading(false);
        }
    };

    const handleMemberRoleChange = (memberId: string, role: UserRole) => {
        setMemberDrafts(prev => ({
            ...prev,
            [memberId]: { role, permissions: resolveOrganizationPermissions(role, prev[memberId]?.permissions) },
        }));
    };

    const handlePermissionToggle = (memberId: string, key: keyof OrganizationPermissionSet, checked: boolean) => {
        setMemberDrafts(prev => ({
            ...prev,
            [memberId]: { role: prev[memberId].role, permissions: { ...prev[memberId].permissions, [key]: checked } },
        }));
    };

    const handleSaveMemberAccess = async (memberId: string) => {
        if (!currentOrganization?.id) return;
        const draft = memberDrafts[memberId];
        if (!draft) return;
        try {
            setMemberSavingId(memberId);
            await api.updateMemberRole(currentOrganization.id, memberId, { role: draft.role });
            await api.updateMemberPermissions(currentOrganization.id, memberId, { permissions: draft.permissions });
            toast({ title: 'Access updated', description: 'Member access has been saved.' });
        } catch (err) {
            toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to update member access.', variant: 'destructive' });
        } finally {
            setMemberSavingId(null);
        }
    };

    const copyToClipboard = (text: string, type: 'token' | 'link') => {
        navigator.clipboard.writeText(text);
        if (type === 'token') { setCopiedToken(true); setTimeout(() => setCopiedToken(false), 2000); }
        else { setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); }
    };

    const toggleMemberExpanded = (memberId: string) => {
        setExpandedMembers(prev => ({ ...prev, [memberId]: !prev[memberId] }));
    };

    // ─── shared styles ─────────────────────────────────────────────────────

    const cardClass = cn(
        'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80',
        'border border-gray-200/50 dark:border-gray-700/50',
        'rounded-2xl shadow-xl dark:shadow-black/20'
    );

    const inputClass = cn(
        'bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11',
        'focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]'
    );

    // ─── section panels ────────────────────────────────────────────────────

    const YourAccessPanel = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Your Access</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    View the role and permissions assigned to your account in this organization.
                </p>
            </div>

            {/* Role badge */}
            <div className={cn(cardClass, 'p-5')}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg flex-shrink-0">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-1">Your Role</p>
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                'text-sm font-bold px-3 py-1 rounded-full',
                                roleColors[currentOrganization?.role ?? ''] ?? roleColors.VIEWER
                            )}>
                                {currentOrganization?.role ?? 'No role'}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                in <span className="font-semibold text-gray-700 dark:text-gray-200">{currentOrganization?.name ?? 'your organization'}</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Permission sections */}
            {currentPermissions && permissionSections.map((section) => (
                <div key={section.title} className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 px-1">
                        {section.title}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {section.permissions.map((permission) => {
                            const allowed = currentPermissions[permission.key];
                            return (
                                <div
                                    key={permission.key}
                                    className={cn(
                                        'flex items-start justify-between p-4 rounded-xl border transition-all',
                                        allowed
                                            ? 'bg-emerald-50/60 dark:bg-emerald-900/10 border-emerald-200/70 dark:border-emerald-800/30'
                                            : 'bg-gray-50/60 dark:bg-gray-800/30 border-gray-200/60 dark:border-gray-700/40'
                                    )}
                                >
                                    <div className="pr-3 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{permission.label}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{permission.description}</p>
                                    </div>
                                    <span className={cn(
                                        'text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5',
                                        allowed
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                    )}>
                                        {allowed ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );

    const InvitePanel = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Invite Member</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Add a new member to your organization and assign their role.
                </p>
            </div>

            {!canManageUsers ? (
                <div className={cn(cardClass, 'p-6 text-center')}>
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Access restricted</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Your role does not allow inviting new members.
                    </p>
                </div>
            ) : (
                <>
                    <Card className={cardClass}>
                        <CardContent className="pt-6">
                            <form className="space-y-4" onSubmit={handleInviteMember}>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
                                    <Input
                                        type="email"
                                        placeholder="member@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role</Label>
                                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as UserRole)}>
                                        <SelectTrigger className={inputClass}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin — full management access</SelectItem>
                                            <SelectItem value="MANAGER">Manager — can manage most resources</SelectItem>
                                            <SelectItem value="ACCOUNTANT">Accountant — read + transaction access</SelectItem>
                                            <SelectItem value="VIEWER">Viewer — read-only access</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <RoleAccessPreview role={inviteRole} />
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                    <Button
                                        type="submit"
                                        disabled={inviteLoading}
                                        className="w-full h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg transition-all duration-300"
                                    >
                                        {inviteLoading
                                            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending invitation...</>
                                            : <><Mail className="w-4 h-4 mr-2" />Send Invitation</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {lastInvitation && (
                        <Card className={cn(cardClass, 'border-emerald-200/60 dark:border-emerald-800/30')}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                        <CheckCheck className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm text-gray-900 dark:text-white">
                                            Invitation created
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Sent to <span className="font-semibold">{lastInvitation.email}</span> · Role: {lastInvitation.role}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Token */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Invitation Token</p>
                                    <div className="flex items-center gap-2">
                                        <p className="flex-1 truncate rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300">
                                            {lastInvitation.token || 'Token unavailable'}
                                        </p>
                                        {lastInvitation.token && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-shrink-0 h-9 border-gray-200 dark:border-gray-700"
                                                onClick={() => copyToClipboard(lastInvitation.token, 'token')}
                                            >
                                                {copiedToken ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                {/* Join link */}
                                <div className="space-y-1.5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">Join Link</p>
                                    <div className="flex items-center gap-2">
                                        <p className="flex-1 truncate rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-mono text-gray-700 dark:text-gray-300">
                                            {lastInvitation.token ? `${inviteBaseUrl}/${lastInvitation.token}` : 'Link unavailable'}
                                        </p>
                                        {lastInvitation.token && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-shrink-0 h-9 border-gray-200 dark:border-gray-700"
                                                onClick={() => copyToClipboard(`${inviteBaseUrl}/${lastInvitation.token}`, 'link')}
                                            >
                                                {copiedLink ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200/60 dark:border-gray-700/40 p-3 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <p className="font-semibold text-gray-700 dark:text-gray-300">How to onboard the invited member:</p>
                                    <p>1. Share the join link above with them.</p>
                                    <p>2. They sign in or register using the invited email.</p>
                                    <p>3. The invitation is accepted automatically via that link.</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    );

    const TeamPanel = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Team Members</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {sortedMembers.length} member{sortedMembers.length !== 1 ? 's' : ''} in this organization
                    </p>
                </div>
                {canManageUsers && (
                    <Button
                        size="sm"
                        onClick={() => setActiveSection('invite')}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite
                    </Button>
                )}
            </div>

            {sortedMembers.length === 0 ? (
                <div className={cn(cardClass, 'p-8 text-center')}>
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                        <Users className="w-7 h-7 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No members yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Invite members to collaborate in this organization.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedMembers.map((member) => {
                        const isCurrentUser = member.userId === user?.id;
                        const isExpanded = expandedMembers[member.id] ?? false;
                        const draft = memberDrafts[member.id] ?? {
                            role: member.role,
                            permissions: resolveOrganizationPermissions(member.role, member.permissions),
                        };

                        return (
                            <div key={member.id} className={cn(cardClass, 'overflow-hidden')}>
                                {/* Member header row */}
                                <div className="flex items-center gap-4 p-5">
                                    {/* Avatar */}
                                    <div className={cn(
                                        'w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-md flex-shrink-0',
                                        isCurrentUser
                                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
                                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                                    )}>
                                        {getInitials(member)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                                {getDisplayName(member)}
                                            </p>
                                            {isCurrentUser && (
                                                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Role selector */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        {canManageUsers && !isCurrentUser ? (
                                            <Select
                                                value={draft.role}
                                                onValueChange={(v) => handleMemberRoleChange(member.id, v as UserRole)}
                                            >
                                                <SelectTrigger className="w-36 h-9 text-xs bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                    <SelectItem value="MANAGER">Manager</SelectItem>
                                                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                                    <SelectItem value="VIEWER">Viewer</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <span className={cn(
                                                'text-xs font-semibold px-3 py-1.5 rounded-full',
                                                roleColors[draft.role] ?? roleColors.VIEWER
                                            )}>
                                                {draft.role}
                                            </span>
                                        )}

                                        {/* Expand toggle */}
                                        <button
                                            onClick={() => toggleMemberExpanded(member.id)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded permission grid */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 dark:border-gray-800 px-5 pb-5 pt-4 space-y-4">
                                        <RoleAccessPreview role={draft.role} />
                                        {permissionSections.map((section) => (
                                            <div key={section.title} className="space-y-2">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                                    {section.title}
                                                </p>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {section.permissions.map((option) => (
                                                        <div
                                                            key={option.key}
                                                            className="flex items-center justify-between rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50/70 dark:bg-gray-800/40 px-4 py-3"
                                                        >
                                                            <div className="pr-3 min-w-0">
                                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{option.label}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{option.description}</p>
                                                            </div>
                                                            <Switch
                                                                checked={Boolean(draft.permissions[option.key])}
                                                                onCheckedChange={(checked) => handlePermissionToggle(member.id, option.key, checked)}
                                                                disabled={!canManageUsers || isCurrentUser}
                                                                className="data-[state=checked]:bg-emerald-600 flex-shrink-0"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Save / note */}
                                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                            {isCurrentUser ? (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Your own permissions are shown for reference and cannot be edited here.
                                                </p>
                                            ) : (
                                                <p className="text-xs text-gray-400 dark:text-gray-500">
                                                    Changes take effect immediately after saving.
                                                </p>
                                            )}
                                            {!isCurrentUser && canManageUsers && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSaveMemberAccess(member.id)}
                                                    disabled={memberSavingId === member.id}
                                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                                                >
                                                    {memberSavingId === member.id
                                                        ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />Saving...</>
                                                        : 'Save Access'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    // ─── render ────────────────────────────────────────────────────────────

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Organization access controls and team permissions
                    </p>
                </div>

                {/* Org pill */}
                <div className={cn(cardClass, 'flex items-center gap-3 px-4 py-3 !shadow-md')}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest">Organization</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {currentOrganization?.name ?? 'No organization'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Layout: sidebar + content */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar */}
                <aside className="lg:w-56 flex-shrink-0">
                    <div className={cn(cardClass, 'p-2 space-y-1 lg:sticky lg:top-28')}>
                        <SidebarButton
                            icon={KeyRound}
                            label="Your Access"
                            active={activeSection === 'access'}
                            onClick={() => setActiveSection('access')}
                        />
                        <SidebarButton
                            icon={Users}
                            label="Team"
                            badge={sortedMembers.length}
                            active={activeSection === 'team'}
                            onClick={() => setActiveSection('team')}
                        />
                        {canManageUsers && (
                            <SidebarButton
                                icon={UserPlus}
                                label="Invite Member"
                                active={activeSection === 'invite'}
                                onClick={() => setActiveSection('invite')}
                            />
                        )}
                    </div>
                </aside>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                    {activeSection === 'access' && <YourAccessPanel />}
                    {activeSection === 'team' && <TeamPanel />}
                    {activeSection === 'invite' && <InvitePanel />}
                </div>
            </div>
        </div>
    );
}
