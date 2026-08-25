import React, { useEffect, useState } from 'react';
import { X, Settings, Loader2, Key, Globe, Clock, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';

interface IntegrationSettingsModalProps {
  isOpen: boolean;
  integration: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const IntegrationSettingsModal: React.FC<IntegrationSettingsModalProps> = ({
  isOpen,
  integration,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState('');
  const [authType, setAuthType] = useState('OAuth 2.0');
  const [syncInterval, setSyncInterval] = useState('Real-Time');
  const [environment, setEnvironment] = useState('Production');
  const [apiKey, setApiKey] = useState('••••••••••••••••••••••••');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [autoRetry, setAutoRetry] = useState(true);

  useEffect(() => {
    if (integration) {
      setEndpointUrl(integration.endpointUrl || 'https://api.example.com/v1/sync');
      setAuthType(integration.authType || 'OAuth 2.0');
      setSyncInterval(integration.syncInterval || 'Real-Time');
      setEnvironment(integration.environment || 'Production');
      
      try {
        if (integration.settingsJson && integration.settingsJson !== '{}') {
          const parsed = JSON.parse(integration.settingsJson);
          if (parsed.webhookUrl) setWebhookUrl(parsed.webhookUrl);
          if (parsed.autoRetry !== undefined) setAutoRetry(parsed.autoRetry);
        }
      } catch (e) {
        console.error('Error parsing settingsJson', e);
      }
    }
  }, [integration]);

  if (!isOpen || !integration) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const settingsJson = JSON.stringify({
        webhookUrl,
        autoRetry,
        apiKeyConfigured: apiKey !== '••••••••••••••••••••••••',
        lastConfiguredDate: new Date().toISOString()
      });

      await api.updateIntegrationSettings(integration.id, {
        endpointUrl,
        authType,
        syncInterval,
        environment,
        settingsJson,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update integration settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
              <Settings className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Integration Connection Settings</h2>
              <p className="text-[11px] text-slate-400 font-medium">Configure credentials and technical endpoints for {integration.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5 text-slate-400" /> Endpoint / Server URL
            </label>
            <input
              type="text"
              value={endpointUrl}
              onChange={(e) => setEndpointUrl(e.target.value)}
              placeholder="e.g. https://api.health.org/fhir/r4"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Authentication Method
              </label>
              <select
                value={authType}
                onChange={(e) => setAuthType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Authentication Method</option>
                <option value="OAuth 2.0">OAuth 2.0 (Bearer Token)</option>
                <option value="API Key">API Key / Token</option>
                <option value="Basic Auth">Basic Auth (User/Password)</option>
                <option value="Mutual TLS">Mutual TLS (Client Cert)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" /> Sync Frequency
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Sync Frequency</option>
                <option value="Real-Time">Real-Time (Event Driven)</option>
                <option value="15 Minutes">Every 15 Minutes</option>
                <option value="30 Minutes">Every 30 Minutes</option>
                <option value="Hourly">Hourly</option>
                <option value="Daily">Daily Batch</option>
                <option value="Manual">Manual Only</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <Key className="h-3.5 w-3.5 text-slate-400" /> Secret Key / Token
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter client secret or key"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Target Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Target Environment</option>
                <option value="Production">Production (Live)</option>
                <option value="Sandbox">Sandbox / Staging</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Webhook Notification Callback URL (Optional)</label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="e.g. https://connectcare.org/api/webhooks/receiver"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
            />
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={autoRetry}
                onChange={(e) => setAutoRetry(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span>Enable Automatic Retry on Connection Failures</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Settings...</> : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
