// src/features/ordonnances/pages/OrdonnanceFormPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Stethoscope, User, PawPrint, Plus, Trash2, FileText } from 'lucide-react';
import type { LigneOrdonnance } from '../types';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

// --- MOCK DATA POUR LE FORMULAIRE ---
const MOCK_CLIENTS = [
  { id: 'CLI-001', nom: 'Rakoto Jean', animaux: [{ id: 'AN-001', nom: 'Rex', espece: 'Chien' }, { id: 'AN-002', nom: 'Minou', espece: 'Chat' }] },
  { id: 'CLI-002', nom: 'Randria Sarah', animaux: [{ id: 'AN-003', nom: 'Bella', espece: 'Chien' }] },
];

const MOCK_MEDICAMENTS = [
  { id: 'MED-001', nom: 'Amoxicilline 500mg' },
  { id: 'MED-002', nom: 'Ivermectine 1%' },
  { id: 'MED-003', nom: 'Vaccin Newcastle' },
];

const VETERINAIRES = ['Dr. Rabe', 'Dr. Rakoto', 'Dr. Andria'];

export function OrdonnanceFormPage() {
  const navigate = useNavigate();
  
  // États du formulaire
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedAnimalId, setSelectedAnimalId] = useState('');
  const [veterinaire, setVeterinaire] = useState(VETERINAIRES[0]);
  const [lignes, setLignes] = useState<LigneOrdonnance[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Logique en cascade
  const clientData = MOCK_CLIENTS.find(c => c.id === selectedClientId);
  const animalData = clientData?.animaux.find(a => a.id === selectedAnimalId);

  const handleAddLigne = () => {
    setLignes([...lignes, { medicamentId: '', nomMedicament: '', posologie: '', duree: '', quantite: 1 }]);
  };

  const handleUpdateLigne = (index: number, field: keyof LigneOrdonnance, value: any) => {
    const newLignes = [...lignes];
    if (field === 'medicamentId') {
      const med = MOCK_MEDICAMENTS.find(m => m.id === value);
      newLignes[index].medicamentId = value;
      newLignes[index].nomMedicament = med?.nom || '';
    } else {
      newLignes[index] = { ...newLignes[index], [field]: value };
    }
    setLignes(newLignes);
  };

  const handleRemoveLigne = (index: number) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedClientId || !selectedAnimalId || lignes.length === 0) {
      toast.error("Veuillez sélectionner un client, un animal et au moins un médicament.");
      return;
    }
    
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation API
    toast.success("Ordonnance créée avec succès !");
    setIsSaving(false);
    navigate('/ordonnances');
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] max-w-[1200px] mx-auto flex flex-col gap-4">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <button onClick={() => navigate('/ordonnances')} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors mb-2">
            <ArrowLeft className="w-3.5 h-3.5" /> Retour aux ordonnances
          </button>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Nouvelle Ordonnance
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Enregistrement...' : 'Enregistrer l\'ordonnance'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 overflow-hidden">
        
        {/* COLONNE GAUCHE (Infos Patient & Vétérinaire) */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 flex flex-col gap-4 overflow-y-auto">
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Propriétaire
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => { setSelectedClientId(e.target.value); setSelectedAnimalId(''); }}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">Sélectionner un client...</option>
              {MOCK_CLIENTS.map(c => <option key={c.id} value={c.id}>{c.nom}</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <PawPrint className="w-3.5 h-3.5" /> Animal
            </label>
            <select
              value={selectedAnimalId}
              onChange={(e) => setSelectedAnimalId(e.target.value)}
              disabled={!selectedClientId}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:opacity-50"
            >
              <option value="">Sélectionner un animal...</option>
              {clientData?.animaux.map(a => <option key={a.id} value={a.id}>{a.nom} ({a.espece})</option>)}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5" /> Vétérinaire prescripteur
            </label>
            <select
              value={veterinaire}
              onChange={(e) => setVeterinaire(e.target.value)}
              className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              {VETERINAIRES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Résumé du patient sélectionné */}
          {animalData && (
            <div className="mt-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Patient sélectionné</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{animalData.nom}</p>
              <p className="text-xs text-slate-600">{animalData.espece}</p>
            </div>
          )}
        </div>

        {/* COLONNE DROITE (Lignes de prescription) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="text-xs font-bold text-slate-900">Médicaments prescrits</h2>
            <button
              onClick={handleAddLigne}
              className="h-7 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-emerald-600 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Ajouter une ligne
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {lignes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 py-10">
                <FileText className="w-8 h-8 mb-2" />
                <p className="text-xs">Aucun médicament ajouté à la prescription.</p>
              </div>
            ) : (
              lignes.map((ligne, index) => (
                <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200/60 grid grid-cols-12 gap-2 items-end">
                  
                  {/* Médicament */}
                  <div className="col-span-4 space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Médicament</label>
                    <select
                      value={ligne.medicamentId}
                      onChange={(e) => handleUpdateLigne(index, 'medicamentId', e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">Choisir...</option>
                      {MOCK_MEDICAMENTS.map(m => <option key={m.id} value={m.id}>{m.nom}</option>)}
                    </select>
                  </div>

                  {/* Posologie */}
                  <div className="col-span-3 space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Posologie</label>
                    <input
                      type="text"
                      value={ligne.posologie}
                      onChange={(e) => handleUpdateLigne(index, 'posologie', e.target.value)}
                      placeholder="Ex: 1 cp matin/soir"
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Durée */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Durée</label>
                    <input
                      type="text"
                      value={ligne.duree}
                      onChange={(e) => handleUpdateLigne(index, 'duree', e.target.value)}
                      placeholder="Ex: 5 jours"
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Quantité */}
                  <div className="col-span-2 space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase">Qté</label>
                    <input
                      type="number"
                      value={ligne.quantite}
                      onChange={(e) => handleUpdateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                      className="w-full h-8 px-2 bg-white border border-slate-200 rounded-md text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Supprimer */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleRemoveLigne(index)}
                      className="h-8 w-8 flex items-center justify-center text-rose-500 hover:bg-rose-100 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}