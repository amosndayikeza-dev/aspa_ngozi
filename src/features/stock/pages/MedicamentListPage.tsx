// src/features/stock/pages/MedicamentListPage.tsx
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, Eye,Pill } from 'lucide-react';
import { medicamentApi } from '../api/medicamentApi';
import type { Medicament } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { StockBadge } from '../components/StockBadge';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { MedicamentForm } from '../components/MedicamentForm';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { ClipboardList,Truck } from 'lucide-react';


export function MedicamentListPage() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMedicament, setSelectedMedicament] = useState<Medicament | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [medicamentToDelete, setMedicamentToDelete] = useState<Medicament | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    const fetchMedicaments = async () => {
      try {
        const data = await medicamentApi.getMedicaments();
        setMedicaments(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMedicaments();
  }, []);

  // --- KPIs ---
  const totalReferences = medicaments.length;
  const stockTotal = medicaments.reduce((acc, med) => 
    acc + med.lots.reduce((sum, lot) => sum + lot.quantite, 0), 0
  );
  const alertesCount = medicaments.filter(med => {
    const totalQte = med.lots.reduce((sum, lot) => sum + lot.quantite, 0);
    const hasExpired = med.lots.some(lot => new Date(lot.datePeremption) < new Date());
    const isLow = totalQte <= med.seuilAlerte;
    return hasExpired || isLow;
  }).length;

  const filteredMedicaments = medicaments.filter((med) => 
    med.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.dci.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- ACTIONS ---
  const handleOpenCreate = () => { setSelectedMedicament(null); setIsModalOpen(true); };
  const handleOpenEdit = (med: Medicament) => { setSelectedMedicament(med); setIsModalOpen(true); };
  
    // ouvrir la vue detaillee
    const handleOpenView = (med: Medicament) => {
        setSelectedMedicament(med);
        setIsViewModalOpen(true);
    }
  const handleOpenDelete = (med: Medicament, e: React.MouseEvent) => {
    e.stopPropagation();
    setMedicamentToDelete(med);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedMedicament) {
        await medicamentApi.updateMedicament(selectedMedicament.id, data);
        setMedicaments(medicaments.map(m => m.id === selectedMedicament.id ? { ...m, ...data } : m));
        toast.success("Médicament mis à jour");
      } else {
        const newMed = await medicamentApi.createMedicament(data);
        setMedicaments([newMed, ...medicaments]);
        toast.success("Médicament ajouté au catalogue");
      }
      setIsModalOpen(false);
    } catch (e) {
      toast.error("Une erreur est survenue");
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
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  // --- COLONNES ---
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
      header: 'Stock disponible',
      render: (med) => {
        const totalQte = med.lots.reduce((sum, lot) => sum + lot.quantite, 0);
        const dates = med.lots.map(l => l.datePeremption).sort();
        const datePeremption = dates.length > 0 ? dates[0] : undefined;

        return (
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold font-mono tabular-nums ${totalQte <= med.seuilAlerte ? 'text-rose-600' : 'text-slate-900'}`}>
              {totalQte}
            </span>
            <span className="text-[11px] text-slate-400">u</span>
            <StockBadge quantite={totalQte} seuil={med.seuilAlerte} datePeremption={datePeremption} />
          </div>
        );
      }
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (med) => (
        <div className="flex items-center justify-end gap-0.5">
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

      {/* ---- EN-TÊTE ---- */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-sm font-bold tracking-tight text-slate-900">Stock & Médicaments</h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Catalogue de références · dates de péremption · alertes seuil</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Barre de recherche */}
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
          <Link
            to="/stock/inventaire"
            className="h-8 px-3 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            Inventaire
          </Link>
          <Link
            to="/stock/achats/nouveau"
            className="h-8 px-3 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <Truck className="w-3.5 h-3.5" />
            Commander
          </Link>
          <button
            onClick={handleOpenCreate}
            className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Nouveau Médicament
          </button>
        </div>
      </div>

      {/* ---- KPIs compact ---- */}
      <div className="grid grid-cols-3 gap-3">
        {/* Références */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Références</p>
            <p className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{totalReferences}</p>
          </div>
        </div>
        {/* Unités en stock */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 flex items-center gap-3">
          <div className="p-2 bg-slate-100 border border-slate-200/70 rounded-lg text-slate-600 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unités en stock</p>
            <p className="text-lg font-black text-slate-900 font-mono tabular-nums leading-tight">{stockTotal}</p>
          </div>
        </div>
        {/* Alertes */}
        <div className={`bg-white rounded-xl border shadow-[0_1px_3px_rgba(0,0,0,0.03)] p-3 flex items-center gap-3 ${alertesCount > 0 ? 'border-rose-200/80 bg-rose-50/30' : 'border-slate-200/90'}`}>
          <div className={`p-2 rounded-lg shrink-0 ${alertesCount > 0 ? 'bg-rose-50 border border-rose-200/70 text-rose-600' : 'bg-slate-100 border border-slate-200/70 text-slate-400'}`}>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Alertes</p>
            <p className={`text-lg font-black font-mono tabular-nums leading-tight ${alertesCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>{alertesCount}</p>
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <DataTable<Medicament>
        data={filteredMedicaments}
        Columns={columns}
        isLoading={isLoading}
        keyExtractor={(med) => med.id}
      />

      {/* MODALES */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMedicament ? "Modifier le médicament" : "Ajouter un médicament"}
        description={selectedMedicament ? "Mettez à jour les informations." : "Créez une nouvelle référence dans votre catalogue."}
        maxWidth="lg"
      >
        <MedicamentForm 
          initialData={selectedMedicament}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce médicament ?"
        description={`Êtes-vous sûr de vouloir supprimer ${medicamentToDelete?.nom} ? Tous les lots associés seront définitivement perdus.`}
        isLoading={isDeleting}
      />

      {/* ----- le modale de visualisation------ */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Fiche du médicament"
        maxWidth="md"
      >
        {selectedMedicament && (
          <div className="space-y-4">
            
            {/* En-tête avec image */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm shrink-0">
                {selectedMedicament.imageUrl ? (
                  <img src={selectedMedicament.imageUrl} alt={selectedMedicament.nom} className="w-full h-full object-cover" />
                ) : (
                  <Pill className="w-8 h-8 text-gray-300" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main">{selectedMedicament.nom}</h3>
                <p className="text-xs font-medium text-brand-dark">{selectedMedicament.dci}</p>
                <p className="text-[11px] text-text-muted mt-1">{selectedMedicament.categorie} • {selectedMedicament.forme}</p>
              </div>
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Prix d'achat</p>
                <p className="text-sm font-semibold text-text-main">{selectedMedicament.prixAchat.toLocaleString('fr-FR')} FBU</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Prix de vente</p>
                <p className="text-sm font-bold text-brand-dark">{selectedMedicament.prixVente.toLocaleString('fr-FR')} FBU</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Seuil d'alerte</p>
                <p className="text-sm font-semibold text-text-main">{selectedMedicament.seuilAlerte} unités</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Stock Total</p>
                <p className="text-sm font-bold text-text-main">
                  {selectedMedicament.lots.reduce((sum, lot) => sum + lot.quantite, 0)} unités
                </p>
              </div>
            </div>

            {/* Détail des lots */}
            <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm mt-4">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <h4 className="text-xs font-bold text-text-main">Lots en stock</h4>
              </div>
              <div className="max-h-40 overflow-y-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] text-text-muted uppercase border-b border-gray-50">
                      <th className="px-4 py-2 font-semibold">
                        Lot
                      </th>
                      <th className="px-4 py-2 font-semibold">
                        Quantité
                      </th>
                      <th className="px-4 py-2 font-semibold">
                        Péremption
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedMedicament.lots.map(lot => (
                      <tr key={lot.id}>
                        <td className="px-4 py-2 text-xs text-text-main">{lot.numeroLot}</td>
                        <td className="px-4 py-2 text-xs font-semibold text-text-main">{lot.quantite}</td>
                        <td className="px-4 py-2 text-xs text-text-muted">{new Date(lot.datePeremption).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="h-9 px-4 bg-brand-dark hover:bg-brand-medium text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}