import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";
import { Save, Upload, X, Settings, Building2, CreditCard, Image as ImageIcon } from 'lucide-react';

import { settingsApi } from "../api/settingsApi";
import type { PharmacySettings } from "../types";
import { TicketPreview } from "../components/TicketPreview";
import { toast } from "sonner";
import { cn } from '@/shared/lib/cn';
import { data } from "react-router-dom";

export function SettingsPage() {
    const [settings, setSettings] = useState<PharmacySettings | null>(null);
    const [isLoaging, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        settingsApi.getSettings().then(data => {
            setSettings(data);
            setIsLoading(false);
        });
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!settings) return;
        const { name, value } = e.target;
        setSettings({ ...settings, [name]: value });
    };
    const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];

        if (!file || !settings) return;

        if (file.size > 1024 * 1024) {
            //------la taille maximale du fichier est de 1MO
            toast.error("Le logo est trop lourd (max 1MO)");
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setSettings({ ...settings, logoUrl: reader.result as string });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!settings) return;
        setIsSaving(true);
        try {
            await settingsApi.updateSettings(settings);
            toast.success("Parametres de la pharmacie enregistres !");
        } catch (error) {
            toast.error("Erreur lors de l'enregistremet");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoaging || !settings) return <div className="p-10 text-xs font-medium text-slate-400 animate-pulse"> Chargement des parametres...</div>;

    return (
        <div className="max-w-[1400px] mx-auto pb-10 space-y-4">

            {/**-----en tete------- */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-emerald-600" />
                        Parametres de la Pharmacie
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Configurez l'identité de votre établissement et les options de facturation.
                    </p>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={isSaving}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm disabled::opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Enregistrement': 'Enregistrer les modifications'}
                </button>
            </div>
            {/** -----------layout split --------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

                {/**------colonne gauche : formulaire --------- */}
                <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4" >
                    {/**----section 1 : identite ----- */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-4">
                        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Building2 className="w-4 h-4 text-slate-400" />
                            Identite de l'etablissement
                        </h2>

                        {/**-----logo upload ------- */}
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-slate-50 border-slate-200 flex items-center justify-center overflow-hidden shrink-0 relative group">
                                {settings.logoUrl ? (
                                     <>
                                    <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                                    <button 
                                    type="button" 
                                    onClick={() => setSettings({ ...settings, logoUrl: '' })}
                                    className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                    <X className="w-5 h-5" />
                                    </button>
                                </>
                                ) : (
                                    <ImageIcon className="w-6 h-6 text-slate-300" />
                            )}
                            </div>
                            <div>
                                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleLogoUpload} className="hidden" />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="h-8 px-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Changer le logo
                                </button>
                                <p className="text-[10px] text-slate-500 mt-1.5">
                                    Format PNG ou JPG, max 1MO.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Nom de la pharmacie</label>
                                <input name="nom" type="text" value={settings.nom} onChange={handleChange} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                            </div>
                            </div>
                        </div>

                        {/* Section 2 : Coordonnées */}
                        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">Coordonnées</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Adresse complète</label>
                                <input name="adresse" type="text" value={settings.adresse} onChange={handleChange} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Téléphone</label>
                                <input name="telephone" type="text" value={settings.telephone} onChange={handleChange} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                                <input name="email" type="email" value={settings.email} onChange={handleChange} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                            </div>
                            </div>
                        </div>

                        {/* Section 3 : Caisse & Facturation */}
                        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 space-y-4">
                            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                            <CreditCard className="w-4 h-4 text-slate-400" /> Configuration de la caisse
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Devise</label>
                                <input name="devise" type="text" value={settings.devise} onChange={handleChange} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">TVA (%)</label>
                                <input name="tva" type="number" value={settings.tva} onChange={handleChange} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Message de bas de ticket</label>
                                <textarea name="messageTicket" value={settings.messageTicket} onChange={handleChange} rows={2} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" />
                            </div>
                            </div>
                        </div>

                        </form>

                        {/*------- COLONNE DROITE : APERÇU DU TICKET ---------*/}
                    <div className="lg:col-span-1 h-full sticky top-4">
                        <TicketPreview settings={settings} />
                </div>

            </div>
        </div>
    );
}