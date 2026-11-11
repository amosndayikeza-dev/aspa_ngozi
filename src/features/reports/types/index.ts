export interface MonthlyData{
    mois: string;
    revenus: number;
    depenses: number;
    profit: number;
}

export interface VendorPerformance{
    nom: string;
    ventes: number;
    objectif: number; //------ pour calculer la barre de progression
}

export interface ReportData {
  kpis: {
    totalRevenus: number;
    totalDepenses: number;
    totalProfit: number;
    margeMoyenne: number;
  };
  historiqueMensuel: {
    mois: string;
    revenus: number;
    depenses: number;
  }[];
  performanceVendeurs: {
    nom: string;
    ventes: number;
    objectif: number;
  }[];
}