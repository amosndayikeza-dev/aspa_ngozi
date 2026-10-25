/**
 *Representation de l'animal de compagnie ou d'elevage
 */

export interface Animal{
    id: string;
    nom: string;
    espece: 'Chien' | 'Chat' | 'Bovin' | 'Carpin' | 'Volaille' | 'Autre';
    race: string;
    dateNaissance: string;
    poidsKg?: number;
}
 
export interface Client{
    id: string;
    nom: string;
    prenom: string;
    telephone: string;
    email: string;
    adresse: string;
    dateInscription: string;
    animaux: Animal[]; //un client possede plusieurs animaux
}