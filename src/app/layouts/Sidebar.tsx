// src/app/layouts/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';                          // 👈 NOUVEAU
import { useAuth } from '@/features/auth';
import { NAVIGATION_SECTIONS } from '@/config/navigation';
import { detteApi } from '@/features/dettes/api/detteApi';            // 👈 NOUVEAU
import { cn } from '@/shared/lib/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();
  
  // 👈 NOUVEAU : État pour le nombre de dettes en retard
  const [nbRetards, setNbRetards] = useState(0);

  // 👈 NOUVEAU : Chargement initial + polling toutes les 60s
  useEffect(() => {
    if (!user) return;
    
    const loadRetards = () => {
      detteApi.getNbDettesRetard()
        .then(setNbRetards)
        .catch(() => setNbRetards(0));  // silencieux en cas d'erreur
    };
    
    loadRetards();
    const interval = setInterval(loadRetards, 60000);
    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  const filteredSections = NAVIGATION_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.allowedRoles.includes(user.role)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside 
      className={cn(
        "bg-brand-obsidian border-r border-white/[0.08] flex flex-col h-full z-20 transition-all duration-300 ease-in-out relative select-none",
        isOpen ? "w-[240px]" : "w-[68px]"
      )}
    >
      {/* --- BOUTON TOGGLE --- */}
      <button
        onClick={onToggle}
        className="absolute -right-2.5 top-5 w-5 h-5 bg-[#141E33] border border-white/20 text-slate-300 rounded-full flex items-center justify-center shadow-lg hover:text-white hover:border-emerald-400 hover:scale-110 transition-all z-50 cursor-pointer"
        title={isOpen ? "Réduire le menu" : "Agrandir le menu"}
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* --- EN-TÊTE --- */}
      <div className={cn(
        "h-14 flex items-center border-b border-white/[0.06] transition-all duration-300 overflow-hidden shrink-0",
        isOpen ? "px-4 gap-2.5" : "justify-center px-0"
      )}>
        <div className="relative shrink-0">
          <img 
            src="/logo.png" 
            alt="Logo Aspa Ngozi" 
            className="w-8 h-8 object-contain bg-white/10 rounded-lg p-0.5 border border-white/15 shadow-sm"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-brand-obsidian animate-pulse" />
        </div>
        {isOpen && (
          <div className="flex flex-col whitespace-nowrap overflow-hidden">
            <span className="text-white font-bold text-[13px] tracking-tight leading-none">
              Aspa Ngozi
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-[9px] font-semibold text-emerald-400 uppercase tracking-widest">
                Pharma Vétérinaire
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-3 px-2 space-y-4">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {isOpen ? (
              <h3 className="px-2.5 text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 whitespace-nowrap">
                {section.title}
              </h3>
            ) : (
              <div className="h-px bg-white/[0.06] mx-2 mb-2" />
            )}
            
            <ul className="space-y-1">
              {section.items.map((item) => {
                // 👈 NOUVEAU : est-ce l'item Dettes ?
                const isDettes = item.path === '/dettes';
                const hasRetards = isDettes && nbRetards > 0;

                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      title={!isOpen ? item.label : undefined}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center rounded-lg text-xs font-medium transition-all duration-150 relative',
                          isOpen ? 'px-2.5 py-2' : 'justify-center py-2 px-0',
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent text-emerald-300 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.08)]'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",
                              !isOpen && "left-0.5"
                            )} />
                          )}
                          
                          <div className="relative shrink-0">
                            <item.icon className={cn(
                              "w-4 h-4 shrink-0 transition-colors",
                              isActive ? "text-emerald-400" : "text-slate-400 group-hover:text-slate-200",
                              isOpen ? "mr-2.5" : "mr-0"
                            )} />
                            {/* 👈 NOUVEAU : Pastille rouge sur l'icône quand la sidebar est réduite */}
                            {hasRetards && !isOpen && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-brand-obsidian animate-pulse" />
                            )}
                          </div>

                          {isOpen && (
                            <>
                              <span className="whitespace-nowrap truncate tracking-tight text-[11px] flex-1">
                                {item.label}
                              </span>
                              {/* 👈 NOUVEAU : Badge numérique quand la sidebar est ouverte */}
                              {hasRetards && (
                                <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                                  {nbRetards}
                                </span>
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* --- PROFIL --- */}
      <div className="p-2 border-t border-white/[0.06] shrink-0">
        <div className={cn(
          "bg-[#101827] border border-white/[0.06] rounded-xl flex items-center transition-all",
          isOpen ? "p-2 gap-2.5" : "p-1.5 justify-center"
        )}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm border border-emerald-400/20">
            {user.nom.charAt(0)}
          </div>
          {isOpen && (
            <div className="flex flex-col min-w-0 flex-1 whitespace-nowrap overflow-hidden">
              <span className="text-slate-200 text-xs font-semibold truncate leading-tight">
                {user.nom}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                  {user.role}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}