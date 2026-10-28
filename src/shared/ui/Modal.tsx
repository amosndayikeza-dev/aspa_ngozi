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
}

const maxWidthClasses = {
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
}: ModalProps) {
  
  // Fermer la modale avec la touche "Escape"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêche le scroll du body quand la modale est ouverte
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    /* 
      L'OVERLAY : Fond noir à 40% + flou intense (backdrop-blur-md) 
      pour un effet "Glassmorphism" très moderne.
    */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* CLIC À L'EXTÉRIEUR POUR FERMER */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />

      {/* CONTENEUR DE LA MODALE */}
      <div 
        className={cn(
          "relative w-full bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",
          maxWidthClasses[maxWidth]
        )}
      >
        {/* EN-TÊTE */}
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-text-main">{title}</h2>
            {description && (
              <p className="text-xs text-text-muted mt-1">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-main hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* CONTENU (Scrollable si trop grand) */}
        <div className="p-5 overflow-y-auto max-h-[70vh] no-scrollbar">
          {children}
        </div>

        {/* PIED (Boutons d'action) */}
        {footer && (
          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
