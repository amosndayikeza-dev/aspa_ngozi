import { AuthProvider } from "./providers/AuthProvider";
import { AppRouter } from "./routes/AppRouter";

/**
 * point d'ntree de l'application
 * ordre des providers (du plus externe au plus interne)
 * 1.AutProvider -> doit englober le router pour que useAuth marche partout
 * 2.AppRouter -> contient le BrowserRouter et les routes
 */

export function App() {
    return (
        <AuthProvider>
            <AppRouter />
        </AuthProvider>
    )
}