import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    /* 
      h-[100dvh] : Prend 100% de la hauteur dynamique de l'écran.
      overflow-hidden : Coupe tout ce qui dépasse.
    */
    <div className="relative h-[100dvh] w-full flex items-center justify-center lg:justify-end p-6 lg:pr-24 overflow-hidden">
      
      {/* 1. IMAGE DE FOND PLEIN ÉCRAN */}
      <img
        src="/pharmacy-bg.jpg"
        alt="Pharmacie Vétérinaire"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />

      {/* 2. CALQUE SOMBRE (OVERLAY) */}
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* 4. TEXTE EN BAS À GAUCHE */}
      <div className=" absolute mr-20 bottom-65 left-8 z-10 hidden lg:block max-w-md">
        <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
          ASPA NGOZI
        </h1>
        <h2 className="text-4xl font-bold leading-tight text-brand-light drop-shadow-lg mb-3">
          Gestion de pharmacie
          <br />
          veterinaire.
        </h2>
        <p className="text-sm text-white/90 drop-shadow-md">
          Connectez-vous et continuez à faire grandir votre pharmacie.
        </p>
      </div>

      {/* 5. FORMULAIRE (FLOTTANT À DROITE) */}
      {/* 
        On ajoute max-h-full et overflow-y-auto pour que si l'écran 
        est vraiment minuscule (ex: zoom 200%), seul le formulaire défile, 
        et non toute la page.
      */}
      <div className="relative z-10 w-full max-w-md max-h-full overflow-y-auto no-scrollbar">
        <Outlet />
      </div>
      
    </div>
  );
}