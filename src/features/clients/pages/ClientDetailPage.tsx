// src/features/clients/pages/ClientDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Phone, Mail, MapPin, Plus, PawPrint, 
  Calendar, Edit, Cake, Weight, Eye, Trash2
} from 'lucide-react';
import { clientApi } from '../api/clientApi';
import type { Client, Animal } from '../types';
import { Modal } from '@/shared/ui/Modal';
import { AnimalForm } from '../components/AnimalForm';

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimalModalOpen, setIsAnimalModalOpen] = useState(false);

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

    setClient({
      ...client,
      animaux: [...client.animaux, newAnimal]
    });
    setIsAnimalModalOpen(false);
  };

  // --- SUPPRESSION D'UN ANIMAL ---
  const handleDeleteAnimal = (animalId: string, animalName: string) => {
    if (!client) return;
    if (window.confirm(`Voulez-vous vraiment supprimer le dossier de ${animalName} ?`)) {
      setClient({
        ...client,
        animaux: client.animaux.filter(a => a.id !== animalId)
      });
    }
  };

  if (isLoading) return <div className="p-10 text-sm text-text-muted animate-pulse">Chargement de la fiche...</div>;
  if (!client) return null;

  const speciesEmoji: Record<string, string> = {
    'Chien': '🐶', 'Chat': '🐱', 'Bovin': '🐮', 'Ovin': '🐑', 'Caprin': '🐐', 'Volaille': '🐔', 'Autre': '🐾'
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* --- BOUTON RETOUR --- */}
      <div>
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 text-xs font-semibold text-text-muted hover:text-brand-dark transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux clients
        </button>
      </div>

      {/* --- LAYOUT ASYMÉTRIQUE --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =======================================
            COLONNE GAUCHE (Profil)
            ======================================= */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Bannière supérieure */}
          <div className="h-24 bg-brand-dark relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          {/* Zone Avatar & Texte - CORRIGÉ ICI */}
          <div className="px-6 pb-6 relative flex flex-col">
            
            {/* L'avatar remonte avec une marge négative (-mt-10) */}
            <div className="-mt-10 w-20 h-20 rounded-2xl bg-white p-1 shadow-md relative z-10">
              <div className="w-full h-full rounded-xl bg-brand-light text-brand-dark flex items-center justify-center font-bold text-2xl">
                {client.nom.charAt(0)}{client.prenom.charAt(0)}
              </div>
            </div>
            
            {/* Le texte est poussé vers le bas avec mt-4 pour ne plus se chevaucher */}
            <div className="mt-4">
              <h1 className="text-xl font-bold text-text-main">{client.nom} {client.prenom}</h1>
              <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Client depuis le {new Date(client.dateInscription).toLocaleDateString('fr-FR')}
              </div>
            </div>

            {/* Bouton Modifier */}
            <button className="w-full mt-6 h-9 bg-gray-50 border border-gray-200 text-text-main hover:bg-gray-100 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
              <Edit className="w-3.5 h-3.5" />
              Modifier le profil
            </button>

            {/* Coordonnées */}
            <div className="mt-8 space-y-5">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-bg rounded-lg text-brand-dark"><Phone className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Téléphone</p>
                  <p className="text-sm font-medium text-text-main">{client.telephone}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-bg rounded-lg text-brand-dark"><Mail className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Email</p>
                  <p className="text-sm font-medium text-text-main">{client.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-brand-bg rounded-lg text-brand-dark"><MapPin className="w-4 h-4" /></div>
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">Adresse</p>
                  <p className="text-sm font-medium text-text-main">{client.adresse}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =======================================
            COLONNE DROITE (Animaux)
            ======================================= */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[500px]">
          
          {/* En-tête de la section Animaux */}
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-dark text-white rounded-lg">
                <PawPrint className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-text-main">Animaux enregistrés</h2>
                <p className="text-[11px] text-text-muted">Dossiers médicaux des patients</p>
              </div>
              <span className="bg-brand-light text-brand-dark text-xs font-bold px-2.5 py-0.5 rounded-md ml-2">
                {client.animaux.length}
              </span>
            </div>
            
            <button 
              onClick={() => setIsAnimalModalOpen(true)}
              className="h-8 px-3 bg-brand-dark hover:bg-brand-medium text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Nouvel animal
            </button>
          </div>

          {/* Tableau des Animaux */}
          <div className="flex-1 overflow-x-auto">
            {client.animaux.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-20 text-center">
                <PawPrint className="w-10 h-10 text-gray-200 mb-3" />
                <p className="text-sm font-bold text-text-main">Aucun animal</p>
                <p className="text-xs text-text-muted mt-1">Ce client n'a pas encore de dossier animal.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-white">
                    <th className="px-6 py-3">Patient</th>
                    <th className="px-6 py-3">Espèce & Race</th>
                    <th className="px-6 py-3">Âge</th>
                    <th className="px-6 py-3">Poids</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {client.animaux.map((animal) => {
                    const age = new Date().getFullYear() - new Date(animal.dateNaissance).getFullYear();
                    return (
                      <tr key={animal.id} className="hover:bg-brand-bg/50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-lg shadow-sm">
                              {speciesEmoji[animal.espece] || '🐾'}
                            </div>
                            <span className="text-sm font-bold text-text-main">{animal.nom}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-semibold text-text-main">{animal.espece}</p>
                          <p className="text-[11px] text-text-muted">{animal.race}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Cake className="w-3.5 h-3.5 text-gray-400" />
                            {age} an{age > 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Weight className="w-3.5 h-3.5 text-gray-400" />
                            {animal.poidsKg ? `${animal.poidsKg} kg` : '-'}
                          </div>
                        </td>
                        
                        {/* --- COLONNE ACTIONS (MISE À JOUR) --- */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            
                            {/* Bouton Voir */}
                            <button 
                              onClick={() => console.log('Ouvrir dossier médical', animal.id)}
                              className="p-1.5 text-gray-400 hover:text-brand-dark hover:bg-brand-light/50 rounded-lg transition-colors" 
                              title="Voir le dossier médical"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Bouton Modifier */}
                            <button 
                              onClick={() => console.log('Modifier animal', animal.id)}
                              className="p-1.5 text-gray-400 hover:text-vet-gold hover:bg-yellow-50 rounded-lg transition-colors" 
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            {/* Bouton Supprimer */}
                            <button 
                              onClick={() => handleDeleteAnimal(animal.id, animal.nom)}
                              className="p-1.5 text-gray-400 hover:text-vet-danger hover:bg-red-50 rounded-lg transition-colors" 
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
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
          onSubmit={handleAddAnimal}
          onCancel={() => setIsAnimalModalOpen(false)}
        />
      </Modal>

    </div>
  );
}