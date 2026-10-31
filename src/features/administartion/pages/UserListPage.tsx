import { useState, useEffect } from 'react';
import { Plus, Search, Mail, ShieldCheck, MoreHorizontal, UserCheck, UserX, Edit } from 'lucide-react';
import { userApi } from '../api/userApi';
import type { User, UserRole } from '../types';
import { UserForm } from '../components/UserForm';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog'; // <-- Import ajouté
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';

export function UserListPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // États pour la modale de suppression
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = () => {
    setIsLoading(true);
    userApi.getUsers().then(data => {
      setUsers(data);
      setIsLoading(false);
    });
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (data: any) => {
    try {
      if (selectedUser) {
        await userApi.updateUser(selectedUser.id, data);
        toast.success("Utilisateur mis à jour");
      } else {
        await userApi.createUser(data);
        toast.success("Nouvel utilisateur créé");
      }
      setIsDrawerOpen(false);
      fetchUsers();
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement");
    }
  };

  // --- SUPPRESSION ---
  const handleOpenDelete = (id: string) => {
    setUserToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await userApi.deleteUser(userToDelete);
      toast.success("Compte supprimé avec succès");
      setIsDeleteModalOpen(false);
      setIsDrawerOpen(false); // Ferme le panneau d'édition
      fetchUsers();
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const RoleBadge = ({ role }: { role: UserRole }) => {
    const styles = {
      PHARMACIEN: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      VENDEUR: 'bg-blue-50 text-blue-700 border-blue-200',
      ADMIN: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border", styles[role])}>
        <ShieldCheck className="w-3 h-3" /> {role}
      </span>
    );
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] max-w-[1400px] mx-auto flex flex-col gap-4 relative overflow-hidden">
      
      {/* EN-TÊTE */}
      <div className="flex justify-between items-end shrink-0">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-600" /> Équipe & Accès
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">Gérez les membres de votre personnel et leurs niveaux d'accréditation.</p>
        </div>
        <button onClick={handleOpenCreate} className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Inviter un membre
        </button>
      </div>

      {/* RECHERCHE */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* GRILLE UTILISATEURS */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white/50 rounded-xl animate-pulse border border-slate-200/60" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between">
                
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleOpenEdit(user)}>
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border", user.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-400 border-slate-200")}>
                      {user.nom.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{user.nom}</h3>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3" /> {user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleOpenEdit(user)} className="text-slate-400 hover:text-emerald-600 transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2 pt-3 border-t border-slate-50">
                  <RoleBadge role={user.role} />
                  <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase", user.isActive ? "text-emerald-600" : "text-rose-500")}>
                    {user.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                    {user.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SIDE-DRAWER */}
      <div className={cn("fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300", isDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={() => setIsDrawerOpen(false)} />
      <div className={cn("fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col", isDrawerOpen ? "translate-x-0" : "translate-x-full")}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900">{selectedUser ? "Modifier le membre" : "Inviter un membre"}</h2>
          <button onClick={() => setIsDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 text-[11px] font-medium">Fermer</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          <UserForm 
            initialData={selectedUser}
            onSubmit={handleSubmit}
            onDelete={handleOpenDelete} // <-- Passage de la fonction de suppression
            onCancel={() => setIsDrawerOpen(false)}
          />
        </div>
      </div>

      {/* MODALE DE SUPPRESSION */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Supprimer ce compte ?"
        description="Cette action est irréversible. L'utilisateur ne pourra plus se connecter à l'application."
        isLoading={isDeleting}
      />

    </div>
  );
}