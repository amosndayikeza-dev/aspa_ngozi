import { useState, type FormEvent } from 'react';
import { Truck, Phone, Mail, CheckCircle2 } from 'lucide-react';
import type { Fournisseur } from '../types';

interface FournisseurFormProps {
  initialData?: Fournisseur | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function FournisseurForm({ initialData, onSubmit, onCancel }: FournisseurFormProps) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    telephone: initialData?.telephone || '',
    email: initialData?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      
      {/* Nom du fournisseur */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nom de l'entreprise</label>
        <div className="relative">
          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            name="nom"
            type="text"
            required
            value={formData.nom}
            onChange={handleChange}
            placeholder="Ex: Centravet"
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Téléphone */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Téléphone</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            name="telephone"
            type="tel"
            required
            value={formData.telephone}
            onChange={handleChange}
            placeholder="034 00 000 00"
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="contact@fournisseur.mg"
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
        <button type="button" onClick={onCancel} className="h-9 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting} className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Enregistrement...' : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {initialData ? 'Mettre à jour' : 'Enregistrer'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}