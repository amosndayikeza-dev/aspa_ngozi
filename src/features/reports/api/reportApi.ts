import type { ReportData } from '../types';

export const reportApi = {

    getReportData: async (): Promise<ReportData> => {
    return new Promise((resolve) => {
    setTimeout(() => {
        resolve({
            kpis: {
                totalRevenus: 15450000,
                totalDepenses: 8200000,
                totalProfit: 7250000,
                margeMoyenne: 46.9, // ------Pourcentage
            },
            historiqueMensuel: [
                {
                    mois: 'Mai', revenus: 2000000, depenses: 1200000, profit: 800000
                },
                {
                    mois: 'Juin', revenus: 2500000, depenses: 1400000, profit: 1100000
                },
                {
                    mois: 'Juil', revenus: 2200000, depenses: 1300000, profit: 900000
                },
                {
                    mois: 'Août', revenus: 2800000, depenses: 1500000, profit: 1300000
                },
                {
                
                    mois: 'Sept', revenus: 3100000, depenses: 1600000, profit: 1500000
                },
                {
                    mois: 'Oct', revenus: 2850000, depenses: 1200000, profit: 1650000
                },
            ],
            performanceVendeurs: [
            {
                nom: 'Randria Sarah', ventes: 6500000, objectif: 8000000
            },
            {
                    nom: 'Kalenga Marc', ventes: 5200000, objectif: 5000000
            }, // Objectif atteint
            {
                nom: 'Rakoto Jean', ventes: 3750000, objectif: 6000000
            },
          ]
        });
      }, 500);
    });
  }
};