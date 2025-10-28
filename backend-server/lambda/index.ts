import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { handle } from 'hono/aws-lambda';
import { Context as HonoContext } from 'hono';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from '../db';
import { users, balances, transactions, loans } from '../db/schema';
import { generateToken, verifyToken, hashPassword, verifyPassword } from './utils/auth';
import { version } from 'os';

export const app = new Hono();

// Add CORS middleware
app.use('/*', cors({
    origin: ['http://localhost:5173', 'https://8bp49x30ql.execute-api.af-south-1.amazonaws.com'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
    ],
    exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
    credentials: true,
    maxAge: 600,
}));

// Types
type Variables = {
    userId: string;
    userEmail: string;
};

type CustomContext = HonoContext<{
    Variables: Variables;
}>;

// Custom error type
class AuthError extends Error {
    constructor(
        message: string,
        public statusCode: number = 401
    ) {
        super(message);
        this.name = 'AuthError';
    }
}

// Middleware for authentication
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

        // Store user info in context
        c.set('userId', payload.userId);
        c.set('userEmail', payload.email);
        await next();
        return Promise.resolve();
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ error: error.message }, error.statusCode as 401 | 403 | 404 | 500);
        }
        return c.json({ error: 'Internal server error' }, 500);
    }
};

// Request validation interfaces
interface LoginRequest {
    email: string;
    password: string;
}

interface RegisterRequest {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
}

const validateLoginRequest = (body: unknown): body is LoginRequest => {
    if (!body || typeof body !== 'object') return false;
    const { email, password } = body as LoginRequest;
    return typeof email === 'string' && typeof password === 'string';
};

const validateRegisterRequest = (body: unknown): body is RegisterRequest => {
    if (!body || typeof body !== 'object') return false;
    const { email, password } = body as RegisterRequest;
    return typeof email === 'string' && typeof password === 'string';
};

// 404 handler
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

// Welcome route
app.get('/', (c) => {
    return c.json<{
        version: string;
        success: boolean;
        message: string;
        timestamp: string;
    }>({
        version: version(),
        success: true,
        message: 'Welcome to the Finance Flow Backend API.',
        timestamp: new Date().toISOString()
    });
});

// Health check endpoint
app.get('/health', async (c) => {
    try {
        // Test database connection
        await db.execute(sql`SELECT 1`);
        return c.json({ status: 'ok', timestamp: new Date().toISOString() }, 200);
    } catch (err) {
        return c.json({
            status: 'error',
            message: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Register endpoint
app.post('/register', async (c) => {
    try {
        const body = await c.req.json();
        if (!validateRegisterRequest(body)) {
            return c.json({ error: 'Invalid request body' }, 400);
        }

        // Check if user already exists
        const existingUser = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (existingUser) {
            return c.json({ error: 'User already exists' }, 400);
        }

        // Hash password
        const passwordHash = await hashPassword(body.password);

        // Create user
        const [newUser] = await db.insert(users).values({
            email: body.email,
            passwordHash,
            firstName: body.firstName,
            lastName: body.lastName,
            phoneNumber: body.phoneNumber,
        }).returning();

        // Generate token
        const token = generateToken(newUser.id, newUser.email);

        return c.json({
            success: true,
            message: 'Registration successful',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                phoneNumber: newUser.phoneNumber,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error'
        }, 500);
    }
});

// Login endpoint
app.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        if (!validateLoginRequest(body)) {
            return c.json({ error: 'Invalid request body' }, 400);
        }

        // Find user
        const user = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (!user) {
            throw new AuthError('Invalid email or password', 401);
        }

        // Verify password
        const isValidPassword = await verifyPassword(body.password, user.passwordHash);
        if (!isValidPassword) {
            throw new AuthError('Invalid email or password', 401);
        }

        // Generate token
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
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ success: false, error: error.message }, error.statusCode as 401 | 400 | 403 | 404 | 500);
        }
        console.error('Login error:', error);
        return c.json({ success: false, error: 'Internal server error' }, 500);
    }
});

// Logout endpoint (token invalidation should be handled client-side)
app.post('/logout', authenticate, async (c) => {
    return c.json({ success: true, message: 'Logout successful' });
});

// Get current user
app.get('/me', authenticate, async (c) => {
    const userId = c.get('userId');

    const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
        columns: {
            passwordHash: false,
        },
    });

    const constructedUser = {
        ...user,
        fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    }

    if (!user) {
        return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ success: true, user: constructedUser });
});

// Create a new balance
app.post('/balances', async (c) => {
    try {
        const body = await c.req.json();

        // Basic validation
        if (!body.userId || !body.type) {
            return c.json({ error: 'Missing required fields: userId, type' }, 400);
        }

        // Default values
        const newBalance = {
            userId: body.userId,
            type: body.type,
            bankName: body.bankName ?? 'UNSPECIFIED_BANK',
            accountName: body.accountName ?? 'Unnamed Account',
            previousBalance: body.previousBalance ?? 0.00,
            accountStatus: body.accountStatus ?? 'ACTIVE',
            balance: body.balance ?? '0.00',
            accountNumber: body.accountNumber ?? `ACC-${Date.now()}`,
        };

        // Insert into database
        const [createdBalance] = await db
            .insert(balances)
            .values(newBalance)
            .returning();

        return c.json({
            success: true,
            message: 'Balance created successfully',
            balance: createdBalance,
        }, 201);
    } catch (error) {
        console.error('Error creating balance:', error);
        return c.json({
            success: false,
            error: error instanceof Error ? error.message : 'Internal server error',
        }, 500);
    }
});

// Get balances for a user
app.get('/balances/:userId', async (c) => {
    const userId = c.req.param('userId');

    try {
        const userBalances = await db.query.balances.findMany({
            where: and(
                eq(balances.userId, userId),
                eq(balances.accountStatus, 'ACTIVE')
            ),
            orderBy: [balances.type],
        });

        return c.json(userBalances);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Get transactions for a user
app.get('/transactions/:userId', async (c) => {
    const userId = c.req.param('userId');

    try {
        const userTransactions = await db.query.transactions.findMany({
            where: eq(transactions.userId, userId),
            orderBy: [desc(transactions.date)],
        });

        return c.json(userTransactions);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Get loans for a user with related data
app.get('/loans/:userId', async (c) => {
    const userId = c.req.param('userId');

    try {
        const userLoans = await db.query.loans.findMany({
            where: eq(loans.userId, userId),
            with: {
                balance: true,
                transactions: true,
            },
            orderBy: [desc(loans.createdAt)],
        });

        return c.json(userLoans);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Create a transaction
app.post('/transactions', async (c) => {
    try {
        const body = await c.req.json();

        const [newTransaction] = await db.insert(transactions)
            .values(body)
            .returning();

        return c.json(newTransaction);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Disburse a loan
app.post('/loans/disburse', async (c) => {
    try {
        const { amount, fromBalanceId, description, userId } = await c.req.json();

        const newTransaction = {
            userId,
            amount: String(amount),
            type: 'LOAN_DISBURSEMENT' as const,
            category: 'Loan Disbursement',
            description: description || 'Loan disbursement',
            reference: `LOAN_DISB_${Date.now()}`,
            fromBalanceId,
            date: new Date(),
            isLoanDisbursement: true,
        };

        const [transaction] = await db.insert(transactions)
            .values(newTransaction)
            .returning();

        return c.json(transaction);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Make a loan payment
app.post('/loans/payment', async (c) => {
    try {
        const { amount, loanId, toBalanceId, description, userId } = await c.req.json();

        // Verify loan exists
        const loan = await db.query.loans.findFirst({
            where: eq(loans.id, loanId),
        });

        if (!loan) {
            return c.json({ error: 'Loan not found' }, 404);
        }

        const newTransaction = {
            userId,
            amount: String(amount),
            type: 'LOAN_PAYMENT' as const,
            category: 'Loan Payment',
            description: description || `Loan payment for ${loan.borrowerName}`,
            reference: `LOAN_PAY_${Date.now()}`,
            toBalanceId,
            loanId,
            date: new Date(),
            isLoanPayment: true,
        };

        const [transaction] = await db.insert(transactions)
            .values(newTransaction)
            .returning();

        return c.json(transaction);
    } catch (err) {
        return c.json({
            error: err instanceof Error ? err.message : 'An error occurred'
        }, 500);
    }
});

// Export the Lambda handler
export const handler = handle(app);