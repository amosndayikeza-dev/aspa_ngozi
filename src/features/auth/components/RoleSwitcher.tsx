import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";
import { cn } from "@/shared/lib/cn";

const ROLES: { value: UserRole; label: string; emoji: string }[] = [
    { value: 'PHARMACIEN', label: 'Pharmacien', emoji: '👑' },
    { value: 'VENDEUR', label: 'vendeur', emoji: '🛒' },
    { value: 'ADMIN', label: 'Admin', emoji: '⚙️' },
];

/**
 * Le composant de developpement uniquement
 * permet de switcher entre les roles pour tester l'UI se reconnecter
 *  a supprimer avant la mise en production
 */
export function RoleSwitcher() {
    const { user, logout, login } = useAuth();

    const handleSwitch = async (role: UserRole) => {
        await logout();
        const emailMap: Record<UserRole, string> = {
            PHARMACIEN: 'boss@aspa@gmail.com',
            VENDEUR: 'vendeur@aspa@gmail.com',
            ADMIN: 'admin@aspa@gmail.com',
        };
        await login({ email: emailMap[role], password: '54321' });
    };

    return (
        <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {ROLES.map((r) => (
                <button
                key={r.value}
                onClick={() => handleSwitch(r.value)}
                className={cn(
                    'text-2xs px-2 py-1 rounded font-medium transition-colors',
                    user?.role === r.value
                    ? 'bg-vet-green text-white'
                    : 'text-gray-400 hover:text-white'
                )}
                title={`Passer en ${r.label}`}
                >
                {r.emoji}
                </button>
            ))}
        </div>
  );
}