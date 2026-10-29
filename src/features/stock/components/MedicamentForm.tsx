// src/features/stock/components/MedicamentForm.tsx
import { useState, useRef, type FormEvent, type ChangeEvent } from 'react';
import { Package, Tag, DollarSign, AlertTriangle, Box, Upload, X, Image as ImageIcon } from 'lucide-react';

interface MedicamentFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function MedicamentForm({ initialData, onSubmit, onCancel }: MedicamentFormProps) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    dci: initialData?.dci || '',
    categorie: initialData?.categorie || 'Antibiotique',
    forme: initialData?.forme || 'Comprimé',
    prixAchat: initialData?.prixAchat || '',
    prixVente: initialData?.prixVente || '',
    seuilAlerte: initialData?.seuilAlerte || 10,
    // Gestion de l'image (Base64)
    imageUrl: initialData?.imageUrl || '',
    // Pour le lot initial
    lotNumero: '',
    lotQuantite: '',
    lotDatePeremption: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Référence pour déclencher le clic sur l'input file caché
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- GESTION DE L'UPLOAD D'IMAGE ---
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérification de la taille (ex: max 2MB pour éviter de faire ramer l'UI)
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop lourde (max 2Mo)");
      return;
    }

    // Utilisation de FileReader pour convertir le fichier en Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = ''; // Reset l'input file
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      ...formData,
      prixAchat: parseFloat(formData.prixAchat as string) || 0,
      prixVente: parseFloat(formData.prixVente as string) || 0,
      seuilAlerte: parseInt(formData.seuilAlerte as string) || 0,
      lots: initialData ? initialData.lots : [
        {
          id: `LOT-${Date.now()}`,
          numeroLot: formData.lotNumero || 'LOT-INITIAL',
          quantite: parseInt(formData.lotQuantite as string) || 0,
          datePeremption: formData.lotDatePeremption || new Date().toISOString().split('T')[0],
        }
      ]
    };

    try {
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 select-none">
      
      {/* --- SECTION IMAGE --- */}
      <div className="flex gap-3.5 items-center p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl">
        {/* Prévisualisation */}
        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs relative group">
          {formData.imageUrl ? (
            <>
              <img src={formData.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Supprimer la photo"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-300" />
          )}
        </div>

        {/* Zone d'upload */}
        <div className="flex-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Photo du médicament</p>
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 px-2.5 bg-white border border-slate-200/90 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Choisir une photo</span>
          </button>
          <p className="text-[10px] text-slate-400 mt-1">PNG, JPG ou WEBP (max 2 Mo)</p>
        </div>
      </div>

      {/* --- INFOS PRINCIPALES --- */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nom commercial</label>
          <div className="relative">
            <Package className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input 
              name="nom" 
              required 
              value={formData.nom} 
              onChange={handleChange} 
              placeholder="Ex: Amoxicilline 500mg" 
              className="w-full h-8 pl-8 pr-3 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all" 
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">DCI</label>
          <div className="relative">
            <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input 
              name="dci" 
              required 
              value={formData.dci} 
              onChange={handleChange} 
              placeholder="Ex: Amoxicilline" 
              className="w-full h-8 pl-8 pr-3 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Catégorie & Forme */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Catégorie</label>
          <select 
            name="categorie" 
            value={formData.categorie} 
            onChange={handleChange} 
            className="w-full h-8 px-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="Antibiotique">Antibiotique</option>
            <option value="Antiparasitaire">Antiparasitaire</option>
            <option value="Vaccin">Vaccin</option>
            <option value="Vitamine">Vitamine</option>
            <option value="Aliment">Aliment</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Forme</label>
          <select 
            name="forme" 
            value={formData.forme} 
            onChange={handleChange} 
            className="w-full h-8 px-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="Comprimé">Comprimé</option>
            <option value="Sirop">Sirop</option>
            <option value="Injection">Injection</option>
            <option value="Pommade">Pommade</option>
            <option value="Poudre">Poudre</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      {/* Prix & Seuil */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prix Achat (FBU)</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input 
              name="prixAchat" 
              type="number" 
              required 
              value={formData.prixAchat} 
              onChange={handleChange} 
              placeholder="1500" 
              className="w-full h-8 pl-8 pr-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all" 
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Prix Vente (FBU)</label>
          <div className="relative">
            <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input 
              name="prixVente" 
              type="number" 
              required 
              value={formData.prixVente} 
              onChange={handleChange} 
              placeholder="2500" 
              className="w-full h-8 pl-8 pr-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all" 
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Seuil Alerte</label>
          <div className="relative">
            <AlertTriangle className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input 
              name="seuilAlerte" 
              type="number" 
              required 
              value={formData.seuilAlerte} 
              onChange={handleChange} 
              placeholder="10" 
              className="w-full h-8 pl-8 pr-2.5 bg-slate-50/70 border border-slate-200/90 rounded-lg text-xs font-mono font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all" 
            />
          </div>
        </div>
      </div>

      {/* Bloc Lot Initial */}
      {!initialData && (
        <div className="p-3 bg-emerald-50/50 border border-emerald-200/70 rounded-xl space-y-2 mt-2">
          <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5" /> 
            <span>Premier lot en stock (Optionnel)</span>
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-600 uppercase">N° de lot</label>
              <input 
                name="lotNumero" 
                value={formData.lotNumero} 
                onChange={handleChange} 
                placeholder="LOT-001" 
                className="w-full h-8 px-2.5 bg-white border border-emerald-200/80 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-600 uppercase">Quantité</label>
              <input 
                name="lotQuantite" 
                type="number" 
                value={formData.lotQuantite} 
                onChange={handleChange} 
                placeholder="50" 
                className="w-full h-8 px-2.5 bg-white border border-emerald-200/80 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-600 uppercase">Péremption</label>
              <input 
                name="lotDatePeremption" 
                type="date" 
                value={formData.lotDatePeremption} 
                onChange={handleChange} 
                className="w-full h-8 px-2.5 bg-white border border-emerald-200/80 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
              />
            </div>
          </div>
        </div>
      )}

      {/* BOUTONS D'ACTION */}
      <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
        <button 
          type="button" 
          onClick={onCancel} 
          className="h-8 px-3.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/60 border border-slate-200/60 transition-colors cursor-pointer"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs border border-emerald-600 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? 'Enregistrement...' : (initialData ? 'Mettre à jour' : 'Créer le médicament')}
        </button>
      </div>
    </form>
  );
}