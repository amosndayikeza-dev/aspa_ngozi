import { useState } from 'react';
import { CatalogueProduits } from '../components/CatalogueProduits';
import { Panier } from '../components/Panier';
import type { LignePanier, ModePaiement } from '../types';
import type { Medicament } from '@/features/stock/types';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/Modal';
import { CreditCard, Banknote, Smartphone, CheckCircle2 } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export function POSPage() {
  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- LOGIQUE DU PANIER ---
  const handleAddToCart = (med: Medicament) => {
    setPanier((prev) => {
      const existing = prev.find(l => l.medicament.id === med.id);
      if (existing) {
        return prev.map(l => l.medicament.id === med.id ? { ...l, quantite: l.quantite + 1 } : l);
      }
      return [...prev, { medicament: med, quantite: 1 }];
    });
  };

  const handleUpdateQuantite = (medId: string, delta: number) => {
    setPanier((prev) => {
      return prev.map(l => {
        if (l.medicament.id === medId) {
          const newQte = l.quantite + delta;
          return newQte > 0 ? { ...l, quantite: newQte } : l;
        }
        return l;
      });
    });
  };

  const handleRemove = (medId: string) => {
    setPanier((prev) => prev.filter(l => l.medicament.id !== medId));
  };

  // --- VALIDATION DE LA VENTE ---
  const total = panier.reduce((acc, ligne) => acc + (ligne.medicament.prixVente * ligne.quantite), 0);

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast.success(`Vente de ${total.toLocaleString('fr-FR')} FBU encaissée en ${modePaiement} !`);
    setPanier([]);
    setIsPaymentModalOpen(false);
    setIsProcessing(false);
  };

  return (
    // 1. print:h-auto et print:max-w-full pour laisser le ticket prendre la place
    <div className="h-[calc(100vh-5.5rem)] max-w-[1600px] mx-auto select-none print:h-auto print:max-w-full">
      
      {/* 2. print:block transforme la grille en affichage simple à l'impression */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full print:block print:h-auto">
        
        {/* CATALOGUE (Gauche - Caché à l'impression) */}
        {/* 3. print:hidden pour le faire disparaître du papier */}
        <div className="lg:col-span-7 h-full overflow-hidden print:hidden">
          <CatalogueProduits onAddToCart={handleAddToCart} />
        </div>

        {/* PANIER TICKET THERMIQUE (Droite - Pleine largeur à l'impression) */}
        {/* 4. print:w-full et print:overflow-visible pour ne pas couper le ticket */}
        <div className="lg:col-span-5 h-full overflow-hidden print:w-full print:h-auto print:overflow-visible">
          <Panier 
            lignes={panier} 
            onUpdateQuantite={handleUpdateQuantite}
            onRemove={handleRemove}
            onCheckout={() => setIsPaymentModalOpen(true)}
          />
        </div>
      </div>

      {/* MODALE DE PAIEMENT ENCAISSEMENT */}
      {/* 5. On l'enveloppe dans une div avec print:hidden pour être sûr qu'elle ne s'imprime pas */}
      <div className="print:hidden">
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Encaissement de la Vente"
          description="Choisissez le mode de règlement pour clôturer et imprimer le ticket."
          maxWidth="sm"
          variant="dialog"
        >
          <div className="space-y-3.5 select-none">
            
            {/* Montant total à encaisser */}
            <div className="bg-emerald-50/70 p-3 rounded-xl text-center border border-emerald-200/70 shadow-2xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                Montant Net à Encaisser
              </p>
              <p className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                {total.toLocaleString('fr-FR')} FBU
              </p>
            </div>

            {/* Choix du mode de paiement */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Mode de règlement
              </p>
              
              <div className="space-y-1.5">
                {[
                  { id: 'Espèces', icon: Banknote },
                  { id: 'Mobile Money', icon: Smartphone },
                  { id: 'Carte Bancaire', icon: CreditCard }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setModePaiement(mode.id as ModePaiement)}
                    className={cn(
                      "w-full flex items-center gap-2.5 p-2.5 rounded-lg border transition-all cursor-pointer text-left",
                      modePaiement === mode.id 
                        ? "bg-slate-950 border-slate-950 text-white shadow-md" 
                        : "bg-white border-slate-200/90 text-slate-800 hover:bg-slate-50"
                    )}
                  >
                    <mode.icon className={cn("w-4 h-4 shrink-0", modePaiement === mode.id ? "text-emerald-400" : "text-slate-400")} />
                    <span className="text-xs font-semibold">{mode.id}</span>
                    {modePaiement === mode.id && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-400" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 h-8 bg-slate-100 hover:bg-slate-200/60 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs border border-emerald-600 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? 'Validation...' : 'Valider & Encaisser'}
              </button>
            </div>
          </div>
        </Modal>
      </div>

    </div>
  );
}