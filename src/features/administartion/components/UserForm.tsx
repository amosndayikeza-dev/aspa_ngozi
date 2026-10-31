import { useState, type FormEvent } from 'react';
import { User as UserIcon, Mail, CheckCircle2, Lock, Eye, EyeOff, Trash2 } from 'lucide-react';
import type { User, UserRole, UserFormData } from '../types';
import { cn } from '@/shared/lib/cn';

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: UserFormData) => Promise<void>;
  onDelete?: (id: string) => void; 
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, onDelete, onCancel }: UserFormProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nom: initialData?.nom || '',
    email: initialData?.email || '',
    role: initialData?.role || 'VENDEUR' as UserRole,
    isActive: initialData?.isActive ?? true,
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validation : le mot de passe est obligatoire uniquement en création
    if (!initialData && (!formData.password || formData.password.length < 6)) {
      alert("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* Avatar */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 mb-2">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl font-bold mb-2 shadow-sm">
          {formData.nom ? formData.nom.charAt(0).toUpperCase() : '?'}
        </div>
      </div>

      {/* Nom */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nom complet</label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text" required value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            placeholder="Ex: Rakoto Jean"
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Email */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Adresse Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="vendeur@vetpharma.mg"
            className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Mot de passe */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Mot de passe {initialData ? '(Optionnel)' : ''}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type={showPassword ? "text" : "password"} 
            required={!initialData} // Requis uniquement si c'est une création
            value={formData.password} 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder={initialData ? "Laisser vide pour ne pas changer" : "Min. 6 caractères"}
            className="w-full h-10 pl-9 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Rôles */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rôle & Accès</label>
        <div className="grid grid-cols-1 gap-2">
          {[
            { id: 'VENDEUR', label: 'Vendeur', desc: 'Caisse, clients, ordonnances' },
            { id: 'PHARMACIEN', label: 'Pharmacien', desc: 'Accès total au système' },
            { id: 'ADMIN', label: 'Administrateur', desc: 'Gestion technique' },
          ].map((r) => (
            <button
              key={r.id} type="button" onClick={() => setFormData({ ...formData, role: r.id as UserRole })}
              className={cn(
                "flex flex-col items-start p-3 rounded-xl border text-left transition-all",
                formData.role === r.id ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500/20" : "bg-white border-slate-200 hover:border-emerald-300"
              )}
            >
              <span className={cn("text-xs font-bold", formData.role === r.id ? "text-emerald-900" : "text-slate-700")}>{r.label}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{r.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Statut Actif */}
      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
        <div>
          <p className="text-xs font-bold text-slate-800">Compte actif</p>
          <p className="text-[10px] text-slate-500">L'utilisateur peut se connecter</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} className="sr-only peer" />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* Actions */}
      <div className="pt-2 flex flex-col gap-2">
        <button type="submit" disabled={isSubmitting} className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
          {isSubmitting ? 'Enregistrement...' : <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>}
        </button>
        
        {/* Bouton supprimer (visible seulement en mode édition) */}
        {initialData && onDelete && (
          <button 
            type="button" 
            onClick={() => onDelete(initialData.id)}
            className="w-full h-9 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-rose-200 mt-2"
          >
            <Trash2 className="w-4 h-4" /> Supprimer ce compte
          </button>
        )}
        
        <button type="button" onClick={onCancel} className="w-full h-9 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-colors">
          Annuler
        </button>
      </div>

    </form>
  );
}