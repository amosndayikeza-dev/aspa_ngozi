// src/features/clients/pages/ClientDetailPage.tsx
import { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Mail, MapPin, Plus, PawPrint, 
  Calendar, Edit, Cake, Weight, Eye, Trash2
} from 'lucide-react';
import { clientApi } from '../api/clientApi';
import type { Client, Animal } from '../types';
import { Modal } from '@/shared/ui/Modal';
import { AnimalForm } from '../components/AnimalForm';
import { ClientForm } from '../components/ClientForm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from 'sonner';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // etat de supprssion
  const [isDeleteAnimalModalOpen, setIsDeleteAnimalModalOpen] = useState(false);
  const [animalToDelete, setAnimalToDelete] = useState<Animal | null>(null);
  const [isDeletingAnimal, setIsDeletingAnimal] = useState(false);

  // animal en cours de manipulation
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      if (!id) return;
      try {
        const data = await clientApi.getClientById(id);
        setClient(data || null);
      } catch (error) {
        console.error("Client introuvable", error);
        navigate('/clients');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClient();
  }, [id, navigate]);
  

  // --- AJOUT D'UN ANIMAL ---
  const handleAddAnimal = async (data: any) => {
    if (!client) return;
    
    await new Promise(resolve => setTimeout(resolve, 600));

    const newAnimal: Animal = {
      ...data,
      id: `AN-${Math.floor(Math.random() * 10000)}`,
    };

    if (selectedAnimal) {
      const updatedAnimals = client.animaux.map(a => a.id === selectedAnimal.id ? { ...a, ...data } : a);
      setClient({ ...client, animaux: updatedAnimals });
      toast.success("Les informations de l'animal ont ete mises a jour");
    } else {
      // mode creation 
      const newAnimal: Animal = { ...data, id: `AN-${Math.floor(Math.random() * 10000)}` };
      setClient({ ...client, animaux: [...client.animaux, newAnimal] });
    }

    setIsAnimalModalOpen(false);
    setSelectedAnimal(null);
  };

  // Ouvre la modale de suppression
  const handleOpenDeleteAnimal = (animal: Animal) => {
    setAnimalToDelete(animal);
    setIsDeleteAnimalModalOpen(true);
  };

  // Exécute la suppression
  const handleConfirmDeleteAnimal = async () => {
    if (!client || !animalToDelete) return;
    setIsDeletingAnimal(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setClient({ ...client, animaux: client.animaux.filter(a => a.id !== animalToDelete.id) });
      toast.success(`Le dossier de ${animalToDelete.nom} a été supprimé`);
      setIsDeleteAnimalModalOpen(false);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeletingAnimal(false);
      setAnimalToDelete(null);
    }
  };

  // action des boutons pour animal
  const handleOpenCreateAnimal = () => {
    setSelectedAnimal(null);
    setIsAnimalModalOpen(true);
  };

  const handleOpenEditAnimal = (animal: Animal) => {
  setSelectedAnimal(animal);      
  setIsAnimalModalOpen(true);     
};

  const handleOpenViewAnimal = (animal: Animal) => {
    setSelectedAnimal(animal);
    setIsViewModalOpen(true);
  };

  // --- mofication du client ---
  const handleUpdateClient = async (data: any) => {
    if (!client) return;
    await new Promise(resolve => setTimeout(resolve, 600));

    // on met a jour le state local
    setClient({ ...client, ...data });
    setIsClientModalOpen(false);
  };

  if (isLoading) return <div className="p-5 text-sm text-text-muted animate-pulse">Chargement de la fiche...</div>;
  if (!client) return null;

  const speciesEmoji: Record<string, string> = {
    'Chien': '🐶', 'Chat': '🐱', 'Bovin': '🐮', 'Ovin': '🐑', 'Caprin': '🐐', 'Volaille': '🐔', 'Autre': '🐾'
  };

  return (
    <div className="space-y-4 max-w-[1600px] mx-auto pb-10">

      {/* --- Fil d'Ariane retour --- */}
      <div>
        <button
          onClick={() => navigate('/clients')}
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux clients
        </button>
      </div>

      {/* --- LAYOUT ASYMÉTRIQUE 4+8 --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">

        {/* ============================================
            COLONNE GAUCHE — Profil Client
            ============================================ */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
          {/* Accent stripe emerald */}
          <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-400" />

          <div className="p-4 flex flex-col">
            {/* Avatar + nom */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-emerald-200/60">
                {client.nom.charAt(0)}{client.prenom.charAt(0)}
              </div>
              <div className="min-w-0 pt-0.5">
                <h1 className="text-sm font-bold text-slate-900 truncate">{client.nom} {client.prenom}</h1>
                <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>Depuis le <span className="font-mono">{new Date(client.dateInscription).toLocaleDateString('fr-FR')}</span></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsClientModalOpen(true)}
              className="w-full mt-4 h-8 bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Edit className="w-3.5 h-3.5" />
              Modifier le profil
            </button>

            {/* Contacts */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 shrink-0">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Téléphone</p>
                  <p className="text-xs font-mono text-slate-800">{client.telephone}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-slate-50 border border-slate-200/70 rounded-lg text-slate-500 shrink-0">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-xs text-slate-800 break-all">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 bg-slate-50 border border-slate-200/70 rounded-lg text-slate-500 shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Adresse</p>
                  <p className="text-xs text-slate-800">{client.adresse}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================
            COLONNE DROITE — Animaux (table haute densité)
            ============================================ */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col">

          {/* En-tête section animaux */}
          <div className="px-4 py-3 border-b border-slate-100 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-violet-50 border border-violet-100 rounded-lg text-violet-600">
                <PawPrint className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-slate-900">Animaux enregistrés</h2>
                <p className="text-[11px] text-slate-400">Dossiers patients de ce propriétaire</p>
              </div>
              <span className="ml-1 bg-violet-100 text-violet-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-violet-200/70">
                {client.animaux.length}
              </span>
            </div>

            <button
              onClick={handleOpenCreateAnimal}
              className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvel animal
            </button>
          </div>

          {/* Table des animaux */}
          <div className="flex-1 overflow-x-auto">
            {client.animaux.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-14 text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-center mb-2.5">
                  <PawPrint className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Aucun animal</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Ce client n'a pas encore de dossier animal.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-3.5 py-2">Patient</th>
                    <th className="px-3.5 py-2">Espèce & Race</th>
                    <th className="px-3.5 py-2">Âge</th>
                    <th className="px-3.5 py-2">Poids</th>
                    <th className="px-3.5 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/80">
                  {client.animaux.map((animal) => {
                    const age = new Date().getFullYear() - new Date(animal.dateNaissance).getFullYear();
                    return (
                      <tr key={animal.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-base shrink-0">
                              {speciesEmoji[animal.espece] || '🐾'}
                            </div>
                            <span className="text-xs font-semibold text-slate-800">{animal.nom}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2">
                          <p className="text-xs font-medium text-slate-800">{animal.espece}</p>
                          <p className="text-[11px] text-slate-400">{animal.race}</p>
                        </td>
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Cake className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">{age} an{age > 1 ? 's' : ''}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2">
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Weight className="w-3 h-3 text-slate-400" />
                            <span className="font-mono">{animal.poidsKg ? `${animal.poidsKg} kg` : '—'}</span>
                          </div>
                        </td>
                        <td className="px-3.5 py-2 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              onClick={() => handleOpenViewAnimal(animal)}
                              className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Voir le dossier"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditAnimal(animal)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenDeleteAnimal(animal)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* --- MODALE D'AJOUT D'ANIMAL --- */}
      <Modal
        isOpen={isAnimalModalOpen}
        onClose={() => setIsAnimalModalOpen(false)}
        title="Ajouter un animal"
        description={`Créer un dossier pour un animal appartenant à ${client.nom} ${client.prenom}.`}
        maxWidth="lg"
      >
        <AnimalForm 
          initialData={selectedAnimal}
          onSubmit={handleAddAnimal}
          onCancel={() => setIsAnimalModalOpen(false)}
        />
      </Modal>

      {/* 2. Modale : Voir l'animal (Fiche rapide) */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Dossier de l'animal"
        maxWidth="sm"
      >
        {selectedAnimal && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-2xl shadow-sm">
                {speciesEmoji[selectedAnimal.espece] || '🐾'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-main">{selectedAnimal.nom}</h3>
                <p className="text-xs font-medium text-brand-medium">{selectedAnimal.espece} • {selectedAnimal.race}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Date de naissance</p>
                <p className="text-sm font-semibold text-text-main">{new Date(selectedAnimal.dateNaissance).toLocaleDateString('fr-FR')}</p>
              </div>
              <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
                <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Poids</p>
                <p className="text-sm font-semibold text-text-main">{selectedAnimal.poidsKg ? `${selectedAnimal.poidsKg} kg` : 'Non renseigné'}</p>
              </div>
            </div>

            <div className="p-3 border border-gray-100 rounded-xl bg-white shadow-sm">
               <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Identifiant unique</p>
               <p className="text-sm font-mono text-text-main">{selectedAnimal.id}</p>
            </div>

            <div className="pt-4 flex justify-end">
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

      {/** MODALE CLIENT */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title="Modifier le client"
        description='Mettre a jour les informations du proprietaire.'
        maxWidth='lg'
      >
        <ClientForm
          initialData={client}
          onSubmit={handleUpdateClient}
          onCancel={() =>setIsClientModalOpen(false)}
        />

      </Modal>

      <ConfirmDialog
        isOpen={isDeleteAnimalModalOpen}
        onClose={() => setIsDeleteAnimalModalOpen(false)}
        onConfirm={handleConfirmDeleteAnimal}
        title="Supprimer cet animal ?"
        description={`Voulez-vous vraiment supprimer le dossier de ${animalToDelete?.nom} ? Cette action est irréversible.`}
        isLoading={isDeletingAnimal}
      />

    </div>
  );
}
