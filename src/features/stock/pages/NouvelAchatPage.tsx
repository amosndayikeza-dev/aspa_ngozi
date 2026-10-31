import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Minus, Truck, CheckCircle2, ShoppingBag, Building2, Package, Receipt, ArrowRight } from 'lucide-react';
import { medicamentApi } from '../api/medicamentApi';
import { achatApi } from '../api/achatApi';
import type { Medicament, LigneAchat, Fournisseur } from '../types';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

export function NouvelAchatPage() {
    
  const navigate = useNavigate();
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [lignes, setLignes] = useState<LigneAchat[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    medicamentApi.getMedicaments().then(setMedicaments);
    achatApi.getFournisseurs().then(data => {
      setFournisseurs(data);
      if (data.length > 0) setSelectedFournisseur(data[0].id);
    });
  }, []);

  const handleAddMedicament = (med: Medicament) => {
    setLignes(prev => {
      const existing = prev.find(l => l.medicamentId === med.id);
      if (existing) {
        return prev.map(l => l.medicamentId === med.id ? { ...l, quantite: l.quantite + 1 } : l);
      }
      return [...prev, { 
        medicamentId: med.id, 
        nomMedicament: med.nom, 
        quantite: 1, 
        prixAchatUnitaire: med.prixAchat 
      }];
    });
  };

  const handleUpdateQte = (id: string, delta: number) => {
    setLignes(prev => prev.map(l => {
      if (l.medicamentId === id) {
        const newQte = l.quantite + delta;
        return newQte > 0 ? { ...l, quantite: newQte } : l;
      }
      return l;
    }));
  };

  const handleRemove = (id: string) => setLignes(prev => prev.filter(l => l.medicamentId !== id));

  const totalCommande = lignes.reduce((acc, l) => acc + (l.prixAchatUnitaire * l.quantite), 0);
  const selectedFournisseurData = fournisseurs.find(f => f.id === selectedFournisseur);

  const handleSubmit = async () => {
    if (!selectedFournisseur || lignes.length === 0) {
      toast.error("Veuillez sélectionner un fournisseur et au moins un produit.");
      return;
    }
    setIsSubmitting(true);
    try {
      await achatApi.createAchat({ fournisseurId: selectedFournisseur, lignes, total: totalCommande });
      toast.success("Commande fournisseur enregistrée ! Le stock a été mis à jour.");
      navigate('/stock');
    } catch (e) {
      toast.error("Erreur lors de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredMeds = medicaments.filter(m => m.nom.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-[calc(100vh-5.5rem)] max-w-[1600px] mx-auto flex flex-col gap-4">
      
      {/* --- 1. EN-TÊTE EXECUTIVE --- */}
      <div className="flex flex-col gap-3">
        <button 
          onClick={() => navigate('/stock')} 
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour au stock
        </button>
        
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              Nouvelle Commande Fournisseur
            </h1>
            <p className="text-[11px] text-slate-500 mt-1">
              Sélectionnez les produits et validez le bon de commande pour réapprovisionner le stock.
            </p>
          </div>
          
          {/* Indicateur d'étape minimaliste */}
          <div className="flex items-center gap-2 text-[10px] font-medium">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              En cours de saisie
            </span>
            <ArrowRight className="w-3 h-3 text-slate-300" />
            <span className="text-slate-400">Validation</span>
          </div>
        </div>
      </div>

      {/* --- 2. LAYOUT PRINCIPAL (Catalogue + Bon de commande) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">

        {/* === COLONNE GAUCHE (Catalogue) === */}
        <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden">
          
          {/* Carte Fournisseur (Design mis en avant) */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3">
            <div className="flex items-center gap-2 mb-2.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <h2 className="text-xs font-bold text-slate-900">Fournisseur</h2>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {fournisseurs.map(f => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFournisseur(f.id)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-all shrink-0 min-w-[160px]",
                    selectedFournisseur === f.id 
                      ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20" 
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center font-bold text-[10px]",
                    selectedFournisseur === f.id ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {f.nom.charAt(0)}
                  </div>
                  <div>
                    <p className={cn("text-[11px] font-semibold", selectedFournisseur === f.id ? "text-emerald-900" : "text-slate-700")}>
                      {f.nom}
                    </p>
                    <p className="text-[9px] text-slate-400">Fournisseur agréé</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Catalogue des produits */}
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col flex-1 overflow-hidden">
            {/* Barre de recherche */}
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Rechercher un produit à commander…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all"
                />
              </div>
            </div>

            {/* Grille produits (Style Bento) */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredMeds.map(med => (
                <button
                  key={med.id}
                  onClick={() => handleAddMedicament(med)}
                  className="p-3 bg-white border border-slate-200/80 rounded-xl hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 transition-all text-left flex flex-col gap-1.5 group relative overflow-hidden"
                >
                  {/* Indicateur de stock */}
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  
                  <span className="text-xs font-semibold text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors pr-3">
                    {med.nom}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Achat: {med.prixAchat.toLocaleString('fr-FR')} FBU</span>
                  
                  <div className="mt-auto pt-2 border-t border-slate-100 flex justify-between items-center w-full">
                    <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Ajouter</span>
                    <div className="p-1 bg-slate-50 group-hover:bg-emerald-600 group-hover:text-white rounded-md transition-colors text-slate-500">
                      <Plus className="w-3 h-3" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* === COLONNE DROITE (Bon de commande / Facture) === */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden">
          
          {/* En-tête du bon de commande */}
          <div className="p-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 mb-1">
              <Receipt className="w-4 h-4 text-slate-600" />
              <h2 className="text-xs font-bold text-slate-900">Bon de commande</h2>
            </div>
            <p className="text-[10px] text-slate-400">
              {selectedFournisseurData ? `Destiné à ${selectedFournisseurData.nom}` : 'Sélectionnez un fournisseur'}
            </p>
          </div>

          {/* Lignes de commande (Style facture) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 bg-slate-50/30">
            {lignes.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60 py-10">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs font-medium">Le bon de commande est vide</p>
                <p className="text-[10px] text-slate-400 mt-1">Ajoutez des produits depuis le catalogue.</p>
              </div>
            ) : (
              lignes.map(l => (
                <div 
                  key={l.medicamentId} 
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200/60 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{l.nomMedicament}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{l.prixAchatUnitaire.toLocaleString('fr-FR')} FBU / u</p>
                  </div>
                  
                  {/* Stepper quantité */}
                  <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200/80 rounded-lg p-0.5 mx-2 shrink-0">
                    <button onClick={() => handleUpdateQte(l.medicamentId, -1)} className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-900 w-5 text-center font-mono">{l.quantite}</span>
                    <button onClick={() => handleUpdateQte(l.medicamentId, 1)} className="p-1 hover:bg-white hover:shadow-sm rounded text-slate-600 transition-all">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <button onClick={() => handleRemove(l.medicamentId)} className="text-[10px] font-medium text-rose-400 hover:text-rose-600 transition-colors shrink-0">
                    Retirer
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pied du bon de commande (Total + Validation) */}
          <div className="p-3 border-t border-slate-100 bg-white">
            
            {/* Ligne de séparation pointillée style facture */}
            <div className="border-t border-dashed border-slate-200 my-2" />

            {/* Total */}
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-medium text-slate-500">Total Commande</span>
              <span className="text-lg font-black text-emerald-700 font-mono tabular-nums">
                {totalCommande.toLocaleString('fr-FR')} <span className="text-[10px] font-normal text-slate-400">FBU</span>
              </span>
            </div>

            {/* Bouton de validation */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || lignes.length === 0}
              className={cn(
                "w-full h-10 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm",
                lignes.length === 0 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md hover:shadow-emerald-200"
              )}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Enregistrement...' : 'Valider la commande'}
            </button>
            
            <p className="text-center text-[9px] text-slate-400 mt-2">
              En validant, le stock sera automatiquement mis à jour.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}