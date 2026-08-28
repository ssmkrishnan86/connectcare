import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock, EyeOff } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';

interface AccessDeniedPageProps {
  moduleName?: string;
  requiredAction?: string;
}

export const AccessDeniedPage: React.FC<AccessDeniedPageProps> = ({
  moduleName = 'this section',
  requiredAction = 'access',
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { previewRole, setPreviewRole, firstPermittedRoute } = usePermission();

  const activeRoleDisplayName = previewRole ? previewRole.roleName : (user?.role || 'Current Role');

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Shield Icon Badge */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-3xl bg-rose-100/80 animate-pulse"></div>
          <div className="relative w-16 h-16 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30">
            <ShieldAlert className="h-8 w-8 stroke-[2.2]" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center border-2 border-white shadow-sm">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <span className="inline-block px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-[11px] uppercase tracking-wider rounded-full">
            Access Restricted
          </span>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Permission Required
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The role (<strong className="text-slate-800 font-bold">{activeRoleDisplayName}</strong>) does not have permission to {requiredAction} <strong className="text-slate-800 font-bold">{moduleName}</strong>.
          </p>
        </div>

        {/* Role Preview Banner */}
        {previewRole && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-center justify-between gap-2 text-left">
            <span className="text-[11px]">
              Viewing in preview mode as <strong>{previewRole.roleName}</strong>.
            </span>
            <button
              type="button"
              onClick={() => setPreviewRole(null)}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-[11px] shrink-0 transition-colors cursor-pointer"
            >
              <EyeOff className="h-3 w-3" /> Exit Preview
            </button>
          </div>
        )}

        {/* Informational Callout */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] text-slate-600 text-left space-y-1">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Role-Based Access Control
          </p>
          <p className="text-slate-500 text-[10px]">
            If you need access to this feature, please request permission from your System Administrator via <strong>Settings &gt; Roles &amp; Permissions</strong>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back</span>
          </button>
          
          <button
            type="button"
            onClick={() => navigate(firstPermittedRoute || '/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Home className="h-4 w-4" />
            <span>Main Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
