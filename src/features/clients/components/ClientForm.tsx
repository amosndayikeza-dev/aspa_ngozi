// src/features/clients/components/ClientForm.tsx
import { useState, type FormEvent } from 'react';
import { User, Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface ClientFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ClientForm({ onSubmit, onCancel }: ClientFormProps) {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    adresse: '',
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
    <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
      
      {/* Ligne 1 : Nom & Prénom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="nom" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Nom
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="nom"
              name="nom"
              type="text"
              required
              value={formData.nom}
              onChange={handleChange}
              placeholder="Rakoto"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="prenom" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Prénom
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="prenom"
              name="prenom"
              type="text"
              required
              value={formData.prenom}
              onChange={handleChange}
              placeholder="Jean"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
            />
          </div>
        </div>
      </div>

      {/* Ligne 2 : Téléphone & Email */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="telephone" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="telephone"
              name="telephone"
              type="tel"
              required
              value={formData.telephone}
              onChange={handleChange}
              placeholder="034 12 345 67"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="jean@email.mg"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
            />
          </div>
        </div>
      </div>

      {/* Ligne 3 : Adresse */}
      <div className="space-y-1.5">
        <label htmlFor="adresse" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
          Adresse
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            id="adresse"
            name="adresse"
            type="text"
            required
            value={formData.adresse}
            onChange={handleChange}
            placeholder="Lot II A 45, Antananarivo"
            className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-text-main placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
          />
        </div>
      </div>

      {/* BOUTONS D'ACTION */}
      <div className="pt-4 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-9 px-4 bg-brand-dark hover:bg-brand-medium text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Enregistrer le client
            </>
          )}
        </button>
      </div>
    </form>
  );
}