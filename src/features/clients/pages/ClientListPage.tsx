import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Phone, Mail, PawPrint, Edit, Trash2 } from 'lucide-react';
import { clientApi } from '../api/clientApi';
import type { Client } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/shared/ui/Modal';
import { ClientForm } from '../components/ClientForm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from 'sonner';

export function ClientListPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    // 2. État pour gérer l'ouverture de la modale
    const [isModalOpen, setIsModalOpen] = useState(false);

    // etat pour savoir si on modifie un client existant
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    //etat de suppression  
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        // ... (le code de chargement reste le même)
        const fetchClients = async () => {
        try {
            const data = await clientApi.getClients();
            setClients(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
        };
        fetchClients();
    }, []);

    //Fonction pour ouvrir la modale en mode Creation
    const handleOpenCreateModal = () => {
        setSelectedClient(null); // on vide le client
        setIsModalOpen(true);
    };

    //Fonction pour ouvrir la modale en mode edition
    const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation(); // empeche l'ouverture de la fiche detaillee
        setSelectedClient(client);
        setIsModalOpen(true);
    }

     // Ouvre la modale de suppression
    const handleOpenDelete = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setClientToDelete(client);
        setIsDeleteModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    setIsDeleting(true);
    try {
      // Simulation appel API
      await new Promise(resolve => setTimeout(resolve, 500));
      setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
      toast.success("Client supprimé avec succès");
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };
    // Fonction de soumission (gere l'ajout et la modification)
    const handleSubmit = async (data: any) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        if (selectedClient) {
            //on met a jour la liste
            setClients(clients.map(c => c.id === selectedClient.id ? {
                ...c, ...data
            } : c));
        } else {
            const newClient: Client = {
                ...data,
                id: `CLI-00${clients.length + 1}`,
                dateInscription: new Date().toISOString().split('T')[0],
                animaux: []
            };
            setClients([newClient, ...clients]);
        }
        setIsModalOpen(false);
    };

    const filteredClients = clients.filter((client) => 
        `${client.nom} ${client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telephone.includes(searchTerm)
    );
    // Définition des colonnes du tableau
    const columns: Column<Client>[] = [
        {
            header: 'Client',
            render: (client) => (
                <div className="flex items-center gap-2.5">
                    {/* Monogramme Avatar */}
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px] shrink-0 ring-1 ring-emerald-200/70">
                        {client.nom.charAt(0)}{client.prenom.charAt(0)}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-slate-800 leading-tight">{client.nom} {client.prenom}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                            {new Date(client.dateInscription).toLocaleDateString('fr-FR')}
                        </p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            render: (client) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                        <Phone className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="font-mono">{client.telephone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        {client.email}
                    </div>
                </div>
            )
        },
        {
            header: 'Animaux',
            render: (client) => (
                <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200/70 text-[11px] font-semibold text-violet-700">
                        <PawPrint className="w-3 h-3" />
                        {client.animaux.length}
                    </span>
                    <span className="text-[11px] text-slate-400">animal{client.animaux.length > 1 ? 'aux' : ''}</span>
                </div>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (client) => (
                <div className="flex items-center justify-end gap-0.5">
                    {/* Voir la fiche */}
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Voir la fiche"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                    {/* Modifier */}
                    <button
                        onClick={(e) => handleOpenEditModal(client, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Modifier"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
                    {/* Supprimer */}
                    <button
                        onClick={(e) => handleOpenDelete(client, e)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-10">

            {/* ---- En-tête de page Premium ---- */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-slate-900">Gestion des Clients</h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        Propriétaires et animaux enregistrés ·{' '}
                        <span className="font-mono font-semibold text-slate-700">{filteredClients.length}</span> résultat{filteredClients.length > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Barre de recherche */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Nom, téléphone…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-56 h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 shadow-[0_1px_2px_rgba(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/60 transition-all"
                        />
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
                        <Plus className="w-3.5 h-3.5" />
                        Nouveau Client
                    </button>
                </div>
            </div>

            {/* TABLEAU */}
      <DataTable 
        data={filteredClients}
        Columns={columns}
        isLoading={isLoading}
        keyExtractor={(client) => client.id}
      />

      {/* 5. LA MODALE */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajouter un nouveau client"
        description="Saisissez les informations du propriétaire. Les animaux pourront être ajoutés après."
        maxWidth="lg"
      >
         <ClientForm 
             initialData={selectedClient || undefined }
             onSubmit={handleSubmit}
             onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
      
    <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce client ?"
        description={`Êtes-vous sûr de vouloir supprimer ${clientToDelete?.nom} ${clientToDelete?.prenom} ? Tous ses animaux et son historique seront définitivement perdus.`}
        isLoading={isDeleting}
      />

    </div>
  );
}
