// src/features/clients/components/AnimalCard.tsx
import { Cake, Weight } from 'lucide-react';
import type { Animal } from '../types';

export function AnimalCard({ animal }: { animal: Animal }) {
  const age = new Date().getFullYear() - new Date(animal.dateNaissance).getFullYear();
  
  const speciesEmoji: Record<string, string> = {
    'Chien': '🐶', 'Chat': '🐱', 'Bovin': '🐮', 'Ovin': '🐑', 'Caprin': '🐐', 'Volaille': '🐔', 'Autre': '🐾'
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-brand-medium/30 transition-all duration-200 group flex flex-col justify-between">
      
      {/* En-tête de la carte */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center justify-center text-xl shadow-inner border border-gray-100 shrink-0">
          {speciesEmoji[animal.espece] || '🐾'}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text-main truncate group-hover:text-brand-dark transition-colors">
            {animal.nom}
          </h3>
          <p className="text-[11px] font-medium text-text-muted truncate mt-0.5">
            {animal.race}
          </p>
        </div>
      </div>

      {/* Détails (Âge & Poids) */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50 text-[11px] text-text-muted">
        <div className="flex items-center gap-1.5">
          <Cake className="w-3.5 h-3.5 text-brand-medium" />
          <span>{age} an{age > 1 ? 's' : ''}</span>
        </div>
        {animal.poidsKg && (
          <div className="flex items-center gap-1.5">
            <Weight className="w-3.5 h-3.5 text-brand-medium" />
            <span>{animal.poidsKg} kg</span>
          </div>
        )}
      </div>
    </div>
  );
}