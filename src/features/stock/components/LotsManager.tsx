// src/features/stock/components/LotsManager.tsx
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { medicamentApi } from '../api/medicamentApi';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';

interface LotForm {
  id?: string;
  numeroLot: string;
  quantite: number;
  datePeremption: string;
  prixAchat: number;
}

const emptyForm: LotForm = {
  numeroLot: '',
  quantite: 0,
  datePeremption: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().split('T')[0],
  prixAchat: 0,
};

export function LotsManager({ produitId, onClose }: { produitId: string; onClose: () => void }) {
  const [lots, setLots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [form, setForm] = useState<LotForm | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadLots = async () => {
    try {
      const data = await medicamentApi.getLotsByProduit(produitId);
      setLots(data);
    } catch {
      toast.error("Erreur de chargement des lots");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadLots(); }, [produitId]);

  const handleAdd = () => setForm({ ...emptyForm });
  
  const handleEdit = (lot: any) => setForm({
    id: lot.id,
    numeroLot: lot.numeroLot,
    quantite: lot.quantite,
    datePeremption: lot.datePeremption,
    prixAchat: lot.prixAchat,
  });

  const handleSave = async () => {
    if (!form) return;
    if (!form.numeroLot.trim()) { toast.error("Numéro de lot requis"); return; }
    if (form.quantite < 0) { toast.error("Quantité invalide"); return; }
    if (!form.datePeremption) { toast.error("Date de péremption requise"); return; }

    setIsSaving(true);
    try {
      const payload = {
        produitId,
        numeroLot: form.numeroLot,
        quantite: form.quantite,
        datePeremption: form.datePeremption,
        prixAchat: form.prixAchat,
      };
      
      if (form.id) {
        await medicamentApi.updateLot(form.id, payload);
        toast.success("Lot mis à jour");
      } else {
        await medicamentApi.createLot(payload);
        toast.success("Lot ajouté");
      }
      
      setForm(null);
      await loadLots();
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!lotToDelete) return;
    setIsDeleting(true);
    try {
      await medicamentApi.deleteLot(lotToDelete);
      toast.success("Lot supprimé");
      await loadLots();
      setLotToDelete(null);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      
      {/* Barre d'action */}
      <div className="flex justify-between items-center">
        <p className="text-[11px] text-slate-500">
          {lots.length} lot{lots.length > 1 ? 's' : ''} · Stock total :{' '}
          <span className="font-bold text-slate-900">{lots.reduce((s, l) => s + l.quantite, 0)} u</span>
        </p>
        <button
          onClick={handleAdd}
          className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Nouveau lot
        </button>
      </div>

      {/* Liste des lots */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400 animate-pulse">Chargement...</div>
      ) : lots.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <p className="text-xs text-slate-400">Aucun lot. Cliquez sur "Nouveau lot".</p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-[10px] text-slate-500 uppercase font-bold">
                <th className="px-3 py-2">N° lot</th>
                <th className="px-3 py-2 text-center">Qté</th>
                <th className="px-3 py-2">Péremption</th>
                <th className="px-3 py-2 text-center">Statut</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lots.map(lot => {
                const jours = lot.joursRestants ?? 0;
                const statut = jours < 0 ? 'PERIME' : jours <= 30 ? 'PROCHE' : 'OK';
                const colors = {
                  PERIME: 'bg-rose-50 text-rose-700 border-rose-200',
                  PROCHE: 'bg-amber-50 text-amber-700 border-amber-200',
                  OK: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                };
                return (
                  <tr key={lot.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-xs font-mono text-slate-900">{lot.numeroLot}</td>
                    <td className="px-3 py-2 text-xs font-bold text-center text-slate-900">{lot.quantite}</td>
                    <td className="px-3 py-2 text-xs text-slate-600">{new Date(lot.datePeremption).toLocaleDateString('fr-FR')}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={cn("inline-flex text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border", colors[statut])}>
                        {statut === 'PERIME' ? 'Périmé' : statut === 'PROCHE' ? `${jours}j` : 'OK'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => handleEdit(lot)} className="p-1 text-slate-400 hover:text-emerald-600 rounded" title="Modifier">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setLotToDelete(lot.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded" title="Supprimer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Formulaire (add/edit) */}
      {form && (
        <div className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-bold text-emerald-900">
              {form.id ? 'Modifier le lot' : 'Nouveau lot'}
            </p>
            <button onClick={() => setForm(null)} className="text-emerald-700 hover:text-emerald-900">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase">N° lot</label>
              <input
                type="text"
                value={form.numeroLot}
                onChange={(e) => setForm({ ...form, numeroLot: e.target.value })}
                placeholder="LOT-XXX"
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase">Quantité</label>
              <input
                type="number"
                min={0}
                value={form.quantite}
                onChange={(e) => setForm({ ...form, quantite: parseInt(e.target.value) || 0 })}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase">Péremption</label>
              <input
                type="date"
                value={form.datePeremption}
                onChange={(e) => setForm({ ...form, datePeremption: e.target.value })}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-slate-600 uppercase">Prix achat</label>
              <input
                type="number"
                min={0}
                value={form.prixAchat}
                onChange={(e) => setForm({ ...form, prixAchat: parseFloat(e.target.value) || 0 })}
                className="w-full h-7 px-2 bg-white border border-slate-200 rounded text-[11px] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Enregistrement...' : form.id ? 'Mettre à jour' : 'Créer le lot'}
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!lotToDelete}
        onClose={() => setLotToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce lot ?"
        description="Cette action retirera la quantité du stock. Irréversible."
        isLoading={isDeleting}
      />
    </div>
  );
}