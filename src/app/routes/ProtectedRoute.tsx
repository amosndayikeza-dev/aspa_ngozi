import { Navigate, Outlet, replace } from "react-router-dom"; 4
import { useAuth } from "@/features/auth";
import type { UserRole } from "@/features/auth";
import { constants } from "node:buffer";

interface ProtectedRouteProps {
    /**  cette interface montre les roles autorises a voir cette route. Si absent : tout utilisateur connecte */
    allowedRoles?: UserRole[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const { status, user } = useAuth();

    if (status === 'initializing') {
        return (
            <div className="min-h-screen bg-vet-cream flex items-center justify-center">
                <div className="text-sm text-gray-500">
                    Chargement...
                </div>
            </div>
        );
    }

    //2. pas connecte -> redirection vers/login
    if (status === 'unauthenticated' || !user) {
        return <Navigate to="/login" replace />
    }

    //2. connecte mais pas le bon role -> redirection vers une page 403
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/403 replace" />;
    }

    //4. si tout est bon -1>on afficher la route enfant
    return <Outlet />;
}