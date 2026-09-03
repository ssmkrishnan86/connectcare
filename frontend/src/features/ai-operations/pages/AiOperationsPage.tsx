import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  CheckCircle2,
  Clock,
  Database,
  AlertTriangle,
  Settings,
  ExternalLink,
  Info,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DoctorAiAssistantPage } from '@/features/dashboard/pages/DoctorAiAssistantPage';
import { NurseAiAssistantPage } from '@/features/dashboard/pages/NurseAiAssistantPage';
import { AiServicesModal } from '../components/AiServicesModal';
import { AiActivityModal } from '../components/AiActivityModal';
import { AiWorkflowsModal } from '../components/AiWorkflowsModal';
import { AiSettingsModal } from '../components/AiSettingsModal';

export const AiOperationsPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [activityPage, setActivityPage] = useState(1);
  const activityPageSize = 7;

  // Modals state
  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isWorkflowsModalOpen, setIsWorkflowsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const userRole = user?.role?.toLowerCase() || '';

  if (userRole === 'doctor' || userRole.includes('physician')) {
    return <DoctorAiAssistantPage />;
  }

  if (userRole === 'nurse' || userRole.includes('staff nurse') || userRole === 'care manager') {
    return <NurseAiAssistantPage />;
  }

  const fetchOverview = () => {
    api.getAiOperationsOverview()
      .then((res) => setData(res))
      .catch(console.error);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const kpis = data?.kpis || {
    aiRequestsToday: '0',
    aiRequestsChange: '--',
    successRate: '0.0%',
    successRateChange: '--',
    avgResponseTime: '0.00 sec',
    avgResponseTimeChange: '--',
    tokensUsedToday: '0M',
    tokensUsedChange: '--',
    errorsToday: '0',
    errorsChange: '--',
  };

  const services = data?.services || [];
  const workflows = data?.workflows || [];
  const recentActivities = data?.recentActivities || [];

  // Dynamic system health evaluation
  const degradedCount = services.filter((s: any) => s.status !== 'Healthy').length;
  const isAllHealthy = services.length > 0 && degradedCount === 0;

  // Dynamic activity pagination
  const totalActivitiesCount = recentActivities.length;
  const totalActivityPages = Math.max(1, Math.ceil(totalActivitiesCount / activityPageSize));
  const paginatedActivities = recentActivities.slice(
    (activityPage - 1) * activityPageSize,
    activityPage * activityPageSize
  );

  const getServiceStatusBadge = (statusStr: string) => {
    if (statusStr === 'Healthy') {
      return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Healthy</span>;
    }
    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">Degraded</span>;
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto font-sans">
      {/* Page Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <span>AI Operations Center</span>
            <Sparkles className="h-5 w-5 text-purple-600 fill-purple-600" />
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'AI Operations Center' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <DataImportExportToolbar
              moduleKey="ai-operations"
              data={data?.activeWorkflows || []}
              idField="id"
              onImportSuccess={fetchOverview}
              customCreateApi={api.createAiWorkflow}
            />
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Settings className="h-4 w-4 text-slate-500" /> AI Settings
            </button>
          </div>
        }
      />

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'AI Requests (Today)', value: kpis.aiRequestsToday, change: kpis.aiRequestsChange, icon: Bot, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'Success Rate', value: kpis.successRate, change: kpis.successRateChange, icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600', isUp: true },
          { title: 'Avg Response Time', value: kpis.avgResponseTime, change: kpis.avgResponseTimeChange, icon: Clock, bg: 'bg-amber-100 text-amber-600', isUp: true },
          { title: 'Tokens Used (Today)', value: kpis.tokensUsedToday, change: kpis.tokensUsedChange, icon: Database, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'Errors (Today)', value: kpis.errorsToday, change: kpis.errorsChange, icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600', isUp: false },
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
            <p className="mt-2 text-[11px] font-semibold text-emerald-600">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Middle Section Grid: 3 Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: AI Services Status */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">AI Services Status</h4>
            <button
              onClick={() => setIsServicesModalOpen(true)}
              className="text-[11px] font-semibold text-purple-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Service</th>
                  <th className="pb-1.5">Status</th>
                  <th className="pb-1.5">Model / Version</th>
                  <th className="pb-1.5">Uptime</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400">
                      No AI services available.
                    </td>
                  </tr>
                ) : (
                  services.map((srv: any, i: number) => (
                    <tr key={srv.id || i}>
                      <td className="py-2 font-bold text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span>{srv.serviceName}</span>
                      </td>
                      <td className="py-2">{getServiceStatusBadge(srv.status)}</td>
                      <td className="py-2 text-[11px] font-mono text-slate-600">{srv.modelVersion}</td>
                      <td className="py-2 font-bold text-slate-800">{srv.uptimePercentage}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className={`pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold ${isAllHealthy ? 'text-emerald-600' : 'text-amber-600'}`}>
            <span className={`h-2 w-2 rounded-full ${isAllHealthy ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            {isAllHealthy ? 'All systems operational' : `${degradedCount} service experiencing degraded performance`}
          </div>
        </div>

        {/* Column 2: AI Requests Trend */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">AI Requests Trend</h4>
            <select className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-700">
              <option>Last 7 Days</option>
            </select>
          </div>
          <div className="h-44 flex items-end justify-between gap-1.5 border-b border-slate-200 pb-2 px-1">
            {((data?.trendDays && data.trendDays.length > 0)
              ? data.trendDays
              : Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), dayShort: d.getDate().toString(), val: 0, count: 0 };
                })
            ).map((pt: any, i: number) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-purple-100 rounded-t flex items-end justify-center h-32">
                  <div
                    className="w-full bg-purple-600 border-t-2 border-purple-700 rounded-t transition-all duration-300"
                    style={{ height: `${pt.val}%` }}
                    title={`${pt.day}: ${pt.count || 0} AI requests`}
                  ></div>
                </div>
                <span className="text-[8px] text-slate-400 font-medium">{pt.dayShort || pt.day}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Requests</p>
              <p className="font-bold text-slate-900">{data?.summaryStats?.totalRequests || kpis.aiRequestsToday || '0'}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Tokens</p>
              <p className="font-bold text-slate-900">{data?.summaryStats?.totalTokens || '0'}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Cost</p>
              <p className="font-bold text-slate-900">{data?.summaryStats?.totalCost || '$0.00'}</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Avg Latency</p>
              <p className="font-bold text-slate-900">{data?.summaryStats?.avgResponseTime || kpis.avgResponseTime || '1.20 sec'}</p>
            </div>
          </div>
        </div>

        {/* Column 3: Recent AI Activity */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Recent AI Activity</h4>
            <button
              onClick={() => setIsActivityModalOpen(true)}
              className="text-[11px] font-semibold text-purple-600 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-2.5 min-h-[220px]">
            {paginatedActivities.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                No recent AI activity recorded.
              </div>
            ) : (
              paginatedActivities.map((act: any, idx: number) => (
                <div key={act.id || idx} className="flex items-start justify-between text-xs">
                  <div className="flex items-start gap-2">
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${act.type === 'Error' ? 'bg-rose-100 text-rose-600' : act.type === 'Info' ? 'bg-blue-100 text-blue-600' : act.type === 'Warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {act.type === 'Error' ? <AlertTriangle className="h-3 w-3" /> : act.type === 'Info' ? <FileText className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-tight">{act.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{act.residentInfo}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium ml-2">{act.timeText}</span>
                </div>
              ))
            )}
          </div>

          {/* Dynamic Activity Pagination */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400">
              {totalActivitiesCount === 0
                ? 'Showing 0 activities'
                : `Showing ${(activityPage - 1) * activityPageSize + 1} to ${Math.min(activityPage * activityPageSize, totalActivitiesCount)} of ${totalActivitiesCount} activities`}
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                disabled={activityPage === 1}
                onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setActivityPage(page)}
                  className={`px-2 py-0.5 font-bold rounded transition-colors ${
                    activityPage === page ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                disabled={activityPage >= totalActivityPages}
                onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section Grid: Top AI Workflows (2/3) + Model Usage (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Top AI Workflows Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-bold text-xs text-slate-900">Top AI Workflows</h4>
              <button
                onClick={() => setIsWorkflowsModalOpen(true)}
                className="text-[11px] font-semibold text-purple-600 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Workflow</th>
                    <th className="p-3">Requests</th>
                    <th className="p-3">Success Rate</th>
                    <th className="p-3">Avg. Response Time</th>
                    <th className="p-3">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {workflows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        No AI workflow records found.
                      </td>
                    </tr>
                  ) : (
                    workflows.map((wf: any, idx: number) => (
                      <tr key={wf.id || idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                          <span>{wf.workflowName}</span>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{wf.requestsCount?.toLocaleString()}</td>
                        <td className="p-3 font-bold text-emerald-600">{wf.successRate}</td>
                        <td className="p-3 text-slate-700">{wf.avgResponseTimeSeconds}</td>
                        <td className="p-3 text-purple-600">📈</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Model Usage Donut Chart */}
        {/* Right 1 Column: Model Usage Donut Chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <h4 className="font-bold text-xs text-slate-900">Model Usage</h4>
            <div className="flex items-center justify-between gap-2">
              {(() => {
                const models = data?.modelUsage || [];
                const p1 = parseFloat(models[0]?.percentage?.replace('%', '') || '0') || 0;
                const p2 = parseFloat(models[1]?.percentage?.replace('%', '') || '0') || 0;
                const totalPct = p1 + p2;
                return (
                  <div className="relative h-24 w-24 flex items-center justify-center shrink-0">
                    <svg className="h-24 w-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="4"
                        strokeDasharray="100, 100"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {totalPct > 0 && (
                        <>
                          <path
                            className="text-purple-600"
                            strokeWidth="4"
                            strokeDasharray={`${p1}, 100`}
                            strokeDashoffset="0"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-cyan-500"
                            strokeWidth="4"
                            strokeDasharray={`${p2}, 100`}
                            strokeDashoffset={`-${p1}`}
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </>
                      )}
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-[9px] font-bold text-slate-500">Tokens</span>
                      <span className="text-xs font-extrabold text-purple-700">{data?.summaryStats?.totalTokens || '0'}</span>
                    </div>
                  </div>
                );
              })()}
              <div className="space-y-1.5 text-[10px] flex-1">
                {(data?.modelUsage || []).map((m: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded shrink-0" style={{ backgroundColor: m.color || '#8B5CF6' }}></span>
                    <span className="font-medium text-slate-600 truncate">{m.model}</span>
                    <span className="font-bold text-slate-900 ml-auto whitespace-nowrap">{m.tokens} ({m.percentage})</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsWorkflowsModalOpen(true)}
              className="text-[11px] font-semibold text-purple-600 hover:underline flex items-center gap-1 pt-2 cursor-pointer"
            >
              View detailed usage report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Alert & Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(data?.alertsAndRecommendations || []).map((alert: any, idx: number) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border card-shadow flex items-start gap-3 ${
              alert.type === 'warning'
                ? 'bg-amber-50 border-amber-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            {alert.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h5 className={`font-bold text-xs ${alert.type === 'warning' ? 'text-amber-900' : 'text-blue-900'}`}>
                {alert.title}
              </h5>
              <p className={`text-[11px] font-medium ${alert.type === 'warning' ? 'text-amber-700' : 'text-blue-700'}`}>
                {alert.description}
              </p>
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className={`text-[11px] font-bold hover:underline pt-1 flex items-center gap-1 cursor-pointer ${
                  alert.type === 'warning' ? 'text-amber-900' : 'text-blue-900'
                }`}
              >
                {alert.actionText || 'Configure'} <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))}

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 card-shadow flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-emerald-700">Potential Monthly Savings</p>
            <h4 className="text-xl font-bold text-emerald-900 mt-0.5">{data?.potentialMonthlySavings || '$0.00'}</h4>
            <p className="text-[10px] text-emerald-600 font-medium">Estimated savings via model routing</p>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-xs">
            {data?.potentialMonthlySavingsPercentage || '0%'}
          </span>
        </div>
      </div>

      {/* AI Services Modal */}
      <AiServicesModal
        isOpen={isServicesModalOpen}
        onClose={() => setIsServicesModalOpen(false)}
      />

      {/* AI Activity Modal */}
      <AiActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
      />

      {/* AI Workflows Modal */}
      <AiWorkflowsModal
        isOpen={isWorkflowsModalOpen}
        onClose={() => setIsWorkflowsModalOpen(false)}
      />

      {/* AI Settings Modal */}
      <AiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSuccess={fetchOverview}
      />
    </div>
  );
};

export default AiOperationsPage;
