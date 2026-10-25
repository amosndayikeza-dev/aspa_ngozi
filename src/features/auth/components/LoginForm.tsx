// src/features/auth/components/LoginForm.tsx
import { useState, type FormEvent } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/shared/lib/cn';

/**
 * Formulaire de connexion - Design "Desktop Pro"
 * 
 * Mise à jour de la palette :
 * - Le fond de la carte utilise un blanc translucide (glassmorphism clair).
 * - Les textes utilisent le gris foncé (gray-800) et le Teal profond (brand-dark).
 * - Les inputs ont un fond gris très clair avec un focus Teal.
 * - Le bouton utilise le Teal profond (brand-dark) avec un hover (brand-medium).
 */
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* 
      CARTE BLANCHE TRANSLUCIDE (Glassmorphism Clair)
      - bg-white/90 : Blanc à 90% d'opacité pour laisser deviner l'image derrière.
      - backdrop-blur-xl : Flou intense pour un effet "verre poli" haut de gamme.
      - border-white/50 : Bordure blanche pour détacher la carte.
      - text-gray-800 : Texte principal en gris très foncé (plus lisible que le blanc).
    */
    <div className="bg-white/90 backdrop-blur-xl border border-white/50 rounded-3xl shadow-2xl p-8 md:p-10 text-gray-800">
      
      {/* --- Titre --- */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-brand-dark">
          Connexion
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Accédez à votre espace Aspa Ngozi
        </p>
      </div>

      {/* --- Formulaire --- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        {/* Champ Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-gray-600">
            Adresse email
          </label>
          <div className="relative">
            {/* L'icône prend la couleur Teal moyen */}
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-medium" />
            <input
              id="email"
              type="email"
              placeholder="vous@vetpharma.mg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                'w-full h-11 rounded-xl bg-gray-50 pl-11 pr-4',
                'text-sm text-gray-800 placeholder:text-gray-400',
                'border border-gray-200',
                // Focus avec la couleur Teal
                'transition-all focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark'
              )}
            />
          </div>
        </div>

        {/* Champ Mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-semibold text-gray-600">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-medium" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={cn(
                'w-full h-11 rounded-xl bg-gray-50 pl-11 pr-11',
                'text-sm text-gray-800 placeholder:text-gray-400',
                'border border-gray-200',
                'transition-all focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-dark transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lien mot de passe oublié */}
        <div className="flex justify-end mt-1">
          <button
            type="button"
            className="text-xs font-semibold text-brand-medium hover:text-brand-dark transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Message d'erreur (Rouge de la palette) */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-xs text-vet-danger font-medium">{error}</p>
          </div>
        )}

        {/* Bouton principal (Teal foncé) */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full h-11 rounded-xl font-semibold text-sm text-white mt-2',
            'bg-brand-dark hover:bg-brand-medium', // Utilisation des nouvelles couleurs
            'transition-colors shadow-md',
            'disabled:opacity-60 disabled:cursor-not-allowed',
            'flex items-center justify-center gap-2'
          )}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
              Connexion…
            </>
          ) : (
            'Se connecter'
          )}
        </button>
        
      </form>
    </div>
  );
}