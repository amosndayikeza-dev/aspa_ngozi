import { useContext } from "react";
import { AuthContext } from "@/app/providers/AuthProvider";

/**
 * Hook pour accéder à l'état d'authentification.
 *
 * À utiliser dans n'importe quel composant :
 *   const { user, login, logout, status } = useAuth();
 *
 * @throws Si utilisé hors d'un <AuthProvider>.
 */

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error(
            "useAuth doit etre utilise a l'interieur d'un <AuthProvider>"
        );
    }

    return context;

}