// src/app/layouts/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { NAVIGATION_SECTIONS } from '@/config/navigation';
import { cn } from '@/shared/lib/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 1. Définition des props
interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();
  if (!user) return null;

  const filteredSections = NAVIGATION_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => item.allowedRoles.includes(user.role)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside 
      className={cn(
        "bg-brand-dark flex flex-col h-full shadow-xl z-20 transition-all duration-300 ease-in-out relative",
        // 2. Changement de largeur selon l'état
        isOpen ? "w-[260px]" : "w-[80px]"
      )}
    >
      
      {/* --- BOUTON TOGGLE (Flèche sur le bord droit de la sidebar) --- */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-10 w-6 h-6 bg-white border border-gray-200 text-brand-dark rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 hover:scale-110 transition-transform z-50"
        title={isOpen ? "Réduire le menu" : "Agrandir le menu"}
      >
        {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {/* --- LOGO --- */}
      <div className={cn(
        "h-24 flex items-center border-b border-white/10 transition-all duration-300 overflow-hidden",
        isOpen ? "px-6 gap-3" : "justify-center px-0"
      )}>
        <img 
          src="/logo.png" 
          alt="Logo VetPharma" 
          className="w-10 h-10 object-contain bg-white rounded-lg p-1 shrink-0"
        />
        {/* On cache le texte si fermé */}
        {isOpen && (
          <div className="flex flex-col whitespace-nowrap">
            <span className="text-white font-bold text-xl tracking-wide">Aspa Ngozi</span>
            <span className="text-brand-light text-[10px] uppercase tracking-widest font-semibold">
              Santé animale
            </span>
          </div>
        )}
      </div>

      {/* --- MENU DE NAVIGATION --- */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-6 space-y-8">
        {filteredSections.map((section, idx) => (
          <div key={idx}>
            {/* On cache les titres de section si fermé, ou on met un petit trait */}
            {isOpen ? (
              <h3 className="px-6 text-[11px] font-bold text-brand-light/60 uppercase tracking-wider mb-3 whitespace-nowrap">
                {section.title}
              </h3>
            ) : (
              <div className="h-px bg-white/10 mx-4 mb-3"></div>
            )}
            
            <ul className="space-y-1 px-3">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    // title permet d'afficher une infobulle au survol quand c'est réduit
                    title={!isOpen ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center rounded-xl text-sm font-medium transition-all duration-200',
                        isOpen ? 'px-3 py-3' : 'justify-center py-3 px-0',
                        isActive
                          ? 'bg-brand-medium text-white shadow-md'
                          : 'text-brand-light/80 hover:bg-white/5 hover:text-white'
                      )
                    }
                  >
                    <item.icon className={cn("w-5 h-5 shrink-0", isOpen ? "mr-3" : "mr-0")} />
                    {isOpen && <span className="whitespace-nowrap">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* --- PIED DE LA SIDEBAR (Profil) --- */}
      <div className="p-4 border-t border-white/10">
        <div className={cn(
          "bg-brand-medium/30 rounded-xl flex items-center transition-all duration-300",
          isOpen ? "p-3 gap-3" : "p-2 justify-center"
        )}>
          <div className="w-8 h-8 rounded-full bg-brand-light text-brand-dark flex items-center justify-center font-bold text-sm shrink-0">
            {user.nom.charAt(0)}
          </div>
          {isOpen && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-white text-xs font-semibold truncate">{user.nom}</span>
              <span className="text-brand-light/70 text-[10px] uppercase">{user.role}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}