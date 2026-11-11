import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useReducer,
    type ReactNode,
} from 'react';
import { authApi } from '@/features/auth/api/authApi';
import type {
    AuthState,
    LoginCredentials,
    User,
} from '@/features/auth/types';

/** Ce que le contexte expose aux composants consommateurs */
interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

// Le contexte lui-même
export const AuthContext = createContext<AuthContextValue | null>(null);

// Clé de stockage centralisée (évite les fautes de frappe)
const STORAGE_KEY = 'vetpharma_user';

// Gère les transitions d'état de façon prévisible
type AuthAction =
    | { type: 'INITIALIZE'; user: User | null }
    | { type: 'LOGIN'; user: User }
    | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case 'INITIALIZE':
            return action.user
                ? { status: 'authenticated', user: action.user }
                : { status: 'unauthenticated', user: null };
        case 'LOGIN':
            return action.user
                ? { status: 'authenticated', user: action.user }
                : { status: 'unauthenticated', user: null };
        case 'LOGOUT':
            return { status: 'unauthenticated', user: null };
        default:
            return state;
    }
}

const initialState: AuthState = {
    status: 'initializing',
    user: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(authReducer, initialState);
    
    // --- Au montage : restaure la session si elle existe ---
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem(STORAGE_KEY);
            if (!storedUser) {
                dispatch({ type: 'INITIALIZE', user: null });
                return;
            }
            // ✅ Validation : on vérifie que le JSON est bien formé
            const user = JSON.parse(storedUser) as User;
            // ✅ Validation : on vérifie que le user a un id et un rôle
            if (!user.id || !user.role) {
                localStorage.removeItem(STORAGE_KEY);
                dispatch({ type: 'INITIALIZE', user: null });
                return;
            }
            dispatch({ type: 'INITIALIZE', user });
        } catch (error) {
            // ✅ Si le JSON est corrompu, on nettoie et on repart de zéro
            console.error("Erreur de restauration de session :", error);
            localStorage.removeItem(STORAGE_KEY);
            dispatch({ type: 'INITIALIZE', user: null });
        }
    }, []);

    // Login
    const login = useCallback(async (credentials: LoginCredentials) => {
        const user = await authApi.login(credentials);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        dispatch({ type: 'LOGIN', user });
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // ✅ On nettoie quand même le localStorage même si le backend échoue
            console.error("Erreur backend logout :", error);
        }
        localStorage.removeItem(STORAGE_KEY);
        dispatch({ type: 'LOGOUT' });
    }, []);

    // Valeur exposée
    const value = useMemo<AuthContextValue>(
        () => ({ ...state, login, logout }),
        [state, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}