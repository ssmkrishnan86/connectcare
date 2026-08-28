import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, Bell, MessageSquare, Calendar, LogOut, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { toggleSidebar, setNotificationsCount, setMessagesCount } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';
import { fetchApi } from '@/lib/api';
import { HeaderNotificationsDropdown } from './HeaderNotificationsDropdown';
import { HeaderMessagesDropdown } from './HeaderMessagesDropdown';
import { HeaderCalendarDropdown } from './HeaderCalendarDropdown';

export const Header: React.FC = () => {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const isDoctor = user?.role?.toLowerCase() === 'doctor';

  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);
  const notificationsCount = useSelector((state: RootState) => state.ui.notificationsCount);
  const messagesCount = useSelector((state: RootState) => state.ui.messagesCount);

  const [activeDropdown, setActiveDropdown] = useState<'notifications' | 'messages' | 'calendar' | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial fetch and 30s background sync of counts from database
    const syncCounts = () => {
      fetchApi<any>(`/notifications/unread-count?role=${encodeURIComponent(user?.role || '')}&userId=${encodeURIComponent(user?.id || '')}`)
        .then((res: any) => {
          const count = res?.data?.unreadCount ?? res?.unreadCount ?? 0;
          dispatch(setNotificationsCount(count));
        })
        .catch(() => {
          // fallback gracefully
        });

      fetchApi<any>('/messages/conversations')
        .then((res: any) => {
          const dataArray = Array.isArray(res) ? res : res?.data;
          const count = res?.unreadCount ?? (Array.isArray(dataArray) ? dataArray.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0) : 0);
          dispatch(setMessagesCount(typeof count === 'number' ? count : 0));
        })
        .catch(() => {
          dispatch(setMessagesCount(0));
        });
    };

    syncCounts();
    const interval = setInterval(syncCounts, 30000);
    return () => clearInterval(interval);
  }, [dispatch, user?.id, user?.role]);

  // Click outside listener to auto-close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name: string) => {
    if (!name) return 'JA';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = isDoctor
    ? (user?.fullName || 'Dr. Sarah Wilson')
    : (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'John Admin');

  const roleTitle = isDoctor
    ? 'Cardiologist'
    : (user?.role === 'Admin' ? 'System Administrator' : user?.role || 'System Administrator');

  const toggleDropdown = (name: 'notifications' | 'messages' | 'calendar') => {
    setActiveDropdown(prev => (prev === name ? null : name));
  };

  const displayNotifCount = notificationsCount;
  const displayMsgCount = messagesCount;

  return (
    <header
      ref={headerRef}
      className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs"
    >
      {/* Left: Menu Toggle with Arrow Icon */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="flex items-center gap-1.5 p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all cursor-pointer group"
          title={sidebarOpen ? 'Hide Left Menu' : 'Show Left Menu'}
        >
          <Menu className="h-5 w-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
          {sidebarOpen ? (
            <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          ) : (
            <ChevronRight className="h-4 w-4 text-blue-600 transition-colors" />
          )}
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64 md:w-80 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, appointments, etc..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1.5 relative">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('notifications')}
              className={`relative p-2.5 rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'notifications' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              {displayNotifCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {displayNotifCount > 99 ? '99+' : displayNotifCount}
                </span>
              )}
            </button>
            {activeDropdown === 'notifications' && (
              <HeaderNotificationsDropdown onClose={() => setActiveDropdown(null)} />
            )}
          </div>

          {/* Messages Button */}
          <div className="relative">
            <button
              onClick={() => toggleDropdown('messages')}
              className={`relative p-2.5 rounded-xl transition-colors cursor-pointer ${
                activeDropdown === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title="Messages"
            >
              <MessageSquare className="h-4 w-4" />
              {displayMsgCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                  {displayMsgCount > 99 ? '99+' : displayMsgCount}
                </span>
              )}
            </button>
            {activeDropdown === 'messages' && (
              <HeaderMessagesDropdown onClose={() => setActiveDropdown(null)} />
            )}
          </div>

          {!isDoctor && (
            /* Calendar Button for Admin/Nurse */
            <div className="relative">
              <button
                onClick={() => toggleDropdown('calendar')}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  activeDropdown === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
                title="Calendar"
              >
                <Calendar className="h-4 w-4" />
              </button>
              {activeDropdown === 'calendar' && (
                <HeaderCalendarDropdown onClose={() => setActiveDropdown(null)} />
              )}
            </div>
          )}
        </div>

        {/* User Profile Area & Logout */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
            <p className="text-[11px] font-semibold text-blue-600 leading-tight">{roleTitle}</p>
          </div>

          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="User Avatar"
              className="h-9 w-9 rounded-full object-cover shadow-2xs border border-slate-200"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs shadow-2xs">
              {getInitials(displayName)}
            </div>
          )}

          {/* Header Logout Button */}
          <button
            type="button"
            onClick={() => logout()}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
