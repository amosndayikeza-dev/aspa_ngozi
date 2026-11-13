
export type UserRole = 'PHARMACIEN' | 'VENDEUR' | 'ADMIN';

export interface User {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
}


export interface UserFormData {
  nom: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password: string;
}

// ... autres types existants (AuditLog, etc.)
export interface AuditLog {
  id: string;
  date: string;
  userNom: string;
  action: string;
  details: string;
}

