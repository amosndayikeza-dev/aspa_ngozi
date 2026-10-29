// src/features/stock/api/achatApi.ts
import type { Fournisseur } from '../types';

const MOCK_FOURNISSEURS: Fournisseur[] = [
  { id: 'F-01', nom: 'Centravet Madagascar' },
  { id: 'F-02', nom: 'PharmaVet Distribution' },
  { id: 'F-03', nom: 'Local Grossiste' }
];

export const achatApi = {
  getFournisseurs: async (): Promise<Fournisseur[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_FOURNISSEURS), 300));
  },
  createAchat: async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 800));
  }
};