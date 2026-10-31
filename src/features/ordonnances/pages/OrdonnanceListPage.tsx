import { useState, useEffect } from "react";
import { Plus, Search, FileText, Eye, Printer, Calendar } from 'lucide-react';
import { ordonnanceApi } from "../api/ordonnanceApi";
import type { Ordonnance } from "../types";
import { DataTable, type Column } from "@/shared/ui/DataTable";
import { data } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export function OrdonnanceListPage() {
    const [ordonnances, setOrdonnances] = useState<Ordonnance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        ordonnanceApi.getOrdonnances().then(data => {
            setOrdonnances(data);
            setIsLoading(false);
        })
    }, []);

    const filteredOrdonnances = ordonnances.filter(o =>
        o.clientNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.animalNom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns: Column<Ordonnance>[] = [
        {
            header: 'N° Ordonnance',
            render: (o) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <FileText
                            className="w-4 h-4 text-emerald-600"
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                            {o.id}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            {new Date(o.date).toLocaleDateString('fr-FR')}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Patient & Proprietaire',
            render: (o) => (
                <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-900">
                        {o.animalNom}<span className="text-[10px] font-normal text-slate-500"> ({o.animalEspece}) </span>
                    </span>
                    <span className="text-[11px] text-slate-500">
                        {o.clientNom}
                    </span>
                </div>
            )
        },
        {
            header: 'Vétérinaire',
            render: (o) => (
                <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                    {o.veterinaireNom}
                </span>
            )
        },
        {
            header: 'Médicaments prescrits',
            render: (o) => (
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-900">
                        {o.lignes.length} produit(s)
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                        {o.lignes.map(l => l.nomMedicament).join(', ')}
                    </span>
                </div>
            )
        },
        {
            header: 'Actions',
            className: 'text-right',
            render: (ordonnance) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        onClick={() => navigate(`/ordonnances/${ordonnance.id}`)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="voir les details">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => {
                            console.log("Impression de l'ordonnance :", ordonnance.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="Imprimer">
                        <Printer className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-4 max-w-[1600px] mx-auto pb-10">

            {/**-----en-tete */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-600" />
                        Ordonnances
                    </h1>
                    <p className="text-[11px] text-slate-500 mt-1">
                        Gérez les prescriptions vétérinaires et préparez les traitements.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/ordonnances/nouveau')}
                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
                    <Plus className="w-4 h-4" />
                    Nouvelle Ordonnance
                </button>
            </div>

            {/**--------- barre de recherche -------------- */}
            <div className="flex items-center gap-4 bg-white p-2 rounded-xl border border-slate-200/90 shadow-sm">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher par N°, client ou animal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-8 pl-8 pr-3 rounder-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all  "
                    />
                </div>
            </div>
            {/**-----tableau------- */}
            <DataTable
                data={filteredOrdonnances}
                Columns={columns}
                isLoading={isLoading}
                keyExtractor={(o) => o.id}
            />
        </div>
    );
}