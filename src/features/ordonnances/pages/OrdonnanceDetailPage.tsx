import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText, Stethoscope, User, PawPrint, Calendar } from 'lucide-react';

export function OrdonnanceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // On simule la récupération des données via l'ID (plus tard, appel API)
  // Pour l'instant, on affiche des données de test pour voir le design
  const ordonnance = {
    id: id || 'ORD-2026-001',
    date: new Date().toISOString(),
    clientNom: 'Rakoto Jean',
    animalNom: 'Rex',
    animalEspece: 'Chien',
    veterinaireNom: 'Dr. Rabe',
    lignes: [
      { nomMedicament: 'Amoxicilline 500mg', posologie: '1 comprimé matin et soir', duree: '7 jours', quantite: 14 }
    ]
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-4">
      
      {/* EN-TÊTE (Caché à l'impression) */}
      <div className="flex justify-between items-end print:hidden">
        <button 
          onClick={() => navigate('/ordonnances')} 
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Retour aux ordonnances
        </button>
        
        <div className="flex gap-2">
          <button 
            onClick={() => window.print()}
            className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4" />
            Imprimer l'ordonnance
          </button>
        </div>
      </div>

      {/* LE DOCUMENT (Ce qui sera imprimé) */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-8 print:border-none print:shadow-none print:p-0">
        
        {/* En-tête du document */}
        <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Ordonnance Vétérinaire</h1>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">N° {ordonnance.id}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-900">Pharmacie Vétérinaire Aspa Ngozi</p>
            <p className="text-[11px] text-slate-500">Ngozi, Burundi</p>
            <p className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-1">
              <Calendar className="w-3 h-3" />
              {new Date(ordonnance.date).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Infos Patient & Vétérinaire */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Propriétaire
              </p>
              <p className="text-sm font-semibold text-slate-900">{ordonnance.clientNom}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <PawPrint className="w-3 h-3" /> Patient
              </p>
              <p className="text-sm font-semibold text-slate-900">
                {ordonnance.animalNom} <span className="text-xs font-normal text-slate-500">({ordonnance.animalEspece})</span>
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Prescripteur
            </p>
            <p className="text-sm font-semibold text-slate-900">{ordonnance.veterinaireNom}</p>
          </div>
        </div>

        {/* Tableau des médicaments */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-2.5">Médicament prescrit</th>
                <th className="px-4 py-2.5">Posologie</th>
                <th className="px-4 py-2.5">Durée</th>
                <th className="px-4 py-2.5 text-center">Qté</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ordonnance.lignes.map((ligne, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-xs font-bold text-slate-900">{ligne.nomMedicament}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{ligne.posologie}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{ligne.duree}</td>
                  <td className="px-4 py-3 text-xs font-mono font-bold text-center text-slate-900">{ligne.quantite}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signature */}
        <div className="mt-12 flex justify-end">
          <div className="text-center">
            <p className="text-[11px] text-slate-400 mb-8">Signature & Cachet du Vétérinaire</p>
            <div className="w-40 border-b border-slate-300"></div>
            <p className="text-[10px] font-semibold text-slate-900 mt-2">{ordonnance.veterinaireNom}</p>
          </div>
        </div>

      </div>
    </div>
  );
}