// src/app/layouts/Header.tsx
import { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { RoleSwitcher } from '@/features/auth';

export function Header() {
  const { user, logout } = useAuth();
  
  // 1. État pour savoir si le menu est ouvert ou fermé
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // 2. Référence vers le menu pour détecter les clics à l'extérieur
  const menuRef = useRef<HTMLDivElement>(null);

  // 3. Effet pour fermer le menu si on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    // On ajoute l'écouteur d'événement
    document.addEventListener('mousedown', handleClickOutside);
    // On le retire quand le composant est détruit (cleanup)
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
      
      {/* --- RECHERCHE GLOBALE --- */}
      <div className="flex items-center gap-4 w-1/2">
        <div className="relative w-full max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un médicament, un client, un lot..."
            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-dark/20 focus:border-brand-dark transition-all"
          />
        </div>
      </div>

      {/* --- ACTIONS & PROFIL --- */}
      <div className="flex items-center gap-6">
        
        <RoleSwitcher />

        {/* Notifications */}
        <button className="relative p-2 text-gray-500 hover:text-brand-dark transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-vet-danger rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200"></div>

        {/* --- MENU DÉROULANT DU PROFIL --- */}
        {/* On attache la ref ici pour englober le bouton et le menu */}
        <div className="relative" ref={menuRef}>
          
          {/* Bouton déclencheur (Profil + Chevron) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-brand-dark text-white flex items-center justify-center font-bold text-sm shadow-md">
              {user?.nom.charAt(0)}
            </div>
            <div className="flex flex-col items-start hidden md:flex">
              <span className="text-xs font-bold text-gray-800 leading-tight">
                {user?.nom}
              </span>
              <span className="text-xs text-gray-500">
                {user?.role === 'PHARMACIEN' ? 'Pharmacien' : user?.role}
              </span>
            </div>
            {/* La flèche tourne quand le menu est ouvert */}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Le Menu Déroulant (s'affiche uniquement si isMenuOpen est true) */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              
              {/* Informations utilisateur (mobile) */}
              <div className="px-4 py-2 border-b border-gray-100 md:hidden">
                <p className="text-sm font-bold text-gray-800">{user?.nom}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>

              {/* Liens du menu */}
              <button className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <User className="w-4 h-4 text-gray-400" />
                Mon profil
              </button>
              
              <button className="w-full text-left px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                <Settings className="w-4 h-4 text-gray-400" />
                Paramètres
              </button>

              {/* Ligne de séparation */}
              <div className="h-px bg-gray-100 my-1"></div>

              {/* Bouton déconnexion intégré au menu */}
              <button 
                onClick={() => {
                  setIsMenuOpen(false); // On ferme le menu
                  logout();             // On lance la déconnexion
                }}
                className="w-full text-left px-4 py-2.5 text-xs text-vet-danger hover:bg-red-50 flex items-center gap-3 transition-colors font-medium"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}