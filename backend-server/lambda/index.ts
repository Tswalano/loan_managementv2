/* eslint-disable @typescript-eslint/no-explicit-any */
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/aws-lambda';
import { Context as HonoContext } from 'hono';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../db';
import {
    users,
    organizations,
    organizationMembers,
    invitations,
    balances,
    transactions,
    loans,
    loanAccess,
    auditLogs
} from '../db/schema';
import { generateToken, verifyToken, hashPassword, verifyPassword } from './utils/auth';
import { randomBytes } from 'crypto';

export const app = new Hono();

// ============================================
// CORS CONFIGURATION
// ============================================

app.use('/*', cors({
    origin: ['http://localhost:5173', 'https://8bp49x30ql.execute-api.af-south-1.amazonaws.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    credentials: true,
    maxAge: 600,
}));

// ============================================
// TYPES & INTERFACES
// ============================================

type Variables = {
    userId: string;
    userEmail: string;
    organizationId?: string;
    userRole?: string;
};

type CustomContext = HonoContext<{
    Variables: Variables;
}>;

class AuthError extends Error {
    constructor(
        message: string,
        public statusCode: number = 401
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

// ============================================
// PERMISSION CHECKING UTILITIES
// ============================================

const rolePermissions = {
    OWNER: { canManageOrg: true, canManageUsers: true, canManageLoans: true, canManageTransactions: true, canView: true },
    ADMIN: { canManageOrg: false, canManageUsers: true, canManageLoans: true, canManageTransactions: true, canView: true },
    MANAGER: { canManageOrg: false, canManageUsers: false, canManageLoans: true, canManageTransactions: true, canView: true },
    ACCOUNTANT: { canManageOrg: false, canManageUsers: false, canManageLoans: false, canManageTransactions: true, canView: true },
    VIEWER: { canManageOrg: false, canManageUsers: false, canManageLoans: false, canManageTransactions: false, canView: true },
};

async function checkPermission(
    userId: string,
    organizationId: string,
    requiredPermission: keyof typeof rolePermissions.OWNER
): Promise<boolean> {
    const membership = await db.query.organizationMembers.findFirst({
        where: and(
            eq(organizationMembers.userId, userId),
            eq(organizationMembers.organizationId, organizationId)
        ),
    });

    if (!membership) return false;

    const permissions = rolePermissions[membership.role];
    return permissions[requiredPermission] || false;
}

async function getUserOrganization(userId: string): Promise<string | null> {
    const membership = await db.query.organizationMembers.findFirst({
        where: eq(organizationMembers.userId, userId),
    });

    return membership?.organizationId || null;
}

// ============================================
// AUDIT LOGGING
// ============================================

async function createAuditLog(
    organizationId: string,
    userId: string,
    action: string,
    entityType: string,
    entityId: string | null,
    oldValues: any,
    newValues: any,
    ipAddress?: string
) {
    try {
        await db.insert(auditLogs).values({
            organizationId,
            userId,
            action,
            entityType,
            entityId,
            oldValues,
            newValues,
            ipAddress,
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

const authenticate = async (c: CustomContext, next: () => Promise<void>) => {
    try {
        const authHeader = c.req.header('Authorization');
        if (!authHeader) {
            throw new AuthError('Authorization header is required');
        }

        const token = authHeader.replace('Bearer ', '');
        const payload = verifyToken(token);

        if (!payload) {
            throw new AuthError('Invalid or expired token');
        }

        c.set('userId', payload.userId);
        c.set('userEmail', payload.email);

        // Get user's organization
        const orgId = await getUserOrganization(payload.userId);
        if (orgId) {
            c.set('organizationId', orgId);
        }

        await next();
        return Promise.resolve();
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ error: error.message }, error.statusCode as 401 | 403 | 404 | 500);
        }
        return c.json({ error: 'Internal server error' }, 500);
    }
};

// ============================================
// BALANCE UPDATE HELPERS
// ============================================

async function updateBalanceFromTransaction(
    balanceId: string,
    amount: number,
    isCredit: boolean,
    trx?: typeof db
) {
    const dbClient = trx || db;

    const [balance] = await dbClient
        .select()
        .from(balances)
        .where(eq(balances.id, balanceId));

    if (!balance) {
        throw new Error('Balance not found');
    }

    const currentBalance = parseFloat(balance.balance);
    const newBalance = isCredit ? currentBalance + amount : currentBalance - amount;

    await dbClient
        .update(balances)
        .set({
            previousBalance: balance.balance,
            balance: String(newBalance.toFixed(2)),
            updatedAt: new Date(),
        })
        .where(eq(balances.id, balanceId));

    return newBalance;
}

async function updateLoanFromPayment(
    loanId: string,
    paymentAmount: number,
    trx?: typeof db
) {
    const dbClient = trx || db;

    const [loan] = await dbClient
        .select()
        .from(loans)
        .where(eq(loans.id, loanId));

    if (!loan) {
        throw new Error('Loan not found');
    }

    const currentOutstanding = parseFloat(loan.outstandingBalance || loan.principalAmount);
    const currentPaid = parseFloat(loan.totalPaid || '0');

    const newOutstanding = currentOutstanding - paymentAmount;
    const newTotalPaid = currentPaid + paymentAmount;

    const newStatus = newOutstanding <= 0 ? 'PAID' : loan.status;

    await dbClient
        .update(loans)
        .set({
            outstandingBalance: String(Math.max(0, newOutstanding).toFixed(2)),
            totalPaid: String(newTotalPaid.toFixed(2)),
            status: newStatus,
            updatedAt: new Date(),
        })
        .where(eq(loans.id, loanId));

    return { newOutstanding, newTotalPaid, newStatus };
}

// ============================================
// BASIC ROUTES
// ============================================

/**
 * @route GET /
 * @description Welcome endpoint
 * @access Public
 */
app.get('/', (c) => {
    return c.json({
        version: '2.0',
        success: true,
        message: 'Welcome to the Finance Flow Backend API - Multi-tenant Edition',
        timestamp: new Date().toISOString(),
        documentation: '/api/docs'
    });
});

/**
 * @route GET /health
 * @description Health check endpoint
 * @access Public
 */
app.get('/health', async (c) => {
    try {
        await db.execute(sql`SELECT 1`);
        return c.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
    } catch (err) {
        return c.json({
            status: 'error',
            message: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// AUTH ROUTES
// ============================================

/**
 * @route POST /register
 * @description Register a new user and create their organization
 * @access Public
 * @body {email, password, firstName, lastName, phoneNumber, organizationName}
 */
app.post('/register', async (c) => {
    try {
        const body = await c.req.json();

        if (!body.email || !body.password) {
            return c.json({ error: 'Email and password are required' }, 400);
        }

        // Check if user exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (existingUser) {
            return c.json({ error: 'User already exists' }, 400);
        }

        const passwordHash = await hashPassword(body.password);

        // Create user, organization, and membership in a transaction
        const result = await db.transaction(async (trx) => {
            // Create user
            const [newUser] = await trx.insert(users).values({
                email: body.email,
                passwordHash,
                firstName: body.firstName,
                lastName: body.lastName,
                phoneNumber: body.phoneNumber,
            }).returning();

            // Create organization
            const [newOrg] = await trx.insert(organizations).values({
                name: body.organizationName || `${body.firstName || body.email}'s Organization`,
                description: body.organizationDescription,
            }).returning();

            // Add user as OWNER of organization
            await trx.insert(organizationMembers).values({
                organizationId: newOrg.id,
                userId: newUser.id,
                role: 'OWNER',
            });

            return { user: newUser, organization: newOrg };
        });

        const token = generateToken(result.user.id, result.user.email);

        return c.json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                firstName: result.user.firstName,
                lastName: result.user.lastName,
                phoneNumber: result.user.phoneNumber,
            },
            organization: {
                id: result.organization.id,
                name: result.organization.name,
            },
        }, 201);
    } catch (error) {
        console.error('Registration error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, 500);
    }
});

/**
 * @route POST /login
 * @description Login user
 * @access Public
 * @body {email, password}
 */
app.post('/login', async (c) => {
    try {
        const body = await c.req.json();

        if (!body.email || !body.password) {
            return c.json({ error: 'Email and password are required' }, 400);
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (!user) {
            throw new AuthError('Invalid email or password', 401);
        }

        if (!user.isActive) {
            throw new AuthError('Account is inactive', 403);
        }

        const isValidPassword = await verifyPassword(body.password, user.passwordHash);
        if (!isValidPassword) {
            throw new AuthError('Invalid email or password', 401);
        }

        // Get user's organization
        const membership = await db.query.organizationMembers.findFirst({
            where: eq(organizationMembers.userId, user.id),
            with: {
                organization: true,
            },
        });

        const token = generateToken(user.id, user.email);

        return c.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phoneNumber: user.phoneNumber,
            },
            organization: membership ? {
                id: membership.organization.id,
                name: membership.organization.name,
                role: membership.role,
            } : null,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ success: false, error: error.message }, error.statusCode as 401 | 403);
        }
        console.error('Login error:', error);
        return c.json({ success: false, error: 'Internal server error' }, 500);
    }
});

/**
 * @route GET /me
 * @description Get current user profile with organization details
 * @access Private
 */
app.get('/me', authenticate, async (c) => {
    const userId = c.get('userId');

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
            columns: {
                passwordHash: false,
            },
        });

        if (!user) {
            return c.json({ error: 'User not found' }, 404);
        }

        // Get organization memberships
        const memberships = await db.query.organizationMembers.findMany({
            where: eq(organizationMembers.userId, userId),
            with: {
                organization: true,
            },
        });

        return c.json({
            success: true,
            user: {
                ...user,
                fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
            },
            organizations: memberships.map(m => ({
                id: m.organization.id,
                name: m.organization.name,
                role: m.role,
                joinedAt: m.joinedAt,
            })),
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// ORGANIZATION ROUTES
// ============================================

/**
 * @route GET /organizations/:organizationId
 * @description Get organization details
 * @access Private (Member)
 */
app.get('/organizations/:organizationId', authenticate, async (c) => {
    const organizationId = c.req.param('organizationId');
    const userId = c.get('userId');

    try {
        // Check if user is member
        const hasAccess = await checkPermission(userId, organizationId, 'canView');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const organization = await db.query.organizations.findFirst({
            where: eq(organizations.id, organizationId),
            with: {
                members: {
                    with: {
                        user: {
                            columns: {
                                passwordHash: false,
                            },
                        },
                    },
                },
            },
        });

        if (!organization) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        return c.json({
            success: true,
            organization: {
                ...organization,
                members: organization.members.map(m => ({
                    userId: m.user.id,
                    email: m.user.email,
                    firstName: m.user.firstName,
                    lastName: m.user.lastName,
                    role: m.role,
                    joinedAt: m.joinedAt,
                })),
            },
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route PUT /organizations/:organizationId
 * @description Update organization details
 * @access Private (Owner/Admin)
 */
app.put('/organizations/:organizationId', authenticate, async (c) => {
    const organizationId = c.req.param('organizationId');
    const userId = c.get('userId');

    try {
        const hasAccess = await checkPermission(userId, organizationId, 'canManageOrg');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        const [updatedOrg] = await db
            .update(organizations)
            .set({
                name: body.name,
                description: body.description,
                settings: body.settings,
                updatedAt: new Date(),
            })
            .where(eq(organizations.id, organizationId))
            .returning();

        await createAuditLog(
            organizationId,
            userId,
            'UPDATE_ORGANIZATION',
            'organization',
            organizationId,
            {},
            updatedOrg,
        );

        return c.json({
            success: true,
            message: 'Organization updated successfully',
            organization: updatedOrg,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route POST /organizations/:organizationId/invite
 * @description Invite a user to the organization
 * @access Private (Owner/Admin)
 * @body {email, role}
 */
app.post('/organizations/:organizationId/invite', authenticate, async (c) => {
    const organizationId = c.req.param('organizationId');
    const userId = c.get('userId');

    try {
        const hasAccess = await checkPermission(userId, organizationId, 'canManageUsers');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.email || !body.role) {
            return c.json({ error: 'Email and role are required' }, 400);
        }

        // Check if user is already a member
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (existingUser) {
            const existingMember = await db.query.organizationMembers.findFirst({
                where: and(
                    eq(organizationMembers.userId, existingUser.id),
                    eq(organizationMembers.organizationId, organizationId)
                ),
            });

            if (existingMember) {
                return c.json({ error: 'User is already a member' }, 400);
            }
        }

        // Generate invitation token
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

        const [invitation] = await db.insert(invitations).values({
            organizationId,
            email: body.email,
            role: body.role,
            invitedBy: userId,
            token,
            expiresAt,
        }).returning();

        await createAuditLog(
            organizationId,
            userId,
            'INVITE_USER',
            'invitation',
            invitation.id,
            {},
            invitation,
        );

        return c.json({
            success: true,
            message: 'Invitation sent successfully',
            invitation: {
                id: invitation.id,
                email: invitation.email,
                role: invitation.role,
                token: invitation.token,
                expiresAt: invitation.expiresAt,
            },
        }, 201);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route POST /invitations/:token/accept
 * @description Accept an invitation
 * @access Private
 */
app.post('/invitations/:token/accept', authenticate, async (c) => {
    const token = c.req.param('token');
    const userId = c.get('userId');

    try {
        const invitation = await db.query.invitations.findFirst({
            where: eq(invitations.token, token),
        });

        if (!invitation) {
            return c.json({ error: 'Invitation not found' }, 404);
        }

        if (invitation.status !== 'PENDING') {
            return c.json({ error: 'Invitation has already been processed' }, 400);
        }

        if (new Date() > invitation.expiresAt) {
            await db.update(invitations)
                .set({ status: 'EXPIRED' })
                .where(eq(invitations.id, invitation.id));
            return c.json({ error: 'Invitation has expired' }, 400);
        }

        const user = await db.query.users.findFirst({
            where: eq(users.id, userId),
        });

        if (user?.email !== invitation.email) {
            return c.json({ error: 'Invitation email does not match your account' }, 403);
        }

        // Add user to organization
        await db.transaction(async (trx) => {
            await trx.insert(organizationMembers).values({
                organizationId: invitation.organizationId,
                userId,
                role: invitation.role,
            });

            await trx.update(invitations)
                .set({
                    status: 'ACCEPTED',
                    acceptedAt: new Date(),
                })
                .where(eq(invitations.id, invitation.id));
        });

        await createAuditLog(
            invitation.organizationId,
            userId,
            'ACCEPT_INVITATION',
            'invitation',
            invitation.id,
            {},
            { userId, organizationId: invitation.organizationId },
        );

        return c.json({
            success: true,
            message: 'Invitation accepted successfully',
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route PUT /organizations/:organizationId/members/:memberId/role
 * @description Update member role
 * @access Private (Owner/Admin)
 */
app.put('/organizations/:organizationId/members/:memberId/role', authenticate, async (c) => {
    const organizationId = c.req.param('organizationId');
    const memberId = c.req.param('memberId');
    const userId = c.get('userId');

    try {
        const hasAccess = await checkPermission(userId, organizationId, 'canManageUsers');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.role) {
            return c.json({ error: 'Role is required' }, 400);
        }

        const [updatedMember] = await db
            .update(organizationMembers)
            .set({
                role: body.role,
                updatedAt: new Date(),
            })
            .where(and(
                eq(organizationMembers.id, memberId),
                eq(organizationMembers.organizationId, organizationId)
            ))
            .returning();

        await createAuditLog(
            organizationId,
            userId,
            'UPDATE_MEMBER_ROLE',
            'organization_member',
            memberId,
            {},
            updatedMember,
        );

        return c.json({
            success: true,
            message: 'Member role updated successfully',
            member: updatedMember,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// BALANCE ROUTES
// ============================================

/**
 * @route POST /balances
 * @description Create a new balance account
 * @access Private (Manager+)
 */
app.post('/balances', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageTransactions');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.type) {
            return c.json({ error: 'Account type is required' }, 400);
        }

        const [newBalance] = await db.insert(balances).values({
            organizationId,
            userId,
            type: body.type,
            bankName: body.bankName || 'UNSPECIFIED_BANK',
            accountName: body.accountName || 'Unnamed Account',
            accountNumber: body.accountNumber || `ACC-${Date.now()}`,
            balance: body.balance || '0.00',
            currency: body.currency || 'ZAR',
        }).returning();

        await createAuditLog(
            organizationId,
            userId,
            'CREATE_BALANCE',
            'balance',
            newBalance.id,
            {},
            newBalance,
        );

        return c.json({
            success: true,
            message: 'Balance account created successfully',
            balance: newBalance,
        }, 201);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route GET /balances
 * @description Get all balances for the organization
 * @access Private (All members)
 */
app.get('/balances', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canView');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const orgBalances = await db.query.balances.findMany({
            where: and(
                eq(balances.organizationId, organizationId),
                eq(balances.accountStatus, 'ACTIVE')
            ),
            orderBy: [balances.type],
        });

        return c.json({
            success: true,
            balances: orgBalances,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route DELETE /balances/:balanceId
 * @description Soft delete a balance account
 * @access Private (Manager+)
 */
app.delete('/balances/:balanceId', authenticate, async (c) => {
    const balanceId = c.req.param('balanceId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageTransactions');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const balance = await db.query.balances.findFirst({
            where: and(
                eq(balances.id, balanceId),
                eq(balances.organizationId, organizationId)
            ),
        });

        if (!balance) {
            return c.json({ error: 'Balance not found' }, 404);
        }

        await db.update(balances)
            .set({ accountStatus: 'INACTIVE', updatedAt: new Date() })
            .where(eq(balances.id, balanceId));

        await createAuditLog(
            organizationId,
            userId,
            'DELETE_BALANCE',
            'balance',
            balanceId,
            balance,
            { accountStatus: 'INACTIVE' },
        );

        return c.json({
            success: true,
            message: 'Balance account deleted successfully',
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// TRANSACTION ROUTES
// ============================================

/**
 * @route POST /transactions
 * @description Create a new transaction (handles INCOME, EXPENSE, TRANSFER)
 * @access Private (Accountant+)
 * @body {amount, type, category, description, fromBalanceId?, toBalanceId?, loanId?, date}
 */
app.post('/transactions', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageTransactions');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.amount || !body.type || !body.category) {
            return c.json({ error: 'Amount, type, and category are required' }, 400);
        }

        const amount = parseFloat(String(body.amount));

        // Validate transaction based on type
        if (body.type === 'INCOME' && !body.toBalanceId) {
            return c.json({ error: 'toBalanceId is required for INCOME transactions' }, 400);
        }

        if (body.type === 'EXPENSE' && !body.fromBalanceId) {
            return c.json({ error: 'fromBalanceId is required for EXPENSE transactions' }, 400);
        }

        if (body.type === 'TRANSFER' && (!body.fromBalanceId || !body.toBalanceId)) {
            return c.json({ error: 'Both fromBalanceId and toBalanceId are required for TRANSFER' }, 400);
        }

        const result = await db.transaction(async (trx) => {
            // Create transaction record
            const [newTransaction] = await trx.insert(transactions).values({
                organizationId,
                userId,
                amount: String(amount),
                type: body.type,
                category: body.category,
                description: body.description,
                reference: body.reference || `TXN_${Date.now()}`,
                fromBalanceId: body.fromBalanceId,
                toBalanceId: body.toBalanceId,
                loanId: body.loanId,
                date: body.date ? new Date(body.date) : new Date(),
                isLoanDisbursement: body.isLoanDisbursement || false,
                isLoanPayment: body.isLoanPayment || false,
                metadata: body.metadata || {},
            }).returning();

            // Update balances
            if (body.fromBalanceId) {
                await updateBalanceFromTransaction(body.fromBalanceId, amount, false, trx);
            }

            if (body.toBalanceId) {
                await updateBalanceFromTransaction(body.toBalanceId, amount, true, trx);
            }

            if (body.isLoanPayment && body.loanId) {
                await updateLoanFromPayment(body.loanId, amount, trx);
            }

            return newTransaction;
        });

        await createAuditLog(
            organizationId,
            userId,
            'CREATE_TRANSACTION',
            'transaction',
            result.id,
            {},
            result,
        );

        return c.json({
            success: true,
            message: 'Transaction created successfully',
            transaction: result,
        }, 201);
    } catch (err) {
        console.error('Error creating transaction:', err);
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route GET /transactions
 * @description Get all transactions for the organization
 * @access Private (All members)
 * @query {limit?, offset?, type?, startDate?, endDate?}
 */
app.get('/transactions', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canView');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const orgTransactions = await db.query.transactions.findMany({
            where: eq(transactions.organizationId, organizationId),
            orderBy: [desc(transactions.date)],
            with: {
                fromBalance: true,
                toBalance: true,
                loan: true,
            },
        });

        return c.json({
            success: true,
            transactions: orgTransactions,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route GET /transactions/:transactionId
 * @description Get specific transaction details
 * @access Private (All members)
 */
app.get('/transactions/:transactionId', authenticate, async (c) => {
    const transactionId = c.req.param('transactionId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canView');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const transaction = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.id, transactionId),
                eq(transactions.organizationId, organizationId)
            ),
            with: {
                fromBalance: true,
                toBalance: true,
                loan: true,
                user: {
                    columns: {
                        passwordHash: false,
                    },
                },
            },
        });

        if (!transaction) {
            return c.json({ error: 'Transaction not found' }, 404);
        }

        return c.json({
            success: true,
            transaction,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route DELETE /transactions/:transactionId
 * @description Delete transaction and reverse balance changes
 * @access Private (Accountant+)
 */
app.delete('/transactions/:transactionId', authenticate, async (c) => {
    const transactionId = c.req.param('transactionId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageTransactions');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const transaction = await db.query.transactions.findFirst({
            where: and(
                eq(transactions.id, transactionId),
                eq(transactions.organizationId, organizationId)
            ),
        });

        if (!transaction) {
            return c.json({ error: 'Transaction not found' }, 404);
        }

        await db.transaction(async (trx) => {
            const amount = parseFloat(transaction.amount);

            // Reverse balance changes
            if (transaction.fromBalanceId) {
                await updateBalanceFromTransaction(transaction.fromBalanceId, amount, true, trx);
            }

            if (transaction.toBalanceId) {
                await updateBalanceFromTransaction(transaction.toBalanceId, amount, false, trx);
            }

            if (transaction.isLoanPayment && transaction.loanId) {
                await updateLoanFromPayment(transaction.loanId, -amount, trx);
            }

            await trx.delete(transactions).where(eq(transactions.id, transactionId));
        });

        await createAuditLog(
            organizationId,
            userId,
            'DELETE_TRANSACTION',
            'transaction',
            transactionId,
            transaction,
            {},
        );

        return c.json({
            success: true,
            message: 'Transaction deleted successfully',
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// LOAN ROUTES
// ============================================

/**
 * @route POST /loans
 * @description Create a new loan
 * @access Private (Manager+)
 */
app.post('/loans', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageLoans');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.balanceId || !body.borrowerName || !body.principalAmount) {
            return c.json({
                error: 'balanceId, borrowerName, and principalAmount are required'
            }, 400);
        }

        const principalAmount = String(body.principalAmount);

        const [newLoan] = await db.insert(loans).values({
            organizationId,
            userId,
            balanceId: body.balanceId,
            borrowerName: body.borrowerName,
            borrowerEmail: body.borrowerEmail,
            borrowerPhone: body.borrowerPhone,
            principalAmount,
            interestRate: String(body.interestRate || 0),
            termMonths: String(body.termMonths),
            status: body.status || 'PENDING',
            disbursementDate: body.disbursementDate ? new Date(body.disbursementDate) : null,
            maturityDate: body.maturityDate ? new Date(body.maturityDate) : null,
            outstandingBalance: principalAmount,
            totalPaid: '0.00',
            metadata: body.metadata || {},
        }).returning();

        await createAuditLog(
            organizationId,
            userId,
            'CREATE_LOAN',
            'loan',
            newLoan.id,
            {},
            newLoan,
        );

        return c.json({
            success: true,
            message: 'Loan created successfully',
            loan: newLoan,
        }, 201);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route GET /loans
 * @description Get all loans for the organization
 * @access Private (Based on role and loan access)
 */
app.get('/loans', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canView');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        // Check if user can view all loans or only specific ones
        const canViewAll = await checkPermission(userId, organizationId, 'canManageLoans');

        let orgLoans;
        if (canViewAll) {
            // User can view all loans
            orgLoans = await db.query.loans.findMany({
                where: eq(loans.organizationId, organizationId),
                with: {
                    balance: true,
                    transactions: {
                        orderBy: [desc(transactions.date)],
                    },
                },
                orderBy: [desc(loans.createdAt)],
            });
        } else {
            // User can only view loans they have access to
            const accessGrants = await db.query.loanAccess.findMany({
                where: and(
                    eq(loanAccess.userId, userId),
                    eq(loanAccess.canView, true)
                ),
            });

            const accessibleLoanIds = accessGrants.map(a => a.loanId);

            if (accessibleLoanIds.length === 0) {
                return c.json({ success: true, loans: [] });
            }

            orgLoans = await db.query.loans.findMany({
                where: and(
                    eq(loans.organizationId, organizationId),
                    inArray(loans.id, accessibleLoanIds)
                ),
                with: {
                    balance: true,
                    transactions: {
                        orderBy: [desc(transactions.date)],
                    },
                },
                orderBy: [desc(loans.createdAt)],
            });
        }

        return c.json({
            success: true,
            loans: orgLoans,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route GET /loans/:loanId
 * @description Get specific loan details
 * @access Private (Based on loan access)
 */
app.get('/loans/:loanId', authenticate, async (c) => {
    const loanId = c.req.param('loanId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const loan = await db.query.loans.findFirst({
            where: and(
                eq(loans.id, loanId),
                eq(loans.organizationId, organizationId)
            ),
            with: {
                balance: true,
                transactions: {
                    orderBy: [desc(transactions.date)],
                },
            },
        });

        if (!loan) {
            return c.json({ error: 'Loan not found' }, 404);
        }

        // Check access
        const canViewAll = await checkPermission(userId, organizationId, 'canManageLoans');

        if (!canViewAll) {
            const access = await db.query.loanAccess.findFirst({
                where: and(
                    eq(loanAccess.loanId, loanId),
                    eq(loanAccess.userId, userId),
                    eq(loanAccess.canView, true)
                ),
            });

            if (!access) {
                return c.json({ error: 'Access denied' }, 403);
            }
        }

        return c.json({
            success: true,
            loan,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route PUT /loans/:loanId
 * @description Update loan details
 * @access Private (Manager+)
 */
app.put('/loans/:loanId', authenticate, async (c) => {
    const loanId = c.req.param('loanId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageLoans');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        const loan = await db.query.loans.findFirst({
            where: and(
                eq(loans.id, loanId),
                eq(loans.organizationId, organizationId)
            ),
        });

        if (!loan) {
            return c.json({ error: 'Loan not found' }, 404);
        }

        const [updatedLoan] = await db.update(loans)
            .set({
                ...body,
                updatedAt: new Date(),
            })
            .where(eq(loans.id, loanId))
            .returning();

        await createAuditLog(
            organizationId,
            userId,
            'UPDATE_LOAN',
            'loan',
            loanId,
            loan,
            updatedLoan,
        );

        return c.json({
            success: true,
            message: 'Loan updated successfully',
            loan: updatedLoan,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route POST /loans/:loanId/disburse
 * @description Disburse a loan
 * @access Private (Manager+)
 */
app.post('/loans/:loanId/disburse', authenticate, async (c) => {
    const loanId = c.req.param('loanId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageLoans');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.amount || !body.fromBalanceId) {
            return c.json({ error: 'amount and fromBalanceId are required' }, 400);
        }

        const amount = parseFloat(String(body.amount));

        const result = await db.transaction(async (trx) => {
            const [loan] = await trx.select().from(loans).where(
                and(
                    eq(loans.id, loanId),
                    eq(loans.organizationId, organizationId)
                )
            );

            if (!loan) {
                throw new Error('Loan not found');
            }

            if (loan.status !== 'PENDING') {
                throw new Error('Loan has already been disbursed or is not in PENDING status');
            }

            // Create disbursement transaction
            const [transaction] = await trx.insert(transactions).values({
                organizationId,
                userId,
                amount: String(amount),
                type: 'LOAN_DISBURSEMENT',
                category: 'Loan Disbursement',
                description: body.description || `Loan disbursement for ${loan.borrowerName}`,
                reference: `LOAN_DISB_${Date.now()}`,
                fromBalanceId: body.fromBalanceId,
                loanId,
                date: new Date(),
                isLoanDisbursement: true,
            }).returning();

            // Debit from source account
            await updateBalanceFromTransaction(body.fromBalanceId, amount, false, trx);

            // Update loan status
            await trx.update(loans)
                .set({
                    status: 'ACTIVE',
                    disbursementDate: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(loans.id, loanId));

            return transaction;
        });

        await createAuditLog(
            organizationId,
            userId,
            'DISBURSE_LOAN',
            'loan',
            loanId,
            {},
            result,
        );

        return c.json({
            success: true,
            message: 'Loan disbursed successfully',
            transaction: result,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route POST /loans/:loanId/payment
 * @description Record a loan payment
 * @access Private (Accountant+)
 */
app.post('/loans/:loanId/payment', authenticate, async (c) => {
    const loanId = c.req.param('loanId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageTransactions');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.amount || !body.toBalanceId) {
            return c.json({ error: 'amount and toBalanceId are required' }, 400);
        }

        const amount = parseFloat(String(body.amount));

        const result = await db.transaction(async (trx) => {
            const [loan] = await trx.select().from(loans).where(
                and(
                    eq(loans.id, loanId),
                    eq(loans.organizationId, organizationId)
                )
            );

            if (!loan) {
                throw new Error('Loan not found');
            }

            if (loan.status !== 'ACTIVE') {
                throw new Error('Cannot make payment to inactive loan');
            }

            // Create payment transaction
            const [transaction] = await trx.insert(transactions).values({
                organizationId,
                userId,
                amount: String(amount),
                type: 'LOAN_PAYMENT',
                category: 'Loan Payment',
                description: body.description || `Loan payment from ${loan.borrowerName}`,
                reference: `LOAN_PAY_${Date.now()}`,
                toBalanceId: body.toBalanceId,
                loanId,
                date: new Date(),
                isLoanPayment: true,
            }).returning();

            // Credit to destination account
            await updateBalanceFromTransaction(body.toBalanceId, amount, true, trx);

            // Update loan
            await updateLoanFromPayment(loanId, amount, trx);

            return transaction;
        });

        await createAuditLog(
            organizationId,
            userId,
            'LOAN_PAYMENT',
            'loan',
            loanId,
            {},
            result,
        );

        return c.json({
            success: true,
            message: 'Loan payment recorded successfully',
            transaction: result,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route POST /loans/:loanId/grant-access
 * @description Grant access to a loan for a specific user
 * @access Private (Manager+)
 */
app.post('/loans/:loanId/grant-access', authenticate, async (c) => {
    const loanId = c.req.param('loanId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageLoans');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const body = await c.req.json();

        if (!body.targetUserId) {
            return c.json({ error: 'targetUserId is required' }, 400);
        }

        // Verify target user is in the organization
        const targetMember = await db.query.organizationMembers.findFirst({
            where: and(
                eq(organizationMembers.userId, body.targetUserId),
                eq(organizationMembers.organizationId, organizationId)
            ),
        });

        if (!targetMember) {
            return c.json({ error: 'Target user is not a member of this organization' }, 400);
        }

        // Check if access already exists
        const existingAccess = await db.query.loanAccess.findFirst({
            where: and(
                eq(loanAccess.loanId, loanId),
                eq(loanAccess.userId, body.targetUserId)
            ),
        });

        if (existingAccess) {
            return c.json({ error: 'Access already granted' }, 400);
        }

        const [access] = await db.insert(loanAccess).values({
            loanId,
            userId: body.targetUserId,
            canView: body.canView !== false,
            canEdit: body.canEdit || false,
            canDelete: body.canDelete || false,
            grantedBy: userId,
        }).returning();

        await createAuditLog(
            organizationId,
            userId,
            'GRANT_LOAN_ACCESS',
            'loan_access',
            access.id,
            {},
            access,
        );

        return c.json({
            success: true,
            message: 'Loan access granted successfully',
            access,
        }, 201);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route DELETE /loans/:loanId/revoke-access/:accessId
 * @description Revoke loan access
 * @access Private (Manager+)
 */
app.delete('/loans/:loanId/revoke-access/:accessId', authenticate, async (c) => {
    const loanId = c.req.param('loanId');
    const accessId = c.req.param('accessId');
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageLoans');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        await db.delete(loanAccess).where(
            and(
                eq(loanAccess.id, accessId),
                eq(loanAccess.loanId, loanId)
            )
        );

        await createAuditLog(
            organizationId,
            userId,
            'REVOKE_LOAN_ACCESS',
            'loan_access',
            accessId,
            {},
            {},
        );

        return c.json({
            success: true,
            message: 'Loan access revoked successfully',
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// REPORTS & ANALYTICS
// ============================================

/**
 * @route GET /reports/dashboard
 * @description Get dashboard summary data
 * @access Private (All members)
 */
app.get('/reports/dashboard', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canView');
        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        // Get total balances
        const activeBalances = await db.query.balances.findMany({
            where: and(
                eq(balances.organizationId, organizationId),
                eq(balances.accountStatus, 'ACTIVE')
            ),
        });

        const totalBalance = activeBalances.reduce((sum, b) => sum + parseFloat(b.balance), 0);

        // Get active loans
        const activeLoans = await db.query.loans.findMany({
            where: and(
                eq(loans.organizationId, organizationId),
                eq(loans.status, 'ACTIVE')
            ),
        });

        const totalLoaned = activeLoans.reduce((sum, l) => sum + parseFloat(l.principalAmount), 0);
        const totalOutstanding = activeLoans.reduce((sum, l) => sum + parseFloat(l.outstandingBalance || '0'), 0);

        // Get recent transactions
        const recentTransactions = await db.query.transactions.findMany({
            where: eq(transactions.organizationId, organizationId),
            orderBy: [desc(transactions.date)],
            limit: 10,
        });

        return c.json({
            success: true,
            dashboard: {
                totalBalance: totalBalance.toFixed(2),
                totalLoaned: totalLoaned.toFixed(2),
                totalOutstanding: totalOutstanding.toFixed(2),
                activeLoansCount: activeLoans.length,
                balanceAccounts: activeBalances.length,
                recentTransactions,
            },
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

/**
 * @route GET /audit-logs
 * @description Get audit logs for the organization
 * @access Private (Owner/Admin)
 */
app.get('/audit-logs', authenticate, async (c) => {
    const userId = c.get('userId');
    const organizationId = c.get('organizationId');

    try {
        if (!organizationId) {
            return c.json({ error: 'Organization not found' }, 404);
        }

        const hasAccess = await checkPermission(userId, organizationId, 'canManageOrg') ||
            await checkPermission(userId, organizationId, 'canManageUsers');

        if (!hasAccess) {
            return c.json({ error: 'Access denied' }, 403);
        }

        const logs = await db.query.auditLogs.findMany({
            where: eq(auditLogs.organizationId, organizationId),
            orderBy: [desc(auditLogs.createdAt)],
            limit: 100,
            with: {
                user: {
                    columns: {
                        passwordHash: false,
                    },
                },
            },
        });

        return c.json({
            success: true,
            logs,
        });
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// ============================================
// 404 HANDLER
// ============================================

app.notFound((c) => {
    return c.json(
        {
            error: true,
            message: 'Endpoint not found',
            path: c.req.path,
            method: c.req.method,
            timestamp: new Date().toISOString()
        },
        404
    );
});

// Export the Lambda handler
export const handler = handle(app);