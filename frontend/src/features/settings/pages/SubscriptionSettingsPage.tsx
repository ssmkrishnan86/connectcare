import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Download,
  Users,
  HardDrive,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { api } from '@/lib/api';

export const SubscriptionSettingsPage: React.FC = () => {
  const [subData, setSubData] = useState<any>({
    plan: {
      currentPlanName: 'Professional Plan',
      status: 'Active',
      renewalDateText: 'Jun 19, 2025',
      amountText: '$199.00 / month',
      paymentMethod: 'VISA **** **** 4242',
      residentsCurrent: 312,
      residentsLimit: 500,
      staffCurrent: 48,
      storageCurrentGb: '42.6',
      storageLimitGb: 100,
      smsCurrent: 1240,
      smsLimit: 5000,
      apiCurrent: 32500,
      apiLimit: 100000,
    },
    invoices: [],
  });

  const [activeTab, setActiveTab] = useState('Current Plan');

  useEffect(() => {
    api.getSettingsSubscription()
      .then((data) => {
        if (data) setSubData(data);
      })
      .catch(console.error);
  }, []);

  const plan = subData.plan || {};
  const invoices = subData.invoices || [];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Subscription</h3>
          <p className="text-xs text-slate-500 font-medium">Manage your subscription plan, usage limits, billing details and payment methods.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3.5 py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold">
            Billing Portal
          </button>
          <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20">
            Change Plan
          </button>
        </div>
      </div>

      {/* Top Tabs Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 card-shadow flex items-center gap-6 text-xs font-bold border-b border-slate-100">
        {['Current Plan', 'Usage & Limits', 'Pricing Plans', 'Billing History', 'Payment Methods'].map((tb) => (
          <button
            key={tb}
            onClick={() => setActiveTab(tb)}
            className={`pb-1 border-b-2 transition-colors ${
              activeTab === tb ? 'border-purple-600 text-purple-700' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tb}
          </button>
        ))}
      </div>

      {/* Top Section: Professional Plan Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-purple-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white uppercase tracking-wider">
                {plan.status || 'Active'}
              </span>
              <span className="text-xs font-medium text-purple-200">Next renewal: {plan.renewalDateText || 'Jun 19, 2025'}</span>
            </div>
            <h2 className="text-2xl font-black mt-1 tracking-tight">{plan.currentPlanName || 'Professional Plan'}</h2>
            <p className="text-xs text-purple-200 font-medium">Ideal for medium-sized senior living facilities requiring advanced clinical and operational features.</p>
          </div>

          <div className="text-right">
            <h3 className="text-3xl font-black">{plan.amountText || '$199.00 / month'}</h3>
            <p className="text-xs text-purple-200 mt-0.5">Billed monthly via {plan.paymentMethod || 'VISA **** 4242'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
          {[
            'Up to 500 Residents',
            '50 Staff accounts',
            '100 GB Storage',
            'Priority Support (24/7)',
            'Advanced Analytics & Reports',
            'Custom Roles & Permissions',
          ].map((ft, i) => (
            <div key={i} className="flex items-center gap-2 text-purple-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{ft}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Middle Section: Usage Summary Progress Bars */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Usage Summary</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Residents Usage */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-purple-600" /> Residents</span>
              <span>312 / 500</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-purple-600 rounded-full" style={{ width: '62.4%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">62.4% used</p>
          </div>

          {/* Staff Accounts Usage */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-emerald-600" /> Staff Accounts</span>
              <span>48 / 50</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '96.0%' }}></div>
            </div>
            <p className="text-[10px] text-rose-500 font-bold text-right">96.0% used (Near limit)</p>
          </div>

          {/* Storage Usage */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><HardDrive className="h-4 w-4 text-blue-600" /> Storage</span>
              <span>42.6 GB / 100 GB</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '42.6%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">42.6% used</p>
          </div>

          {/* SMS Credits Usage */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><MessageSquare className="h-4 w-4 text-amber-600" /> SMS Credits</span>
              <span>1,240 / 5,000</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '24.8%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">24.8% used</p>
          </div>

          {/* API Calls Usage */}
          <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex justify-between font-bold text-slate-800">
              <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-cyan-600" /> API Calls</span>
              <span>32,500 / 100,000</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '32.5%' }}></div>
            </div>
            <p className="text-[10px] text-slate-400 text-right">32.5% used</p>
          </div>
        </div>
      </div>

      {/* Pricing Plans Cards Grid (4 Plans) */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm text-slate-900">Pricing Plans</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Plan 1: Basic */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex flex-col justify-between space-y-4">
            <div>
              <h5 className="font-bold text-slate-900 text-base">Basic Plan</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">For small care homes & clinics</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">$99 <span className="text-xs font-normal text-slate-500">/ mo</span></h3>
              <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                <li>✓ Up to 100 Residents</li>
                <li>✓ 10 Staff accounts</li>
                <li>✓ 20 GB Storage</li>
                <li>✓ Standard Support</li>
              </ul>
            </div>
            <button className="w-full py-2 border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl font-bold">
              Upgrade Plan
            </button>
          </div>

          {/* Plan 2: Professional (Active) */}
          <div className="bg-white p-5 rounded-2xl border-2 border-purple-600 card-shadow flex flex-col justify-between space-y-4 relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-purple-600 text-white rounded-full text-[9px] font-extrabold uppercase">
              Current Plan
            </span>
            <div>
              <h5 className="font-bold text-purple-900 text-base">Professional Plan</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">For medium senior living facilities</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">$199 <span className="text-xs font-normal text-slate-500">/ mo</span></h3>
              <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                <li>✓ Up to 500 Residents</li>
                <li>✓ 50 Staff accounts</li>
                <li>✓ 100 GB Storage</li>
                <li>✓ Priority 24/7 Support</li>
              </ul>
            </div>
            <button className="w-full py-2 bg-slate-100 text-slate-500 rounded-xl font-bold cursor-default" disabled>
              Current Plan
            </button>
          </div>

          {/* Plan 3: Enterprise */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex flex-col justify-between space-y-4">
            <div>
              <h5 className="font-bold text-slate-900 text-base">Enterprise Plan</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">For large multi-facility networks</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">$499 <span className="text-xs font-normal text-slate-500">/ mo</span></h3>
              <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                <li>✓ Up to 2,000 Residents</li>
                <li>✓ 200 Staff accounts</li>
                <li>✓ 500 GB Storage</li>
                <li>✓ Dedicated Account Manager</li>
              </ul>
            </div>
            <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-sm">
              Upgrade Plan
            </button>
          </div>

          {/* Plan 4: Custom */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 card-shadow flex flex-col justify-between space-y-4">
            <div>
              <h5 className="font-bold text-slate-900 text-base">Custom Plan</h5>
              <p className="text-[10px] text-slate-400 mt-0.5">Tailored for healthcare systems</p>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Contact Us</h3>
              <ul className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                <li>✓ Unlimited Residents</li>
                <li>✓ Unlimited Staff</li>
                <li>✓ Custom Storage & SLA</li>
                <li>✓ On-Premise / Hybrid Cloud</li>
              </ul>
            </div>
            <button className="w-full py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold">
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Billing History Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-6 space-y-3 text-xs">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Billing History</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3">Invoice #</th>
                <th className="p-3">Date</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Invoice PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {invoices.map((inv: any, idx: number) => (
                <tr key={inv.id || idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 font-bold text-slate-900">{inv.invoiceNumber}</td>
                  <td className="p-3 text-slate-500 text-[11px]">{inv.dateText}</td>
                  <td className="p-3 font-bold text-slate-900">{inv.amountText}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold">
                      <Download className="h-3.5 w-3.5" /> Download PDF
                    </button>
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

export default SubscriptionSettingsPage;
