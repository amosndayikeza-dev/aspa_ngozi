import { LoginForm } from "../components/LoginForm";

/**
 * Page de connexion.
 * le Layout (cebtrage, fond creme) est fourni par authLayout via le router
 */

export function LoginPage() {
    return (
        <div className="w-full">
            {/**Branding au-dessus du formulaire */}
            <div className="text-start mb-6">
                {/*<h1 className="text-3xl font-bold text-vet-green">
                    ASPA NGOZI
                </h1>
                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider mb-4">
                    Gestion de pharmacie vétérinaire
                </p>*/}
                <LoginForm />
            </div>
        </div>
    );
}