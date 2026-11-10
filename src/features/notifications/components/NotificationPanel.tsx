// src/features/notifications/components/NotificationPanel.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, AlertTriangle, Package, Info, CheckCircle2, CheckCheck, ArrowRight } from 'lucide-react';
import { notificationApi } from '../api/notificationApi';
import type { Notification, NotificationType } from '../types';
import { cn } from '@/shared/lib/cn';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      notificationApi.getNotifications().then(setNotifications);
    }
  }, [isOpen]);

  // Configuration visuelle par type de notification
  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case 'STOCK': 
        return { 
          icon: Package, 
          iconColor: 'text-rose-600', 
          bgColor: 'bg-rose-50', 
          borderColor: 'border-rose-200',
          label: 'Stock'
        };
      case 'PEREMPTION': 
        return { 
          icon: AlertTriangle, 
          iconColor: 'text-amber-600', 
          bgColor: 'bg-amber-50', 
          borderColor: 'border-amber-200',
          label: 'Péremption'
        };
      case 'SYSTEME': 
        return { 
          icon: Info, 
          iconColor: 'text-blue-600', 
          bgColor: 'bg-blue-50', 
          borderColor: 'border-blue-200',
          label: 'Système'
        };
      default: 
        return { 
          icon: CheckCircle2, 
          iconColor: 'text-emerald-600', 
          bgColor: 'bg-emerald-50', 
          borderColor: 'border-emerald-200',
          label: 'Info'
        };
    }
  };

  // Marquer une notification comme lue localement (à connecter au backend plus tard)
  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      {/* Overlay sombre */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity duration-300 print:hidden", 
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panneau latéral (un peu plus large pour respirer) */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-full max-w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col print:hidden",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        
        {/* --- EN-TÊTE --- */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- LISTE DES NOTIFICATIONS --- */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 py-10 opacity-70">
              <CheckCircle2 className="w-10 h-10 mb-2 text-slate-300" />
              <p className="text-sm font-medium">Tout est à jour !</p>
              <p className="text-xs mt-1">Aucune notification pour le moment.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const config = getTypeConfig(notif.type);
              const Icon = config.icon;

              return (
                <div 
                  key={notif.id} 
                  onClick={() => markAsRead(notif.id)}
                  className={cn(
                    "relative p-3 rounded-xl border flex gap-3 transition-all cursor-pointer group",
                    notif.isRead 
                      ? "bg-white border-slate-100 opacity-60 hover:opacity-100" 
                      : "bg-white border-slate-200 shadow-sm hover:border-emerald-300 hover:shadow-md"
                  )}
                >
                  {/* Bordure latérale colorée pour les non-lues */}
                  {!notif.isRead && (
                    <div className={cn("absolute left-0 top-3 bottom-3 w-1 rounded-r-full", config.iconColor.replace('text-', 'bg-'))} />
                  )}

                  {/* Icône dans une bulle colorée */}
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", config.bgColor)}>
                    <Icon className={cn("w-4 h-4", config.iconColor)} />
                  </div>

                  {/* Contenu textuel */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <p className={cn("text-xs font-bold truncate pr-2", notif.isRead ? "text-slate-600" : "text-slate-900")}>
                        {notif.title}
                      </p>
                      {!notif.isRead && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1" />}
                    </div>
                    
                    <p className={cn("text-[11px] leading-snug line-clamp-2", notif.isRead ? "text-slate-500" : "text-slate-600")}>
                      {notif.message}
                    </p>
                    
                    <div className="flex items-center justify-between mt-2">
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", config.bgColor, config.iconColor)}>
                        {config.label}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {new Date(notif.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* --- PIED DU PANNEAU --- */}
        {notifications.length > 0 && (
          <div className="p-3 border-t border-slate-100 bg-white shrink-0 space-y-2">
            <button 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="w-full h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCheck className="w-4 h-4" />
              Tout marquer comme lu
            </button>
            
            <button 
              onClick={() => { onClose(); navigate('/notifications'); }}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Voir le centre de notifications
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </>
  );
}