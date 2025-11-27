/* eslint-disable @typescript-eslint/no-explicit-any */
// Simple auth utilities - No Zustand, no hooks, just functions
// Use these anywhere in your app

import type { User } from '@/types';

/**
 * Get the current user from sessionStorage
 */
export function getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem('user');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch {
        return null;
    }
}

/**
 * Get the auth token
 */
export function getAuthToken(): string | null {
    return sessionStorage.getItem('authToken');
}

/**
 * Get the current organization
 */
export function getCurrentOrganization(): any | null {
    const orgStr = sessionStorage.getItem('organization');
    if (!orgStr) return null;

    try {
        return JSON.parse(orgStr);
    } catch {
        return null;
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!(getAuthToken() && getCurrentUser());
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth(): void {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('organization');
}

/**
 * Save user data after login
 */
export function saveUserData(token: string, user: User, organization?: any): void {
    sessionStorage.setItem('authToken', token);
    sessionStorage.setItem('user', JSON.stringify(user));
    if (organization) {
        sessionStorage.setItem('organization', JSON.stringify(organization));
    }
}