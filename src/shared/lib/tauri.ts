/**
 * Wrapper autour de `invoke` de Tauri.
 *
 * Rôle :
 * - Centralise l'appel au backend Rust en UN seul endroit.
 * - Uniformise les erreurs : le frontend reçoit TOUJOURS un `Error` avec
 *   un `.message` lisible, que ce soit en mode mock ou en mode réel.
 *
 * Le backend Rust renvoie ses erreurs via `Err(String)` → Tauri rejette
 * la promesse avec cette string brute. On la transforme ici en `Error`
 * pour que `catch (err) { err.message }` fonctionne partout.
 */

// ✅ Backend Rust branché — le mock est désactivé.
const USE_MOCK = false;

// Conservé pour réactivation rapide en cas de besoin (débug, démo hors ligne).
const Mock_USERS = [
    { id: '1', nom: 'Rakoto Jean', email: 'boss@vetpharma.mg', password: '123456', role: 'PHARMACIEN' as const },
    { id: '2', nom: 'Randria Sarah', email: 'vendeur@vetpharma.mg', password: '123456', role: 'VENDEUR' as const },
    { id: '3', nom: 'Admin Système', email: 'admin@vetpharma.mg', password: '123456', role: 'ADMIN' as const },
];

export async function callBackend<T>(command: string, args?: Record<string, unknown>): Promise<T> {
    // --- MODE MOCK (désactivé, gardé pour référence) ---
    if (USE_MOCK) {
        await new Promise((resolve) => setTimeout(resolve, 500));

        switch (command) {
            case 'login': {
                const { email, password } = args as { email: string; password: string };
                const user = Mock_USERS.find(
                    (u) => u.email === email && u.password === password
                );
                if (!user) {
                    throw new Error('Email ou mot de passe incorrect');
                }
                const { password: _, ...safeUser } = user;
                return safeUser as T;
            }
            case 'logout':
                return undefined as T;
            default:
                throw new Error(`Commande mock inconnue : ${command}`);
        }
    }

    // --- MODE RÉEL (production) ---
    const { invoke } = await import('@tauri-apps/api/core');
    try {
        return await invoke<T>(command, args);
    } catch (err) {
        // Le backend Rust renvoie des `String` (via `Err(e.to_string())`).
        // On les normalise en `Error` pour une gestion uniforme côté React.
        if (err instanceof Error) throw err;
        throw new Error(typeof err === 'string' ? err : String(err));
    }
}