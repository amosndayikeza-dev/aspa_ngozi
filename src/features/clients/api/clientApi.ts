import { callBackend } from '../../../shared/lib/tauri';
import type { Animal, Client } from '../types';

/**
 * Transforme les données brutes renvoyées par Rust (snake_case/camelCase partiel)
 * vers l'interface `Client` attendue par React.
 */
const mapClient = (c: any): Client => ({
  ...c,
  // On mappe createdAt (Rust) vers dateInscription (React)
  dateInscription: c.createdAt || new Date().toISOString(),
  // On initialise un tableau vide pour les animaux (qui seront ajoutés en Phase 4)
  animaux: c.animaux || [],
});

/**
 * API de gestion des clients.
 * Branchée sur le backend Rust via Tauri (IPC).
 */
export const clientApi = {

  /**
   * Récupère la liste de tous les clients depuis la base de données.
   */
  getClients: async (): Promise<Client[]> => {
    const clients = await callBackend<any[]>('list_clients');
    return clients.map(mapClient); // ✅ On applique le mapper
  },

  /**
   * Récupère un client spécifique par son ID.
   */
  getClientById: async (id: string): Promise<Client> => {
    const c = await callBackend<any>('get_client', { id });
    return mapClient(c); // ✅ On applique le mapper
  },

  /**
   * Crée un nouveau client dans la base de données.
   */
  createClient: async (data: Omit<Client, 'id' | 'dateInscription' | 'animaux'>): Promise<Client> => {
    const c = await callBackend<any>('create_client', { data });
    return mapClient(c); // ✅ On applique le mapper
  },

  /**
   * Met à jour un client existant.
   */
  updateClient: async (id: string, data: Partial<Client>): Promise<Client> => {
    const c = await callBackend<any>('update_client', { id, data });
    return mapClient(c); // ✅ On applique le mapper
  },

  /**
   * Supprime un client.
   */
  deleteClient: async (id: string): Promise<void> => {
    return callBackend<void>('delete_client', { id });
  },

  /**
   * Met à jour un animal existant.
   * (Commande à créer en Phase 4)
   */
  updateAnimal: async (clientId: string, animalId: string, data: Partial<Animal>): Promise<Animal> => {
    return callBackend<Animal>('update_animal', { clientId, animalId, data });
  }
};