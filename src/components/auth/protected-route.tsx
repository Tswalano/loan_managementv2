// // src/components/auth/protected-route.tsx
// import { Navigate, useLocation } from 'react-router-dom';
// import useUserSession from '@/hooks/useUserSession';

// export function ProtectedRoute({ children }: { children: React.ReactNode }) {
//     const { user, isLoading } = useUserSession();
//     const location = useLocation();

//     if (isLoading) {
//         return (
//             <div className="flex items-center justify-center min-h-screen">
//                 <div className="w-8 h-8 border-4 border-emerald-500 rounded-full animate-spin border-t-transparent"></div>
//             </div>
//         );
//     }

//     if (!user) {
//         return <Navigate to="/app/login" state={{ from: location }} replace />;
//     }

//     return <>{children}</>;
// }