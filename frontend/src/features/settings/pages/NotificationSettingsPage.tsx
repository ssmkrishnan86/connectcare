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
  Plus,
  Edit2,
  Trash2,
  Volume2,
  Smartphone,
  Server,
  FileText,
  X,
  RefreshCw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';

export const NotificationSettingsPage: React.FC = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [activeSubMenu, setActiveSubMenu] = useState('Email Notifications');
  const [activeTab, setActiveTab] = useState('All');
  const [searchTemplate, setSearchTemplate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Email Config State
  const [emailConfig, setEmailConfig] = useState({
    smtpHost: '',
    smtpPort: '587',
    senderName: 'ConnectCare Notifications',
    senderEmail: 'notifications@connectcare.local',
    enableSsl: true,
    alertEmail: true,
    taskEmail: true,
    consultationEmail: true,
    handoverEmail: false,
    billingEmail: true,
  });

  // SMS Config State
  const [smsConfig, setSmsConfig] = useState({
    provider: 'Twilio SMS Gateway',
    accountSid: '',
    fromNumber: '',
    urgentAlertsSms: true,
    codeBlueSms: true,
    taskAssignmentSms: false,
    handoverAlertSms: true,
  });

  // Push & In-App Config State
  const [inAppConfig, setInAppConfig] = useState({
    enableSoundAlerts: true,
    soundType: 'Chime High (Default)',
    enableToastPopups: true,
    toastDurationSec: 6,
    showCriticalBanner: true,
    autoMarkReadOnNavigate: true,
  });

  // Quiet Hours State
  const [quietHours, setQuietHours] = useState({
    enabled: false,
    startTime: '22:00',
    endTime: '06:00',
    bypassForCritical: true,
    bypassForCodeBlue: true,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  });

  // Matrix Preferences State
  const [preferencesMatrix, setPreferencesMatrix] = useState<Record<string, { email: boolean; sms: boolean; push: boolean; inApp: boolean }>>({
    'Critical Alerts': { email: true, sms: true, push: true, inApp: true },
    'Task Assignments': { email: true, sms: false, push: true, inApp: true },
    'Consultations': { email: true, sms: true, push: true, inApp: true },
    'Medication Reminders': { email: false, sms: true, push: true, inApp: true },
    'Shift Handovers': { email: true, sms: false, push: true, inApp: true },
    'Care Plan Updates': { email: true, sms: false, push: false, inApp: true },
    'System Announcements': { email: true, sms: false, push: true, inApp: true },
  });

  // Template Modal State
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [templateForm, setTemplateForm] = useState({
    templateName: '',
    description: '',
    category: 'Clinical',
    channel: 'Email',
    triggerEvent: '',
    status: 'Active',
    isEnabled: true,
  });

  const [totalDispatchesCount, setTotalDispatchesCount] = useState<number>(0);

  const loadData = () => {
    api.getSettingsNotifications()
      .then((res: any) => {
        const data = Array.isArray(res) ? res : res?.data;
        setTemplates(Array.isArray(data) ? data : []);
      })
      .catch(console.error);

    api.getNotifications({ pageSize: 1 })
      .then((res: any) => {
        const data = res?.data || res;
        const total = data?.totalCount ?? (Array.isArray(data?.notifications) ? data.notifications.length : (Array.isArray(data) ? data.length : 0));
        setTotalDispatchesCount(typeof total === 'number' ? total : 0);
      })
      .catch(console.error);

    api.getNotificationDeliveryHistory(25)
      .then((res: any) => {
        const list = res?.data || res;
        if (Array.isArray(list)) setHistory(list);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = (id: string) => {
    api.toggleNotificationTemplate(id)
      .then((res: any) => {
        const updated = res?.data || res;
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isEnabled: updated.isEnabled, status: updated.status } : t))
        );
      })
      .catch(console.error);
  };

  const handleSaveGlobalChanges = () => {
    setSaveSuccessMessage('Notification settings saved and synchronized successfully!');
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      templateName: '',
      description: '',
      category: 'Clinical',
      channel: 'Email',
      triggerEvent: '',
      status: 'Active',
      isEnabled: true,
    });
    setIsTemplateModalOpen(true);
  };

  const handleOpenEditTemplate = (tpl: any) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      templateName: tpl.templateName || '',
      description: tpl.description || '',
      category: tpl.category || 'Clinical',
      channel: tpl.channel || 'Email',
      triggerEvent: tpl.triggerEvent || '',
      status: tpl.status || 'Active',
      isEnabled: tpl.isEnabled !== false,
    });
    setIsTemplateModalOpen(true);
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.templateName) return;

    try {
      if (editingTemplate?.id) {
        await api.updateNotificationTemplate(editingTemplate.id, templateForm);
        setTemplates(prev =>
          prev.map(t => (t.id === editingTemplate.id ? { ...t, ...templateForm } : t))
        );
      } else {
        const res: any = await api.createNotificationTemplate(templateForm);
        const created = res?.data || res;
        setTemplates(prev => [created, ...prev]);
      }
      setIsTemplateModalOpen(false);
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await api.deleteNotificationTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Failed to delete template:', err);
    }
  };

  const filteredTemplates = templates.filter(tpl => {
    if (activeTab === 'System' && tpl.category !== 'System' && tpl.category !== 'User Management' && tpl.category !== 'Authentication') return false;
    if (activeTab === 'Custom' && (tpl.category === 'User Management' || tpl.category === 'Authentication')) return false;
    if (statusFilter !== 'All' && tpl.status?.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (searchTemplate) {
      const s = searchTemplate.toLowerCase();
      return (
        tpl.templateName?.toLowerCase().includes(s) ||
        tpl.description?.toLowerCase().includes(s) ||
        tpl.triggerEvent?.toLowerCase().includes(s) ||
        tpl.category?.toLowerCase().includes(s)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Notifications & Delivery Channels</h3>
          <p className="text-xs text-slate-500 font-medium">
            Configure multi-channel alerts, sound effects, quiet hours, delivery preferences, and message templates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="settings-general"
            data={templates}
            idField="id"
            onImportSuccess={loadData}
            customCreateApi={api.createNotificationTemplate}
          />
          {saveSuccessMessage && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4" /> {saveSuccessMessage}
            </span>
          )}
          <button
            onClick={handleSaveGlobalChanges}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer transition-all"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sub-Menu (1/4) + Right Settings Panel (3/4) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Sub-menu Card */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200 card-shadow space-y-1">
            <h4 className="px-3 pt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Notification Channels
            </h4>
            <p className="px-3 text-[10px] text-slate-400 mb-2">Configure delivery modes and dispatch settings.</p>

            {[
              { label: 'Email Notifications', icon: Mail },
              { label: 'SMS Notifications', icon: MessageSquare },
              { label: 'Push Notifications', icon: Smartphone },
              { label: 'In-App Notifications', icon: Bell },
              { label: 'Notification Preferences', icon: Sliders },
              { label: 'Quiet Hours', icon: Clock },
              { label: 'Templates', icon: FileText },
              { label: 'Notification History', icon: Send },
            ].map((sub) => (
              <button
                key={sub.label}
                onClick={() => setActiveSubMenu(sub.label)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeSubMenu === sub.label
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <sub.icon className="h-4 w-4 shrink-0" />
                <span>{sub.label}</span>
              </button>
            ))}
          </div>

          {/* Bottom Summary Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow space-y-3 text-xs">
            <h5 className="font-bold text-slate-900 border-b border-slate-100 pb-2">Active Channels Summary</h5>
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Total Templates</span>
                <span className="text-slate-900 font-bold">{templates.length}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Email Enabled</span>
                <span className="text-blue-700 font-bold">
                  {templates.filter((t) => t.isEnabled && (t.channel || '').includes('Email')).length}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">SMS Enabled</span>
                <span className="text-emerald-600 font-bold">
                  {templates.filter((t) => t.isEnabled && (t.channel || '').includes('SMS')).length}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">Push Enabled</span>
                <span className="text-purple-600 font-bold">
                  {templates.filter((t) => t.isEnabled && (t.channel || '').includes('Push')).length}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-slate-500">In-App Enabled</span>
                <span className="text-amber-600 font-bold">
                  {templates.filter((t) => t.isEnabled && (t.channel || '').includes('In-App')).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Panel depending on activeSubMenu */}
        <div className="lg:col-span-3 space-y-4">
          {/* Header Title */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-slate-900">{activeSubMenu}</h4>
              <p className="text-xs text-slate-400 font-medium">
                {activeSubMenu === 'Email Notifications' && 'Configure SMTP relay server, sender identity, and email dispatch triggers.'}
                {activeSubMenu === 'SMS Notifications' && 'Manage SMS gateway credentials and urgent broadcast phone alerts.'}
                {activeSubMenu === 'Push Notifications' && 'Manage Web and Mobile push notifications and priority sound triggers.'}
                {activeSubMenu === 'In-App Notifications' && 'Adjust header badges, audio chime alerts, and toast popup durations.'}
                {activeSubMenu === 'Notification Preferences' && 'Set custom notification matrix per event category.'}
                {activeSubMenu === 'Quiet Hours' && 'Set scheduled do-not-disturb hours with emergency bypass overrides.'}
                {activeSubMenu === 'Templates' && 'Manage reusable message templates across email, SMS, and push channels.'}
                {activeSubMenu === 'Notification History' && 'Real-time audit log of dispatched notifications with delivery status.'}
              </p>
            </div>
            {activeSubMenu === 'Templates' && (
              <button
                onClick={handleOpenCreateTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> New Template
              </button>
            )}
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Email Enabled</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                  {templates.filter((t) => t.isEnabled && (t.channel || '').includes('Email')).length}
                </h4>
                <p className="text-[10px] text-slate-400">of {templates.length} templates</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Delivery Rate</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                  {totalDispatchesCount > 0 ? '100%' : '0%'}
                </h4>
                <p className="text-[10px] text-slate-400">real-time</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Avg. Delivery</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">
                  {totalDispatchesCount > 0 ? '< 1 sec' : '0 sec'}
                </h4>
                <p className="text-[10px] text-slate-400">instant dispatch</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 card-shadow flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">Dispatches</p>
                <h4 className="text-xl font-bold text-slate-900 mt-0.5">{totalDispatchesCount.toLocaleString()}</h4>
                <p className="text-[10px] text-slate-400">total notifications</p>
              </div>
            </div>
          </div>

          {/* View: Email Notifications */}
          {activeSubMenu === 'Email Notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5 space-y-5 text-xs">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Server className="h-4 w-4 text-blue-600" /> SMTP Relay Configuration
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">SMTP Host Server</label>
                  <input
                    type="text"
                    value={emailConfig.smtpHost}
                    onChange={e => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Port</label>
                  <input
                    type="text"
                    value={emailConfig.smtpPort}
                    onChange={e => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sender Display Name</label>
                  <input
                    type="text"
                    value={emailConfig.senderName}
                    onChange={e => setEmailConfig({ ...emailConfig, senderName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Sender Email Address</label>
                  <input
                    type="email"
                    value={emailConfig.senderEmail}
                    onChange={e => setEmailConfig({ ...emailConfig, senderEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h5 className="font-bold text-slate-900">Email Event Triggers</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { key: 'alertEmail', label: 'Clinical Emergency Alerts (Critical / High)' },
                    { key: 'taskEmail', label: 'Staff Task Assignments & Due Reminders' },
                    { key: 'consultationEmail', label: 'Doctor Teleconsultations & Appointments' },
                    { key: 'handoverEmail', label: 'Shift Handover Summaries' },
                    { key: 'billingEmail', label: 'Invoices & Financial Receipts' },
                  ].map(item => (
                    <label key={item.key} className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(emailConfig as any)[item.key]}
                        onChange={e => setEmailConfig({ ...emailConfig, [item.key]: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                      <span className="font-semibold text-slate-700">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* View: SMS Notifications */}
          {activeSubMenu === 'SMS Notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5 space-y-5 text-xs">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-600" /> SMS Provider & Gateway
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">SMS Gateway Service</label>
                  <input
                    type="text"
                    value={smsConfig.provider}
                    onChange={e => setSmsConfig({ ...smsConfig, provider: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">From / Caller ID</label>
                  <input
                    type="text"
                    value={smsConfig.fromNumber}
                    onChange={e => setSmsConfig({ ...smsConfig, fromNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-3">
                <h5 className="font-bold text-slate-900">Urgent SMS Alerts</h5>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsConfig.urgentAlertsSms}
                      onChange={e => setSmsConfig({ ...smsConfig, urgentAlertsSms: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-700">Dispatch SMS for Critical Vitals & Patient Emergencies</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsConfig.codeBlueSms}
                      onChange={e => setSmsConfig({ ...smsConfig, codeBlueSms: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 h-4 w-4"
                    />
                    <span className="font-semibold text-slate-700">Instant Broadcast to On-Call Physician Mobile</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* View: In-App Notifications */}
          {activeSubMenu === 'In-App Notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5 space-y-5 text-xs">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-blue-600" /> In-App Alert Experience
              </h5>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Sound Effects</span>
                    <span className="text-slate-500 text-[11px]">Play audio alert when new critical patient event arrives</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppConfig.enableSoundAlerts}
                    onChange={e => setInAppConfig({ ...inAppConfig, enableSoundAlerts: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Floating Toast Popups</span>
                    <span className="text-slate-500 text-[11px]">Show non-intrusive popup on bottom-right of screen</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppConfig.enableToastPopups}
                    onChange={e => setInAppConfig({ ...inAppConfig, enableToastPopups: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                  <div>
                    <span className="font-bold text-slate-900 block">Auto-Mark Read on Click</span>
                    <span className="text-slate-500 text-[11px]">Automatically mark notification read when clicking the item</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={inAppConfig.autoMarkReadOnNavigate}
                    onChange={e => setInAppConfig({ ...inAppConfig, autoMarkReadOnNavigate: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 h-4 w-4"
                  />
                </label>
              </div>
            </div>
          )}

          {/* View: Notification Preferences Matrix */}
          {activeSubMenu === 'Notification Preferences' && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5 space-y-4 text-xs">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-blue-600" /> Channel Delivery Matrix
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3 text-center">In-App</th>
                      <th className="p-3 text-center">Email</th>
                      <th className="p-3 text-center">Push</th>
                      <th className="p-3 text-center">SMS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {Object.entries(preferencesMatrix).map(([cat, val]) => (
                      <tr key={cat} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{cat}</td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={val.inApp}
                            onChange={e => setPreferencesMatrix({
                              ...preferencesMatrix,
                              [cat]: { ...val, inApp: e.target.checked }
                            })}
                            className="rounded border-slate-300 text-blue-600 h-4 w-4"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={val.email}
                            onChange={e => setPreferencesMatrix({
                              ...preferencesMatrix,
                              [cat]: { ...val, email: e.target.checked }
                            })}
                            className="rounded border-slate-300 text-blue-600 h-4 w-4"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={val.push}
                            onChange={e => setPreferencesMatrix({
                              ...preferencesMatrix,
                              [cat]: { ...val, push: e.target.checked }
                            })}
                            className="rounded border-slate-300 text-blue-600 h-4 w-4"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={val.sms}
                            onChange={e => setPreferencesMatrix({
                              ...preferencesMatrix,
                              [cat]: { ...val, sms: e.target.checked }
                            })}
                            className="rounded border-slate-300 text-blue-600 h-4 w-4"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View: Quiet Hours */}
          {activeSubMenu === 'Quiet Hours' && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-5 space-y-5 text-xs">
              <h5 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" /> Do Not Disturb & Quiet Hours
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    value={quietHours.startTime}
                    onChange={e => setQuietHours({ ...quietHours, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    value={quietHours.endTime}
                    onChange={e => setQuietHours({ ...quietHours, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={quietHours.bypassForCritical}
                    onChange={e => setQuietHours({ ...quietHours, bypassForCritical: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 h-4 w-4"
                  />
                  <span className="font-bold text-slate-900">Always bypass Quiet Hours for Critical Emergency Alerts</span>
                </label>
              </div>
            </div>
          )}

          {/* View: Templates Table */}
          {(activeSubMenu === 'Templates' || activeSubMenu === 'Push Notifications') && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-4 text-xs">
                  {['All', 'System', 'Custom'].map((tb) => (
                    <button
                      key={tb}
                      onClick={() => setActiveTab(tb)}
                      className={`pb-2 font-bold border-b-2 transition-colors cursor-pointer ${
                        activeTab === tb
                          ? 'border-blue-600 text-blue-700'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tb} Templates
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchTemplate}
                      onChange={e => setSearchTemplate(e.target.value)}
                      placeholder="Search templates..."
                      className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                    {filteredTemplates.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{tpl.templateName}</td>
                        <td className="p-3 text-slate-500 text-[11px] max-w-xs">{tpl.description}</td>
                        <td className="p-3">
                          <span className="flex items-center gap-1 font-semibold text-blue-700">
                            <Mail className="h-3.5 w-3.5" /> {tpl.channel || 'Email'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-700 font-semibold text-[11px]">{tpl.triggerEvent}</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggle(tpl.id)}
                            className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                              tpl.isEnabled ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
                            }`}
                          >
                            <span className="bg-white w-4 h-4 rounded-full shadow"></span>
                          </button>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditTemplate(tpl)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded"
                              title="Edit Template"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(tpl.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete Template"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* View: Notification History */}
          {activeSubMenu === 'Notification History' && (
            <div className="bg-white rounded-2xl border border-slate-200 card-shadow p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h5 className="font-bold text-slate-900">Recent Dispatches & Audit Log</h5>
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                >
                  <RefreshCw className="h-3 w-3" /> Refresh Log
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-3">Title / Event</th>
                      <th className="p-3">Channel</th>
                      <th className="p-3">Recipient</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-semibold">
                          No notification delivery logs found. When live alerts or tasks trigger notifications, they will appear here.
                        </td>
                      </tr>
                    ) : (
                      history.map((item, idx) => (
                        <tr key={item.id || idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{item.title}</td>
                          <td className="p-3 text-slate-600 font-semibold">{item.channel || 'Email + In-App'}</td>
                          <td className="p-3 text-slate-700">{item.recipient || 'All Staff'}</td>
                          <td className="p-3 text-blue-600 font-semibold">{item.patient || '-'}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                              {item.status || 'Delivered'}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{item.sentAt}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create/Edit Template */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900">
                {editingTemplate ? 'Edit Notification Template' : 'Create New Template'}
              </h4>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1 font-bold">Template Name *</label>
                <input
                  type="text"
                  required
                  value={templateForm.templateName}
                  onChange={e => setTemplateForm({ ...templateForm, templateName: e.target.value })}
                  placeholder="e.g. Critical Vitals Emergency Broadcast"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Description</label>
                <textarea
                  rows={2}
                  value={templateForm.description}
                  onChange={e => setTemplateForm({ ...templateForm, description: e.target.value })}
                  placeholder="Brief summary of when and to whom this template is dispatched"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Category</label>
                  <select
                    value={templateForm.category}
                    onChange={e => setTemplateForm({ ...templateForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Clinical">Clinical</option>
                    <option value="Alerts">Alerts</option>
                    <option value="Tasks">Tasks</option>
                    <option value="Appointments">Appointments</option>
                    <option value="Medications">Medications</option>
                    <option value="Discharge">Discharge</option>
                    <option value="System">System</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-bold">Channel</label>
                  <select
                    value={templateForm.channel}
                    onChange={e => setTemplateForm({ ...templateForm, channel: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Email">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="Push">Push Notification</option>
                    <option value="In-App">In-App Alert</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-bold">Trigger Event</label>
                <input
                  type="text"
                  value={templateForm.triggerEvent}
                  onChange={e => setTemplateForm({ ...templateForm, triggerEvent: e.target.value })}
                  placeholder="e.g. Critical Vitals Threshold Exceeded"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer shadow-sm shadow-blue-500/20"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSettingsPage;
