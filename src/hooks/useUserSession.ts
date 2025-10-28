// src/hooks/useUserSession.ts
import { BACKEND_API_URL } from '@/lib/utils/consts';
import { User } from '@/types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';

interface SessionResponse {
    user: User;
    success: boolean;
    message: string;


}

interface AuthError {
    success: boolean;
    message: string;
    code?: string;
}

const SESSION_STORAGE_KEY = 'authToken';
const USER_STORAGE_KEY = 'user';
const SESSION_CHECK_INTERVAL = 300000; // Increased to 30 seconds to reduce calls
const SESSION_QUERY_KEY = ['session'] as const;

const getStoredToken = () => sessionStorage.getItem(SESSION_STORAGE_KEY);
const getStoredUser = (): User | null => {
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
};

const fetchSession = async (): Promise<SessionResponse> => {
    const token = getStoredToken();
    if (!token) throw new Error('No authentication token found');

    const response = await fetch(`${BACKEND_API_URL}/me`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const error: AuthError = {
            message: 'Failed to fetch session',
            code: response.status.toString(),
        };

        if (response.status === 401) {
            error.message = 'Session expired';
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
        }
        throw error;
    }

    const data = await response.json();
    console.log('Fetched session data:', data);
    return {
        user: data.user
    };
};

const useUserSession = () => {
    const queryClient = useQueryClient();
    const [localUser, setLocalUser] = useState<User | null>(getStoredUser);

    const {
        data: sessionData,
        error,
        isLoading,
        isError,
        refetch
    } = useQuery({
        queryKey: SESSION_QUERY_KEY,
        queryFn: fetchSession,
        retry: (failureCount, error: AuthError) => {
            return !(error.code === '401' || error.code === '403') && failureCount < 2;
        },
        enabled: !!getStoredToken(),
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false, // Disable refetch on window focus
        refetchOnReconnect: false, // Disable refetch on reconnect
    });

    useEffect(() => {
        if (sessionData?.user) {
            setLocalUser(sessionData.user);
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sessionData.user));
        }
    }, [sessionData]);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const checkAuthState = async () => {
            try {
                const token = getStoredToken();
                const currentUser = getStoredUser();

                if (token && !currentUser) {
                    await queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
                } else if (!token && currentUser) {
                    setLocalUser(null);
                    localStorage.removeItem(USER_STORAGE_KEY);
                }
            } catch (error) {
                console.error('Auth state check failed:', error);
            } finally {
                timeoutId = setTimeout(checkAuthState, SESSION_CHECK_INTERVAL);
            }
        };

        checkAuthState();
        return () => clearTimeout(timeoutId);
    }, [queryClient]);

    const clearSession = useCallback(() => {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setLocalUser(null);
        queryClient.removeQueries({ queryKey: SESSION_QUERY_KEY });
        window.location.href = '/app/login';
    }, [queryClient]);

    const setSession = useCallback((token: string, user: User) => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, token);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        setLocalUser(user);
        queryClient.invalidateQueries({ queryKey: SESSION_QUERY_KEY });
    }, [queryClient]);

    return {
        user: localUser,
        isLoading,
        error: isError ? (error as AuthError) : null,
        clearSession,
        setSession,
        refetchSession: refetch,
    };
};

export default useUserSession;
export type { User, AuthError, SessionResponse };