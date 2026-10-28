// src/features/clients/components/AnimalForm.tsx
import { useState, type FormEvent } from 'react';
import { PawPrint, Calendar, Weight, CheckCircle2 } from 'lucide-react';
import type { Animal } from '../types';

interface AnimalFormProps {
  // Si fourni, le formulaire passe en mode ÉDITION
  initialData?: Animal | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function AnimalForm({ initialData, onSubmit, onCancel }: AnimalFormProps) {
  // Initialisation avec les données existantes ou vides
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    espece: initialData?.espece || 'Chien',
    race: initialData?.race || '',
    dateNaissance: initialData?.dateNaissance || '',
    poidsKg: initialData?.poidsKg?.toString() || '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        poidsKg: formData.poidsKg ? parseFloat(formData.poidsKg) : undefined,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form id="animal-form" onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="nom" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Nom de l'animal
          </label>
          <div className="relative">
            <PawPrint className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="nom" name="nom" type="text" required
              value={formData.nom} onChange={handleChange} placeholder="Ex: Rex"
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark"
            />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="espece" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
            Espèce
          </label>
          <select
            id="espece" name="espece" value={formData.espece} onChange={handleChange}
            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark"
          >
            <option value="Chien">Chien</option>
            <option value="Chat">Chat</option>
            <option value="Bovin">Bovin</option>
            <option value="Ovin">Ovin</option>
            <option value="Caprin">Caprin</option>
            <option value="Volaille">Volaille</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="race" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Race</label>
          <input
            id="race" name="race" type="text" required
            value={formData.race} onChange={handleChange} placeholder="Ex: Golden Retriever"
            className="w-full h-10 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark"
          />
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor="dateNaissance" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Date de naissance</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="dateNaissance" name="dateNaissance" type="date" required
              value={formData.dateNaissance} onChange={handleChange}
              className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="poidsKg" className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">Poids (kg) - Optionnel</label>
        <div className="relative">
          <Weight className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            id="poidsKg" name="poidsKg" type="number" step="0.1"
            value={formData.poidsKg} onChange={handleChange} placeholder="Ex: 12.5"
            className="w-full h-10 pl-9 pr-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="h-9 px-4 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={isSubmitting} className="h-9 px-4 bg-brand-dark hover:bg-brand-medium text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Enregistrement...' : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              {initialData ? 'Mettre à jour' : 'Ajouter l\'animal'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}