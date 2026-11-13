import { useState, useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingCart, CreditCard, Printer, Receipt, AlertTriangle } from 'lucide-react';
import type { LignePanier } from '../types/index';
import { useParametres } from '@/features/settings/hooks/useParametres';
import { cn } from '@/shared/lib/cn';

interface PanierProps {
  lignes: LignePanier[];
  onUpdateQuantite: (medId: string, delta: number) => void;
  onSetQuantite: (medId: string, newQte: number) => void;   // ← AJOUT
  onRemove: (medId: string) => void;
  onCheckout: () => void;
}

/**
 * Champ de saisie manuelle de la quantité.
 * - L'utilisateur peut taper librement (aucune validation pendant la frappe)
 * - La validation se fait au blur / Entrée → appelle `onCommit` avec la valeur
 * - Si onCommit rejette (stock insuffisant), le parent gère le toast + clamp
 */
function QtyInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [local, setLocal] = useState(String(value));

  // Resynchronise si le parent change la valeur (ex: bouton +/-)
  useEffect(() => {
    setLocal(String(value));
  }, [value]);

  const commit = () => {
    const n = parseInt(local, 10);
    if (isNaN(n) || n <= 0) {
      setLocal(String(value)); // saisie invalide → revert
      return;
    }
    onCommit(n);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={local}
      onChange={(e) => setLocal(e.target.value.replace(/\D/g, '').slice(0, 5))}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className="text-[11px] font-bold text-slate-900 w-9 text-center tabular-nums bg-transparent border-none outline-none focus:bg-white focus:ring-1 focus:ring-emerald-400 rounded"
      title="Saisir la quantité"
    />
  );
}

export function Panier({ lignes, onUpdateQuantite, onSetQuantite, onRemove, onCheckout }: PanierProps) {
  const total = lignes.reduce((acc, ligne) => acc + (ligne.medicament.prixVente * ligne.quantite), 0);
  const totalArticles = lignes.reduce((acc, ligne) => acc + ligne.quantite, 0);

  // ✅ Charger les paramètres depuis la DB
  const { parametres } = useParametres();

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('fr-FR');
  const timeFormatted = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="ticket-imprimable" className="flex flex-col h-full bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden font-mono text-slate-900 select-none print:border-none print:shadow-none print:h-auto print:overflow-visible">

      {/* --- EN-TÊTE DU TICKET THERMIQUE --- */}
      <div className="p-3.5 pb-2 border-b border-dashed border-slate-300 text-center bg-slate-50/40 print:bg-white">
        <div className="flex justify-center mb-1.5">
          {parametres?.logoUrl ? (
            <img
              src={parametres.logoUrl}
              alt="Logo"
              className="w-7 h-7 object-contain rounded p-0.5 border border-slate-300 bg-white"
            />
          ) : (
            <img
              src="/logo.png"
              alt="Logo"
              className="w-7 h-7 object-contain rounded p-0.5 border border-slate-300 bg-white"
            />
          )}
        </div>
        <h2 className="text-xs font-bold tracking-tight uppercase leading-tight">
          {parametres?.nom || 'NOM DE LA PHARMACIE'}
        </h2>
        <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
          Santé Animale & Produits Vétérinaires
        </p>
        <p className="text-[9px] text-slate-400 mt-0.5">
          {parametres?.adresse || ''}{parametres?.telephone ? ` — Tél: ${parametres.telephone}` : ''}
        </p>

        {/* Méta-informations du ticket */}
        <div className="mt-2 pt-1.5 border-t border-dashed border-slate-300 flex justify-between items-center text-[10px] text-slate-600">
          <span>TICKET #POS-2026</span>
          <span>{dateFormatted} {timeFormatted}</span>
        </div>
      </div>

      {/* En-tête des colonnes du reçu */}
      <div className="px-3.5 py-1.5 bg-slate-100/70 border-b border-dashed border-slate-300 flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase print:bg-white">
        <span>Désignation / P.U</span>
        <span>Qté x Total</span>
      </div>

      {/* --- LISTE DES ARTICLES DU REÇU --- */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 no-scrollbar bg-white print:overflow-visible print:h-auto">
        {lignes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-60 print:hidden">
            <Receipt className="w-8 h-8 text-slate-400 mb-2 stroke-1" />
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">* TICKET VIERGE *</p>
            <p className="text-[10px] text-slate-500 mt-1">Sélectionnez un article du catalogue pour débuter la vente.</p>
          </div>
        ) : (
          lignes.map((ligne) => {
            const stock = ligne.medicament.stock ?? 0;
            const atMax = ligne.quantite >= stock;

            return (
              <div
                key={ligne.medicament.id}
                className="pb-2 border-b border-dashed border-slate-200 text-xs space-y-1"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="font-bold text-slate-900 truncate leading-tight flex-1">
                    {ligne.medicament.nom}
                  </span>
                  <span className="font-bold text-slate-900 shrink-0 tabular-nums">
                    {(ligne.medicament.prixVente * ligne.quantite).toLocaleString('fr-FR')} {parametres?.devise || 'FBU'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500">
                      @ {ligne.medicament.prixVente.toLocaleString('fr-FR')} {parametres?.devise || 'FBU'}
                    </span>
                    <span className={cn("text-[9px] font-semibold", stock <= 5 ? "text-amber-600" : "text-emerald-600")}>
                      Stock: {stock}
                    </span>
                  </div>

                  <span className="hidden print:inline text-[10px] font-bold">
                    Qté: {ligne.quantite}
                  </span>

                  <div className="flex items-center gap-2 print:hidden">
                    <div className="flex items-center border border-slate-300 rounded bg-slate-50 p-0.5">
                      <button
                        onClick={() => onUpdateQuantite(ligne.medicament.id, -1)}
                        className="p-0.5 hover:bg-slate-200 rounded text-slate-700 transition-colors cursor-pointer"
                        title="Diminuer"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>

                      <QtyInput
                        value={ligne.quantite}
                        onCommit={(n) => onSetQuantite(ligne.medicament.id, n)}
                      />

                      <button
                        onClick={() => onUpdateQuantite(ligne.medicament.id, 1)}
                        disabled={atMax}
                        title={atMax ? `Stock maximum atteint (${stock})` : "Augmenter"}
                        className={cn(
                          "p-0.5 rounded transition-colors",
                          atMax ? "text-slate-300 cursor-not-allowed" : "hover:bg-slate-200 text-slate-700 cursor-pointer"
                        )}
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemove(ligne.medicament.id)}
                      className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Supprimer la ligne"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {atMax && stock > 0 && (
                  <div className="flex items-center gap-1 text-[9px] text-amber-600 font-semibold pt-0.5 print:hidden">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>Quantité maximale atteinte</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* --- PIED DU TICKET THERMIQUE --- */}
      <div className="p-3.5 border-t-2 border-dashed border-slate-400 bg-slate-50/50 space-y-2 print:bg-white">
        <div className="space-y-1 text-[11px] text-slate-600">
          <div className="flex justify-between">
            <span>Nombre d'articles :</span>
            <span className="font-bold text-slate-800">{totalArticles}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA ({parametres?.tva || 0}%) :</span>
            <span className="font-bold text-slate-800">0 {parametres?.devise || 'FBU'}</span>
          </div>
        </div>

        <div className="bg-slate-950 text-white p-2.5 rounded-lg flex justify-between items-center shadow-inner print:bg-white print:text-black print:border print:border-black print:shadow-none">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 print:text-black">Total à Payer</span>
            <span className="text-[9px] text-slate-400 print:text-gray-600">Net à régler</span>
          </div>
          <span className="text-xl font-bold font-mono tracking-tight text-white tabular-nums print:text-black">
            {total.toLocaleString('fr-FR')} {parametres?.devise || 'FBU'}
          </span>
        </div>

        <div className="space-y-1.5 pt-1 print:hidden">
          <button
            onClick={onCheckout}
            disabled={lignes.length === 0}
            className="w-full h-8.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Encaisser le ticket</span>
          </button>

          <button
            onClick={handlePrint}
            disabled={lignes.length === 0}
            className="w-full h-7 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold font-sans flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Imprimer le ticket</span>
          </button>
        </div>

        <div className="pt-2 text-center border-t border-dashed border-slate-300">
          <div className="h-6 flex items-center justify-center gap-0.5 overflow-hidden opacity-70">
            {[4, 2, 6, 1, 3, 5, 2, 4, 1, 3, 6, 2, 5, 3, 1, 4, 2, 6, 3, 2, 5, 1, 4, 3, 2, 6].map((w, i) => (
              <span key={i} className="h-full bg-slate-900 inline-block" style={{ width: `${w}px` }} />
            ))}
          </div>
          <p className="text-[8px] tracking-widest text-slate-400 uppercase mt-1">
            {parametres?.messageTicket || '* MERCI DE VOTRE VISITE *'}
          </p>
        </div>
      </div>

    </div>
  );
}