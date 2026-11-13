// src/features/notifications/pages/NotificationCenterPage.tsx
import { useState, useEffect } from 'react';
import { 
  Bell, CheckCheck, Trash2, AlertTriangle, Package, Info, 
  CheckCircle2, Filter, Search, Inbox
} from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import type { Notification, NotificationType } from '../types';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filterType, setFilterType] = useState<NotificationType | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'UNREAD'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchNotifications = async () => {
    setIsLoading(true);
    const data = await notificationApi.getNotifications();
    setNotifications(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success("Tout est marqué comme lu.");
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await notificationApi.deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification supprimée.");
  };

  const filteredNotifications = notifications.filter(n => {
    const matchType = filterType === 'ALL' || n.type === filterType;
    const matchStatus = filterStatus === 'ALL' || (filterStatus === 'UNREAD' && !n.isRead);
    const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        n.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'STOCK': return { icon: Package, color: 'text-rose-600', bg: 'bg-rose-50', label: 'Stock' };
      case 'PEREMPTION': return { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Péremption' };
      case 'SYSTEME': return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Système' };
      default: return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Info' };
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto pb-10 space-y-4">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" /> Centre de Notifications
          </h1>
          <p className="text-[11px] text-slate-500 mt-1">
            {unreadCount > 0 
              ? `Vous avez ${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}.`
              : "Toutes vos notifications sont à jour."}
          </p>
        </div>
        
        <button 
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0}
          className="h-8 px-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
          Tout marquer comme lu
        </button>
      </div>

      {/* --- BARRE D'OUTILS UNIFIÉE --- */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-2 flex flex-col md:flex-row gap-2 items-center justify-between">
        
        {/* Recherche */}
        <div className="relative w-full md:max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une notification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/60 transition-all"
          />
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-8 px-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold focus:outline-none focus:border-emerald-500 shrink-0"
          >
            <option value="ALL">Toutes</option>
            <option value="UNREAD">Non lues</option>
          </select>

          <div className="flex bg-slate-100 p-0.5 rounded-lg shrink-0">
            {(['ALL', 'STOCK', 'PEREMPTION', 'SYSTEME'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={cn(
                  "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all",
                  filterType === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {type === 'ALL' ? 'Tout' : type === 'PEREMPTION' ? 'Péremption' : type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- LISTE DES NOTIFICATIONS --- */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden min-h-[400px]">
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-400 animate-pulse">Chargement...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="h-[400px] flex flex-col items-center justify-center text-slate-400">
            <Inbox className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Aucune notification trouvée</p>
            <p className="text-[11px] mt-1">Modifiez vos filtres pour voir plus de résultats.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredNotifications.map((notif) => {
              const config = getTypeConfig(notif.type);
              const Icon = config.icon;

              return (
                <div 
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkAsRead(notif.id)}
                  className={cn(
                    "p-3.5 flex gap-3 transition-colors cursor-pointer group items-start",
                    notif.isRead ? "bg-white hover:bg-slate-50" : "bg-emerald-50/40 hover:bg-emerald-50/70"
                  )}
                >
                  {/* Icône */}
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs font-bold", notif.isRead ? "text-slate-700" : "text-slate-900")}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                            Nouveau
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                        {new Date(notif.date).toLocaleDateString('fr-FR')} • {new Date(notif.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <p className={cn("text-[11px] leading-relaxed", notif.isRead ? "text-slate-500" : "text-slate-600")}>
                      {notif.message}
                    </p>
                  </div>

                  {/* Actions (visibles au survol) */}
                  <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button 
                      onClick={(e) => handleDelete(notif.id, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}