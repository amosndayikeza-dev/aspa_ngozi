import { resolve } from "node:dns";
import type { Animal, Client } from "../types";
import { data } from "react-router-dom";

/**
 * Base de donnee fictive (mock)
 * ces donnees simulent ce que le backend renverra plus tard
 */

const MOCK_CLIENTS: Client[] = [
    {
        id: 'CLI-001',
        nom: 'Rakoto',
        prenom: 'Jean',
        telephone: '034 12 345 67',
        email: 'jean.rakoto@email.mg',
        adresse: 'Lot II A 45, Antananarivo',
        dateInscription: '2025-01-15',
        animaux: [
            { id: 'AN-001', nom: 'Rex', espece: 'Chien', race: 'Berger Allemand', dateNaissance: '2021-05-10', poidsKg: 32 },
            { id: 'AN-002', nom: 'Minou', espece: 'Chat', race: 'Européen', dateNaissance: '2022-08-20', poidsKg: 4.5 }
        ]
    },
    {
        id: 'CLI-002',
        nom: 'Randria',
        prenom: 'Sarah',
        telephone: '033 98 765 43',
        email: 'sarah.randria@email.mg',
        adresse: 'Villa Rose, Toamasina',
        dateInscription: '2025-03-22',
        animaux: [
            { id: 'AN-003', nom: 'Bella', espece: 'Chien', race: 'Golden Retriever', dateNaissance: '2020-11-05', poidsKg: 28 }
        ]
    },
    {
        id: 'CLI-003',
        nom: 'Élevage',
        prenom: 'Kazoza',
        telephone: '032 11 223 34',
        email: 'contact@kazoza.mg',
        adresse: 'Route Nationale 2, Moramanga',
        dateInscription: '2024-10-05',
        animaux: [
            { id: 'AN-004', nom: 'Vache-01', espece: 'Bovin', race: 'Zébu', dateNaissance: '2023-01-15', poidsKg: 250 },
            { id: 'AN-005', nom: 'Vache-02', espece: 'Bovin', race: 'Zébu', dateNaissance: '2023-02-10', poidsKg: 240 }
        ]
    }
];

/**
 * API de gestion des clients
 * Actuellement branchee sur des donnees mockees.
 */

export const clientApi = {

    /**
     * recupere la liste de tout les clients
     * simule un delais reseau de 600ms pour tester les etats de chragement (skeletons)
     */

    getClients: async (): Promise<Client[]> => {
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_CLIENTS), 600);
        });
    },

     /**
     * Récupère un client spécifique par son ID.
     * Simule un délai réseau pour tester le chargement.
     */
    getClientById: async (id: string): Promise<Client | undefined> => {
        return new Promise((resolve, reject) => {
        setTimeout(() => {
            const client = MOCK_CLIENTS.find((c) => c.id === id);
            if (client) {
            resolve(client);
            } else {
            reject(new Error("Client introuvable"));
            }
        }, 400);
        });
    },

    /**
     * modification du client
     */

    updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Dans une vraie API, le backend ferait la mise à jour en base.
        // Ici, on renvoie juste les données fusionnées.
        resolve({ id, ...data } as Client); 
      }, 500);
    });
    },
    
    /**
     *  mise a jour de l'animal
     */
    updateAnimal: async (clientId: string, animalId: string, data: Partial<Animal>): Promise<Animal> => {
        return new Promise((resolve) => {
            setTimeout(() => {
            resolve({ id: animalId, ...data } as Animal);
            }, 500);
        });
    }
};