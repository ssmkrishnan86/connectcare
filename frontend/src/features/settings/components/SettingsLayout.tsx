import React from 'react';
import { Outlet } from 'react-router-dom';
import { Save } from 'lucide-react';

export const SettingsLayout: React.FC = () => {
  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Settings</h2>
          <p className="text-xs text-slate-500 font-medium">Manage system configuration, security, organization details and preferences.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Dynamic Outlet Sub-Page View */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default SettingsLayout;
