import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { Activity } from 'lucide-react';

export function AuthLayout() {
  const { status } = useAuth();

  if (status === 'authenticated') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative h-[100dvh] w-full flex items-center justify-center lg:justify-end p-6 lg:pr-24 overflow-hidden bg-slate-900">
      
      {/* 1. IMAGE DE FOND */}
      <img
        src="/pharmacy-bg.jpg"
        alt="Pharmacie Vétérinaire"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. CALQUE SOMBRE (OVERLAY) */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-900/30 z-0" />

      {/* 3. LOGO & TEXTE (CENTRÉ VERTICALEMENT À GAUCHE) */}
      {/* ✅ MODIFICATION ICI : top-1/2 -translate-y-1/2 pour centrer */}
      <div className="absolute top-1/2 -translate-y-1/2 left-16 z-10 hidden lg:block max-w-md">
        
        {/* Badge de marque */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200 tracking-widest uppercase">
            Aspa Ngozi
          </span>
        </div>

        {/* Titre */}
        <h2 className="text-3xl font-bold leading-[1.15] text-white tracking-tight mb-3">
          Gestion de pharmacie
          <br />
          <span className="text-emerald-400">vétérinaire.</span>
        </h2>
        
        {/* Sous-titre */}
        <p className="text-xs text-slate-300 leading-relaxed max-w-sm font-medium">
          Connectez-vous pour accéder à votre espace de travail, gérer les stocks, les ordonnances et servir vos clients.
        </p>
      </div>

      {/* 4. FORMULAIRE (FLOTTANT À DROITE) */}
      {/* Il est déjà centré grâce au 'flex items-center' du parent */}
      <div className="relative z-10 w-full max-w-[380px] max-h-full overflow-y-auto no-scrollbar">
        <Outlet />
      </div>
      
    </div>
  );
}