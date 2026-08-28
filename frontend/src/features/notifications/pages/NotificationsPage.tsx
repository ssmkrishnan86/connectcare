import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  RefreshCw,
  Search,
  Trash2,
  Calendar,
  Pill,
  MessageSquare,
  FileText,
  UserCheck,
  Clock,
  ArrowRight,
  Sparkles,
  Inbox,
} from 'lucide-react';
import { api } from '@/lib/api';
import { setNotificationsCount } from '@/store/slices/uiSlice';
import { useAuth } from '@/features/auth/context/AuthContext';

interface NotificationItem {
  id: string;
  userId?: string;
  userRole?: string;
  title: string;
  message: string;
  description?: string;
  type: string;
  severity: string;
  actionUrl?: string;
  patientName?: string;
  patientIdCode?: string;
  roomLocation?: string;
  isRead: boolean;
  timestampText: string;
  createdDate?: string;
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await api.getNotifications({
        role: user?.role,
        userId: user?.id,
        search: searchTerm || undefined,
        type: selectedCategory !== 'All' ? selectedCategory : undefined,
        severity: selectedSeverity !== 'All' ? selectedSeverity : undefined,
        isRead: readFilter === 'unread' ? false : readFilter === 'read' ? true : undefined,
        pageSize: 100,
      });

      const data = res?.data || res;
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        const count = data.unreadCount ?? data.notifications.filter((n: NotificationItem) => !n.isRead).length;
        dispatch(setNotificationsCount(count));
      } else if (Array.isArray(data)) {
        setNotifications(data);
        const count = data.filter((n: NotificationItem) => !n.isRead).length;
        dispatch(setNotificationsCount(count));
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err?.message || 'Failed to load notifications from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [selectedCategory, selectedSeverity, readFilter, user?.id, user?.role]);

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      loadNotifications();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
      );
      dispatch(setNotificationsCount(Math.max(0, notifications.filter(n => !n.isRead && n.id !== id).length)));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await api.markAllNotificationsRead(user?.id, user?.role);
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
      dispatch(setNotificationsCount(0));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      const remaining = notifications.filter(item => item.id !== id);
      setNotifications(remaining);
      dispatch(setNotificationsCount(remaining.filter(n => !n.isRead).length));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleClearAllRead = async () => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await api.clearAllReadNotifications(user?.id, user?.role);
      const remaining = notifications.filter(item => !item.isRead);
      setNotifications(remaining);
      dispatch(setNotificationsCount(remaining.length));
    } catch (err) {
      console.error('Failed to clear read notifications:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all notification records?')) return;
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await api.clearAllNotificationData();
      setNotifications([]);
      dispatch(setNotificationsCount(0));
    } catch (err) {
      console.error('Failed to clear all notifications:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.isRead) {
      handleMarkAsRead(item.id);
    }
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const getTypeIcon = (type: string, severity: string) => {
    const t = type?.toLowerCase();
    const s = severity?.toLowerCase();

    if (s === 'critical') return <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />;
    if (t === 'alert') return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
    if (t === 'task') return <UserCheck className="h-5 w-5 text-amber-500 shrink-0" />;
    if (t === 'consultation') return <Calendar className="h-5 w-5 text-blue-500 shrink-0" />;
    if (t === 'medication') return <Pill className="h-5 w-5 text-purple-500 shrink-0" />;
    if (t === 'shifthandover') return <Clock className="h-5 w-5 text-emerald-500 shrink-0" />;
    if (t === 'careplan' || t === 'clinical') return <FileText className="h-5 w-5 text-indigo-500 shrink-0" />;
    if (t === 'message') return <MessageSquare className="h-5 w-5 text-sky-500 shrink-0" />;
    return <Info className="h-5 w-5 text-blue-500 shrink-0" />;
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const categories = [
    { label: 'All', value: 'All' },
    { label: 'Alerts', value: 'Alert' },
    { label: 'Tasks', value: 'Task' },
    { label: 'Consultations', value: 'Consultation' },
    { label: 'Medications', value: 'Medication' },
    { label: 'Shift Handover', value: 'ShiftHandover' },
    { label: 'Care Plans', value: 'CarePlan' },
    { label: 'Messages', value: 'Message' },
    { label: 'System', value: 'System' },
  ];

  const totalCount = notifications.length;
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const criticalCount = notifications.filter(n => n.severity?.toLowerCase() === 'critical' && !n.isRead).length;
  const taskCount = notifications.filter(n => n.type?.toLowerCase() === 'task' && !n.isRead).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications Center</h1>
              <p className="text-xs text-slate-500 font-medium">
                Live alerts, clinical assignments, consultation updates, and hospital broadcasts.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionInProgress}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </button>
          )}
          <button
            onClick={handleClearAllRead}
            disabled={actionInProgress || notifications.every(n => !n.isRead)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check className="h-4 w-4 text-slate-400" />
            Clear Read
          </button>
          <button
            onClick={handleClearAllData}
            disabled={actionInProgress || notifications.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4 text-rose-600" />
            Clear All
          </button>
          <button
            onClick={loadNotifications}
            className="p-2 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl transition-colors cursor-pointer"
            title="Refresh notifications"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Total Inbox</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{totalCount}</h3>
            <p className="text-[10px] text-slate-400 font-medium">{unreadCount} unread currently</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Critical Alerts</p>
            <h3 className="text-xl font-black text-rose-600 leading-tight">{criticalCount}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Requires immediate response</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Active Tasks</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">{taskCount}</h3>
            <p className="text-[10px] text-slate-400 font-medium">Assigned clinical tasks</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400">Live Delivery</p>
            <h3 className="text-xl font-black text-slate-900 leading-tight">100%</h3>
            <p className="text-[10px] text-emerald-600 font-bold">Synchronized in Real-Time</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search notifications by title, patient, room, or details..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* Severity & Read Status Filters */}
          <div className="flex items-center gap-2.5">
            <select
              value={selectedSeverity}
              onChange={e => setSelectedSeverity(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical Only</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Info">Informational</option>
            </select>

            <select
              value={readFilter}
              onChange={e => setReadFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs font-bold">
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-3">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold">Loading notification records...</p>
          </div>
        ) : error ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <p className="text-xs font-bold text-rose-600">{error}</p>
            <button
              onClick={loadNotifications}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-16 rounded-2xl border border-slate-200 text-center space-y-3">
            <Bell className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No notifications found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are all caught up! When patient alerts, assignments, or clinical updates occur, they will appear here in real-time.
            </p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group bg-white hover:border-blue-300 hover:shadow-md ${
                !item.isRead ? 'border-blue-200 bg-blue-50/20 shadow-2xs' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Type Icon */}
                <div className="mt-0.5 p-2 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform">
                  {getTypeIcon(item.type, item.severity)}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      {!item.isRead && (
                        <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" title="Unread" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase border ${getSeverityBadgeClass(
                          item.severity
                        )}`}
                      >
                        {item.severity || 'Info'}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">{item.timestampText}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {item.message || item.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 text-[11px]">
                    <div className="flex items-center gap-3 text-slate-500 font-semibold">
                      {item.patientName && (
                        <span className="text-blue-600 font-bold">
                          {item.patientName} {item.patientIdCode ? `(${item.patientIdCode})` : ''}
                        </span>
                      )}
                      {item.roomLocation && <span>📍 {item.roomLocation}</span>}
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-bold text-[10px] uppercase">
                        {item.type}
                      </span>
                    </div>

                    {/* Inline Actions */}
                    <div className="flex items-center gap-2">
                      {item.actionUrl && (
                        <span className="text-xs font-bold text-blue-600 group-hover:underline inline-flex items-center gap-1">
                          View Details <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                      {!item.isRead && (
                        <button
                          onClick={e => handleMarkAsRead(item.id, e)}
                          title="Mark as read"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={e => handleDelete(item.id, e)}
                        title="Delete notification"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
