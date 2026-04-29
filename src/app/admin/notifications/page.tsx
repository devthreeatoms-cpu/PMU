"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  ShoppingBag, 
  MessageSquare, 
  Check, 
  CheckCheck, 
  ExternalLink,
  Calendar,
  Filter
} from "lucide-react";
import Link from "next/link";
import { 
  getNotificationsAction, 
  markNotificationAsReadAction, 
  markAllNotificationsAsReadAction 
} from "./actions";
import { AdminNotification } from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setIsLoading(true);
    const result = await getNotificationsAction();
    if (result.success) {
      setNotifications(result.notifications || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    const result = await markNotificationAsReadAction(id);
    if (result.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsReadAction();
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading italic text-zinc-900">System Activity</h1>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-2">
            Real-time notifications & logs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-1 flex gap-1">
            <button 
              onClick={() => setFilter("all")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === "all" ? "bg-zinc-900 text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter("unread")}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                filter === "unread" ? "bg-[#FF4D6D] text-white shadow-lg" : "text-zinc-500 hover:bg-zinc-50"
              }`}
            >
              Unread
            </button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleMarkAllAsRead}
            className="rounded-xl border-zinc-200 text-[10px] font-bold uppercase tracking-widest"
          >
            <CheckCheck size={14} className="mr-2" /> Mark All Read
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-zinc-100 animate-pulse" />
          ))
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-dashed border-zinc-200 p-20 text-center">
            <Bell className="w-12 h-12 text-zinc-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900">No notifications found</h3>
            <p className="text-sm text-zinc-400 mt-1 italic">Everything is up to date.</p>
          </div>
        ) : (
          filteredNotifications.map((notif, idx) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`group bg-white rounded-2xl border transition-all hover:shadow-xl hover:shadow-zinc-200/50 p-6 flex flex-col md:flex-row md:items-center gap-6 ${
                !notif.isRead ? "border-brand-rose/20 bg-brand-rose/[0.02]" : "border-zinc-100"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                notif.type === 'order' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {notif.type === 'order' ? <ShoppingBag size={20} /> : <MessageSquare size={20} />}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className={`text-sm font-bold tracking-tight ${!notif.isRead ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    {notif.title}
                  </h3>
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#FF4D6D] animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                  {notif.message}
                </p>
                <div className="flex items-center gap-4 pt-1">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                    <Calendar size={12} /> {formatDistanceToNow(notif.createdAt)} ago
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 md:border-l md:pl-6 md:border-zinc-100">
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notif.id!)}
                    className="p-2 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                    title="Mark as read"
                  >
                    <Check size={18} />
                  </button>
                )}
                <Link 
                  href={notif.link}
                  className="flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-rose transition-all shadow-lg shadow-zinc-900/10"
                  onClick={() => handleMarkAsRead(notif.id!)}
                >
                  Action <ExternalLink size={12} />
                </Link>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
