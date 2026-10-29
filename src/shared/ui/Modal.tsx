// src/shared/ui/Modal.tsx
import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'drawer' | 'dialog';
}

const maxWidthDrawerClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

const maxWidthDialogClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
  variant,
}: ModalProps) {
  // Par défaut, les modales sm (confirmations) sont centrées en Glassmorphism,
  // tandis que md, lg, xl sont des Side-Drawers coulissants depuis la droite.
  const isDrawer = variant ? variant === 'drawer' : maxWidth !== 'sm';

  // Fermer la modale avec la touche "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return isDrawer ? (
    /* --- PANNEAU LATÉRAL COULISSANT (SIDE-DRAWER) --- */
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Clic à l'extérieur pour fermer */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* Conteneur du tiroir latéral */}
      <div 
        className={cn(
          "relative h-full w-full bg-white border-l border-slate-200/90 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out z-10",
          maxWidthDrawerClasses[maxWidth]
        )}
      >
        {/* Ligne d'accent lumineuse supérieure */}
        <div className="h-0.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-transparent shrink-0" />

        {/* En-tête */}
        {title && (
          <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0 bg-slate-50/60">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h2>
              {description && (
                <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Fermer (Échap)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Corps scrollable */}
        <div className="flex-1 p-5 overflow-y-auto no-scrollbar">
          {children}
        </div>

        {/* Pied avec boutons d'action */}
        {footer && (
          <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  ) : (
    /* --- MODALE CENTRÉE EN GLASSMORPHISM --- */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      <div 
        className={cn(
          "relative w-full bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10",
          maxWidthDialogClasses[maxWidth]
        )}
      >
        {title && (
          <div className="flex items-start justify-between gap-3 p-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">{title}</h2>
              {description && (
                <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="p-5 overflow-y-auto max-h-[85vh] no-scrollbar">
          {children}
        </div>

        {footer && (
          <div className="p-3.5 px-5 border-t border-slate-100 bg-slate-50/80 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
