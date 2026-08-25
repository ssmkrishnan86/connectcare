import React, { useState } from 'react';
import { X, Settings, Save } from 'lucide-react';

interface AiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AiSettingsModal: React.FC<AiSettingsModalProps> = ({ isOpen, onClose }) => {
  const [defaultModel, setDefaultModel] = useState('gpt-4o');
  const [fallbackModel, setFallbackModel] = useState('gpt-4o-mini');
  const [autoRetryFailed, setAutoRetryFailed] = useState(true);
  const [tokenBudgetMonthly, setTokenBudgetMonthly] = useState('15M');
  const [maxConcurrency, setMaxConcurrency] = useState('25');
  const [enableSafetyGuardrails, setEnableSafetyGuardrails] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert('AI Operations settings saved successfully!');
      onClose();
    }, 500);
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
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-purple-500/20 transition-colors"
            >
              <Save className="h-4 w-4" /> Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
