import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function DashboardLayout() {
    //Etat pour gerer l'ouverture et la fermeture du sidebar
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    return (
        <div className="flex h-screen w-full bg-brand-bg overflow-hidden font-sans">
            
            {/**La sidebar est fixe a gauche */}
            <Sidebar
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />
            
            {/**La partie a droite qui contient le header et le contenu defilable */}
            <div className="flex-1 flex flex-col min-w-0">
                <Header />

                {/** c'est ic qu'on va afficher les pages (Dashboard,ventes...) s'affichent 
                 *  overflow-y-auto permet de scroller SEULEMENT cette zone,
                sans faire bouger la Sidebar ni le Header. 
                */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}