import { callBackend } from '../../../shared/lib/tauri';

export const statsApi = {
  /**
   * Dashboard Pharmacien (Vue d'ensemble globale)
   */
  getPharmacistStats: async (): Promise<any> => {
    return callBackend<any>('get_pharmacist_stats');
  },

  /**
   * Dashboard Vendeur (Stats personnelles du jour)
   */
  getSellerStats: async (userId: string): Promise<any> => {
    return callBackend<any>('get_seller_stats', { userId });
  },

  /**
   * Dashboard Admin (Console technique)
   */
  getAdminStats: async (): Promise<any> => {
    return callBackend<any>('get_admin_stats');
  }
};