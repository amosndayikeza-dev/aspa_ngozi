import { useState, useEffect } from 'react';
import { CatalogueProduits } from '../components/CatalogueProduits';
import { Panier } from '../components/Panier';
import type { LignePanier, ModePaiement } from '../types';
import type { Medicament } from '@/features/stock/types';
import type { Client, Animal } from '@/features/clients/types';
import { clientApi } from '@/features/clients/api/clientApi';
import { animalApi } from '@/features/clients/api/animalApi';
import { venteApi } from '../api/venteApi'; // 👈 Import de l'API de vente
import { toast } from 'sonner';
import { Modal } from '@/shared/ui/Modal';
import { CreditCard, Banknote, Smartphone, CheckCircle2, User, PawPrint } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useAuth } from '@/features/auth';

export function POSPage() {
  const { user } = useAuth();
  const [panier, setPanier] = useState<LignePanier[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [modePaiement, setModePaiement] = useState<ModePaiement>('Espèces');
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ États pour le client et l'animal
  const [clients, setClients] = useState<Client[]>([]);
  const [animaux, setAnimaux] = useState<Animal[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>('');

  // ✅ Charger les clients au démarrage
  useEffect(() => {
    clientApi.getClients().then(setClients).catch(console.error);
  }, []);

  // ✅ Charger les animaux quand on sélectionne un client
  useEffect(() => {
    if (selectedClientId) {
      animalApi.getAnimauxByClient(selectedClientId)
        .then(setAnimaux)
        .catch(console.error);
      setSelectedAnimalId(''); // Reset l'animal
    } else {
      setAnimaux([]);
    }
  }, [selectedClientId]);

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
    if (!selectedClientId) {
      toast.error("Veuillez sélectionner un client pour valider la vente.");
      return;
    }

    if (!user) {
      toast.error("Utilisateur non authentifié. Veuillez vous reconnecter.");
      return;
    }

    setIsProcessing(true);
    try {
      // Simulation de l'utilisateur connecté (à remplacer par ton contexte d'auth si tu en as un)
      const currentUserId = '1'; // Rakoto Jean (Pharmacien)

      // ✅ Appel réel au backend Rust
      await venteApi.createVente({
        clientId: selectedClientId,
        animalId: selectedAnimalId || null,
        userId: user.id, // 👈 Remplace le '1' codé en dur
        modePaiement: modePaiement,
        lignes: panier.map(l => ({
          produitId: l.medicament.id,
          quantite: l.quantite,
          prixUnitaire: l.medicament.prixVente
        }))
      });

      toast.success(`Vente de ${total.toLocaleString('fr-FR')} FBU encaissée en ${modePaiement} !`);
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

      {/* MODALE DE PAIEMENT ENCAISSEMENT */}
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
            
            {/* ✅ SÉLECTION DU CLIENT ET DE L'ANIMAL */}
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

              {/* Affiché seulement si le client a des animaux */}
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
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Mode de règlement</p>
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
                disabled={isProcessing || !selectedClientId}
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