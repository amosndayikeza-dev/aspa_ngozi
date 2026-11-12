// src/features/stock/pages/MedicamentListPage.tsx
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, Eye, Pill, ClipboardList, Truck, Boxes, X, Calendar } from 'lucide-react';
import { medicamentApi } from '../api/medicamentApi';
import type { Medicament } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { StockBadge } from '../components/StockBadge';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { MedicamentForm } from '../components/MedicamentForm';
import { LotsManager } from '../components/LotsManager';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';

export function MedicamentListPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicamentToDelete, setMedicamentToDelete] = useState<Medicament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isLotsManagerOpen, setIsLotsManagerOpen] = useState(false);

  const fetchMedicaments = async () => {
    try {
      const data = await medicamentApi.getMedicaments();
      setMedicaments(data);
    } catch (error) {
      console.error(error);
      toast.error("Erreur de chargement");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicaments();
  }, []);

  // KPIs basés sur le stock VALIDE (vendable)
  const totalReferences = medicaments.length;
  const stockTotal = medicaments.reduce((acc, med) => 
    acc + (med.stockValide ?? med.lots.reduce((sum, lot) => sum + lot.quantite, 0)), 0
  );
  const alertesCount = medicaments.filter(med => {
    const stockV = med.stockValide ?? med.lots.reduce((sum, lot) => sum + lot.quantite, 0);
    return stockV <= med.seuilAlerte;
  }).length;

  const filteredMedicaments = medicaments.filter((med) => 
    med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dci.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenCreate = () => { setSelectedMedicament(null); setIsModalOpen(true); };
  const handleOpenEdit = (med: Medicament) => { setSelectedMedicament(med); setIsModalOpen(true); };
  const handleOpenView = (med: Medicament) => { setSelectedMedicament(med); setIsViewModalOpen(true); };
  const handleOpenLots = (med: Medicament) => { setSelectedMedicament(med); setIsLotsManagerOpen(true); };
  
  const handleOpenDelete = (med: Medicament, e: React.MouseEvent) => {
    e.stopPropagation();
    setMedicamentToDelete(med);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: any, imagePath?: string | null) => {
    try {
      if (selectedMedicament) {
        const updated = await medicamentApi.updateMedicament(selectedMedicament.id, data, imagePath);
        setMedicaments(medicaments.map(m => m.id === selectedMedicament.id ? updated : m));
        toast.success("Médicament mis à jour");
      } else {
        const newMed = await medicamentApi.createMedicament(data, imagePath);
        setMedicaments([newMed, ...medicaments]);
        toast.success("Médicament ajouté");
      }
      setIsModalOpen(false);
      fetchMedicaments(); // Recharge pour avoir les stocks à jour
    } catch (e: any) {
      toast.error(e.message || "Une erreur est survenue");
    }
  };

  const handleConfirmDelete = async () => {
    if (!medicamentToDelete) return;
    setIsDeleting(true);
    try {
      await medicamentApi.deleteMedicament(medicamentToDelete.id);
      setMedicaments(prev => prev.filter(m => m.id !== medicamentToDelete.id));
      toast.success("Médicament supprimé");
      setIsDeleteModalOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: Column<Medicament>[] = [
    {
      header: 'Médicament',
      render: (med) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-center overflow-hidden shrink-0">
            {med.imageUrl ? (
              <img src={med.imageUrl} alt={med.nom} className="w-full h-full object-cover" />
            ) : (
              <Pill className="w-4 h-4 text-slate-300" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">{med.nom}</span>
            <span className="text-[11px] text-slate-400">{med.dci || 'DCI non renseignée'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Catégorie / Forme',
      render: (med) => (
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex w-fit px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/70 text-[10px] font-semibold text-slate-600">{med.categorie}</span>
          <span className="text-[11px] text-slate-400">{med.forme}</span>
        </div>
      )
    },
    {
      header: 'Prix de vente',
      render: (med) => (
        <span className="text-xs font-bold font-mono tabular-nums text-slate-900">
          {med.prixVente.toLocaleString('fr-FR')} <span className="font-normal text-slate-400">FBU</span>
        </span>
      )
    },
    {
      header: 'Stock (lots)',
      render: (med) => {
        const stockValide = med.stockValide ?? med.lots.reduce((s, l) => s + l.quantite, 0);
        const stockPerime = med.stockPerime ?? 0;
        const nbLots = med.lots.length;

        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <span className={cn(
                "text-xs font-bold font-mono tabular-nums",
                stockValide <= med.seuilAlerte ? 'text-rose-600' : 'text-slate-900'
              )}>
                {stockValide}
              </span>
              <span className="text-[11px] text-slate-400">u</span>
              <StockBadge 
                quantite={stockValide} 
                seuil={med.seuilAlerte} 
                datePeremption={med.datePeremption} 
              />
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleOpenLots(med); }}
              className="text-[10px] text-slate-500 hover:text-emerald-700 hover:underline text-left flex items-center gap-1 cursor-pointer"
            >
              <Boxes className="w-3 h-3" />
              {nbLots} lot{nbLots > 1 ? 's' : ''}
              {stockPerime > 0 && (
                <span className="text-rose-600 font-semibold">· {stockPerime} périmé{stockPerime > 1 ? 's' : ''}</span>
              )}
            </button>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (med) => (
        <div className="flex items-center justify-end gap-0.5">
          <button onClick={() => handleOpenLots(med)} className="p-1.5 text-slate-400 hover:text-violet-700 hover:bg-violet-50 rounded-md transition-colors" title="Gérer les lots">
            <Boxes className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleOpenView(med)} className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors" title="Voir les détails">
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleOpenEdit(med)} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors" title="Modifier">
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button onClick={(e) => handleOpenDelete(med, e)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors" title="Supprimer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">
      {/* EN-TÊTE */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">Stock & Médicaments</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Catalogue de références · gestion par lots · alertes seuil</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Nom ou DCI…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-52 h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all"
            />
          </div>
          <Link to="/stock/inventaire" className="h-8 px-3 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <ClipboardList className="w-3.5 h-3.5" /> Inventaire
          </Link>
          <Link to="/stock/achats/nouveau" className="h-8 px-3 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Truck className="w-3.5 h-3.5" /> Commander
          </Link>
          <button onClick={handleOpenCreate} className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer">
            <Plus className="w-3.5 h-3.5" /> Nouveau Médicament
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 shrink-0"><Package className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Références</p>
            <p className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{totalReferences}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 flex items-center gap-3">
          <div className="p-2 bg-slate-100 border border-slate-200/70 rounded-lg text-slate-600 shrink-0"><TrendingUp className="w-4 h-4" /></div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unités vendables</p>
            <p className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{stockTotal}</p>
          </div>
        </div>
        <div className={cn(
          "bg-white rounded-xl border shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 flex items-center gap-3",
          alertesCount > 0 ? 'border-rose-200/80 bg-rose-50/30' : 'border-slate-200/90'
        )}>
          <div className={cn("p-2 rounded-lg shrink-0", alertesCount > 0 ? 'bg-rose-50 border border-rose-200/70 text-rose-600' : 'bg-slate-100 border border-slate-200/70 text-slate-400')}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alertes</p>
            <p className={cn("text-lg font-black font-mono tabular-nums leading-tight", alertesCount > 0 ? 'text-rose-600' : 'text-slate-900')}>{alertesCount}</p>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <DataTable<Medicament> data={filteredMedicaments} Columns={columns} isLoading={isLoading} keyExtractor={(med) => med.id} />

      {/* MODALE ÉDITION */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedMedicament ? "Modifier le médicament" : "Ajouter un médicament"} maxWidth="lg">
        <MedicamentForm initialData={selectedMedicament} onSubmit={handleSubmit} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      {/* MODALE DÉTAIL */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Fiche du médicament" maxWidth="md">
        {selectedMedicament && (
          <div className="space-y-4">
            {/* En-tête */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                {selectedMedicament.imageUrl ? (
                  <img src={selectedMedicament.imageUrl} alt={selectedMedicament.nom} className="w-full h-full object-cover" />
                ) : (
                  <Pill className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedMedicament.nom}</h3>
                <p className="text-xs font-medium text-emerald-700">{selectedMedicament.dci}</p>
                <p className="text-[11px] text-slate-500 mt-1">{selectedMedicament.categorie} • {selectedMedicament.forme}</p>
              </div>
            </div>

            {/* Grille info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Prix achat</p>
                <p className="text-sm font-semibold text-slate-900">{selectedMedicament.prixAchat.toLocaleString('fr-FR')} FBU</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Prix vente</p>
                <p className="text-sm font-bold text-emerald-700">{selectedMedicament.prixVente.toLocaleString('fr-FR')} FBU</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Stock vendable</p>
                <p className="text-sm font-bold text-slate-900">
                  {selectedMedicament.stockValide ?? selectedMedicament.lots.reduce((s, l) => s + l.quantite, 0)} unités
                </p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Stock périmé</p>
                <p className={cn("text-sm font-bold", (selectedMedicament.stockPerime ?? 0) > 0 ? 'text-rose-600' : 'text-slate-400')}>
                  {selectedMedicament.stockPerime ?? 0} unités
                </p>
              </div>
            </div>

            {/* Lots détaillés */}
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                <h4 className="text-xs font-bold text-slate-900">Lots ({selectedMedicament.lots.length})</h4>
                <button
                  onClick={() => { setIsViewModalOpen(false); setIsLotsManagerOpen(true); }}
                  className="text-[10px] font-semibold text-emerald-600 hover:underline"
                >
                  Gérer les lots
                </button>
              </div>
              <div className="max-h-52 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-slate-500 uppercase border-b border-slate-100 bg-white">
                      <th className="px-4 py-2 font-semibold">N° lot</th>
                      <th className="px-4 py-2 font-semibold text-center">Qté</th>
                      <th className="px-4 py-2 font-semibold">Péremption</th>
                      <th className="px-4 py-2 font-semibold text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedMedicament.lots.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-xs text-slate-400 italic">
                          Aucun lot. Ajoutez-en via "Gérer les lots".
                        </td>
                      </tr>
                    ) : (
                      selectedMedicament.lots.map(lot => {
                        const jours = lot.joursRestants ?? 0;
                        const statut = jours < 0 ? 'PERIME' : jours <= 30 ? 'EXPIRE_BIENTOT' : 'VALIDE';
                        const colors = {
                          PERIME: 'text-rose-700 bg-rose-50 border-rose-200',
                          EXPIRE_BIENTOT: 'text-amber-700 bg-amber-50 border-amber-200',
                          VALIDE: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                        };
                        return (
                          <tr key={lot.id}>
                            <td className="px-4 py-2 text-xs font-mono text-slate-800">{lot.numeroLot}</td>
                            <td className="px-4 py-2 text-xs font-bold text-center text-slate-800">{lot.quantite}</td>
                            <td className="px-4 py-2 text-xs text-slate-600">{new Date(lot.datePeremption).toLocaleDateString('fr-FR')}</td>
                            <td className="px-4 py-2 text-right">
                              <span className={cn("inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border", colors[statut as keyof typeof colors])}>
                                {statut === 'PERIME' ? 'Périmé' : statut === 'EXPIRE_BIENTOT' ? `${jours}j` : 'OK'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setIsViewModalOpen(false)} className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold">
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* MODALE LOTS MANAGER */}
      <Modal isOpen={isLotsManagerOpen} onClose={() => setIsLotsManagerOpen(false)} title="Gestion des lots" description={selectedMedicament ? `Produit : ${selectedMedicament.nom}` : ''} maxWidth="lg">
        {selectedMedicament && (
          <LotsManager
            produitId={selectedMedicament.id}
            onClose={() => { setIsLotsManagerOpen(false); fetchMedicaments(); }}
          />
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce médicament ?"
        description={`Êtes-vous sûr de vouloir supprimer ${medicamentToDelete?.nom} ? Tous les lots seront perdus.`}
        isLoading={isDeleting}
      />
    </div>
  );
}