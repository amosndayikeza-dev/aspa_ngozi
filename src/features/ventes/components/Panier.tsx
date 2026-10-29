// src/features/ventes/components/Panier.tsx
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, Printer, Receipt } from 'lucide-react';
import type { LignePanier } from '../types/index';

interface PanierProps {
  lignes: LignePanier[];
  onUpdateQuantite: (medId: string, delta: number) => void;
  onRemove: (medId: string) => void;
  onCheckout: () => void;
}

export function Panier({ lignes, onUpdateQuantite, onRemove, onCheckout }: PanierProps) {
  const total = lignes.reduce((acc, ligne) => acc + (ligne.medicament.prixVente * ligne.quantite), 0);
  const totalArticles = lignes.reduce((acc, ligne) => acc + ligne.quantite, 0);

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('fr-FR');
  const timeFormatted = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden font-mono text-slate-900 select-none">
      
      {/* --- EN-TÊTE DU TICKET THERMIQUE --- */}
      <div className="p-3.5 pb-2 border-b border-dashed border-slate-300 text-center bg-slate-50/40">
        <div className="flex justify-center mb-1.5">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-7 h-7 object-contain rounded p-0.5 border border-slate-300 bg-white" 
          />
        </div>
        <h2 className="text-xs font-bold tracking-tight uppercase leading-tight">
          Pharmacie Vétérinaire Aspa Ngozi
        </h2>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
          Santé Animale & Produits Vétérinaires
        </p>
        <p className="text-[9px] text-slate-400 mt-0.5">
          Ngozi, Burundi — Tél: +257 22 30 45 00
        </p>

        {/* Méta-informations du ticket */}
        <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px] text-slate-600">
          <span>TICKET #POS-2026</span>
          <span>{dateFormatted} {timeFormatted}</span>
        </div>
      </div>

      {/* En-tête des colonnes du reçu */}
      <div className="px-3.5 py-1.5 bg-slate-100/70 border-b border-dashed border-slate-300 flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase">
        <span>Désignation / P.U</span>
        <span>Qté x Total</span>
      </div>

      {/* --- LISTE DES ARTICLES DU REÇU (Zone déroulante) --- */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar bg-white">
        {lignes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60">
            <Receipt className="w-8 h-8 text-slate-400 mb-2 stroke-1" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">*** TICKET VIERGE ***</p>
            <p className="text-[10px] text-slate-500 mt-1">Sélectionnez un article du catalogue pour débuter la vente.</p>
          </div>
        ) : (
          lignes.map((ligne) => (
            <div 
              key={ligne.medicament.id} 
              className="pb-2 border-b border-dashed border-slate-200 text-xs space-y-1"
            >
              {/* Ligne 1 : Nom et Total */}
              <div className="flex justify-between items-start gap-2">
                <span className="font-bold text-slate-900 truncate leading-tight flex-1">
                  {ligne.medicament.nom}
                </span>
                <span className="font-bold text-slate-900 shrink-0 tabular-nums">
                  {(ligne.medicament.prixVente * ligne.quantite).toLocaleString('fr-FR')} FBU
                </span>
              </div>

              {/* Ligne 2 : Prix unitaire, Contrôle de quantité et Bouton Supprimer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span className="text-[10px] text-slate-500">
                  @ {ligne.medicament.prixVente.toLocaleString('fr-FR')} FBU
                </span>

                <div className="flex items-center gap-2">
                  {/* Micro-contrôleur de quantité */}
                  <div className="flex items-center border border-slate-300 rounded bg-slate-50 p-0.5">
                    <button 
                      onClick={() => onUpdateQuantite(ligne.medicament.id, -1)} 
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
                      title="Diminuer"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-900 w-5 text-center tabular-nums">
                      {ligne.quantite}
                    </span>
                    <button 
                      onClick={() => onUpdateQuantite(ligne.medicament.id, 1)} 
                      className="p-0.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
                      title="Augmenter"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Bouton supprimer */}
                  <button 
                    onClick={() => onRemove(ligne.medicament.id)} 
                    className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                    title="Supprimer la ligne"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- PIED DU TICKET THERMIQUE --- */}
      <div className="p-3.5 border-t-2 border-dashed border-slate-400 bg-slate-50/50 space-y-2">
        {/* Décompte */}
        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span>Nombre d'articles :</span>
            <span className="font-bold text-slate-800">{totalArticles}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA (0% Santé Animale) :</span>
            <span className="font-bold text-slate-800">0 FBU</span>
          </div>
        </div>

        {/* Encadré Total Mis en Évidence */}
        <div className="bg-slate-950 text-white p-2.5 rounded-lg flex justify-between items-center shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total à Payer</span>
            <span className="text-[9px] text-slate-400">Net à régler</span>
          </div>
          <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums">
            {total.toLocaleString('fr-FR')} FBU
          </span>
        </div>

        {/* Boutons d'Action */}
        <div className="space-y-1.5 pt-1">
          <button
            onClick={onCheckout}
            disabled={lignes.length === 0}
            className="w-full h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Encaisser le ticket</span>
          </button>

          <button
            onClick={() => window.print()}
            disabled={lignes.length === 0}
            className="w-full h-7 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold font-sans flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer le ticket</span>
          </button>
        </div>

        {/* Simulation Code-barres Thermique */}
        <div className="pt-2 text-center border-t border-dashed border-slate-300">
          <div className="h-6 flex items-center justify-center gap-0.5 overflow-hidden opacity-70">
            {[4, 2, 6, 1, 3, 5, 2, 4, 1, 3, 6, 2, 5, 3, 1, 4, 2, 6, 3, 2, 5, 1, 4, 3, 2, 6].map((w, i) => (
              <span key={i} className="h-full bg-slate-900 inline-block" style={{ width: `${w}px` }} />
            ))}
          </div>
          <p className="text-[8px] tracking-widest text-slate-400 uppercase mt-1">
            *** MERCI DE VOTRE VISITE ***
          </p>
        </div>
      </div>

    </div>
  );
}