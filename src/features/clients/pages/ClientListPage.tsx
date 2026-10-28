import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Phone, Mail, PawPrint, Edit, Trash2 } from 'lucide-react';
import { clientApi } from '../api/clientApi';
import type { Client } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/shared/ui/Modal';
import { ClientForm } from '../components/ClientForm';

export function ClientListPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    
    // 2. État pour gérer l'ouverture de la modale
    const [isModalOpen, setIsModalOpen] = useState(false);

    // etat pour savoir si on modifie un client existant
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
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
    //Definition des colonnes du tableau
    const columns: Column<Client>[] = [
        {
            header: 'Client',
            render: (client) => (
                <div className="flex items-center gap-3">
                    {/** Avatar avec initiales */}
                    <div className="w-8 h-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-semibold text-xs shrink-0">
                        {client.nom.charAt(0)}{client.prenom.charAt(0)}
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-text-main">{client.nom} {client.prenom}</p>
                        <p className="text-xs text-text-muted mt-0.5">Inscrit le {new Date(client.dateInscription).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            render: (client) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Phone className="w-3 h-3 text-brand-dark" /> {client.telephone}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-text-muted">
                        <Mail className="w-3 h-3 text-text-muted" /> {client.email}
                    </div>
                </div>
            )
        }, {
            header: 'Animaux',
            render: (client) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-brand-light/30 rounded-lg text-brand-dark">
                        <PawPrint className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-text-main"> {client.animaux.length} </span>
                    <span className="text-text-muted text-xs">enregistré(s)</span>
                </div>
            )
        }, {
            header: 'Actions',
            className: 'text-right', // Aligne le contenu à droite
            render: (client) => (
                <div className="flex items-center justify-end gap-0.5">
          
                    {/* Bouton Voir */}
                    <button
                         onClick={(e) => {
                            e.stopPropagation(); 
                            navigate(`/clients/${client.id}`); 
                            }}
                        className="p-1.5 text-text-muted hover:text-brand-dark hover:bg-brand-light/30 rounded-lg transition-colors"
                        title="Voir la fiche"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>

                    {/* Bouton Modifier */}
                     <button
                        onClick={(e) => handleOpenEditModal(client, e)}
                        className="p-1.5 text-text-muted hover:text-brand-dark hover:bg-brand-light/30 rounded-lg transition-colors"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>

                    {/* Bouton Supprimer (Rouge) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            // Plus tard : ouvrir une modale de confirmation
                            if (window.confirm(`Voulez-vous vraiment supprimer ${client.nom} ?`)) {
                                console.log('Supprimer le client', client.id);
                            }
                        }}
                        className="p-1.5 text-text-muted hover:text-vet-danger hover:bg-vet-danger/10 rounded-lg transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>

                </div>
            )
        }
    ];

    return (
        <div className="space-y-5 max-w-[1600px] mx-auto pb-10">

            {/** ----- En tete de page ----- */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-text-main">Gestion des clients</h1>
                    <p className="text-xs text-text-muted mt-1">Retrouver les proprietaires et leurs animaux enregistrés.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, téléphone ou email…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-72 h-9 pl-9 pr-4 rounded-full bg-white border border-gray-100 text-xs text-text-main placeholder:text-text-muted shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-colors"
                        />
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="h-9 px-4 bg-brand-dark hover:bg-brand-medium text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
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

    </div>
  );
}
