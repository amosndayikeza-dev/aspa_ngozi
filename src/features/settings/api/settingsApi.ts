import { callBackend } from '../../../shared/lib/tauri';
import type { PharmacySettings } from '../types';

const CURRENT_USER_ROLE = 'ADMIN'; // À remplacer par useAuth() plus tard

export const settingsApi = {
  getSettings: async (): Promise<PharmacySettings> => {
    return callBackend<PharmacySettings>('get_parametres');
  },
  
  updateSettings: async (data: PharmacySettings): Promise<PharmacySettings> => {
    return callBackend<PharmacySettings>('update_parametres', { 
      data, 
      currentUserRole: CURRENT_USER_ROLE 
    });
  }
};