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
  'w-full h-9 pl-9 pr-3 bg-gray-50 border border-gray-100 rounded-xl text-sm text-text-main placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-colors';

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
    <form id="client-form" onSubmit={handleSubmit} className="space-y-4">
      
      {/* Ligne 1 : Nom & Prénom */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="nom" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Nom
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
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
        <div className="space-y-1.5">
          <label htmlFor="prenom" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Prénom
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="telephone" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Téléphone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
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
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
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
      <div className="space-y-1.5">
        <label htmlFor="adresse" className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          Adresse
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
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
      <div className="pt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 px-4 rounded-xl text-xs font-semibold text-text-muted bg-gray-50 hover:text-text-main hover:bg-brand-light/30 transition-colors"
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
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enregistrer le client
            </>
          )}
        </button>
      </div>
    </form>
  );
}
