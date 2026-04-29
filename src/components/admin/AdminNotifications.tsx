"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, ShoppingBag, MessageSquare, Check, CheckCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { 
  getNotificationsAction, 
  getUnreadNotificationsCountAction, 
  markNotificationAsReadAction, 
  markAllNotificationsAsReadAction 
} from "@/app/admin/notifications/actions";
import { AdminNotification } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    const [notifsResult, countResult] = await Promise.all([
      getNotificationsAction(),
      getUnreadNotificationsCountAction()
    ]);

    if (notifsResult.success) setNotifications(notifsResult.notifications || []);
    if (countResult.success) setUnreadCount(countResult.count || 0);
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsReadAction(id);
    if (result.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsReadAction();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all group ${
          isOpen ? "bg-zinc-100 text-zinc-900" : "text-zinc-500 hover:bg-zinc-100"
        }`}
      >
        <Bell size={20} className={isOpen ? "scale-110" : "group-hover:scale-110 transition-transform"} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF4D6D] text-[10px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-900">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-[9px] font-bold text-[#FF4D6D] hover:text-zinc-900 transition-colors uppercase tracking-widest flex items-center gap-1"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto no-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-zinc-200 mx-auto mb-2" />
                  <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">No notifications yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={`p-4 border-b border-zinc-50 last:border-0 transition-colors hover:bg-zinc-50 group relative ${
                      !notif.isRead ? "bg-brand-rose/5" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        notif.type === 'order' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {notif.type === 'order' ? <ShoppingBag size={14} /> : <MessageSquare size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-[11px] font-bold truncate ${!notif.isRead ? 'text-zinc-900' : 'text-zinc-600'}`}>
                            {notif.title}
                          </p>
                          <span className="text-[8px] text-zinc-400 whitespace-nowrap">
                            {formatDistanceToNow(notif.createdAt)} ago
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 line-clamp-2 mt-0.5 leading-relaxed">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <Link 
                            href={notif.link}
                            onClick={() => {
                              handleMarkAsRead(notif.id!);
                              setIsOpen(false);
                            }}
                            className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-gold hover:text-zinc-900 flex items-center gap-1"
                          >
                            View Details <ExternalLink size={10} />
                          </Link>
                          {!notif.isRead && (
                            <button 
                              onClick={() => handleMarkAsRead(notif.id!)}
                              className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-emerald-600 flex items-center gap-1"
                            >
                              Mark Read <Check size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center">
              <Link 
                href="/admin/notifications" 
                className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                View all activity
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
