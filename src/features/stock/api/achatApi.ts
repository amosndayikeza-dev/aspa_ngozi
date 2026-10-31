import type { Fournisseur } from '../types';

let MOCK_FOURNISSEURS: Fournisseur[] = [
  { id: 'F-01', nom: 'Centravet Madagascar', telephone: '034 11 222 33', email: 'contact@centravet.mg' },
  { id: 'F-02', nom: 'PharmaVet Distribution', telephone: '033 44 555 66', email: 'ventes@pharmavet.mg' },
  { id: 'F-03', nom: 'Local Grossiste', telephone: '032 77 888 99', email: 'info@localgrossiste.mg' }
];

export const achatApi = {
  getFournisseurs: async (): Promise<Fournisseur[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_FOURNISSEURS]), 300));
  },
  
  createFournisseur: async (data: Omit<Fournisseur, 'id'>): Promise<Fournisseur> => {
    return new Promise((resolve) => {
      const newF = { ...data, id: `F-0${MOCK_FOURNISSEURS.length + 1}` };
      MOCK_FOURNISSEURS = [newF, ...MOCK_FOURNISSEURS];
      setTimeout(() => resolve(newF), 500);
    });
  },

  updateFournisseur: async (id: string, data: Partial<Fournisseur>): Promise<Fournisseur> => {
    return new Promise((resolve) => {
      MOCK_FOURNISSEURS = MOCK_FOURNISSEURS.map(f => f.id === id ? { ...f, ...data } : f);
      setTimeout(() => resolve({ id, ...data } as Fournisseur), 500);
    });
  },

  deleteFournisseur: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      MOCK_FOURNISSEURS = MOCK_FOURNISSEURS.filter(f => f.id !== id);
      setTimeout(() => resolve(), 500);
    });
  },

  createAchat: async (data: any): Promise<void> => {
    return new Promise((resolve) => setTimeout(() => resolve(), 800));
  }
};