import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Truck, Phone, Mail, ArrowRight } from 'lucide-react';
import { achatApi } from '../api/achatApi';
import type { Fournisseur } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { Modal } from '@/shared/ui/Modal';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'; 
import { FournisseurForm } from '../components/FournisseurForm';
import { toast } from 'sonner';

export function FournisseurListPage() {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState<Fournisseur | null>(null);
  
  // Modale de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fournisseurToDelete, setFournisseurToDelete] = useState<Fournisseur | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchFournisseurs = () => {
    setIsLoading(true);
    achatApi.getFournisseurs().then(data => {
      setFournisseurs(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  // --- ACTIONS ---
  const handleOpenCreate = () => {
    setSelectedFournisseur(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (fournisseur: Fournisseur, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFournisseur(fournisseur);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (fournisseur: Fournisseur, e: React.MouseEvent) => {
    e.stopPropagation();
    setFournisseurToDelete(fournisseur);
    setIsDeleteModalOpen(true);
  };

  // --- SOUMISSION (Création / Modification) ---
  const handleSubmit = async (data: any) => {
    try {
      if (selectedFournisseur) {
        await achatApi.updateFournisseur(selectedFournisseur.id, data);
        toast.success("Fournisseur mis à jour");
      } else {
        await achatApi.createFournisseur(data);
        toast.success("Nouveau fournisseur ajouté");
      }
      setIsModalOpen(false);
      fetchFournisseurs(); // Rafraîchit la liste
    } catch (error) {
      toast.error("Une erreur est survenue");
    }
  };

  // --- SUPPRESSION ---
  const handleConfirmDelete = async () => {
    if (!fournisseurToDelete) return;
    setIsDeleting(true);
    try {
      await achatApi.deleteFournisseur(fournisseurToDelete.id);
      toast.success("Fournisseur supprimé");
      setIsDeleteModalOpen(false);
      fetchFournisseurs(); // Rafraîchit la liste
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredFournisseurs = fournisseurs.filter(f => 
    f.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<Fournisseur>[] = [
    {
      header: 'Fournisseur',
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
            <Truck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-900">{f.nom}</span>
        </div>
      )
    },
    {
      header: 'Contact',
      render: (f) => (
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-slate-600 flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {f.telephone}</span>
          <span className="text-[11px] text-slate-600 flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {f.email}</span>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      render: (f) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenEdit(f, e)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Modifier">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={(e) => handleOpenDelete(f, e)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors" title="Supprimer">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-4 max-w-[1200px] mx-auto pb-10">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            Achats & Fournisseurs
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            Gérez vos partenaires et passez de nouvelles commandes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate('/stock/achats/nouveau')}
            className="h-9 px-3 bg-white border border-slate-200 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            Nouvelle Commande <ArrowRight className="w-4 h-4" />
          </button>
          
          <button onClick={handleOpenCreate} className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
            <Plus className="w-4 h-4" />
            Nouveau Fournisseur
          </button>
        </div>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/90 ">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all"
          />
        </div>
      </div>

      {/* TABLEAU */}
      <DataTable 
        data={filteredFournisseurs}
        Columns={columns}
        isLoading={isLoading}
        keyExtractor={(f) => f.id}
      />

      {/* MODALES (Regroupées à la fin) */}
      
      {/* 1. Formulaire d'ajout/édition */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedFournisseur ? "Modifier le fournisseur" : "Nouveau fournisseur"}
        description={selectedFournisseur ? "Mettez à jour les coordonnées." : "Ajoutez un nouveau partenaire à votre liste."}
        maxWidth="md"
      >
        <FournisseurForm 
          initialData={selectedFournisseur}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {/* 2. Confirmation de suppression */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce fournisseur ?"
        description={`Êtes-vous sûr de vouloir supprimer ${fournisseurToDelete?.nom} ? Cette action est irréversible.`}
        isLoading={isDeleting}
      />

    </div>
  );
}