import { useState, useEffect } from 'react';
import { CatalogueProduits } from '../components/CatalogueProduits';
import { Panier } from '../components/Panier';
import type { LignePanier, ModePaiement } from '../types';
import type { Medicament } from '@/features/stock/types';
import type { Client, Animal } from '@/features/clients/types';
import { clientApi } from '@/features/clients/api/clientApi';
import { animalApi } from '@/features/clients/api/animalApi';
import { venteApi } from '../api/venteApi';
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/Modal';
import { CreditCard, Banknote, Smartphone, CheckCircle2, User, PawPrint, Wallet, Calendar } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuth } from '@/features/auth';

export function POSPage() {
  const { user } = useAuth();
  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces');
  const [isProcessing, setIsProcessing] = useState(false);

  // --- États client & animal ---
  const [clients, setClients] = useState<Client[]>([]);
  const [animaux, setAnimaux] = useState<Animal[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');

  // --- États crédit ---
  const [montantVerse, setMontantVerse] = useState<number>(0);
  const [modeVersement, setModeVersement] = useState<string>('Espèces');
  const [dateEcheance, setDateEcheance] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // --- Charger les clients au démarrage ---
  useEffect(() => {
    clientApi.getClients().then(setClients).catch(console.error);
  }, []);

  // --- Charger les animaux quand un client est sélectionné ---
  useEffect(() => {
    if (selectedClientId) {
      animalApi.getAnimauxByClient(selectedClientId)
        .then(setAnimaux)
        .catch(console.error);
      setSelectedAnimalId('');
    } else {
      setAnimaux([]);
    }
  }, [selectedClientId]);

  // --- Reset les champs de crédit quand on ferme la modale ---
  useEffect(() => {
    if (!isPaymentModalOpen) {
      setMontantVerse(0);
      setModeVersement('Espèces');
      setModePaiement('Espèces');
    }
  }, [isPaymentModalOpen]);

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

  // --- VALIDATION ---
  const total = panier.reduce((acc, ligne) => acc + (ligne.medicament.prixVente * ligne.quantite), 0);
  const resteACredit = Math.max(0, total - montantVerse);

  const handleConfirmPayment = async () => {
    if (!selectedClientId) {
      toast.error("Veuillez sélectionner un client pour valider la vente.");
      return;
    }
    if (!user) {
      toast.error("Utilisateur non authentifié. Veuillez vous reconnecter.");
      return;
    }

    // Validations spécifiques au crédit
    if (modePaiement === 'Crédit') {
      if (montantVerse < 0 || montantVerse > total) {
        toast.error("Le montant versé est invalide.");
        return;
      }
      if (!dateEcheance) {
        toast.error("Veuillez choisir une date d'échéance.");
        return;
      }
    }

    setIsProcessing(true);
    try {
      await venteApi.createVente({
        clientId: selectedClientId,
        animalId: selectedAnimalId || null,
        userId: user.id,
        modePaiement: modePaiement,
        lignes: panier.map(l => ({
          produitId: l.medicament.id,
          quantite: l.quantite,
          prixUnitaire: l.medicament.prixVente,
        })),
        // ✅ Envoi des infos de crédit (null si vente comptant)
        credit: modePaiement === 'Crédit' ? {
          montantVerse,
          modeVersement,
          dateEcheance,
        } : null,
      });

      const message = modePaiement === 'Crédit'
        ? `Vente à crédit de ${total.toLocaleString('fr-FR')} FBU enregistrée. Reste à payer : ${resteACredit.toLocaleString('fr-FR')} FBU.`
        : `Vente de ${total.toLocaleString('fr-FR')} FBU encaissée en ${modePaiement} !`;

      toast.success(message);
      setPanier([]);
      setIsPaymentModalOpen(false);
      setSelectedClientId('');
      setSelectedAnimalId('');
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la validation de la vente");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] max-w-[1600px] mx-auto select-none print:h-auto print:max-w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 h-full print:block print:h-auto">
        
        <div className="lg:col-span-7 h-full overflow-hidden print:hidden">
          <CatalogueProduits onAddToCart={handleAddToCart} />
        </div>

        <div className="lg:col-span-5 h-full overflow-hidden print:w-full print:h-auto print:overflow-visible">
          <Panier 
            lignes={panier} 
            onUpdateQuantite={handleUpdateQuantite}
            onRemove={handleRemove}
            onCheckout={() => setIsPaymentModalOpen(true)}
          />
        </div>
      </div>

      {/* MODALE DE PAIEMENT */}
      <div className="print:hidden">
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title="Encaissement de la Vente"
          description="Choisissez le client et le mode de règlement."
          maxWidth="sm"
          variant="dialog"
        >
          <div className="space-y-3.5 select-none">
            
            {/* SÉLECTION DU CLIENT ET DE L'ANIMAL */}
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3 h-3" /> Client (Obligatoire)
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="">Sélectionner un client...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.nom} {c.prenom}</option>
                  ))}
                </select>
              </div>

              {selectedClientId && animaux.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <PawPrint className="w-3 h-3" /> Animal (Optionnel)
                  </label>
                  <select
                    value={selectedAnimalId}
                    onChange={(e) => setSelectedAnimalId(e.target.value)}
                    className="w-full h-8 px-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">Aucun animal spécifique</option>
                    {animaux.map(a => (
                      <option key={a.id} value={a.id}>{a.nom} ({a.espece})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* MONTANT TOTAL */}
            <div className="bg-emerald-50/70 p-3 rounded-xl text-center border border-emerald-200/70 shadow-2xs">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">
                Montant Net à Encaisser
              </p>
              <p className="text-2xl font-black font-mono tracking-tight text-slate-900 tabular-nums">
                {total.toLocaleString('fr-FR')} FBU
              </p>
            </div>

            {/* MODE DE PAIEMENT */}
            <div className="space-y-1.5">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode de règlement</p>
              <div className="space-y-1.5">
                {[
                  { id: 'Espèces', icon: Banknote },
                  { id: 'Mobile Money', icon: Smartphone },
                  { id: 'Carte Bancaire', icon: CreditCard },
                  { id: 'Crédit', icon: Wallet },
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

            {/* CHAMPS CRÉDIT (uniquement si mode Crédit) */}
            {modePaiement === 'Crédit' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                  <Calendar className="w-3 h-3" />
                  Détails du crédit
                </div>

                {/* Montant versé */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-amber-700">Montant versé maintenant (FBU)</label>
                  <input
                    type="number"
                    min={0}
                    max={total}
                    value={montantVerse}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setMontantVerse(Math.max(0, Math.min(total, val)));
                    }}
                    className="w-full h-8 px-2 bg-white border border-amber-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <div className="flex gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setMontantVerse(0)}
                      className="text-[9px] px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-semibold cursor-pointer"
                    >
                      Rien (crédit total)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMontantVerse(total)}
                      className="text-[9px] px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded font-semibold cursor-pointer"
                    >
                      Tout payer
                    </button>
                  </div>
                </div>

                {/* Mode du versement */}
                {montantVerse > 0 && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-amber-700">Mode de paiement de l'acompte</label>
                    <select
                      value={modeVersement}
                      onChange={(e) => setModeVersement(e.target.value)}
                      className="w-full h-8 px-2 bg-white border border-amber-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                    >
                      <option value="Espèces">Espèces</option>
                      <option value="Mobile Money">Mobile Money</option>
                      <option value="Carte Bancaire">Carte Bancaire</option>
                    </select>
                  </div>
                )}

                {/* Date d'échéance */}
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-amber-700">Date d'échéance</label>
                  <input
                    type="date"
                    value={dateEcheance}
                    onChange={(e) => setDateEcheance(e.target.value)}
                    className="w-full h-8 px-2 bg-white border border-amber-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                {/* Récap reste à crédit */}
                <div className="pt-2 border-t border-amber-200 flex justify-between items-center">
                  <span className="text-[10px] font-semibold text-amber-700">Reste à crédit :</span>
                  <span className="text-sm font-bold text-amber-900 font-mono">
                    {resteACredit.toLocaleString('fr-FR')} FBU
                  </span>
                </div>
              </div>
            )}

            {/* BOUTONS */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 h-8 bg-slate-100 hover:bg-slate-200/60 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button 
                onClick={handleConfirmPayment}
                disabled={isProcessing || !selectedClientId}
                className="flex-1 h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-2xs border border-emerald-600 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isProcessing ? 'Validation...' : (modePaiement === 'Crédit' ? 'Enregistrer à crédit' : 'Valider & Encaisser')}
              </button>
            </div>
          </div>
        </Modal>
      </div>

    </div>
  );
}