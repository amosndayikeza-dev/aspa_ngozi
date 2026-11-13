// src/features/clients/pages/ClientListPage.tsx
import { useState, useEffect } from 'react';
import { 
  Plus, Search, Eye, Phone, Mail, PawPrint, Edit, Trash2, Wallet,
  ChevronLeft, ChevronRight // <-- Ajout des icônes de pagination
} from 'lucide-react';
import { clientApi } from '../api/clientApi';
import type { Client } from '../types';
import { DataTable, type Column } from '@/shared/ui/DataTable';
import { useNavigate } from 'react-router-dom';
import { Modal } from '@/shared/ui/Modal';
import { ClientForm } from '../components/ClientForm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { ResultDialog } from '@/shared/ui/ResultDialog';
import { toast } from 'sonner';
import { detteApi } from '@/features/dettes/api/detteApi';
import { cn } from '@/shared/lib/cn';

const ITEMS_PER_PAGE = 10; // Nombre de clients par page

export function ClientListPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // --- ÉTATS POUR LA PAGINATION ---
    const [currentPage, setCurrentPage] = useState(1);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Map des dettes par client
    const [dettesMap, setDettesMap] = useState<Record<string, number>>({});

    // Popup résultat CRUD
    const [resultDialog, setResultDialog] = useState<{
        open: boolean;
        variant: 'success' | 'error';
        title: string;
        description?: string;
    }>({ open: false, variant: 'success', title: '' });

    // Chargement des clients + dettes
    const loadData = async () => {
        setIsLoading(true);
        try {
            const clientsData = await clientApi.getClients();
            setClients(clientsData);

            const dettesEntries = await Promise.all(
                clientsData.map(async (c) => {
                    try {
                        const du = await detteApi.getTotalDuByClient(c.id);
                        return [c.id, du] as [string, number];
                    } catch {
                        return [c.id, 0] as [string, number];
                    }
                })
            );

            setDettesMap(
                Object.fromEntries(dettesEntries.filter(([_, du]) => du > 0))
            );
        } catch (error) {
            console.error(error);
            toast.error("Erreur de chargement");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Réinitialiser la page quand on tape dans la recherche
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleOpenCreateModal = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleOpenDelete = (client: Client, e: React.MouseEvent) => {
        e.stopPropagation();
        setClientToDelete(client);
        setIsDeleteModalOpen(true);
    };

    const extractErrorMessage = (e: any, fallback: string): string => {
        if (typeof e === 'string') return e;
        if (e?.message) return e.message;
        return fallback;
    };

    const handleConfirmDelete = async () => {
        if (!clientToDelete) return;
        setIsDeleting(true);
        try {
            await clientApi.deleteClient(clientToDelete.id);
            setClients((prev) => prev.filter((c) => c.id !== clientToDelete.id));
            toast.success("Client supprimé avec succès");
            setIsDeleteModalOpen(false);

            setResultDialog({
                open: true,
                variant: 'success',
                title: 'Client supprimé',
                description: `Le dossier de "${clientToDelete.nom} ${clientToDelete.prenom}" a été supprimé.`,
            });
        } catch (error: any) {
            const message = extractErrorMessage(error, "Erreur lors de la suppression");
            toast.error(message);

            setResultDialog({
                open: true,
                variant: 'error',
                title: 'Suppression impossible',
                description: message,
            });
        } finally {
            setIsDeleting(false);
            setClientToDelete(null);
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            if (selectedClient) {
                const updated = await clientApi.updateClient(selectedClient.id, data);
                setClients(clients.map(c => c.id === selectedClient.id ? { ...c, ...updated } : c));
                toast.success("Client mis à jour avec succès");

                setResultDialog({
                    open: true,
                    variant: 'success',
                    title: 'Client modifié',
                    description: `Les informations de "${data.nom} ${data.prenom}" ont été mises à jour.`,
                });
            } else {
                const newClient = await clientApi.createClient(data);
                setClients([newClient, ...clients]);
                toast.success("Client ajouté avec succès");

                setResultDialog({
                    open: true,
                    variant: 'success',
                    title: 'Client créé',
                    description: `"${data.nom} ${data.prenom}" a été ajouté à votre fichier client.`,
                });
            }
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            const message = extractErrorMessage(error, "Erreur lors de l'enregistrement");
            toast.error(message);

            setResultDialog({
                open: true,
                variant: 'error',
                title: 'Enregistrement impossible',
                description: message,
            });
        }
    };

    const filteredClients = clients.filter((client) =>
        `${client.nom} ${client.prenom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.telephone.includes(searchTerm)
    );

    // --- LOGIQUE DE PAGINATION ---
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentClients = filteredClients.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

    const columns: Column<Client>[] = [
        {
            header: 'Client',
            render: (client) => (
                <div className="flex items-center gap-2.5">
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
            header: 'Dette',
            render: (client) => {
                const du = dettesMap[client.id] || 0;
                if (du === 0) {
                    return <span className="text-[11px] text-slate-300">—</span>;
                }
                return (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate('/dettes');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Voir les dettes"
                    >
                        <Wallet className="w-3 h-3" />
                        {du.toLocaleString('fr-FR')} FBU
                    </button>
                );
            }
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (client) => (
                <div className="flex items-center justify-end gap-0.5">
                    <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                        className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        title="Voir la fiche"
                    >
                        <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={(e) => handleOpenEditModal(client, e)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Modifier"
                    >
                        <Edit className="w-3.5 h-3.5" />
                    </button>
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

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-sm font-bold tracking-tight text-slate-900">Gestion des Clients</h1>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                        Propriétaires et animaux enregistrés ·{' '}
                        <span className="font-mono font-semibold text-slate-700">{filteredClients.length}</span> résultat{filteredClients.length > 1 ? 's' : ''}
                    </p>
                </div>
                <div className="flex items-center gap-2">
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

            {/* TABLEAU (avec currentClients et 'columns' minuscule) */}
            <DataTable
                data={currentClients}
                Columns={columns}
                isLoading={isLoading}
                keyExtractor={(client) => client.id}
            />

            {/* --- PAGINATION --- */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 bg-white border border-slate-200/90 rounded-xl shadow-sm">
                    <p className="text-[11px] text-slate-500">
                        Affichage de <span className="font-bold text-slate-800">{indexOfFirstItem + 1}</span> à{' '}
                        <span className="font-bold text-slate-800">{Math.min(indexOfLastItem, filteredClients.length)}</span> sur{' '}
                        <span className="font-bold text-slate-800">{filteredClients.length}</span> clients
                    </p>

                    <div className="flex items-center gap-1">
                        {/* Précédent */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        {/* Pages */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                            // Logique pour n'afficher que 5 boutons max
                            if (totalPages > 5 && Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) {
                                if (page === 2 || page === totalPages - 1) return <span key={page} className="px-1 text-slate-400 text-[11px]">...</span>;
                                return null;
                            }

                            return (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={cn(
                                        "min-w-[26px] h-7 px-1.5 rounded-md text-[11px] font-bold transition-colors",
                                        currentPage === page
                                            ? "bg-emerald-600 text-white shadow-sm"
                                            : "text-slate-600 hover:bg-slate-100"
                                    )}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        {/* Suivant */}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* MODALES */}
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

            <ResultDialog
                isOpen={resultDialog.open}
                onClose={() => setResultDialog({ ...resultDialog, open: false })}
                variant={resultDialog.variant}
                title={resultDialog.title}
                description={resultDialog.description}
            />

        </div>
    );
}