import { Receipt } from "lucide-react";
import type { PharmacySettings } from "../types";

export function TicketPreview({ settings }: { settings: PharmacySettings }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-slate-500" />
                <h3 className="text-xs font-bold text-slate-700" >Apercu du ticket</h3>
            </div>

            {/**------ le faut ticket ------ */}
            <div className="p-4 flex-1 flex justify-center bg-slate-100/50">
                <div className="bg-white border border-slate-200 w-full max-w-[260px] p-3 shadow-sm font-mono text-slate-800 text-[10px] leadign-tight flex-col items-center text-center">

                    {/**------ le logo et le nom ------ */}
                    {settings.logoUrl ? (
                        <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain mb-1 rounded" />
                    ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center mb-1 text-slate-400">
                            Logo
                        </div>
                    )}
                    <h4 className="font-bold uppercase text-xs"> {settings.nom || 'NOM DE LA PHARMACIE'} </h4>
                    <p className="mt-0.5 text-slate-500"> {settings.adresse || 'Adresse non renseignée'} </p>
                    <p className="text-slate-500"> Tel: {settings.telephone || '-'} </p>
                    <div className="w-full border-b border-dashed border-slate-300 my-2" />
                    <p className="text-left w-full"> Date : {new Date().toLocaleDateString('fr-FR')} </p>
                    <p className="text-left w-full mb-2"> Ticket #EXEMPLE </p>
                    
                    <div className="w-full border-b border-dashed border-slate-300 my-1" />
                    <div className="flex justify-between w-full font-bold">
                        <span>Article Exemple</span>
                        <span>1 * 5 000</span>
                    </div>
                    <div className="w-full border-b border-dashed border-slate-300 my-2" />

                    {/** ---- Total -------- */}
                    <div className="flex justify-between w-full text-sm font-bold mt-1">
                        <span>TOTAL</span>
                        <span>5 000 {settings.devise} </span>
                    </div>
                    {settings.tva > 0 && (
                        <p className="text-left w-full text-[9px] text-slate-500 mt-1">Dont TVA ({settings.tva}%)</p>
                    )}
                    
                    <div className="w-full border-b border-dashed border-slate-300 my-3" />
                    
                    <p className="text-slate-500 max-w-[200px]">{settings.messageTicket || 'Message de remerciement...'}</p>
                </div>
            </div>
        </div>
    );
}