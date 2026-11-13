import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '@/shared/lib/cn';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* 
      CARTE DE CONNEXION (Style Antigravity)
      - Fond blanc pur avec bordure slate très fine.
      - Ombre douce et coins arrondis standards (rounded-2xl).
      - Padding compact (p-6 md:p-8).
    */
    <div className="bg-white border border-slate-200/90 shadow-xl rounded-2xl p-6 md:p-8 text-slate-900 w-full max-w-sm">
      
      {/* --- Titre --- */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-slate-900">
          Connexion
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Accédez à votre espace Aspa Ngozi
        </p>
      </div>

      {/* --- Formulaire --- */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Champ Email */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Adresse email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="email"
              type="email"
              placeholder="vous@vetpharma.mg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={cn(
                'w-full h-10 rounded-lg bg-slate-50 pl-10 pr-3',
                'text-xs text-slate-800 placeholder:text-slate-400',
                'border border-slate-200',
                'transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
              )}
            />
          </div>
        </div>

        {/* Champ Mot de passe */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Mot de passe
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={cn(
                'w-full h-10 rounded-lg bg-slate-50 pl-10 pr-10',
                'text-xs text-slate-800 placeholder:text-slate-400',
                'border border-slate-200',
                'transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Lien mot de passe oublié */}
        <div className="flex justify-end mt-0.5">
          <button
            type="button"
            className="text-[11px] font-semibold text-slate-500 hover:text-emerald-600 transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          </div>
        )}

        {/* Bouton principal */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            'w-full h-10 rounded-lg font-semibold text-xs text-white mt-1',
            'bg-emerald-600 hover:bg-emerald-700',
            'transition-colors shadow-sm',
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