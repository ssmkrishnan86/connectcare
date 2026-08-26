import React, { useState, useEffect } from 'react';
import { X, Settings, Save, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [fallbackModel, setFallbackModel] = useState('gpt-4o-mini');
  const [autoRetryFailed, setAutoRetryFailed] = useState(true);
  const [tokenBudgetMonthly, setTokenBudgetMonthly] = useState('15M');
  const [maxConcurrency, setMaxConcurrency] = useState('25');
  const [enableSafetyGuardrails, setEnableSafetyGuardrails] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setSavedSuccess(false);
      api.getAiSettings()
        .then((res: any) => {
          const s = res?.data || res;
          if (s) {
            if (s.primaryModel) setDefaultModel(s.primaryModel);
            if (s.fallbackModel) setFallbackModel(s.fallbackModel);
            if (s.monthlyTokenLimit) setTokenBudgetMonthly(s.monthlyTokenLimit);
            if (s.maxConcurrentRequests) setMaxConcurrency(s.maxConcurrentRequests.toString());
            if (s.autoRetryFailed !== undefined) setAutoRetryFailed(s.autoRetryFailed);
            if (s.enableSafetyGuardrails !== undefined) setEnableSafetyGuardrails(s.enableSafetyGuardrails);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const payload = {
      primaryModel: defaultModel,
      fallbackModel: fallbackModel,
      monthlyTokenLimit: tokenBudgetMonthly,
      maxConcurrentRequests: parseInt(maxConcurrency, 10) || 25,
      autoRetryFailed: autoRetryFailed,
      enableSafetyGuardrails: enableSafetyGuardrails,
    };

    api.saveAiSettings(payload)
      .then(() => {
        setSavedSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
        }, 800);
      })
      .catch((err) => {
        console.error('Failed to save AI settings:', err);
        alert('Failed to save AI settings. Please try again.');
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">AI Operations Settings</h3>
              <p className="text-xs text-slate-500 font-medium">Configure LLM routing, safety guardrails, and token limits</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Primary LLM Model</label>
              <select
                value={defaultModel}
                onChange={(e) => setDefaultModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="">Select Primary Model</option>
                <option value="gpt-4o">GPT-4o (Default High Intelligence)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Fast & Cost Efficient)</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Fallback Model</label>
              <select
                value={fallbackModel}
                onChange={(e) => setFallbackModel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              >
                <option value="">Select Fallback Model</option>
                <option value="gpt-4o-mini">GPT-4o Mini</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3-haiku">Claude 3 Haiku</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Monthly Token Limit</label>
              <input
                type="text"
                value={tokenBudgetMonthly}
                onChange={(e) => setTokenBudgetMonthly(e.target.value)}
                placeholder="15M"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Max Concurrent Requests</label>
              <input
                type="text"
                value={maxConcurrency}
                onChange={(e) => setMaxConcurrency(e.target.value)}
                placeholder="25"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRetryFailed}
                onChange={(e) => setAutoRetryFailed(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-800 font-semibold">Enable automatic retry for failed API requests</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSafetyGuardrails}
                onChange={(e) => setEnableSafetyGuardrails(e.target.checked)}
                className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-slate-800 font-semibold">Enforce HIPAA compliance & clinical safety guardrails</span>
            </label>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {isLoading ? (
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-600" /> Loading configuration...
              </span>
            ) : savedSuccess ? (
              <span className="text-[11px] text-emerald-600 flex items-center gap-1.5 font-bold animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Settings saved successfully!
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Changes take effect immediately across all clinical workflows.</span>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || isLoading}
                className={`flex items-center gap-1.5 px-4 py-2 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer ${
                  savedSuccess
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                    : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : savedSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Configuration</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
