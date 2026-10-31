export interface LigneOrdonnance{
    medicamentId: string;
    nomMedicament: string;
    posologie: string; //Ex: 1 comprime matin et soir
    duree: string;
    quantite: number;
}

export interface Ordonnance{
    id: string;
    date: string;
    clientNom: string;
    animalNom: string;
    animalEspece: string;
    veterinaireNom: string;
    lignes: LigneOrdonnance[];

}