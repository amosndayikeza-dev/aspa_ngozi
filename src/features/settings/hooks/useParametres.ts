import { useState, useEffect } from 'react';
import { settingsApi } from '../api/settingsApi';
import type { PharmacySettings } from '../types';

/**
 * Hook qui charge les paramètres de la pharmacie depuis la base.
 * Les paramètres sont mis en cache au niveau du composant.
 *
 * Usage :
 *   const { parametres, isLoading } = useParametres();
 *   if (isLoading) return <Chargement />;
 *   return <h1>{parametres?.nom}</h1>;
 */
export function useParametres() {
  const [parametres, setParametres] = useState<PharmacySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    settingsApi.getSettings()
      .then((data) => {
        if (isMounted) {
          setParametres(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement paramètres :", err);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { parametres, isLoading, hasError };
}