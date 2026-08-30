import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  Loader2
} from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface AiSettingsState {
  primaryModel: string;
  fallbackModel: string;
  monthlyTokenLimit: string;
  maxConcurrentRequests: number;
  autoRetryFailed: boolean;
  enableSafetyGuardrails: boolean;
  activeProvider: string;
}

export const AiSettingsScreen: React.FC = () => {
  const toast = useToast();
  const [activeSubMenu, setActiveSubMenu] = useState<'General' | 'Providers' | 'Models' | 'Safety & Guardrails'>('General');
  const [config, setConfig] = useState<AiSettingsState>({
    primaryModel: 'gpt-4o',
    fallbackModel: 'gpt-4o-mini',
    monthlyTokenLimit: '15M',
    maxConcurrentRequests: 25,
    autoRetryFailed: true,
    enableSafetyGuardrails: true,
    activeProvider: 'OpenAI',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const subMenus = ['General', 'Providers', 'Models', 'Safety & Guardrails'] as const;

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAiSettings();
      const data = res?.data ?? res;
      if (data) {
        setConfig({
          primaryModel: data.primaryModel || 'gpt-4o',
          fallbackModel: data.fallbackModel || 'gpt-4o-mini',
          monthlyTokenLimit: data.monthlyTokenLimit || '15M',
          maxConcurrentRequests: data.maxConcurrentRequests || 25,
          autoRetryFailed: data.autoRetryFailed !== false,
          enableSafetyGuardrails: data.enableSafetyGuardrails !== false,
          activeProvider: data.activeProvider || 'OpenAI',
        });
      }
    } catch (err: any) {
      console.error('Failed to load AI settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof AiSettingsState) => {
    if (typeof config[key] === 'boolean') {
      setConfig((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.saveAiSettings(config);
      toast.success('AI Governance & Infrastructure configuration saved successfully.');
    } catch (err: any) {
      toast.error(`Failed to save AI settings: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
        <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          <span>AI Governance & Pipeline Configuration</span>
        </h1>

        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5" />
          )}
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading configuration from server...</span>
        </div>
      ) : (
        <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[380px]">
          {/* Left Navigation Sub-Menu (3 cols) */}
          <div className="md:col-span-3 space-y-1 border-r border-slate-100 pr-3">
            {subMenus.map((item) => (
              <button
                key={item}
                onClick={() => setActiveSubMenu(item)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                  activeSubMenu === item
                    ? 'bg-indigo-50 text-indigo-700 font-extrabold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Center / Right Configuration Body (9 cols) */}
          <div className="md:col-span-9 space-y-5">
            {activeSubMenu === 'General' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Pipeline Execution & Concurrency
                </h3>

                <div className="space-y-3 text-xs max-w-lg">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900 block">Enforce Clinical Safety Guardrails</span>
                      <span className="text-[11px] text-slate-500">
                        Validates all prompts through minimum PHI filter and regex safety checks.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('enableSafetyGuardrails')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.enableSafetyGuardrails ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.enableSafetyGuardrails ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-bold text-slate-900 block">Auto-Retry Failed Requests</span>
                      <span className="text-[11px] text-slate-500">
                        Automatically fallback to secondary model on timeout or rate limiting.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggle('autoRetryFailed')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        config.autoRetryFailed ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          config.autoRetryFailed ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Max Concurrent AI Requests</label>
                    <input
                      type="number"
                      value={config.maxConcurrentRequests}
                      onChange={(e) => setConfig({ ...config, maxConcurrentRequests: parseInt(e.target.value) || 10 })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Monthly Token Allocation Limit</label>
                    <input
                      type="text"
                      value={config.monthlyTokenLimit}
                      onChange={(e) => setConfig({ ...config, monthlyTokenLimit: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSubMenu === 'Models' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Model Routing Policy
                </h3>

                <div className="space-y-3 text-xs max-w-lg">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Primary Orchestration Model</label>
                    <select
                      value={config.primaryModel}
                      onChange={(e) => setConfig({ ...config, primaryModel: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    >
                      <option value="gpt-4o">OpenAI GPT-4o (Production Default)</option>
                      <option value="claude-3-haiku">Anthropic Claude 3 Haiku</option>
                      <option value="gemini-1.5-pro">Google Gemini 1.5 Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">High-Throughput Fallback Model</label>
                    <select
                      value={config.fallbackModel}
                      onChange={(e) => setConfig({ ...config, fallbackModel: e.target.value })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                    >
                      <option value="gpt-4o-mini">OpenAI GPT-4o Mini (Default Fallback)</option>
                      <option value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSubMenu === 'Providers' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Active AI Infrastructure Provider
                </h3>
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 text-xs space-y-2 max-w-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">Provider: OpenAI Enterprise API</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                      Connected (BAA Signed)
                    </span>
                  </div>
                  <p className="text-slate-600">
                    Zero-retention HIPAA Business Associate Agreement active. Data is never used for foundation model training.
                  </p>
                </div>
              </div>
            )}

            {activeSubMenu === 'Safety & Guardrails' && (
              <div className="space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                  Clinical Safety & PHI Boundaries
                </h3>
                <div className="space-y-2 text-xs max-w-lg">
                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <span className="font-bold text-slate-900 block">Minimum-Necessary Context Filtering</span>
                    <p className="text-slate-600">
                      Restricts PHI payload to only active diagnoses, recent vitals, and current MAR items before API transmission.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                    <span className="font-bold text-slate-900 block">Automated Hallucination & Dosage Check</span>
                    <p className="text-slate-600">
                      Validates all output schema structures and flags unverified clinical assertions before rendering to UI.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AiSettingsScreen;
