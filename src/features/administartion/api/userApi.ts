import type { User, UserFormData } from '../types';

let MOCK_USERS: User[] = [
  { id: 'U-01', nom: 'Rakoto Jean', email: 'boss@vetpharma.mg', role: 'PHARMACIEN', isActive: true, dateCreation: '2025-01-10' },
  { id: 'U-02', nom: 'Randria Sarah', email: 'vendeur@vetpharma.mg', role: 'VENDEUR', isActive: true, dateCreation: '2025-03-15' },
  { id: 'U-03', nom: 'Admin Système', email: 'admin@vetpharma.mg', role: 'ADMIN', isActive: true, dateCreation: '2025-01-01' },
];

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...MOCK_USERS]), 500));
  },

  createUser: async (data: UserFormData): Promise<User> => {
    return new Promise((resolve) => {
      const newUser: User = {
        id: `U-0${MOCK_USERS.length + 1}`,
        nom: data.nom,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
        dateCreation: new Date().toISOString().split('T')[0]
      };
      MOCK_USERS = [newUser, ...MOCK_USERS];
      setTimeout(() => resolve(newUser), 500);
    });
  },

  updateUser: async (id: string, data: Partial<UserFormData>): Promise<User> => {
    return new Promise((resolve) => {
      MOCK_USERS = MOCK_USERS.map(u => 
        u.id === id ? { ...u, nom: data.nom, email: data.email, role: data.role, isActive: data.isActive } : u
      );
      const updated = MOCK_USERS.find(u => u.id === id) as User;
      setTimeout(() => resolve(updated), 500);
    });
  },

  deleteUser: async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      MOCK_USERS = MOCK_USERS.filter(u => u.id !== id);
      setTimeout(() => resolve(), 500);
    });
  }
};