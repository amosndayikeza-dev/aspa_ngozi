// src/features/clients/components/ClientForm.tsx
import { useState, type FormEvent } from 'react';
import { User, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';

interface ClientFormProps {
  initialData?: {
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
  };

  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const fieldClass =
  'w-full h-8 pl-8 pr-3 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all';

export function ClientForm({initialData, onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    prenom: initialData?.prenom || '',
    telephone: initialData?.telephone || '',
    email: initialData?.email || '',
    adresse: initialData?.adresse || '',
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
    <form id="client-form" onSubmit={handleSubmit} className="space-y-3.5 select-none">
      
      {/* Ligne 1 : Nom & Prénom */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="nom" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Nom
          </label>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={formData.nom}
              onChange={handleChange}
              placeholder="Rakoto"
              className={fieldClass}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="prenom" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Prénom
          </label>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Jean"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Ligne 2 : Téléphone & Email */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="telephone" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required
              value={formData.telephone}
              onChange={handleChange}
              placeholder="034 12 345 67"
              className={fieldClass}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label htmlFor="email" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="jean@email.mg"
              className={fieldClass}
            />
          </div>
        </div>
      </div>

      {/* Ligne 3 : Adresse */}
      <div className="space-y-1">
        <label htmlFor="adresse" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Adresse
        </label>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="adresse"
            name="adresse"
            type="text"
            required
            value={formData.adresse}
            onChange={handleChange}
            placeholder="Lot II A 45, Antananarivo"
            className={fieldClass}
          />
        </div>
      </div>

      {/* BOUTONS D'ACTION */}
      <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-8 px-3.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/60 border border-slate-200/60 transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs border border-emerald-600 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Enregistrement...' : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{initialData ? 'Mettre à jour' : 'Enregistrer le client'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
