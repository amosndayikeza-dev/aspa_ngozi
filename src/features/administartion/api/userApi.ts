import { callBackend } from '../../../shared/lib/tauri';

// ⚠️ Pour l'instant, on simule l'utilisateur connecté en tant qu'ADMIN.
// Dans une vraie app, tu récupéreras ça depuis ton AuthContext ou le localStorage.
const CURRENT_USER_ROLE = 'ADMIN'; 

export const userApi = {
  getUsers: async () => {
    const users = await callBackend<any[]>('list_users');
    // On mappe "actif" (Rust) vers "isActive" (React)
    return users.map(u => ({ ...u, isActive: u.actif }));
  },

  createUser: async (data: any) => {
    // On ajoute currentUserRole pour la sécurité côté Rust
    return callBackend<any>('create_user', { 
      data, 
      currentUserRole: CURRENT_USER_ROLE 
    });
  },

  updateUser: async (id: string, data: any) => {
    return callBackend<any>('update_user', { 
      id, 
      data, 
      currentUserRole: CURRENT_USER_ROLE 
    });
  },

  // On remplace deleteUser par toggleUserActif
  toggleUserActif: async (id: string, actif: boolean) => {
    return callBackend<void>('toggle_user_actif', { 
      id, 
      actif, 
      currentUserRole: CURRENT_USER_ROLE 
    });
  }
};