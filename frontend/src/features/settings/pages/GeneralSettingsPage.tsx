import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Building2 } from 'lucide-react';
import { api } from '@/lib/api';

export const GeneralSettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    organizationName: 'Connected Care Senior Living',
    tagline: 'Compassionate Care, Connected Life',
    primaryColor: '#6B46C1',
    phone: '+91 98765 43210',
    email: 'info@connectedcare.com',
    address: '123, Care Street, Healthy City, Chennai - 600001, Tamil Nadu, India',
    dateFormat: 'DD MMM YYYY (19 May 2025)',
    defaultLanguage: 'English',
    timeFormat: '12 Hour (05:30 PM)',
    itemsPerPage: 20,
    weekStartsOn: 'Monday',
    defaultDashboard: 'Overview',
    allowPublicRegistration: true,
    sessionTimeoutMinutes: 30,
    enableAuditLogs: true,
    passwordExpiryDays: 90,
    enableTwoFactorAuth: true,
    maintenanceMode: false,
    weightUnit: 'Kilograms (kg)',
    heightUnit: 'Centimeters (cm)',
    temperatureUnit: 'Celsius (°C)',
    currency: 'INR (₹) - Indian Rupee',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettingsGeneral()
      .then((data) => {
        if (data) setFormData(data);
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    api.saveSettingsGeneral(formData)
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch(console.error);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Title Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">General Settings</h3>
          <p className="text-xs text-slate-500 font-medium">Manage basic application settings and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors"
        >
          <Save className="h-4 w-4" /> Save Changes
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Settings saved successfully!
        </div>
      )}

      {/* Card 1: Organization Information */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">Organization Information</h4>
          <p className="text-xs text-slate-400 font-medium">Update your organization details and contact information.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Organization Name</label>
              <input
                type="text"
                value={formData.organizationName || ''}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tagline <span className="text-slate-400 font-normal">(Optional)</span></label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                <div className="flex gap-2">
                  <select className="px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium">
                    <option>+91</option>
                  </select>
                  <input
                    type="text"
                    value={formData.phone?.replace('+91 ', '') || ''}
                    onChange={(e) => setFormData({ ...formData, phone: `+91 ${e.target.value}` })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Logo</label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <button className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold shadow-sm">
                    Change Logo
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG or SVG. Max size 2MB.</p>
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Primary Color</label>
              <div className="flex items-center gap-2">
                <span className="h-8 w-8 rounded-lg bg-purple-600 border border-slate-200 shrink-0"></span>
                <input
                  type="text"
                  value={formData.primaryColor || '#6B46C1'}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Address</label>
              <textarea
                rows={3}
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Card 2: Application Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">Application Preferences</h4>
          <p className="text-xs text-slate-400 font-medium">Configure basic application preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Date Format</label>
            <select
              value={formData.dateFormat || ''}
              onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>DD MMM YYYY (19 May 2025)</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Default Language</label>
            <select
              value={formData.defaultLanguage || ''}
              onChange={(e) => setFormData({ ...formData, defaultLanguage: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>English</option>
              <option>Spanish</option>
              <option>Tamil</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Time Format</label>
            <select
              value={formData.timeFormat || ''}
              onChange={(e) => setFormData({ ...formData, timeFormat: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>12 Hour (05:30 PM)</option>
              <option>24 Hour (17:30)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Items Per Page</label>
            <select
              value={formData.itemsPerPage || 20}
              onChange={(e) => setFormData({ ...formData, itemsPerPage: parseInt(e.target.value) || 20 })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Week Starts On</label>
            <select
              value={formData.weekStartsOn || 'Monday'}
              onChange={(e) => setFormData({ ...formData, weekStartsOn: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>Monday</option>
              <option>Sunday</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Default Dashboard</label>
            <select
              value={formData.defaultDashboard || 'Overview'}
              onChange={(e) => setFormData({ ...formData, defaultDashboard: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>Overview</option>
              <option>Clinical</option>
              <option>Operations</option>
            </select>
          </div>
        </div>
      </div>

      {/* Card 3: System Preferences */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">System Preferences</h4>
          <p className="text-xs text-slate-400 font-medium">Configure system related preferences.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Allow Public Registration</p>
                <p className="text-[10px] text-slate-400">Allow new users to register through public portal</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, allowPublicRegistration: !formData.allowPublicRegistration })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.allowPublicRegistration ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Enable Audit Logs</p>
                <p className="text-[10px] text-slate-400">Track and log system activities</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, enableAuditLogs: !formData.enableAuditLogs })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.enableAuditLogs ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow"></span>
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Enable Two Factor Authentication</p>
                <p className="text-[10px] text-slate-400">Require 2FA for admin and privileged users</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, enableTwoFactorAuth: !formData.enableTwoFactorAuth })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.enableTwoFactorAuth ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow"></span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={formData.sessionTimeoutMinutes || 30}
                onChange={(e) => setFormData({ ...formData, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Users will be logged out after the set time of inactivity.</p>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Password Expiry (days)</label>
              <input
                type="number"
                value={formData.passwordExpiryDays || 90}
                onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) || 90 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
              />
              <p className="text-[10px] text-slate-400 mt-1">Users will be required to change password after set number of days.</p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-900">Maintenance Mode</p>
                <p className="text-[10px] text-slate-400">Put the application into maintenance mode</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                  formData.maintenanceMode ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow"></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card 4: Default Units & Values */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h4 className="font-bold text-sm text-slate-900">Default Units & Values</h4>
          <p className="text-xs text-slate-400 font-medium">Set default units and measurements used across the application.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Weight Unit</label>
            <select
              value={formData.weightUnit || 'Kilograms (kg)'}
              onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>Kilograms (kg)</option>
              <option>Pounds (lbs)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Height Unit</label>
            <select
              value={formData.heightUnit || 'Centimeters (cm)'}
              onChange={(e) => setFormData({ ...formData, heightUnit: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>Centimeters (cm)</option>
              <option>Feet / Inches</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Temperature Unit</label>
            <select
              value={formData.temperatureUnit || 'Celsius (°C)'}
              onChange={(e) => setFormData({ ...formData, temperatureUnit: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>Celsius (°C)</option>
              <option>Fahrenheit (°F)</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Currency</label>
            <select
              value={formData.currency || 'INR (₹) - Indian Rupee'}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
            >
              <option>INR (₹) - Indian Rupee</option>
              <option>USD ($) - US Dollar</option>
              <option>EUR (€) - Euro</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
