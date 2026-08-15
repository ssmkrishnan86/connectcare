import React from 'react';
import { Search, Bell, Mail, Calendar, LogOut, UserCheck } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const displayName = user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'User';
  const roleBadge = user?.role || 'Admin';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search patients, alerts, tasks..."
          className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 font-medium">
          <Calendar className="h-3.5 w-3.5 text-slate-500" />
          <span>May 20, 2026</span>
          <span className="text-slate-400">Monday</span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              8
            </span>
          </button>

          <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer">
            <Mail className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>
        </div>

        {/* User Profile Badge & Logout Button */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shadow-xs">
            {getInitials(displayName)}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">{displayName}</p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[10px]">
              <UserCheck className="h-2.5 w-2.5" /> {roleBadge}
            </span>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => logout()}
            title="Sign Out"
            className="flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition-all cursor-pointer group"
          >
            <LogOut className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
