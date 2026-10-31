
// ----------------les stt=
export const statsApi = {
  getDashboardStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          kpis: {
            caJour: 485000,
            caSemaine: 3120000,
            beneficeMois: 1260000,
            clientsServis: 24,
          },
          ventesSemaine: [
            { jour: 'Lun', ventes: 180000 },
            { jour: 'Mar', ventes: 250000 },
            { jour: 'Mer', ventes: 220000 },
            { jour: 'Jeu', ventes: 310000 },
            { jour: 'Ven', ventes: 450000 },
            { jour: 'Sam', ventes: 520000 },
            { jour: 'Dim', ventes: 190000 },
          ],
          repartitionCategories: [
            { name: 'Antibiotique', value: 4500000, color: '#10b981' }, 
            { name: 'Aliments', value: 2500000, color: '#3b82f6' }, 
            { name: 'Vaccin', value: 800000, color: '#f59e0b' }, 
          ],
          topProduits: [
            { nom: 'Amoxicilline 500mg', ventes: 145, ca: 362500 },
            { nom: 'Ivermectine 1%', ventes: 98, ca: 1176000 },
            { nom: 'Vaccin Newcastle', ventes: 76, ca: 646000 },
            { nom: 'Vitamine B12', ventes: 54, ca: 162000 },
          ]
        });
      }, 600);
    });
  }
};