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

    // 3. Fonction de soumission du formulaire
    const handleCreateClient = async (data: any) => {
        // Pour l'instant, on simule l'ajout dans le state local
        const newClient: Client = {
        ...data,
        id: `CLI-00${clients.length + 1}`,
        dateInscription: new Date().toISOString().split('T')[0],
        animaux: []
        };
        
        // Simulation d'un appel API
        await new Promise(resolve => setTimeout(resolve, 800)); 
        
        setClients([newClient, ...clients]);
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
                    <div className="w-8 h-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-xs shrink-0">
                        {client.nom.charAt(0)}{client.prenom.charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-text-main">{client.nom} {client.prenom}</p>
                        <p className="text-[11px] text-text-muted mt-0.5">Inscrit le {new Date(client.dateInscription).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            render: (client) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <Phone className="w-3 h-3 text-brand-dark" /> {client.telephone}
                    </div>
                    <div className="flex items-center gap-1.5 text-text-muted">
                        <Mail className="w-3 h-3 text-vet-gold" /> {client.email}
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
                    <span className="font-medium text-text-main"> {client.animaux.length} </span>
                    <span className="text-text-muted text-[11px]">enregistré(s)</span>
                </div>
            )
        }, {
            header: 'Actions',
            className: 'text-right', // Aligne le contenu à droite
            render: (client) => (
                <div className="flex items-center justify-end gap-1">
          
                    {/* Bouton Voir */}
                    <button
                         onClick={(e) => {
                            e.stopPropagation(); 
                            navigate(`/clients/${client.id}`); 
                            }}
                        className="p-1.5  text-brand-dark hover:text-gray-400 hover:bg-brand-light/50 rounded-lg transition-colors"
                        title="Voir la fiche"
                    >
                        <Eye className="w-4 h-4" />
                    </button>

                    {/* Bouton Modifier */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('Modifier le client', client.id);
                            // Plus tard : ouvrir la modale d'édition
                        }}
                        className="p-1.5 text-vet-gold  hover:text-gray-400 hover:bg-yellow-200 rounded-lg transition-colors"
                        title="Modifier"
                    >
                        <Edit className="w-4 h-4" />
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
                        className="p-1.5 text-vet-danger  hover:text-gray-400 hover:bg-red-200 rounded-lg transition-colors"
                        title="Supprimer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                </div>
            )
        }
    ];

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

            {/** ----- En tete de page ----- */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-xl font-bold text-text-main"> Gestion des clients</h1>
                    <p className="text-xs text-text-muted mt-1"> Retrouver les proprietaires et leurs animaux enregistrés.</p>
                </div>
                <button className=" h-9 px-4 bg-brand-dark hover:bg-brand-medium text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow">
                    <Plus />
                    Nouveau Client
                </button>
            </div>

            {/**---- Barre d'outil (recherche) ------- */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par nom, téléphone  ou email ..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-transparent text-xs text-text-main placeholder:text-gray-400 focus:outline-none"
                    />
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
          onSubmit={handleCreateClient}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

    </div>
  );
}