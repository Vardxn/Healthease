import React, { useState, useMemo } from 'react';
import { useNotifications } from '../context/NotificationContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Input from '../components/ui/Input';
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertCircle,
  FileText,
  Video,
  Pill,
  Activity,
  Sparkles,
  ShieldCheck,
  Search,
  Eye,
  Trash
} from 'lucide-react';

const CATEGORY_CONFIG = {
  prescription: { label: 'Prescriptions', icon: FileText, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' },
  consultation: { label: 'Consultations', icon: Video, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
  medicine: { label: 'Medicines', icon: Pill, color: 'text-secondary bg-secondary/10 border-secondary/20' },
  vitals: { label: 'Vitals', icon: Activity, color: 'text-danger bg-danger/10 border-danger/20' },
  ai: { label: 'AI Health', icon: Sparkles, color: 'text-primary bg-primary/10 border-primary/20' },
  admin: { label: 'System', icon: ShieldCheck, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' }
};

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      const matchesSearch =
        notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notif.message.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || notif.category === selectedCategory;
      const matchesUnread = !unreadOnly || !notif.read;
      return matchesSearch && matchesCategory && matchesUnread;
    });
  }, [notifications, searchTerm, selectedCategory, unreadOnly]);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return 'Just now';
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryIcon = (category) => {
    const config = CATEGORY_CONFIG[category];
    if (!config) return <Bell size={16} />;
    const IconComponent = config.icon;
    return <IconComponent size={16} className={config.color.split(' ')[0]} />;
  };

  return (
    <div className="w-full space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight">Notification Center</h2>
          <p className="text-text-secondary text-sm">
            Stay updated with your prescription status, vitals logs, and telemedicine reminders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="secondary" className="text-xs font-bold rounded-custom">
              <CheckCircle2 size={14} className="mr-1.5" /> Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 border border-danger/20 hover:bg-danger/5 text-danger rounded-custom text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar Card */}
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative w-full md:col-span-2">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search health alerts, prescriptions..."
              className="w-full pl-10 pr-4 py-2 bg-surface-secondary border border-border rounded-[12px] text-sm focus:outline-none focus:border-primary focus:bg-surface transition-all text-text-primary"
            />
          </div>

          {/* Toggle for unread */}
          <label className="flex items-center gap-2.5 text-xs font-bold text-text-primary cursor-pointer select-none self-center md:justify-end">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="h-4.5 w-4.5 rounded border-border text-primary focus:ring-primary"
            />
            Show Unread Only
          </label>
        </div>

        {/* Categories Selectors */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary border-primary text-white'
                : 'bg-surface-secondary border-border text-text-secondary hover:border-text-secondary/50'
            }`}
          >
            All Updates
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                selectedCategory === key
                  ? 'bg-primary border-primary text-white'
                  : 'bg-surface-secondary border-border text-text-secondary hover:border-text-secondary/50'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Notifications Grid List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto space-y-4">
            <Bell size={48} className="mx-auto text-text-secondary/40" />
            <h4 className="font-bold text-text-primary text-lg">No Notifications</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {unreadOnly || searchTerm || selectedCategory !== 'all'
                ? 'Try clearing active filters or search terms.'
                : 'New updates and reminders will appear here when generated.'}
            </p>
          </Card>
        ) : (
          filteredNotifications.map((notif) => (
            <Card
              key={notif.id}
              className={`p-5 transition-all border relative flex items-start gap-4 ${
                notif.read
                  ? 'bg-surface/60 border-border opacity-75'
                  : 'bg-surface border-primary/20 shadow-md'
              }`}
            >
              {/* Left indicator pill */}
              {!notif.read && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-custom" />
              )}

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${
                CATEGORY_CONFIG[notif.category]?.color || 'bg-slate-500/10 border-slate-500/20 text-slate-500'
              }`}>
                {getCategoryIcon(notif.category)}
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className={`text-base font-bold ${notif.read ? 'text-text-primary/80' : 'text-text-primary'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-[10px] text-text-secondary font-semibold whitespace-nowrap">
                    {formatDate(notif.timestamp)}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed">{notif.message}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-shrink-0 self-center">
                {!notif.read && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="p-2 hover:bg-surface-secondary text-text-secondary hover:text-primary rounded-lg transition-all"
                    title="Mark Read"
                  >
                    <Eye size={15} />
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notif.id)}
                  className="p-2 hover:bg-danger/10 text-text-secondary hover:text-danger rounded-lg transition-all"
                  title="Delete Alert"
                >
                  <Trash size={14} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
