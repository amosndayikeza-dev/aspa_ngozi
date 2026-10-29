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
    <form id="animal-form" onSubmit={handleSubmit} className="space-y-3.5 select-none">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="nom" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Nom de l'animal
          </label>
          <div className="relative">
            <PawPrint className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="nom" name="nom" type="text" required
              value={formData.nom} onChange={handleChange} placeholder="Ex: Rex"
              className="w-full h-8 pl-8 pr-3 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label htmlFor="espece" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Espèce
          </label>
          <select
            id="espece" name="espece" value={formData.espece} onChange={handleChange}
            className="w-full h-8 px-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="race" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Race</label>
          <input
            id="race" name="race" type="text" required
            value={formData.race} onChange={handleChange} placeholder="Ex: Golden Retriever"
            className="w-full h-8 px-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
        
        <div className="space-y-1">
          <label htmlFor="dateNaissance" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date de naissance</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              id="dateNaissance" name="dateNaissance" type="date" required
              value={formData.dateNaissance} onChange={handleChange}
              className="w-full h-8 pl-8 pr-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="poidsKg" className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Poids (kg) - Optionnel</label>
        <div className="relative">
          <Weight className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            id="poidsKg" name="poidsKg" type="number" step="0.1"
            value={formData.poidsKg} onChange={handleChange} placeholder="Ex: 12.5"
            className="w-full h-8 pl-8 pr-3 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
          />
        </div>
      </div>

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
              <span>{initialData ? 'Mettre à jour' : 'Ajouter l\'animal'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}