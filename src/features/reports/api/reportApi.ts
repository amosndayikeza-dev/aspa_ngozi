import { callBackend } from '../../../shared/lib/tauri';
import type { ReportData } from '../types';

export const reportApi = {
  /**
   * Récupère les données calculées pour les rapports financiers.
   */
  getReportData: async (): Promise<ReportData> => {
    return callBackend<ReportData>('get_report_data');
  }
};