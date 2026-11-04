export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN';

export interface AuditLog {
  id: string;
  date: string;
  userNom: string;
  userRole: string;
  action: AuditAction;
  module: string;
  details: string;
}