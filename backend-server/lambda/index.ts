import { Hono } from 'hono';
import { cors } from 'hono/cors'
import { handle } from 'hono/aws-lambda';
import { createClient, User } from '@supabase/supabase-js';
import { Context as HonoContext } from 'hono';

const app = new Hono();

// Add CORS middleware
app.use('/*', cors({
    origin: 'http://localhost:5173',
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

// Environment validation
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing required environment variables for Supabase configuration');
}

// Supabase client setup
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type definitions
interface AuthResponse {
    message: string;
    token?: string;
    error?: string;
}

type Variables = {
    user: User;
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
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            throw new AuthError('Invalid or expired token');
        }

        // Store user in context
        c.set('user', user);
        await next();
        return Promise.resolve();
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ error: error.message }, error.statusCode as 401 | 403 | 404 | 500);
        }
        return c.json({ error: 'Internal server error' }, 500);
    }
};

// Login request validation
interface LoginRequest {
    email: string;
    password: string;
}

const validateLoginRequest = (body: unknown): body is LoginRequest => {
    if (!body || typeof body !== 'object') return false;
    const { email, password } = body as LoginRequest;
    return typeof email === 'string' && typeof password === 'string';
};

// Health check endpoint
app.get('/health', (c) => {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Login endpoint
app.post('/login', async (c) => {
    try {
        const body = await c.req.json();
        if (!validateLoginRequest(body)) {
            return c.json({ error: 'Invalid request body' }, 400);
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: body.email,
            password: body.password,
        });

        if (error) {
            throw new AuthError(error.message, 401);
        }

        if (!data.session?.access_token) {
            throw new AuthError('No access token returned');
        }

        return c.json({
            success: true,
            message: 'Login successful',
            token: data.session.access_token,
            user: data.user,
        });
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ success: false, error: error.message }, error.statusCode as 401 | 400 | 403 | 404 | 500);
        }
        return c.json({ success: false, error: 'Internal server error' }, 500);
    }
});

// Secured endpoints
app.post('/logout', authenticate, async (c) => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            throw new AuthError(error.message, 400);
        }

        return c.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        if (error instanceof AuthError) {
            return c.json({ success: false, error: error.message }, error.statusCode as 401 | 400 | 403 | 404 | 500);
        }
        return c.json({ success: true, error: 'Internal server error' }, 500);
    }
});

// Protected route example
app.get('/protected', authenticate, (c) => {
    const user = c.get('user') as User;
    return c.json({ success: true, message: 'Protected route', user });
});

// Check active sessions and set the user
app.get('/active-sessions', authenticate, async (c) => {
    const user = c.get('user') as User;
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        return c.json({ success: false, error: error.message }, 500);
    }

    return c.json({ success: true, message: 'Active sessions', user, sessions: data });
});

// Database Endoints
app.get('/balances/:userId', async (c) => {
    const userId = c.req.param('userId')

    try {
        const { data, error } = await supabase
            .from('balances')
            .select('*')
            .eq('userId', userId)
            .eq('accountStatus', 'ACTIVE')
            .order('type')

        if (error) throw error

        return c.json(data)
    } catch (err) {
        return c.json({ error: err instanceof Error ? err.message : 'An error occurred' }, 500)
    }
})

app.get('/transactions/:userId', async (c) => {
    const userId = c.req.param('userId')

    try {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('userId', userId)
            .order('date', { ascending: false })

        if (error) throw error

        return c.json(data)
    } catch (err) {
        return c.json({ error: err instanceof Error ? err.message : 'An error occurred' }, 500)
    }
})

app.get('/loans/:userId', async (c) => {
    const userId = c.req.param('userId')

    try {
        const { data, error } = await supabase
            .from('loans')
            .select(`
                *,
                balance:balances!inner(*),
                transactions!loanId(*)
            `)
            .eq('userId', userId)
            .order('createdAt', { ascending: false })

        if (error) throw error

        return c.json(data)
    } catch (err) {
        return c.json({ error: err instanceof Error ? err.message : 'An error occurred' }, 500)
    }
})

app.post('/transactions', async (c) => {
    try {
        const body = await c.req.json()
        const { data, error } = await supabase
            .from('transactions')
            .insert(body)
            .select()
            .single()

        if (error) throw error

        return c.json(data)
    } catch (err) {
        return c.json({ error: err instanceof Error ? err.message : 'An error occurred' }, 500)
    }
})

app.post('/loans/disburse', async (c) => {
    try {
        const { amount, fromBalanceId, description, userId } = await c.req.json()

        const newTransaction = {
            amount: String(amount),
            type: 'LOAN_DISBURSEMENT',
            category: 'Loan Disbursement',
            description: description || 'Loan disbursement',
            reference: `LOAN_DISB_${Date.now()}`,
            fromBalanceId,
            date: new Date(),
            isLoanDisbursement: true,
            userId
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert(newTransaction)
            .select()
            .single()

        if (error) throw error

        return c.json(data)
    } catch (err) {
        return c.json({ error: err instanceof Error ? err.message : 'An error occurred' }, 500)
    }
})

app.post('/loans/payment', async (c) => {
    try {
        const { amount, loanId, toBalanceId, description, userId } = await c.req.json()

        // Verify loan exists
        const { data: loan, error: loanError } = await supabase
            .from('loans')
            .select('*')
            .eq('id', loanId)
            .single()

        if (loanError) throw loanError
        if (!loan) throw new Error('Loan not found')

        const newTransaction = {
            amount: String(amount),
            type: 'LOAN_PAYMENT',
            category: 'Loan Payment',
            description: description || `Loan payment for ${loan.borrowerName}`,
            reference: `LOAN_PAY_${Date.now()}`,
            toBalanceId,
            loanId,
            date: new Date(),
            isLoanPayment: true,
            userId
        }

        const { data, error } = await supabase
            .from('transactions')
            .insert(newTransaction)
            .select()
            .single()

        if (error) throw error

        return c.json(data)
    } catch (err) {
        return c.json({ error: err instanceof Error ? err.message : 'An error occurred' }, 500)
    }
})

// Export the Lambda handler
export const handler = handle(app);