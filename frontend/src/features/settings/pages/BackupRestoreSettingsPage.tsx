import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  Trash2,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';

export const BackupRestoreSettingsPage: React.FC = () => {
  const [backupData, setBackupData] = useState<any>({
    lastSuccessfulBackup: 'May 19, 2025 02:30 AM (UTC-05:00)',
    nextScheduledBackup: 'May 20, 2025 02:30 AM (UTC-05:00)',
    totalBackups: 32,
    successfulBackups: 30,
    failedBackups: 2,
    history: [],
  });

  const [backupScope, setBackupScope] = useState('Full Backup');
  const [backupDescription, setBackupDescription] = useState('');
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState('');

  const loadData = () => {
    api.getSettingsBackup()
      .then((data) => {
        if (data) setBackupData(data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBackup = () => {
    setCreatingBackup(true);
    api.createSettingsBackup({ scope: backupScope, description: backupDescription })
      .then(() => {
        setCreatingBackup(false);
        setBackupSuccessMessage('Backup created successfully!');
        setBackupDescription('');
        loadData();
        setTimeout(() => setBackupSuccessMessage(''), 3000);
      })
      .catch((err) => {
        setCreatingBackup(false);
        console.error(err);
      });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Backup & Restore</h3>
          <p className="text-xs text-slate-500 font-medium">Create, manage and restore database and system backups.</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20"
        >
          <Database className="h-4 w-4" /> {creatingBackup ? 'Creating Backup...' : 'Backup Now'}
        </button>
      </div>

      {backupSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {backupSuccessMessage}
        </div>
      )}

      {/* Top 2 Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Last Backup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-500">Last Backup</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Success</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">{backupData.lastSuccessfulBackup}</h4>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
              <span>Size: <strong className="text-slate-900">24.6 GB</strong></span>
              <span>Type: <strong className="text-slate-900">Full Backup</strong></span>
            </div>
          </div>
        </div>

        {/* Right Card: Next Scheduled Backup */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-500">Next Scheduled Backup</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">Scheduled</span>
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">{backupData.nextScheduledBackup}</h4>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-1">
              <span>Frequency: <strong className="text-slate-900">Daily at 02:30 AM</strong></span>
              <span>Retention: <strong className="text-slate-900">30 days</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Card: Backup Now */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Backup Now</h4>
        <p className="text-[10px] text-slate-400">Trigger an immediate manual backup of system data.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Full Backup', desc: 'Complete database and file backup.' },
            { label: 'Database Only', desc: 'PostgreSQL database schema and records.' },
            { label: 'Files Only', desc: 'Uploaded documents, images and attachments.' },
          ].map((scp) => (
            <label
              key={scp.label}
              onClick={() => setBackupScope(scp.label)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                backupScope === scp.label ? 'bg-purple-50/50 border-purple-400' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="radio"
                  name="scope"
                  checked={backupScope === scp.label}
                  onChange={() => setBackupScope(scp.label)}
                  className="accent-purple-600"
                />
                <span className="font-bold text-slate-900">{scp.label}</span>
              </div>
              <p className="text-[10px] text-slate-400 ml-5">{scp.desc}</p>
            </label>
          ))}
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Backup Description <span className="text-slate-400 font-normal">(Optional)</span></label>
          <input
            type="text"
            value={backupDescription}
            onChange={(e) => setBackupDescription(e.target.value)}
            placeholder="e.g. Manual on-demand backup before system maintenance..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:outline-none"
          />
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2"
        >
          <Database className="h-4 w-4" /> {creatingBackup ? 'Creating Backup...' : 'Create Backup Now'}
        </button>
      </div>

      {/* Backup Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Total Backups</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{backupData.totalBackups || 32}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Successful Backups</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{backupData.successfulBackups || 30}</h4>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Failed Backups</p>
            <h4 className="text-xl font-bold text-slate-900 mt-0.5">{backupData.failedBackups || 2}</h4>
          </div>
        </div>
      </div>

      {/* Main Backup History Table */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="font-bold text-sm text-slate-900">Backup History</h4>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search backups..."
              className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Backup Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Description</th>
                <th className="p-3">Size</th>
                <th className="p-3">Created On</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {(backupData.history || []).map((b: any, idx: number) => (
                <tr key={b.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{b.backupName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800">{b.type}</span>
                  </td>
                  <td className="p-3 text-slate-500 text-[11px]">{b.description}</td>
                  <td className="p-3 font-bold text-slate-800">{b.sizeText}</td>
                  <td className="p-3 text-slate-500 text-[11px] whitespace-nowrap">{b.createdOnText}</td>
                  <td className="p-3">
                    {b.status === 'Success' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Success</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Failed</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-400">
                      <button className="p-1 hover:text-purple-600" title="Download"><Download className="h-3.5 w-3.5" /></button>
                      <button className="p-1 hover:text-blue-600" title="Restore"><RotateCcw className="h-3.5 w-3.5" /></button>
                      <button className="p-1 hover:text-rose-600" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BackupRestoreSettingsPage;
