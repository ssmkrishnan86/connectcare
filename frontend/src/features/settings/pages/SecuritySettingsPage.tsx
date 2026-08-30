import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, ShieldCheck, Plus, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';

export const SecuritySettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<any>({
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    passwordExpiryDays: 90,
    enableMfaFor: 'All Users',
    mfaAuthenticatorApp: true,
    mfaSmsVerification: true,
    mfaEmailVerification: false,
    rememberMfaDays: 7,
    sessionTimeoutMinutes: 30,
    idleTimeoutMinutes: 15,
    forceLogoutOnPasswordChange: true,
    allowMultipleActiveSessions: false,
    lockoutThreshold: 5,
    lockoutDurationMinutes: 15,
    preventUserEnumeration: true,
    requireEmailVerification: true,
    restrictLoginToRegisteredDevices: false,
    allowPasswordReset: true,
    restrictSpecificIps: true,
  });

  const [allowedIps, setAllowedIps] = useState<string[]>([
    '203.0.113.10',
    '203.0.113.0/24',
    '198.51.100.15',
  ]);

  const [newIpInput, setNewIpInput] = useState('');
  const [activeTab, setActiveTab] = useState('Password Policy');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getSettingsSecurity()
      .then((data) => {
        if (data) {
          setFormData(data);
          if (data.allowedIpsJson) {
            try {
              setAllowedIps(JSON.parse(data.allowedIpsJson));
            } catch (e) { console.error(e); }
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleSave = () => {
    const payload = {
      ...formData,
      allowedIpsJson: JSON.stringify(allowedIps),
    };

    api.saveSettingsSecurity(payload)
      .then(() => {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      })
      .catch(console.error);
  };

  const addIp = () => {
    if (newIpInput.trim()) {
      setAllowedIps([...allowedIps, newIpInput.trim()]);
      setNewIpInput('');
    }
  };

  const removeIp = (idx: number) => {
    setAllowedIps(allowedIps.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Security</h3>
          <p className="text-xs text-slate-500 font-medium">Manage password policies, authentication rules, session management and security configurations.</p>
        </div>
        <div className="flex items-center gap-2.5">
          <DataImportExportToolbar
            moduleKey="settings-general"
            data={formData ? [formData] : []}
            idField="id"
            onImportSuccess={() => api.getSettingsSecurity().then(setFormData)}
            customCreateApi={api.saveSettingsSecurity}
          />
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 cursor-pointer"
          >
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Security settings saved successfully!
        </div>
      )}

      {/* Top Tabs Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 card-shadow flex items-center gap-6 text-xs font-bold border-b border-slate-100">
        {['Password Policy', 'Two-Factor Auth', 'Sessions', 'Account Lockout', 'IP Restrictions', 'Security Audit'].map((tb) => (
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

      {/* Main Grid: Left Column (1/2) + Right Column (1/2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Card 1: Password Policy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Password Policy</h4>
            <p className="text-[10px] text-slate-400">Set requirements for user passwords to enhance security.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Minimum Password Length</label>
                <input
                  type="number"
                  value={formData.minPasswordLength || 8}
                  onChange={(e) => setFormData({ ...formData, minPasswordLength: parseInt(e.target.value) || 8 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password Expiry (days)</label>
                <input
                  type="number"
                  value={formData.passwordExpiryDays || 90}
                  onChange={(e) => setFormData({ ...formData, passwordExpiryDays: parseInt(e.target.value) || 90 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {[
                { label: 'Require at least one uppercase letter (A-Z)', key: 'requireUppercase' },
                { label: 'Require at least one lowercase letter (a-z)', key: 'requireLowercase' },
                { label: 'Require at least one number (0-9)', key: 'requireNumbers' },
                { label: 'Require at least one special character (!@#$%^&*)', key: 'requireSpecialChars' },
              ].map((chk) => (
                <label key={chk.key} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData[chk.key]}
                    onChange={(e) => setFormData({ ...formData, [chk.key]: e.target.checked })}
                    className="accent-purple-600 rounded"
                  />
                  <span>{chk.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Card 2: Multi-Factor Authentication */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Multi-Factor Authentication (MFA)</h4>
            <p className="text-[10px] text-slate-400">Configure MFA settings to add an extra layer of security.</p>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Enable MFA for</label>
              <select
                value={formData.enableMfaFor || 'All Users'}
                onChange={(e) => setFormData({ ...formData, enableMfaFor: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              >
                <option>All Users</option>
                <option>Admins & Staff Only</option>
                <option>Optional for All</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.mfaAuthenticatorApp}
                  onChange={(e) => setFormData({ ...formData, mfaAuthenticatorApp: e.target.checked })}
                  className="accent-purple-600 rounded"
                />
                <span>Authenticator App (TOTP - Google Authenticator, Authy, etc.)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.mfaSmsVerification}
                  onChange={(e) => setFormData({ ...formData, mfaSmsVerification: e.target.checked })}
                  className="accent-purple-600 rounded"
                />
                <span>SMS Verification Code</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.mfaEmailVerification}
                  onChange={(e) => setFormData({ ...formData, mfaEmailVerification: e.target.checked })}
                  className="accent-purple-600 rounded"
                />
                <span>Email Verification Code</span>
              </label>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Remember MFA on trusted devices for (days)</label>
              <input
                type="number"
                value={formData.rememberMfaDays || 7}
                onChange={(e) => setFormData({ ...formData, rememberMfaDays: parseInt(e.target.value) || 7 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Card 3: Session Management */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Session Management</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Session Timeout (minutes)</label>
                <input
                  type="number"
                  value={formData.sessionTimeoutMinutes || 30}
                  onChange={(e) => setFormData({ ...formData, sessionTimeoutMinutes: parseInt(e.target.value) || 30 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Idle Timeout (minutes)</label>
                <input
                  type="number"
                  value={formData.idleTimeoutMinutes || 15}
                  onChange={(e) => setFormData({ ...formData, idleTimeoutMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.forceLogoutOnPasswordChange}
                  onChange={(e) => setFormData({ ...formData, forceLogoutOnPasswordChange: e.target.checked })}
                  className="accent-purple-600 rounded"
                />
                <span>Force logout from all devices on password change</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={formData.allowMultipleActiveSessions}
                  onChange={(e) => setFormData({ ...formData, allowMultipleActiveSessions: e.target.checked })}
                  className="accent-purple-600 rounded"
                />
                <span>Allow multiple active sessions per user</span>
              </label>
            </div>
          </div>

          {/* Card 4: Account Lockout Policy */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Account Lockout Policy</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lockout Threshold (attempts)</label>
                <input
                  type="number"
                  value={formData.lockoutThreshold || 5}
                  onChange={(e) => setFormData({ ...formData, lockoutThreshold: parseInt(e.target.value) || 5 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.lockoutDurationMinutes || 15}
                  onChange={(e) => setFormData({ ...formData, lockoutDurationMinutes: parseInt(e.target.value) || 15 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Prevent user enumeration during login', key: 'preventUserEnumeration' },
                { label: 'Require email verification for new accounts', key: 'requireEmailVerification' },
                { label: 'Restrict login to registered devices only', key: 'restrictLoginToRegisteredDevices' },
                { label: 'Allow password reset via email', key: 'allowPasswordReset' },
              ].map((chk) => (
                <label key={chk.key} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData[chk.key]}
                    onChange={(e) => setFormData({ ...formData, [chk.key]: e.target.checked })}
                    className="accent-purple-600 rounded"
                  />
                  <span>{chk.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Card 5: IP Restrictions */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-sm text-slate-900">IP Restrictions</h4>
                <p className="text-[10px] text-slate-400">Restrict access to specific IP addresses or subnets.</p>
              </div>
              <button
                onClick={() => setFormData({ ...formData, restrictSpecificIps: !formData.restrictSpecificIps })}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  formData.restrictSpecificIps ? 'bg-purple-600 justify-end' : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="bg-white w-4 h-4 rounded-full shadow"></span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-700 block mb-1">Allowed IP Addresses / CIDR Ranges</label>
              <div className="space-y-1.5">
                {allowedIps.map((ip, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 font-mono font-bold text-slate-800">
                    <span>{ip}</span>
                    <button onClick={() => removeIp(idx)} className="text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                  placeholder="e.g. 192.168.1.1 or 10.0.0.0/16"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none"
                />
                <button onClick={addIp} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold flex items-center gap-1">
                  <Plus className="h-3.5 w-3.5" /> Add IP Address
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Security Status & HTTP Headers */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow space-y-4 text-xs">
        <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">HTTP Security Headers Status</h4>
        <div className="flex flex-wrap gap-3">
          {[
            'X-Frame-Options: DENY',
            'X-Content-Type-Options: nosniff',
            'Strict-Transport-Security: max-age=31536000',
            "Content-Security-Policy: default-src 'self'",
            'Referrer-Policy: strict-origin-when-cross-origin',
            'Permissions-Policy: geolocation=(), camera=()',
          ].map((hdr, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl font-mono text-[11px] font-bold">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> {hdr}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;
