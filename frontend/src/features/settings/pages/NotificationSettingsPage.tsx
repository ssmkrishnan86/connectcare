import React, { useState, useEffect } from 'react';
import {
  Mail,
  MessageSquare,
  Bell,
  Sliders,
  CheckCircle2,
  Clock,
  Send,
  Save,
  Search,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { api } from '@/lib/api';

export const NotificationSettingsPage: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    emailEnabled: 18,
    totalTemplates: 24,
    deliverySuccessRate: '98.6%',
    avgDeliveryTime: '32 sec',
    emailsSent: '12,548',
  });
  const [activeSubMenu, setActiveSubMenu] = useState('Email Notifications');
  const [activeTab, setActiveTab] = useState('All Templates');

  useEffect(() => {
    api.getSettingsNotifications()
      .then((data) => setTemplates(data || []))
      .catch(console.error);

    api.getSettingsNotificationStats()
      .then((data) => {
        if (data) setStats(data);
      })
      .catch(console.error);
  }, []);

  const handleToggle = (id: string) => {
    api.toggleNotificationTemplate(id)
      .then((updated) => {
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isEnabled: updated.isEnabled, status: updated.status } : t))
        );
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Notifications</h3>
          <p className="text-xs text-slate-500 font-medium">Configure notification settings and templates.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20">
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {/* Main Grid: Left Sub-Menu & Summary (1/4) + Right Templates Table (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Sub-menu Card */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 card-shadow space-y-1">
            <h4 className="px-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Notification Settings
            </h4>
            <p className="px-3 text-[10px] text-slate-400 mb-2">Configure how and when notifications are sent.</p>

            {[
              { label: 'Email Notifications', icon: Mail },
              { label: 'SMS Notifications', icon: MessageSquare },
              { label: 'Push Notifications', icon: Bell },
              { label: 'In-App Notifications', icon: Bell },
              { label: 'Notification Preferences', icon: Sliders },
              { label: 'Quiet Hours', icon: Clock },
              { label: 'Templates', icon: Mail },
              { label: 'Notification History', icon: Clock },
            ].map((sub) => (
              <button
                key={sub.label}
                onClick={() => setActiveSubMenu(sub.label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubMenu === sub.label
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <sub.icon className="h-4 w-4" />
                <span>{sub.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Summary Card */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow space-y-3 text-xs">
            <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Notification Summary</h5>
            <div className="space-y-2">
              <div className="flex justify-between font-semibold"><span className="text-slate-500">Total Templates</span><span className="text-slate-900 font-bold">24</span></div>
              <div className="flex justify-between font-semibold"><span className="text-slate-500">Email Enabled</span><span className="text-purple-700 font-bold">18</span></div>
              <div className="flex justify-between font-semibold"><span className="text-slate-500">SMS Enabled</span><span className="text-emerald-600 font-bold">12</span></div>
              <div className="flex justify-between font-semibold"><span className="text-slate-500">Push Enabled</span><span className="text-blue-600 font-bold">15</span></div>
              <div className="flex justify-between font-semibold"><span className="text-slate-500">In-App Enabled</span><span className="text-amber-600 font-bold">22</span></div>
            </div>
          </div>
        </div>

        {/* Right Column: Templates & Stats */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Title */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow">
            <h4 className="font-bold text-sm text-slate-900">{activeSubMenu}</h4>
            <p className="text-xs text-slate-400 font-medium">Configure email notification templates and delivery preferences.</p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Email Enabled</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.emailEnabled}</h4>
                <p className="text-[10px] text-slate-400">of {stats.totalTemplates} templates</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Delivery Success Rate</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.deliverySuccessRate}</h4>
                <p className="text-[10px] text-slate-400">last 30 days</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Avg. Delivery Time</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.avgDeliveryTime}</h4>
                <p className="text-[10px] text-slate-400">last 30 days</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Emails Sent</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{stats.emailsSent}</h4>
                <p className="text-[10px] text-slate-400">last 30 days</p>
              </div>
            </div>
          </div>

          {/* Main Templates Table */}
          <div className="bg-white rounded-xl border border-slate-200 card-shadow p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-4 text-xs">
                {['All Templates (24)', 'System Templates (16)', 'Custom Templates (8)'].map((tb) => (
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
                <div className="relative w-48">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search templates..."
                    className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <select className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Template Name</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Trigger Event</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {templates.map((tpl, idx) => (
                    <tr key={tpl.id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{tpl.templateName}</td>
                      <td className="p-3 text-slate-500 text-[11px]">{tpl.description}</td>
                      <td className="p-3">
                        <span className="flex items-center gap-1 font-semibold text-purple-700">
                          <Mail className="h-3.5 w-3.5" /> Email
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 font-semibold text-[11px]">{tpl.triggerEvent}</td>
                      <td className="p-3">
                        <button
                          onClick={() => handleToggle(tpl.id)}
                          className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                            tpl.isEnabled ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                          }`}
                        >
                          <span className="bg-white w-4 h-4 rounded-full shadow"></span>
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <button className="p-1 text-slate-400 hover:text-slate-600">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Showing 1 to {templates.length} of 24 templates</span>
              <div className="flex items-center gap-2">
                <button className="p-1 border border-slate-200 rounded text-slate-400"><ChevronLeft className="h-4 w-4" /></button>
                <button className="px-2 py-0.5 bg-purple-600 text-white rounded font-bold">1</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">2</button>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">3</button>
                <span className="text-slate-400">...</span>
                <button className="px-2 py-0.5 hover:bg-slate-100 text-slate-600 rounded">24</button>
                <button className="p-1 border border-slate-200 rounded text-slate-400"><ChevronRight className="h-4 w-4" /></button>
                <select className="ml-2 px-2 py-1 border border-slate-200 rounded text-slate-600 text-[11px]">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSettingsPage;
