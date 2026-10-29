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
    <header className="h-12 bg-white/95 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.02)] select-none">
      
      {/* --- RECHERCHE GLOBALE STYLE COMMAND PALETTE --- */}
      <div className="flex items-center gap-3 w-1/2 max-w-md">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un médicament, client, ordonnance..."
            className="w-full h-8 pl-8 pr-14 bg-slate-100/70 border border-slate-200/70 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-[10px] font-mono text-slate-400 bg-white border border-slate-200 px-1 py-0.2 rounded shadow-2xs leading-none">
              Ctrl+K
            </kbd>
          </div>
        </div>
      </div>

      {/* --- ACTIONS & PROFIL --- */}
      <div className="flex items-center gap-3">
        
        {/* Statut du système (Desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50/80 border border-emerald-200/60 text-[11px] font-medium text-emerald-800">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Base Locale Connectée</span>
        </div>

        <RoleSwitcher />

        {/* Notifications */}
        <button 
          className="relative p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-5 w-px bg-slate-200"></div>

        {/* --- MENU DÉROULANT DU PROFIL --- */}
        <div className="relative" ref={menuRef}>
          
          {/* Bouton déclencheur compact */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200/60 transition-all focus:outline-none cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-brand-obsidian text-emerald-300 flex items-center justify-center font-bold text-[11px] shadow-sm border border-white/10">
              {user?.nom.charAt(0)}
            </div>
            <div className="flex flex-col items-start hidden sm:flex leading-tight text-left">
              <span className="text-[11px] font-semibold text-slate-800 truncate max-w-[110px]">
                {user?.nom}
              </span>
              <span className="text-[9px] text-slate-500 font-medium">
                {user?.role === 'PHARMACIEN' ? 'Pharmacien' : user?.role}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Le Menu Déroulant */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-slate-200/80 p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="px-2.5 py-1.5 border-b border-slate-100 sm:hidden">
                <p className="text-xs font-bold text-slate-800">{user?.nom}</p>
                <p className="text-[10px] text-slate-500">{user?.role}</p>
              </div>

              <button className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Mon profil</span>
              </button>
              
              <button className="w-full text-left px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer">
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Paramètres</span>
              </button>

              <div className="h-px bg-slate-100 my-1"></div>

              <button 
                onClick={() => {
                  setIsMenuOpen(false);
                  logout();
                }}
                className="w-full text-left px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2.5 transition-colors font-medium cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Se déconnecter</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}