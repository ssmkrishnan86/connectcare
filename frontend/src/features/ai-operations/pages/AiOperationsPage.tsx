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
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { api } from '@/lib/api';

export const AiOperationsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.getAiOperationsOverview()
      .then((res) => setData(res))
      .catch(console.error);
  }, []);

  const kpis = data?.kpis || {
    aiRequestsToday: '2,458',
    aiRequestsChange: '↑ 18.5% vs yesterday',
    successRate: '95.8%',
    successRateChange: '↑ 2.4% vs yesterday',
    avgResponseTime: '1.42 sec',
    avgResponseTimeChange: '↓ 0.38 sec vs yesterday',
    tokensUsedToday: '1.2M',
    tokensUsedChange: '↑ 12.7% vs yesterday',
    errorsToday: '28',
    errorsChange: '↓ 17.6% vs yesterday',
  };

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
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
            <Settings className="h-4 w-4 text-slate-500" /> AI Settings
          </button>
        }
      />

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { title: 'AI Requests (Today)', value: kpis.aiRequestsToday, change: kpis.aiRequestsChange, icon: Bot, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'Success Rate', value: kpis.successRate, change: kpis.successRateChange, icon: CheckCircle2, bg: 'bg-emerald-100 text-emerald-600', isUp: true },
          { title: 'Avg Response Time', value: kpis.avgResponseTime, change: kpis.avgResponseTimeChange, icon: Clock, bg: 'bg-amber-100 text-amber-600', isUp: true },
          { title: 'Tokens Used (Today)', value: kpis.tokensUsedToday, change: kpis.tokensUsedChange, icon: Database, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'Errors (Today)', value: kpis.errorsToday, change: kpis.errorsChange, icon: AlertTriangle, bg: 'bg-rose-100 text-rose-600', isUp: true },
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
            <button className="text-[11px] font-semibold text-purple-600 hover:underline">View All</button>
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
                {(data?.services || [
                  { serviceName: 'Clinical Note Assistant', status: 'Healthy', modelVersion: 'gpt-4o', uptimePercentage: '99.9%' },
                  { serviceName: 'Medication Assistant', status: 'Healthy', modelVersion: 'gpt-4o-mini', uptimePercentage: '99.8%' },
                  { serviceName: 'Care Plan Generator', status: 'Healthy', modelVersion: 'claude-3-haiku', uptimePercentage: '99.7%' },
                  { serviceName: 'Document Summarizer', status: 'Healthy', modelVersion: 'gpt-4o', uptimePercentage: '99.9%' },
                  { serviceName: 'Insights & Analytics', status: 'Healthy', modelVersion: 'gpt-4o', uptimePercentage: '99.6%' },
                  { serviceName: 'Conversation Assistant', status: 'Degraded', modelVersion: 'gpt-3.5-turbo', uptimePercentage: '98.2%' },
                  { serviceName: 'Image Analysis', status: 'Healthy', modelVersion: 'gemini-1.5-pro', uptimePercentage: '99.5%' },
                ]).map((srv: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 font-bold text-slate-900 flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                      <span>{srv.serviceName}</span>
                    </td>
                    <td className="py-2">{getServiceStatusBadge(srv.status)}</td>
                    <td className="py-2 text-[11px] font-mono text-slate-600">{srv.modelVersion}</td>
                    <td className="py-2 font-bold text-slate-800">{srv.uptimePercentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> All systems operational
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
            {[
              { day: 'May 13', val: 50 },
              { day: 'May 14', val: 65 },
              { day: 'May 15', val: 60 },
              { day: 'May 16', val: 78 },
              { day: 'May 17', val: 95 },
              { day: 'May 18', val: 72 },
              { day: 'May 19', val: 80 },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-purple-100 rounded-t flex items-end justify-center" style={{ height: `${pt.val}%` }}>
                  <div className="w-full bg-purple-600 border-t-2 border-purple-700 rounded-t h-full"></div>
                </div>
                <span className="text-[8px] text-slate-400 font-medium">{pt.day.split(' ')[1]}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs pt-1">
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Requests</p>
              <p className="font-bold text-slate-900">16,842</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Tokens</p>
              <p className="font-bold text-slate-900">8.7M</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Total Cost</p>
              <p className="font-bold text-slate-900">$48.62</p>
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-medium">Avg Response Time</p>
              <p className="font-bold text-slate-900">1.42 sec</p>
            </div>
          </div>
        </div>

        {/* Column 3: Recent AI Activity */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Recent AI Activity</h4>
            <button className="text-[11px] font-semibold text-purple-600 hover:underline">View All</button>
          </div>
          <div className="space-y-2.5">
            {(data?.recentActivities || [
              { timeText: '10:15 AM', title: 'Clinical Note generated successfully', residentInfo: 'Resident: Mary Johnson (RID-10023)', type: 'Success' },
              { timeText: '10:12 AM', title: 'Medication interaction checked', residentInfo: 'Resident: Robert Brown (RID-10045)', type: 'Success' },
              { timeText: '10:10 AM', title: 'Care plan recommendations generated', residentInfo: 'Resident: Anita Sharma (RID-10011)', type: 'Success' },
              { timeText: '10:08 AM', title: 'Document summarized', residentInfo: 'File: Lab Results - May 19, 2025', type: 'Info' },
              { timeText: '10:05 AM', title: 'High priority alert summary generated', residentInfo: 'Incident: Fall Alert - RID-10032', type: 'Success' },
              { timeText: '10:02 AM', title: 'Image analysis completed', residentInfo: 'Type: Skin Assessment', type: 'Success' },
              { timeText: '10:01 AM', title: 'AI request failed', residentInfo: 'Service: Conversation Assistant', type: 'Error' },
            ]).map((act: any, idx: number) => (
              <div key={idx} className="flex items-start justify-between text-xs">
                <div className="flex items-start gap-2">
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${act.type === 'Error' ? 'bg-rose-100 text-rose-600' : act.type === 'Info' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {act.type === 'Error' ? <AlertTriangle className="h-3 w-3" /> : act.type === 'Info' ? <FileText className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">{act.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{act.residentInfo}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium">{act.timeText}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <span className="text-[10px] text-slate-400">Showing 1 to 7 of 25 activities</span>
            <div className="flex gap-1 text-[11px]">
              <button className="px-1.5 py-0.5 bg-purple-600 text-white font-bold rounded">1</button>
              <button className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 rounded">2</button>
              <button className="px-1.5 py-0.5 text-slate-600 hover:bg-slate-100 rounded">3</button>
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
              <button className="text-[11px] font-semibold text-purple-600 hover:underline">View All</button>
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
                  {(data?.workflows || [
                    { workflowName: 'Clinical Note Assistant', requestsCount: 4562, successRate: '96.3%', avgResponseTimeSeconds: '1.21 sec' },
                    { workflowName: 'Medication Interaction Check', requestsCount: 3842, successRate: '97.1%', avgResponseTimeSeconds: '1.18 sec' },
                    { workflowName: 'Care Plan Recommendation', requestsCount: 2984, successRate: '94.7%', avgResponseTimeSeconds: '1.56 sec' },
                    { workflowName: 'Document Summarization', requestsCount: 2156, successRate: '95.9%', avgResponseTimeSeconds: '1.33 sec' },
                    { workflowName: 'Patient Risk Analysis', requestsCount: 1854, successRate: '93.8%', avgResponseTimeSeconds: '1.78 sec' },
                  ]).map((wf: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                        <span>{wf.workflowName}</span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{wf.requestsCount?.toLocaleString()}</td>
                      <td className="p-3 font-bold text-emerald-600">{wf.successRate}</td>
                      <td className="p-3 text-slate-700">{wf.avgResponseTimeSeconds}</td>
                      <td className="p-3 text-purple-600">📈</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Model Usage Donut Chart */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <h4 className="font-bold text-xs text-slate-900">Model Usage</h4>
            <div className="flex items-center justify-between">
              <div className="relative h-28 w-28 flex items-center justify-center">
                <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-purple-600" strokeWidth="4" strokeDasharray="48.3, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                  <path className="text-cyan-500" strokeWidth="4" strokeDasharray="24.1, 100" strokeDashoffset="-48.3" stroke="currentColor" fill="none" />
                  <path className="text-emerald-500" strokeWidth="4" strokeDasharray="14.9, 100" strokeDashoffset="-72.4" stroke="currentColor" fill="none" />
                  <path className="text-amber-500" strokeWidth="4" strokeDasharray="8.0, 100" strokeDashoffset="-87.3" stroke="currentColor" fill="none" />
                  <path className="text-rose-500" strokeWidth="4" strokeDasharray="4.7, 100" strokeDashoffset="-95.3" stroke="currentColor" fill="none" />
                </svg>
                <div className="absolute flex flex-col items-center text-center">
                  <span className="text-[10px] font-bold text-slate-900">Total Tokens</span>
                  <span className="text-xs font-bold text-purple-700">8.7M</span>
                  <span className="text-[8px] text-emerald-600 font-bold">+12.7%</span>
                </div>
              </div>
              <div className="space-y-1 text-[10px]">
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">GPT-4o</span> <span className="font-bold text-slate-900 ml-auto">4.2M (48.3%)</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">GPT-4o Mini</span> <span className="font-bold text-slate-900 ml-auto">2.1M (24.1%)</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Claude 3 Haiku</span> <span className="font-bold text-slate-900 ml-auto">1.3M (14.9%)</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Gemini 1.5 Pro</span> <span className="font-bold text-slate-900 ml-auto">0.7M (8.0%)</span></div>
                <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-rose-500"></span> <span className="font-medium text-slate-600">GPT-3.5 Turbo</span> <span className="font-bold text-slate-900 ml-auto">0.4M (4.7%)</span></div>
              </div>
            </div>
            <button className="text-[11px] font-semibold text-purple-600 hover:underline flex items-center gap-1 pt-2">
              View detailed usage report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Alert & Recommendation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 card-shadow flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-amber-900">High Error Rate Detected</h5>
            <p className="text-[11px] text-amber-700 font-medium">Conversation Assistant is experiencing a higher error rate than usual.</p>
            <button className="text-[11px] font-bold text-amber-900 hover:underline pt-1 flex items-center gap-1">
              View Details <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 card-shadow flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-blue-900">Model Optimization Available</h5>
            <p className="text-[11px] text-blue-700 font-medium">Switching some workflows to GPT-4o Mini could reduce costs by up to 18%.</p>
            <button className="text-[11px] font-bold text-blue-900 hover:underline pt-1 flex items-center gap-1">
              View Recommendation <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 card-shadow flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-emerald-700">Potential Monthly Savings</p>
            <h4 className="text-xl font-bold text-emerald-900 mt-0.5">$1,245</h4>
            <p className="text-[10px] text-emerald-600 font-medium">Estimated savings</p>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-xs">18%</span>
        </div>
      </div>
    </div>
  );
};

export default AiOperationsPage;
