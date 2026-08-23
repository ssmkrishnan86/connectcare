import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  CreditCard,
  Percent,
  Calendar,
  Filter,
  Download,
  ExternalLink,
  Layers,
  Printer,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Pagination } from '@/components/common/Pagination';
import { api } from '@/lib/api';

export const FinancialReportsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [viewBy, setViewBy] = useState('Daily');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  useEffect(() => {
    api.getFinancialReports(viewBy)
      .then((res: any) => {
        const payload = res?.data || res;
        setData(payload);
      })
      .catch(console.error);
  }, [viewBy]);

  const handleViewReport = (title: string, category: string, description?: string) => {
    setSelectedReport({
      reportName: title,
      reportType: category,
      generatedByName: 'Chief Financial Officer',
      generatedByRole: 'Financial Controller',
      generatedOnText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      careUnit: 'Finance & Billing Department',
      description: description || `Executive financial statement and ledger audit aggregated for ${viewBy.toLowerCase()} period reporting.`,
      format: 'PDF'
    });
    setIsViewModalOpen(true);
  };

  const handleDownloadReport = (report: any) => {
    const reportTitle = report?.reportName || 'Financial_Report';
    const content = `CONNECTCARE HEALTHCARE SYSTEM - EXECUTIVE FINANCIAL REPORT
Title: ${reportTitle}
Period: ${viewBy}
Generated On: ${report?.generatedOnText || new Date().toLocaleString()}
Category: ${report?.reportType || 'Financial Analytics'}

KEY METRICS SUMMARY:
- Total Revenue: ${kpis.totalRevenue}
- Total Expenses: ${kpis.totalExpenses}
- Net Income: ${kpis.netIncome}
- Outstanding Receivables: ${kpis.outstandingReceivables} (${kpis.receivablesInvoiceCount} Invoices)
- Outstanding Payables: ${kpis.outstandingPayables} (${kpis.payablesBillCount} Bills)
- Collection Rate: ${kpis.collectionRate}

EXECUTIVE SUMMARY:
${report?.description || 'All financial ledgers verified and reconciled against bank records.'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${viewBy.toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reportData = data?.data || data;
  const kpis = reportData?.kpis || {
    totalRevenue: '$ 0',
    totalExpenses: '$ 0',
    netIncome: '$ 0',
    outstandingReceivables: '$ 0',
    receivablesInvoiceCount: 0,
    outstandingPayables: '$ 0',
    payablesBillCount: 0,
    collectionRate: '0%',
  };

  const getTxStatusBadge = (statusStr: string) => {
    switch (statusStr?.toLowerCase()) {
      case 'received':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Received</span>;
      case 'paid':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Paid</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Sent</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Reports & Analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports & Analytics', href: '/reports/overview' },
          { label: 'Financial Reports' },
        ]}
        actions={
          <>
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>May 13 – May 19, 2025</span>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
              <Download className="h-4 w-4" /> Export
            </button>
          </>
        }
      />

      {/* Subtitle */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Financial Reports</h2>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Revenue', value: kpis.totalRevenue, change: '↑ 12.4% vs last 7 days', icon: DollarSign, bg: 'bg-purple-100 text-purple-600', isUp: true },
          { title: 'Total Expenses', value: kpis.totalExpenses, change: '↑ 8.7% vs last 7 days', icon: FileText, bg: 'bg-indigo-100 text-indigo-600', isUp: true },
          { title: 'Net Income', value: kpis.netIncome, change: '↑ 18.9% vs last 7 days', icon: Layers, bg: 'bg-blue-100 text-blue-600', isUp: true },
          { title: 'Outstanding Receivables', value: kpis.outstandingReceivables, change: `Due from ${kpis.receivablesInvoiceCount} invoices`, icon: FileText, bg: 'bg-amber-100 text-amber-600', isInfo: true },
          { title: 'Outstanding Payables', value: kpis.outstandingPayables, change: `Due to ${kpis.payablesBillCount} bills`, icon: CreditCard, bg: 'bg-rose-100 text-rose-600', isInfo: true },
          { title: 'Collection Rate', value: kpis.collectionRate, change: '↑ 4.3% vs last 7 days', icon: Percent, bg: 'bg-purple-100 text-purple-600', isUp: true },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className={`h-9 w-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 stroke-[2]" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-[11px] font-medium text-slate-500">{stat.title}</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{stat.value}</h3>
            </div>
            <p className={`mt-2 text-[11px] font-semibold ${stat.isInfo ? 'text-slate-400' : stat.isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Location / Unit</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Locations</option>
              <option value="Main Hospital">Main Hospital</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Department</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Departments</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Payer Type</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Payers</option>
              <option value="Insurance">Insurance</option>
              <option value="Private Pay">Private Pay</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Service Category</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Categories</option>
              <option value="Inpatient Services">Inpatient Services</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Payment Mode</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Modes</option>
              <option value="Online">Online</option>
              <option value="Card">Card</option>
            </select>
          </div>
        </div>

        {/* View By Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <span className="text-[10px] font-bold text-slate-400 px-2">View By</span>
          {['Daily', 'Weekly', 'Monthly'].map((opt) => (
            <button
              key={opt}
              onClick={() => setViewBy(opt)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                viewBy === opt ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of 4 Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Chart 1: Revenue Trend */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Revenue Trend</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
          </div>
          <div className="h-44 flex items-end justify-between gap-1.5 border-b border-slate-200 pb-2 px-1">
            {[
              { day: 'May 13', val: 50 },
              { day: 'May 14', val: 62 },
              { day: 'May 15', val: 58 },
              { day: 'May 16', val: 82 },
              { day: 'May 17', val: 70 },
              { day: 'May 18', val: 65 },
              { day: 'May 19', val: 78 },
            ].map((pt, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div className="w-full bg-purple-50 rounded-t flex items-end justify-center" style={{ height: `${pt.val}%` }}>
                  <div className="w-full bg-purple-600/40 border-t-2 border-purple-600 rounded-t h-full"></div>
                </div>
                <span className="text-[8px] text-slate-400 font-medium">{pt.day.split(' ')[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Revenue by Payer Type */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Revenue by Payer Type</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-purple-600" strokeWidth="4" strokeDasharray="53.9, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-cyan-500" strokeWidth="4" strokeDasharray="31.9, 100" strokeDashoffset="-53.9" stroke="currentColor" fill="none" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="10.0, 100" strokeDashoffset="-85.8" stroke="currentColor" fill="none" />
                <path className="text-blue-500" strokeWidth="4" strokeDasharray="4.2, 100" strokeDashoffset="-95.8" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-900">$ 2,458,760</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">Insurance</span> <span className="font-bold text-slate-900 ml-auto">$ 1,325,410 (53.9%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">Private Pay</span> <span className="font-bold text-slate-900 ml-auto">$ 785,230 (31.9%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Government</span> <span className="font-bold text-slate-900 ml-auto">$ 245,600 (10.0%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-500"></span> <span className="font-medium text-slate-600">Corporate</span> <span className="font-bold text-slate-900 ml-auto">$ 102,520 (4.2%)</span></div>
            </div>
          </div>
        </div>

        {/* Chart 3: Expenses by Category */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Expenses by Category</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-blue-600" strokeWidth="4" strokeDasharray="39.9, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="22.5, 100" strokeDashoffset="-39.9" stroke="currentColor" fill="none" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="13.7, 100" strokeDashoffset="-62.4" stroke="currentColor" fill="none" />
                <path className="text-purple-600" strokeWidth="4" strokeDasharray="11.7, 100" strokeDashoffset="-76.1" stroke="currentColor" fill="none" />
                <path className="text-cyan-500" strokeWidth="4" strokeDasharray="12.2, 100" strokeDashoffset="-87.8" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-900">$ 1,532,480</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-blue-600"></span> <span className="font-medium text-slate-600">Salaries & Benefits</span> <span className="font-bold text-slate-900 ml-auto">$ 612,340 (39.9%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Medical Supplies</span> <span className="font-bold text-slate-900 ml-auto">$ 345,280 (22.5%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Utilities & Facilities</span> <span className="font-bold text-slate-900 ml-auto">$ 210,560 (13.7%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">Services & Contracts</span> <span className="font-bold text-slate-900 ml-auto">$ 178,900 (11.7%)</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">Other Expenses</span> <span className="font-bold text-slate-900 ml-auto">$ 185,400 (12.2%)</span></div>
            </div>
          </div>
        </div>

        {/* Chart 4: Payment Mode Collection */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Payment Mode Collection</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Details</button>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-28 w-28 transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-purple-600" strokeWidth="4" strokeDasharray="45.6, 100" strokeDashoffset="0" stroke="currentColor" fill="none" />
                <path className="text-cyan-500" strokeWidth="4" strokeDasharray="28.3, 100" strokeDashoffset="-45.6" stroke="currentColor" fill="none" />
                <path className="text-amber-500" strokeWidth="4" strokeDasharray="16.7, 100" strokeDashoffset="-73.9" stroke="currentColor" fill="none" />
                <path className="text-emerald-500" strokeWidth="4" strokeDasharray="9.4, 100" strokeDashoffset="-90.6" stroke="currentColor" fill="none" />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-900">$ 2,458,760</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-purple-600"></span> <span className="font-medium text-slate-600">Online</span> <span className="font-bold text-slate-900 ml-auto">45.6%</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-cyan-500"></span> <span className="font-medium text-slate-600">Card</span> <span className="font-bold text-slate-900 ml-auto">28.3%</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-amber-500"></span> <span className="font-medium text-slate-600">Cash</span> <span className="font-bold text-slate-900 ml-auto">16.7%</span></div>
              <div className="flex items-center gap-1.5"><span className="h-2 w-2 rounded bg-emerald-500"></span> <span className="font-medium text-slate-600">Bank Transfer</span> <span className="font-bold text-slate-900 ml-auto">9.4%</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 3 Tables: Revenue Summary, Expense Summary, Aging Receivables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Table 1: Revenue Summary */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Revenue Summary</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Service Category</th>
                  <th className="pb-1.5">Revenue ($)</th>
                  <th className="pb-1.5">% of Total</th>
                  <th className="pb-1.5">vs Last 7 Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {(data?.revenueSummary || [
                  { category: 'Inpatient Services', amount: '$ 1,145,230', percentage: '46.6%', trend: '↑ 14.6%' },
                  { category: 'Outpatient Services', amount: '$ 678,450', percentage: '27.6%', trend: '↑ 9.8%' },
                  { category: 'Diagnostic Services', amount: '$ 312,560', percentage: '12.7%', trend: '↑ 6.2%' },
                  { category: 'Pharmacy', amount: '$ 245,780', percentage: '10.0%', trend: '↑ 11.3%' },
                  { category: 'Other Services', amount: '$ 76,740', percentage: '3.1%', trend: '↓ 2.1%' },
                ]).map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 font-bold text-slate-900">{row.category}</td>
                    <td className="py-2">{row.amount}</td>
                    <td className="py-2">{row.percentage}</td>
                    <td className={`py-2 font-bold ${row.trend.includes('↑') ? 'text-emerald-600' : 'text-rose-600'}`}>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Expense Summary */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Expense Summary</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Expense Category</th>
                  <th className="pb-1.5">Amount ($)</th>
                  <th className="pb-1.5">% of Total</th>
                  <th className="pb-1.5">vs Last 7 Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {(data?.expenseSummary || [
                  { category: 'Salaries & Benefits', amount: '$ 612,340', percentage: '39.9%', trend: '↑ 6.5%' },
                  { category: 'Medical Supplies', amount: '$ 345,280', percentage: '22.5%', trend: '↑ 5.9%' },
                  { category: 'Utilities & Facilities', amount: '$ 210,560', percentage: '13.7%', trend: '↑ 3.1%' },
                  { category: 'Services & Contracts', amount: '$ 178,900', percentage: '11.7%', trend: '↑ 2.7%' },
                  { category: 'Other Expenses', amount: '$ 185,400', percentage: '12.2%', trend: '↓ 1.8%' },
                ]).map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 font-bold text-slate-900">{row.category}</td>
                    <td className="py-2">{row.amount}</td>
                    <td className="py-2">{row.percentage}</td>
                    <td className={`py-2 font-bold ${row.trend.includes('↑') ? 'text-emerald-600' : 'text-rose-600'}`}>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Aging of Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Aging of Receivables</h4>
            <button className="text-[11px] font-semibold text-blue-600 hover:underline">View Full Report</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Age Range</th>
                  <th className="pb-1.5">Amount ($)</th>
                  <th className="pb-1.5">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {(data?.agingReceivables || [
                  { range: '0 - 30 Days', amount: '$ 312,450', percentage: '36.9%' },
                  { range: '31 - 60 Days', amount: '$ 245,780', percentage: '29.1%' },
                  { range: '61 - 90 Days', amount: '$ 156,230', percentage: '18.5%' },
                  { range: '91 - 120 Days', amount: '$ 89,450', percentage: '10.6%' },
                  { range: '> 120 Days', amount: '$ 41,320', percentage: '4.9%' },
                ]).map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 font-bold text-slate-900">{row.range}</td>
                    <td className="py-2 font-bold text-slate-900">{row.amount}</td>
                    <td className="py-2 font-semibold text-slate-700">{row.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grid of 2 Tables: Top Revenue Generating Locations & Recent Financial Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Top Revenue Locations */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Top Revenue Generating Locations</h4>
            <button 
              onClick={() => handleViewReport('Revenue by Location Report', 'Financial Reports', 'Location-level financial revenue analysis comparing hospital wings and clinics.')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View Full Report <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Location / Unit</th>
                  <th className="p-2.5">Revenue ($)</th>
                  <th className="p-2.5">% of Total</th>
                  <th className="p-2.5">vs Last 7 Days</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(data?.topLocations || [
                  { location: 'Main Hospital', amount: '$ 1,245,230', percentage: '50.7%', trend: '↑ 13.2%' },
                  { location: 'West Wing', amount: '$ 523,450', percentage: '27.3%', trend: '↑ 9.1%' },
                  { location: 'Care Center – North', amount: '$ 345,780', percentage: '14.1%', trend: '↑ 6.4%' },
                  { location: 'Downtown Clinic', amount: '$ 215,230', percentage: '8.8%', trend: '↓ 1.3%' },
                  { location: 'Rehab Unit', amount: '$ 128,070', percentage: '5.1%', trend: '↑ 4.7%' },
                ]).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900">{row.location}</td>
                    <td className="p-2.5 font-bold text-slate-900">{row.amount}</td>
                    <td className="p-2.5 font-semibold text-slate-700">{row.percentage}</td>
                    <td className={`p-2.5 font-bold ${row.trend.includes('↑') ? 'text-emerald-600' : 'text-rose-600'}`}>{row.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Recent Financial Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900">Recent Financial Transactions</h4>
            <button 
              onClick={() => handleViewReport('Recent Financial Transactions Audit', 'Financial Reports', 'Audit log of recent payments received, invoices issued, and supplier bills paid.')}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-2.5">Date & Time</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Reference</th>
                  <th className="p-2.5">Customer / Vendor</th>
                  <th className="p-2.5">Amount ($)</th>
                  <th className="p-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {(data?.recentTransactions || [
                  { dateText: 'May 19, 2025 10:32 AM', type: 'Payment Received', reference: 'RCPT-12548', customerVendor: 'Blue Cross Blue Shield', amountText: '$ 54,320', status: 'Received' },
                  { dateText: 'May 19, 2025 09:15 AM', type: 'Invoice Generated', reference: 'INV-45879', customerVendor: 'Mary Johnson', amountText: '$ 28,750', status: 'Sent' },
                  { dateText: 'May 18, 2025 06:45 PM', type: 'Payment Received', reference: 'RCPT-12547', customerVendor: 'CareFirst Health', amountText: '$ 125,600', status: 'Received' },
                  { dateText: 'May 18, 2025 04:10 PM', type: 'Bill Paid', reference: 'BILL-78965', customerVendor: 'MedSupply Solutions', amountText: '$ 32,450', status: 'Paid' },
                  { dateText: 'May 18, 2025 11:20 AM', type: 'Invoice Generated', reference: 'INV-45878', customerVendor: 'Robert Brown', amountText: '$ 17,300', status: 'Sent' },
                ]).slice((currentPage - 1) * pageSize, currentPage * pageSize).map((tx: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-2.5 text-[11px] text-slate-500 whitespace-nowrap">{tx.dateText}</td>
                    <td className="p-2.5 font-bold text-slate-900">{tx.type}</td>
                    <td className="p-2.5 font-mono text-[11px] text-blue-600 font-semibold">{tx.reference}</td>
                    <td className="p-2.5 font-medium text-slate-700">{tx.customerVendor}</td>
                    <td className="p-2.5 font-bold text-slate-900">{tx.amountText}</td>
                    <td className="p-2.5">{getTxStatusBadge(tx.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil((data?.recentTransactions?.length || 5) / pageSize))}
            totalResults={data?.recentTransactions?.length || 5}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            itemLabel="transactions"
          />
        </div>
      </div>

      {/* Report Viewer Modal */}
      {isViewModalOpen && selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{selectedReport.reportName}</h3>
                  <p className="text-xs text-slate-500 font-semibold">{selectedReport.reportType} • {viewBy} Period</p>
                </div>
              </div>
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Audited By</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedByName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedReport.generatedByRole}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Generated On</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.generatedOnText}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Department</span>
                  <p className="font-extrabold text-slate-800">{selectedReport.careUnit}</p>
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-1">Executive Summary</h4>
                <p className="text-slate-600 font-medium leading-relaxed bg-emerald-50/40 p-3 rounded-xl border border-emerald-100/60">
                  {selectedReport.description}
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-xs mb-2">Financial Overview ({viewBy} View)</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                    <span className="text-[10px] font-bold text-emerald-600">Total Revenue</span>
                    <p className="text-lg font-black text-emerald-900 mt-0.5">{kpis.totalRevenue}</p>
                  </div>
                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-center">
                    <span className="text-[10px] font-bold text-rose-600">Total Expenses</span>
                    <p className="text-lg font-black text-rose-900 mt-0.5">{kpis.totalExpenses}</p>
                  </div>
                  <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                    <span className="text-[10px] font-bold text-blue-600">Net Income</span>
                    <p className="text-lg font-black text-blue-900 mt-0.5">{kpis.netIncome}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-2xs transition-colors cursor-pointer"
              >
                <Printer className="h-4 w-4" />
                <span>Print</span>
              </button>
              <button
                onClick={() => handleDownloadReport(selectedReport)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReportsPage;
