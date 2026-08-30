import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  FileText,
  CreditCard,
  Percent,
  Calendar,
  Download,
  ExternalLink,
  Layers,
  Printer,
  X,
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{new Date(Date.now() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <DataImportExportToolbar
              moduleKey="reports"
              data={reportData?.recentTransactions || []}
              idField="id"
              onImportSuccess={() => api.getFinancialReports(viewBy).then((res: any) => setData(res?.data || res))}
              customCreateApi={api.createCustomReport}
            />
          </div>
        }
      />

      {/* Subtitle */}
      <div>
        <h2 className="text-lg font-bold text-slate-900">Financial Reports</h2>
      </div>

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { title: 'Total Revenue', value: kpis.totalRevenue, change: 'Billed total (YTD)', icon: DollarSign, bg: 'bg-purple-100 text-purple-600' },
          { title: 'Total Expenses', value: kpis.totalExpenses, change: 'Recorded expenditures', icon: FileText, bg: 'bg-indigo-100 text-indigo-600' },
          { title: 'Net Income', value: kpis.netIncome, change: 'Operating margin', icon: Layers, bg: 'bg-blue-100 text-blue-600' },
          { title: 'Outstanding Receivables', value: kpis.outstandingReceivables, change: `Due from ${kpis.receivablesInvoiceCount} invoices`, icon: FileText, bg: 'bg-amber-100 text-amber-600', isInfo: true },
          { title: 'Outstanding Payables', value: kpis.outstandingPayables, change: `Due to ${kpis.payablesBillCount} bills`, icon: CreditCard, bg: 'bg-rose-100 text-rose-600', isInfo: true },
          { title: 'Collection Rate', value: kpis.collectionRate, change: 'Realized collections', icon: Percent, bg: 'bg-purple-100 text-purple-600' },
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
            <p className={`mt-2 text-[11px] font-semibold ${stat.isInfo ? 'text-slate-400' : 'text-emerald-600'}`}>
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
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Service Category</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Categories</option>
            </select>
          </div>

          <div className="flex flex-col text-[10px] text-slate-400">
            <span>Payment Mode</span>
            <select className="mt-0.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium">
              <option value="All">All Modes</option>
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
        {/* Chart 1: Revenue Overview */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Total Revenue</h4>
          </div>
          <div className="h-36 flex items-center justify-center border-b border-slate-200 pb-2 px-1">
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-slate-900">{kpis.totalRevenue}</span>
              <span className="text-xs text-slate-400 mt-1">Live Revenue Stream</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Revenue by Payer Type */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Revenue by Payer Type</h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-[10px] font-bold text-slate-900">{kpis.totalRevenue}</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px] flex-1 ml-3">
              {(data?.revenueByPayerType || []).length > 0 ? (
                (data?.revenueByPayerType || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#8B5CF6' }}></span>
                    <span className="font-medium text-slate-600">{item.type}</span>
                    <span className="font-bold text-slate-900 ml-auto">{item.amount} ({item.percentage})</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-[10px]">No payer data recorded</div>
              )}
            </div>
          </div>
        </div>

        {/* Chart 3: Expenses by Category */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Expenses by Category</h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-[10px] font-bold text-slate-900">{kpis.totalExpenses}</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px] flex-1 ml-3">
              {(data?.expensesByCategory || []).length > 0 ? (
                (data?.expensesByCategory || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#3B82F6' }}></span>
                    <span className="font-medium text-slate-600">{item.category}</span>
                    <span className="font-bold text-slate-900 ml-auto">{item.amount} ({item.percentage})</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-[10px]">No expense categories recorded</div>
              )}
            </div>
          </div>
        </div>

        {/* Chart 4: Payment Mode Collection */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-xs text-slate-900">Payment Mode Collection</h4>
          </div>
          <div className="flex items-center justify-between">
            <div className="relative h-28 w-28 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full border-4 border-slate-100 flex flex-col items-center justify-center bg-slate-50">
                <span className="text-[10px] font-bold text-slate-900">{kpis.totalRevenue}</span>
                <span className="text-[8px] text-slate-400 font-medium">Total</span>
              </div>
            </div>
            <div className="space-y-1 text-[10px] flex-1 ml-3">
              {(data?.paymentModeCollection || []).length > 0 ? (
                (data?.paymentModeCollection || []).map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded" style={{ backgroundColor: item.color || '#8B5CF6' }}></span>
                    <span className="font-medium text-slate-600">{item.mode}</span>
                    <span className="font-bold text-slate-900 ml-auto">{item.percentage}</span>
                  </div>
                ))
              ) : (
                <div className="text-slate-400 text-[10px]">No payment modes recorded</div>
              )}
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
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Service Category</th>
                  <th className="pb-1.5">Revenue ($)</th>
                  <th className="pb-1.5">% of Total</th>
                  <th className="pb-1.5">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {(data?.revenueSummary || []).length > 0 ? (
                  (data?.revenueSummary || []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-slate-900">{row.category}</td>
                      <td className="py-2">{row.amount}</td>
                      <td className="py-2">{row.percentage}</td>
                      <td className={`py-2 font-bold ${row.trend?.includes('↑') ? 'text-emerald-600' : 'text-rose-600'}`}>{row.trend}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                      No revenue records recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Expense Summary */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Expense Summary</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="text-[10px] text-slate-400 uppercase font-semibold border-b border-slate-100">
                <tr>
                  <th className="pb-1.5">Expense Category</th>
                  <th className="pb-1.5">Amount ($)</th>
                  <th className="pb-1.5">% of Total</th>
                  <th className="pb-1.5">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {(data?.expenseSummary || []).length > 0 ? (
                  (data?.expenseSummary || []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-slate-900">{row.category}</td>
                      <td className="py-2">{row.amount}</td>
                      <td className="py-2">{row.percentage}</td>
                      <td className={`py-2 font-bold ${row.trend?.includes('↑') ? 'text-emerald-600' : 'text-rose-600'}`}>{row.trend}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-slate-400 text-xs">
                      No expense records recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3: Aging of Receivables */}
        <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">Aging of Receivables</h4>
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
                {(data?.agingReceivables || []).length > 0 ? (
                  (data?.agingReceivables || []).map((row: any, i: number) => (
                    <tr key={i}>
                      <td className="py-2 font-bold text-slate-900">{row.range}</td>
                      <td className="py-2 font-bold text-slate-900">{row.amount}</td>
                      <td className="py-2 font-semibold text-slate-700">{row.percentage}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-400 text-xs">
                      No outstanding receivables recorded
                    </td>
                  </tr>
                )}
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
                {(data?.topLocations || []).length > 0 ? (
                  (data?.topLocations || []).map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 font-bold text-slate-900">{row.location}</td>
                      <td className="p-2.5 font-bold text-slate-900">{row.amount}</td>
                      <td className="p-2.5 font-semibold text-slate-700">{row.percentage}</td>
                      <td className={`p-2.5 font-bold ${row.trend?.includes('↑') ? 'text-emerald-600' : 'text-rose-600'}`}>{row.trend}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-slate-400 text-xs">
                      No location revenue data recorded yet
                    </td>
                  </tr>
                )}
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
                {(data?.recentTransactions || []).length > 0 ? (
                  (data?.recentTransactions || []).slice((currentPage - 1) * pageSize, currentPage * pageSize).map((tx: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-2.5 text-[11px] text-slate-500 whitespace-nowrap">{tx.dateText || tx.transactionDate}</td>
                      <td className="p-2.5 font-bold text-slate-900">{tx.type}</td>
                      <td className="p-2.5 font-mono text-[11px] text-blue-600 font-semibold">{tx.reference || tx.transactionNumber}</td>
                      <td className="p-2.5 font-medium text-slate-700">{tx.customerVendor || tx.description}</td>
                      <td className="p-2.5 font-bold text-slate-900">{tx.amountText || `$ ${tx.amount}`}</td>
                      <td className="p-2.5">{getTxStatusBadge(tx.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400 text-xs">
                      No financial transactions recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={Math.max(1, Math.ceil(((data?.recentTransactions || []).length || 1) / pageSize))}
            totalResults={(data?.recentTransactions || []).length}
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
