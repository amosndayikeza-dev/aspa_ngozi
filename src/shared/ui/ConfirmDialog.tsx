// src/shared/ui/ConfirmDialog.tsx
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Supprimer',
  cancelText = 'Annuler',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="sm"
      variant="dialog"
    >
      <div className="flex flex-col items-center text-center py-1 select-none">
        
        {/* Icône d'alerte */}
        <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200/70 flex items-center justify-center mb-3 text-rose-600 shadow-2xs">
          <AlertTriangle className="w-5 h-5" />
        </div>

        {/* Titre et description */}
        <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
        <p className="text-xs text-slate-500 mb-5 leading-relaxed max-w-[280px]">{description}</p>

        {/* Boutons */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-8 bg-slate-100 hover:bg-slate-200/60 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 h-8 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs border border-rose-600 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Suppression...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}