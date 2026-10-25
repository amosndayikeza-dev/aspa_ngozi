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

/** Ce que le contexte expose aux composants aux composants consommateurs */

interface AuthContextValue extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
}

// le contexte lui-meme 
export const AuthContext = createContext<AuthContextValue | null>(null);

// gere les transaction d'etat de facon previsible
type AuthAction =
    | { type: 'INITIALIZE'; user: User | null }
    | { type: 'LOGIN'; user: User }
    | { type: 'LOGOUT' };

function authReducer(state: AuthState, action: AuthAction): AuthState{
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
    
    // --- Au montage : on vérifie s'il existe une session sauvegardée ---
    // Pour l'instant, on simule : pas de session persistée → unauthenticated.
    // Plus tard, on lira un token dans localStorage/AsyncStorage

    useEffect(() => {
        const storedUser = localStorage.getItem('aspa Ngozi');
        const user = storedUser ? (JSON.parse(storedUser) as User) : null;
        dispatch({ type: 'INITIALIZE', user });
    }, []);

    //login
    const login = useCallback(async (credentials: LoginCredentials) => {
        const user = await authApi.login(credentials);
        localStorage.setItem('aspa Ngozi', JSON.stringify(user));
        dispatch({ type: 'LOGIN', user });
    }, []);

    // logout
    const logout = useCallback(async () => {
        await authApi.logout();
        localStorage.removeItem('aspa Ngozi');
        dispatch({ type: 'LOGOUT' });
    }, []);

    // valeur expose
    const value = useMemo<AuthContextValue>(
        () => ({ ...state, login, logout }),
        [state, login, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}