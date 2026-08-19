import React from 'react';
import { Search, Bell, Mail, Calendar, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return 'JA';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'John Admin';
  const roleTitle = user?.role === 'Admin' ? 'System Administrator' : user?.role || 'System Administrator';

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      {/* Left: Hamburger Menu Icon */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" title="Toggle Sidebar">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Search Input */}
        <div className="relative w-64 md:w-80 lg:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search patients, ID, phone, email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
          />
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Notifications">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
              8
            </span>
          </button>

          <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Messages">
            <Mail className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center">
              3
            </span>
          </button>

          <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer" title="Calendar">
            <Calendar className="h-4 w-4" />
          </button>
        </div>

        {/* User Profile Badge & Logout Button */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs shadow-2xs">
            {getInitials(displayName)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
            <p className="text-[11px] font-semibold text-slate-400 leading-tight">{roleTitle}</p>
          </div>

          {/* Logout Button */}
          <button
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
