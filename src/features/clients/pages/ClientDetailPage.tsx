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

  // --- SUPPRESSION D'UN ANIMAL ---
  const handleDeleteAnimal = (animalId: string, animalName: string) => {
    if (!client) return;
    if (window.confirm(`Voulez-vous vraiment supprimer le dossier de ${animalName} ?`)) {
      setClient({
        ...client,
        animaux: client.animaux.filter(a => a.id !== animalId)
      });
      toast.success(`Le dossier de ${animalName} a été  supprimé`);
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
    <div className="space-y-5 max-w-[1600px] mx-auto pb-10">
      
      {/* --- BOUTON RETOUR --- */}
      <div>
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-brand-dark hover:bg-gray-50 transition-colors px-2.5 py-1.5 rounded-lg w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Retour aux clients
        </button>
      </div>

      {/* --- LAYOUT ASYMÉTRIQUE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* =======================================
            COLONNE GAUCHE (Profil)
            ======================================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-1 bg-brand-dark" />

          <div className="p-5 flex flex-col">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-brand-light text-brand-dark flex items-center justify-center font-semibold text-sm shrink-0">
                {client.nom.charAt(0)}{client.prenom.charAt(0)}
              </div>
              <div className="min-w-0 pt-0.5">
                <h1 className="text-sm font-semibold text-text-main truncate">{client.nom} {client.prenom}</h1>
                <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Client depuis le {new Date(client.dateInscription).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsClientModalOpen(true)}
              className="w-full mt-5 h-8 bg-gray-50 text-text-muted hover:text-brand-dark hover:bg-brand-light/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
              <Edit className="w-3.5 h-3.5" />
              Modifier le profil
            </button>

            <div className="mt-5 pt-5 border-t border-gray-100 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand-light/30 rounded-lg text-brand-dark"><Phone className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">Téléphone</p>
                  <p className="text-sm text-text-main">{client.telephone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand-light/30 rounded-lg text-brand-dark"><Mail className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm text-text-main">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-brand-light/30 rounded-lg text-brand-dark"><MapPin className="w-3.5 h-3.5" /></div>
                <div>
                  <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-0.5">Adresse</p>
                  <p className="text-sm text-text-main">{client.adresse}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================
            COLONNE DROITE (Animaux)
            ======================================= */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
          
          {/* En-tête de la section Animaux */}
          <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-brand-light/30 text-brand-dark rounded-lg">
                <PawPrint className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-text-main">Animaux enregistrés</h2>
                <p className="text-xs text-text-muted">Dossiers médicaux des patients</p>
              </div>
              <span className="bg-brand-light text-brand-dark text-xs font-semibold px-2 py-0.5 rounded-md">
                {client.animaux.length}
              </span>
            </div>
            
            <button 
              onClick={handleOpenCreateAnimal}
              className="h-8 px-3 bg-brand-dark hover:bg-brand-medium text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvel animal
            </button>
          </div>

          {/* Tableau des Animaux */}
          <div className="flex-1 overflow-x-auto">
            {client.animaux.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-3">
                  <PawPrint className="w-5 h-5 text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-main">Aucun animal</p>
                <p className="text-xs text-text-muted mt-1">Ce client n'a pas encore de dossier animal.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-xs font-semibold text-text-muted uppercase tracking-wider bg-gray-50">
                    <th className="px-4 py-2.5">Patient</th>
                    <th className="px-4 py-2.5">Espèce & Race</th>
                    <th className="px-4 py-2.5">Âge</th>
                    <th className="px-4 py-2.5">Poids</th>
                    <th className="px-4 py-2.5 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {client.animaux.map((animal) => {
                    const age = new Date().getFullYear() - new Date(animal.dateNaissance).getFullYear();
                    return (
                      <tr key={animal.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-light/30 flex items-center justify-center text-sm">
                              {speciesEmoji[animal.espece] || '🐾'}
                            </div>
                            <span className="text-xs font-semibold text-text-main">{animal.nom}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-medium text-text-main">{animal.espece}</p>
                          <p className="text-xs text-text-muted">{animal.race}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Cake className="w-3.5 h-3.5" />
                            {age} an{age > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Weight className="w-3.5 h-3.5" />
                            {animal.poidsKg ? `${animal.poidsKg} kg` : '-'}
                          </div>
                        </td>
                        
                        {/* --- COLONNE ACTIONS (MISE À JOUR) --- */}
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            
                            {/* Bouton Voir */}
                            <button 
                              onClick={() => handleOpenViewAnimal(animal)}
                              className="p-1.5 text-text-muted hover:text-brand-dark hover:bg-brand-light/30 rounded-lg transition-colors" 
                              title="Voir le dossier médical"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Bouton Modifier */}
                            <button 
                              onClick={() => handleOpenEditAnimal(animal) }
                              className="p-1.5 text-text-muted hover:text-brand-dark hover:bg-brand-light/30 rounded-lg transition-colors" 
                              title="Modifier"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Bouton Supprimer */}
                            <button 
                              onClick={() => handleDeleteAnimal(animal.id, animal.nom)}
                              className="p-1.5 text-text-muted hover:text-vet-danger hover:bg-vet-danger/10 rounded-lg transition-colors" 
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

    </div>
  );
}
