import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth";
import type { UserRole } from "@/features/auth";

interface ProtectedRouteProps {
    /** Rôles autorisés à voir cette route. Si absent : tout utilisateur connecté. */
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { status, user } = useAuth();

    // 1. Chargement initial (ex: validation du token depuis le localStorage)
    if (status === 'initializing') {
        return (
            <div className="min-h-screen bg-vet-cream flex items-center justify-center">
                <div className="text-sm text-gray-500">Chargement...</div>
            </div>
        );
    }

    // 2. Pas connecté → redirection vers /login
    if (status === 'unauthenticated' || !user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Connecté mais pas le bon rôle → page 403
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403" replace />;
    }

    // 4. Tout est bon → on affiche la route enfant
    return <Outlet />;
}