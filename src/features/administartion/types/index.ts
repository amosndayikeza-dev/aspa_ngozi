
export type UserRole = 'PHARMACIEN' | 'VENDEUR' | 'ADMIN';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  dateCreation: string;
}

export interface AuditLog {
  id: string;
  date: string;
  userNom: string;
  action: string;
  details: string;
}

export interface User{
  id:string;
  nom:string;
  emaail:string;
  role:UserRole;
  isActive: boolean;
  password?:string;

}