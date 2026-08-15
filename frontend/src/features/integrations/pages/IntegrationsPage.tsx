import React, { useState, useEffect } from 'react';
import {
  Network,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Settings,
  MoreVertical,
  Edit2,
  ExternalLink,
  PauseCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';
import { IntegrationCreateModal } from '../components/IntegrationCreateModal';

export const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalIntegrations: 12,
    activeIntegrations: 9,
    inactiveIntegrations: 2,
    failedIntegrations: 1,
    dataSyncTodayRate: '98.6%',
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All Integrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchIntegrations = () => {
    api.getIntegrations(searchTerm, categoryFilter !== 'All Categories' ? categoryFilter : undefined)
      .then((data) => {
        setIntegrations(data || []);
        if (data && data.length > 0 && !selectedIntegration) {
          setSelectedIntegration(data[0]);
        }
      })
      .catch(console.error);

    api.getIntegrationStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);

    api.getIntegrationLogs()
      .then((data) => setLogs(data || []))
      .catch(console.error);
  };

  useEffect(() => {
    fetchIntegrations();
  }, [searchTerm, categoryFilter]);

  const handleSyncNow = (id: string) => {
    api.triggerIntegrationSync(id)
      .then(() => {
        alert('Sync triggered successfully!');
        api.getIntegrationLogs().then(setLogs);
      })
      .catch(console.error);
  };

  const getStatusDot = (statusStr: string) => {
    switch (statusStr?.toLowerCase()) {
      case 'active':
        return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Active</span>;
      case 'inactive':
        return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Inactive</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Failed</span>;
    }
  };

  const filteredIntegrations = integrations.filter((item) => {
    if (activeTab === 'Active') return item.status === 'Active';
    if (activeTab === 'Inactive') return item.status === 'Inactive';
    if (activeTab === 'Failed') return item.status === 'Failed';
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <PageHeader
        title="Integrations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Integrations' },
        ]}
        actions={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add New Integration
          </button>
        }
      />

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'Total Integrations', value: (stats.totalIntegrations || 12).toString(), subtext: 'All configured integrations', icon: Network, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Active Integrations', value: (stats.activeIntegrations || 9).toString(), subtext: 'Currently connected', icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600' },
          { title: 'Inactive Integrations', value: (stats.inactiveIntegrations || 2).toString(), subtext: 'Not connected', icon: PauseCircle, bg: 'bg-amber-100 text-amber-600' },
          { title: 'Failed Integrations', value: (stats.failedIntegrations || 1).toString(), subtext: 'Requires attention', icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600' },
          { title: 'Data Sync (Today)', value: stats.dataSyncTodayRate || '98.6%', subtext: 'Success rate', icon: Activity, bg: 'bg-blue-100 text-blue-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <p className="mt-2 text-[11px] font-medium text-slate-400">{stat.subtext}</p>
          </div>
        ))}
      </div>

      {/* Main Filter Bar & Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-wrap items-center justify-between gap-3">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 lg:border-b-0 pb-2 lg:pb-0">
          {[
            { label: 'All Integrations', count: stats.totalIntegrations || 12 },
            { label: 'Active', count: stats.activeIntegrations || 9 },
            { label: 'Inactive', count: stats.inactiveIntegrations || 2 },
            { label: 'Failed', count: stats.failedIntegrations || 1 },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === tab.label
                  ? 'bg-purple-50 text-purple-600 border border-purple-200'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === tab.label ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or system..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
          >
            <option>All Categories</option>
            <option value="EHR">EHR</option>
            <option value="Laboratory">Laboratory</option>
            <option value="Pharmacy">Pharmacy</option>
            <option value="Insurance">Insurance</option>
            <option value="Communication">Communication</option>
          </select>

          <select className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
            <option>All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Failed">Failed</option>
          </select>

          <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold">
            <Filter className="h-3.5 w-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Grid: Integrations Table (2/3) + Integration Details (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Integration Name</th>
                    <th className="p-3">System / Application</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Last Sync</th>
                    <th className="p-3">Data Sync</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredIntegrations.map((item) => (
                    <tr
                      key={item.id || item.name}
                      onClick={() => setSelectedIntegration(item)}
                      className={`hover:bg-purple-50/50 cursor-pointer transition-colors ${selectedIntegration?.id === item.id ? 'bg-purple-50/80 border-l-4 border-purple-600' : ''}`}
                    >
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-400">{item.systemApplication}</p>
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-slate-800">{item.systemApplication}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-3">{getStatusDot(item.status)}</td>
                      <td className="p-3 text-[11px] text-slate-500">{item.lastSyncText}</td>
                      <td className="p-3">
                        {item.dataSyncRateText !== '--' ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900">{item.dataSyncRateText}</span>
                            <div className="w-12 bg-slate-100 rounded-full h-1.5">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: item.dataSyncRateText }}></div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">--</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1 text-slate-400">
                          <button className="p-1 hover:text-purple-600" title="Settings">
                            <Settings className="h-3.5 w-3.5" />
                          </button>
                          <button className="p-1 hover:text-slate-700" title="More">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Integration Details Inspector Panel */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">
                  {selectedIntegration?.name || 'EHR System'}
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {selectedIntegration?.status || 'Active'}
                </span>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:underline">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-600 font-medium">
                {selectedIntegration?.description || 'Sync patient demographics, encounters, allergies, medications and more.'}
              </p>
            </div>

            <div className="space-y-3 text-xs border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Category</span>
                <span className="font-bold text-slate-800">{selectedIntegration?.category || 'EHR'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">System / Application</span>
                <span className="font-bold text-slate-800">{selectedIntegration?.systemApplication || 'Epic'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Connection Type</span>
                <span className="font-bold text-slate-800">{selectedIntegration?.connectionType || 'API'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Connected On</span>
                <span className="font-semibold text-slate-700">{selectedIntegration?.connectedOnText || 'Apr 10, 2025, 11:30 AM'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Last Successful Sync</span>
                <span className="font-semibold text-slate-700">{selectedIntegration?.lastSyncText || 'Today, 10:15 AM'}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Data Sync Rate (Today)</span>
                  <span className="font-bold text-emerald-600">{selectedIntegration?.dataSyncRateText || '99.8%'}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: selectedIntegration?.dataSyncRateText || '99.8%' }}></div>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Data in Last Sync</span>
                <span className="font-bold text-slate-800">{selectedIntegration?.dataLastSyncCount || 1245} records</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Next Sync</span>
                <span className="font-semibold text-slate-700">{selectedIntegration?.nextSyncText || 'Today, 11:00 AM'}</span>
              </div>
            </div>

            <button
              onClick={() => handleSyncNow(selectedIntegration?.id)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-semibold transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Sync Now
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Integration Activity Log */}
      <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h4 className="font-bold text-sm text-slate-900">Integration Activity Log</h4>
          <button className="text-xs font-semibold text-purple-600 hover:underline flex items-center gap-1">
            View All Activity <ExternalLink className="h-3 w-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Integration Name</th>
                <th className="p-3">Event</th>
                <th className="p-3">Status</th>
                <th className="p-3">Details</th>
                <th className="p-3">Triggered By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {logs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-[11px] text-slate-500 whitespace-nowrap">{log.dateTimeText}</td>
                  <td className="p-3 font-bold text-slate-900">{log.integrationName}</td>
                  <td className="p-3 font-semibold text-slate-800">{log.event}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${log.status === 'Success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">{log.details}</td>
                  <td className="p-3 font-bold text-slate-800">{log.triggeredBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <IntegrationCreateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchIntegrations}
      />
    </div>
  );
};

export default IntegrationsPage;
