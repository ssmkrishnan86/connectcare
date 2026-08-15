import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';
import { RoleCreateModal } from '../components/RoleCreateModal';

export const RolesPermissionsSettingsPage: React.FC = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Permissions');
  const [permissionPreset, setPermissionPreset] = useState('Full Access');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchRoles = () => {
    api.getSettingsRoles()
      .then((data) => {
        setRoles(data || []);
        if (data && data.length > 0 && !selectedRole) {
          setSelectedRole(data[0]);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const modulesList = [
    { name: 'Dashboard', access: [true, true, true, true, true, true, false, true] },
    { name: 'Residents', access: [true, true, true, true, true, true, true, true] },
    { name: 'Care Team', access: [true, true, true, true, true, true, true, true] },
    { name: 'Clinical', access: [true, true, true, true, true, true, true, true] },
    { name: 'Medication', access: [true, true, true, true, true, true, true, true] },
    { name: 'Financial', access: [true, true, true, true, true, true, true, true] },
    { name: 'Reports & Analytics', access: [true, true, true, true, true, true, true, true] },
    { name: 'Alerts & Incidents', access: [true, true, true, true, true, true, false, false] },
    { name: 'Integrations', access: [true, true, true, true, false, false, false, false] },
    { name: 'Settings', access: [true, false, true, true, false, false, false, false] },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Roles & Permissions</h3>
          <p className="text-xs text-slate-500 font-medium">Create and manage roles for the application.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20"
        >
          <Plus className="h-4 w-4" /> Create New Role
        </button>
      </div>

      {/* Grid: Left Roles List (1/3) + Right Permissions Matrix (2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Roles List */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-3 h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Roles</h4>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search roles..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <Filter className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-2">
            {roles.map((r, i) => (
              <div
                key={r.id || i}
                onClick={() => setSelectedRole(r)}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  selectedRole?.id === r.id || selectedRole?.roleName === r.roleName
                    ? 'bg-purple-50/80 border-purple-300 shadow-sm'
                    : 'bg-white border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">{r.roleName}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{r.description}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full shrink-0">
                    {r.usersCount} Users
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400">Showing 1 to 10 of 10 roles</span>
            <div className="flex items-center gap-1">
              <button className="p-1 border border-slate-200 rounded text-slate-400"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold text-[10px]">1</button>
              <button className="p-1 border border-slate-200 rounded text-slate-400"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        </div>

        {/* Right Column: Role Details & Matrix */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base text-slate-900">{selectedRole?.roleName || 'System Administrator'}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                    {selectedRole?.categoryBadge || 'System Role'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {selectedRole?.description || 'Full access to all modules and settings. Can manage users, roles and system configurations.'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold">
                  <Edit2 className="h-3.5 w-3.5" /> Edit Role
                </button>
                <button className="p-1.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sub-tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
              <div className="flex gap-4">
                {['Permissions', `Users (${selectedRole?.usersCount || 12})`, 'Role Details'].map((tb) => (
                  <button
                    key={tb}
                    onClick={() => setActiveTab(tb.split(' ')[0])}
                    className={`pb-2 font-bold border-b-2 transition-colors ${
                      activeTab === tb.split(' ')[0]
                        ? 'border-purple-600 text-purple-700'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tb}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button className="px-3 py-1 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg font-semibold text-[11px]">
                  Module View
                </button>
                <button className="px-3 py-1 text-slate-500 hover:bg-slate-50 rounded-lg font-medium text-[11px]">
                  Action View
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">Module Permissions</h5>
                  <p className="text-[10px] text-slate-400">Define access level for each module.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-2.5 text-left">Module</th>
                      <th className="p-2.5">Full Access</th>
                      <th className="p-2.5">Create</th>
                      <th className="p-2.5">Read</th>
                      <th className="p-2.5">Update</th>
                      <th className="p-2.5">Delete</th>
                      <th className="p-2.5">Export</th>
                      <th className="p-2.5">Import</th>
                      <th className="p-2.5">Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {modulesList.map((m, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-2.5 text-left font-bold text-slate-900">{m.name}</td>
                        {m.access.map((acc, aIdx) => (
                          <td key={aIdx} className="p-2.5">
                            {acc ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-400 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Allowed
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                    <XCircle className="h-3.5 w-3.5 text-rose-400" /> Not Allowed
                  </span>
                </div>
                <button className="px-4 py-1.5 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold">
                  Customize Permissions
                </button>
              </div>
            </div>

            {/* Bottom Card: Permission Presets */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
              <h5 className="font-bold text-xs text-slate-900">Permission Presets</h5>
              <p className="text-[10px] text-slate-400">Use predefined templates to quickly set permissions.</p>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                {[
                  { title: 'Full Access', desc: 'Grants full access to all modules and actions.' },
                  { title: 'Limited Access', desc: 'Grants access to selected modules.' },
                  { title: 'Read Only', desc: 'Grants read-only access to all modules.' },
                  { title: 'Custom', desc: 'Configure custom permissions.' },
                ].map((pst, i) => (
                  <label
                    key={i}
                    onClick={() => setPermissionPreset(pst.title)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      permissionPreset === pst.title
                        ? 'bg-white border-purple-400 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{pst.title}</span>
                      <input
                        type="radio"
                        name="preset"
                        checked={permissionPreset === pst.title}
                        onChange={() => setPermissionPreset(pst.title)}
                        className="accent-purple-600"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{pst.desc}</p>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <RoleCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchRoles}
      />
    </div>
  );
};

export default RolesPermissionsSettingsPage;
