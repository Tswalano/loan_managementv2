import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@/lib/auth';
import { useCurrentUser } from '@/lib/api';
import { AccessDenied } from '@/components/access/access-denied';
import { getActiveOrganization, PermissionKey, resolveOrganizationPermissions } from '@/lib/permissions';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: PermissionKey;
    deniedDescription?: string;
}

export function ProtectedRoute({ children, requiredPermission, deniedDescription }: ProtectedRouteProps) {
    const location = useLocation();
    const { data: currentUserData, isLoading } = useCurrentUser();

    if (!isAuthenticated()) {
        // Redirect to login, but save the location they were trying to access
        return <Navigate to="/app/login" state={{ from: location }} replace />;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
            </div>
        );
    }

    if (requiredPermission) {
        const activeOrganization = getActiveOrganization(currentUserData?.organizations);
        const permissions = activeOrganization
            ? resolveOrganizationPermissions(activeOrganization.role, activeOrganization.permissions)
            : null;

        if (!permissions?.[requiredPermission]) {
            return <AccessDenied description={deniedDescription} />;
        }
    }

    return <>{children}</>;
}
