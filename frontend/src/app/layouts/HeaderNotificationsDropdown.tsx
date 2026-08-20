import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Bell, Check, CheckCheck, AlertTriangle, AlertCircle, Info, RefreshCw } from 'lucide-react';
import { fetchApi } from '@/lib/api';
import { setNotificationsCount } from '@/store/slices/uiSlice';

interface NotificationItem {
  id: string;
  alertIdCode: string;
  title: string;
  description: string;
  severity: string;
  type: string;
  patientName: string;
  roomLocation: string;
  timestampText: string;
  status: string;
  isRead: boolean;
}

interface HeaderNotificationsDropdownProps {
  onClose: () => void;
}

export const HeaderNotificationsDropdown: React.FC<HeaderNotificationsDropdownProps> = ({ onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchApi('/api/notifications');
      const data = res?.data || res;
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        const count = data.unreadCount ?? data.notifications.filter((n: NotificationItem) => !n.isRead).length;
        setUnreadCount(count);
        dispatch(setNotificationsCount(count));
      } else if (Array.isArray(data)) {
        setNotifications(data);
        const count = data.filter((n: NotificationItem) => !n.isRead).length;
        setUnreadCount(count);
        dispatch(setNotificationsCount(count));
      } else {
        setNotifications([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch notifications:', err);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetchApi(`/api/notifications/${id}/read`, { method: 'POST' });
      setNotifications(prev =>
        prev.map(item => (item.id === id ? { ...item, isRead: true, status: 'Resolved' } : item))
      );
      setUnreadCount(prev => {
        const next = Math.max(0, prev - 1);
        dispatch(setNotificationsCount(next));
        return next;
      });
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      await fetchApi('/api/notifications/read-all', { method: 'POST' });
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true, status: 'Resolved' })));
      setUnreadCount(0);
      dispatch(setNotificationsCount(0));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    } finally {
      setActionInProgress(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />;
      case 'medium':
        return <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-4 w-4 text-blue-500 shrink-0" />;
    }
  };

  const getSeverityBadgeClass = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'high':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden text-slate-800 font-sans animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={actionInProgress}
            className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Content Body */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-medium">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-xs font-semibold text-rose-600 mb-2">{error}</p>
            <button
              onClick={loadNotifications}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-40 text-slate-400" />
            <p className="text-xs font-semibold">No notifications</p>
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => {
                onClose();
                navigate('/alerts');
              }}
              className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer ${
                !item.isRead ? 'bg-indigo-50/40' : ''
              }`}
            >
              <div className="mt-0.5">{getSeverityIcon(item.severity)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{item.title}</h4>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase border ${getSeverityBadgeClass(
                      item.severity
                    )}`}
                  >
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-1.5">{item.description}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                  <span>
                    {item.patientName} {item.roomLocation ? `• ${item.roomLocation}` : ''}
                  </span>
                  <span>{item.timestampText}</span>
                </div>
              </div>
              {!item.isRead && (
                <button
                  onClick={e => handleMarkAsRead(item.id, e)}
                  title="Mark as read"
                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer shrink-0 mt-0.5"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center">
        <button
          onClick={() => {
            onClose();
            navigate('/alerts');
          }}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
        >
          View All Alerts & Incidents →
        </button>
      </div>
    </div>
  );
};
