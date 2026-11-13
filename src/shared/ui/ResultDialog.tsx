import { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

type Variant = 'success' | 'error' | 'warning';

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: Variant;
  title: string;
  description?: string;
  confirmLabel?: string;
}

/**
 * Popup de résultat d'opération (succès / échec / avertissement).
 * Design Desktop Pro : Layout asymétrique, gestion de la touche Échap, boutons alignés.
 */
export function ResultDialog({
  isOpen,
  onClose,
  variant = 'success',
  title,
  description,
  confirmLabel = 'OK',
}: ResultDialogProps) {
  
  // --- GESTION DE LA TOUCHE ÉCHAP ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Optionnel : empêcher le scroll du body en arrière-plan
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // --- CONFIGURATION DES COULEURS ---
  const styles: Record<Variant, { icon: any; color: string; bg: string; border: string; btn: string }> = {
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      btn: 'bg-emerald-600 hover:bg-emerald-700',
    },
    error: {
      icon: XCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      btn: 'bg-rose-600 hover:bg-rose-700',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      btn: 'bg-amber-600 hover:bg-amber-700',
    },
  };

  const s = styles[variant];
  const Icon = s.icon;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-[420px] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        
        {/* --- CONTENU PRINCIPAL (Layout Asymétrique) --- */}
        <div className="p-5 flex gap-4 items-start">
          
          {/* Icône à gauche */}
          <div className={cn('w-10 h-10 rounded-full flex items-center justify-center border shrink-0 mt-0.5', s.bg, s.border)}>
            <Icon className={cn('w-5 h-5', s.color)} />
          </div>

          {/* Texte à droite */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                {title}
              </h3>
              {/* Croix de fermeture discrète */}
              <button
                onClick={onClose}
                className="p-1 -mt-1 -mr-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            
            {description && (
              <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* --- PIED DU DIALOGUE (Boutons alignés) --- */}
        <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
          <button
            onClick={onClose}
            className={cn(
              'h-8 px-4 rounded-lg text-xs font-semibold text-white transition-all shadow-sm',
              s.btn
            )}
          >
            {confirmLabel}
          </button>
        </div>
        
      </div>
    </div>
  );
}