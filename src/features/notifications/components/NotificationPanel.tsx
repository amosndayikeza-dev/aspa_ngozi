import { useState, useEffect } from 'react';
import { X, AlertTriangle, Package, Info, CheckCircle2 } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import type { Notification, NotificationType } from '../types';
import { cn } from '@/shared/lib/cn';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (isOpen) {
      notificationApi.getNotifications().then(setNotifications);
    }
  }, [isOpen]);

  // Icônes et couleurs selon le type
  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'STOCK': return <Package className="w-4 h-4 text-rose-600" />;
      case 'PEREMPTION': return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'SYSTEME': return <Info className="w-4 h-4 text-blue-600" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
  };

  const getBgColor = (type: NotificationType) => {
    switch (type) {
      case 'STOCK': return "bg-rose-50 border-rose-100";
      case 'PEREMPTION': return "bg-amber-50 border-amber-100";
      case 'SYSTEME': return "bg-blue-50 border-blue-100";
      default: return "bg-emerald-50 border-emerald-100";
    }
  };

  return (
    <>
      {/* Overlay sombre */}
      <div 
        className={cn("fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 transition-opacity duration-300 print:hidden", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")}
        onClick={onClose}
      />

      {/* Panneau latéral */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-[350px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col print:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            Notifications
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.isRead).length} non lues
            </span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-3 rounded-xl border flex gap-3 transition-colors cursor-default",
                notif.isRead ? "bg-white border-slate-100 opacity-70" : getBgColor(notif.type)
              )}
            >
              <div className="shrink-0 mt-0.5">{getIcon(notif.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="text-xs font-bold text-slate-900">{notif.title}</p>
                  {!notif.isRead && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1" />}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">{notif.message}</p>
                <p className="text-[9px] text-slate-400 mt-1.5 uppercase font-medium">
                  {new Date(notif.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}