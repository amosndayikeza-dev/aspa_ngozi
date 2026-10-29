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
        <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200/60">
            {ROLES.map((r) => (
                <button
                key={r.value}
                onClick={() => handleSwitch(r.value)}
                className={cn(
                    'text-[10px] px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1',
                    user?.role === r.value
                    ? 'bg-white text-slate-800 font-semibold shadow-2xs border border-slate-200/80'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/40'
                )}
                title={`Passer en mode ${r.label}`}
                >
                  <span className="text-xs leading-none">{r.emoji}</span>
                  <span className="hidden xl:inline text-[10px]">{r.label}</span>
                </button>
            ))}
        </div>
    );
}