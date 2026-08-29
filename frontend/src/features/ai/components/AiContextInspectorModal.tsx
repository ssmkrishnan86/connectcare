import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Database, Pill, Activity, AlertCircle, FileCheck, CheckSquare, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import type { AiContextPreview } from '../types/ai';

interface AiContextInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
}

export const AiContextInspectorModal: React.FC<AiContextInspectorModalProps> = ({
  isOpen,
  onClose,
  patientId,
}) => {
  const [contextData, setContextData] = useState<AiContextPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Clinical' | 'Vitals' | 'Meds' | 'Raw'>('Clinical');

  useEffect(() => {
    if (isOpen && patientId) {
      loadContext();
    }
  }, [isOpen, patientId]);

  const loadContext = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAiContextPreview(patientId);
      setContextData(data);
    } catch (err) {
      console.error('Failed to load AI context preview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Minimum-Necessary AI Context Inspector
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  HIPAA Boundary Verified
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Transparent view of clinical telemetry provided to ConnectCare AI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-slate-50/30">
          {(['Clinical', 'Vitals', 'Meds', 'Raw'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'Clinical' && 'Patient & Care Context'}
              {tab === 'Vitals' && 'Recent Vitals & Labs'}
              {tab === 'Meds' && 'Active MAR'}
              {tab === 'Raw' && 'JSON Schema Payload'}
            </button>
          ))}
          <button
            onClick={loadContext}
            disabled={isLoading}
            className="ml-auto mb-2 p-1.5 text-xs text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
            title="Refresh Context"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
              <p className="text-xs">Extracting authorized clinical context bundle...</p>
            </div>
          ) : !contextData ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Unable to load patient context bundle.
            </div>
          ) : (
            <>
              {activeTab === 'Clinical' && (
                <div className="space-y-4">
                  {/* Patient Info Banner */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block">Resident</span>
                      <strong className="text-slate-800">{contextData.contextBundle.patientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Record ID</span>
                      <strong className="text-slate-800">{contextData.contextBundle.patientIdCode}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Care Unit</span>
                      <strong className="text-slate-800">{contextData.contextBundle.careUnit}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Room / Bed</span>
                      <strong className="text-slate-800">{contextData.contextBundle.roomBed}</strong>
                    </div>
                  </div>

                  {/* Active Diagnoses & Allergies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-indigo-600" /> Active Diagnoses
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {contextData.contextBundle.activeDiagnoses.map((d, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs bg-indigo-50 text-indigo-700 font-medium"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" /> Documented Allergies
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {contextData.contextBundle.allergies.map((a, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg text-xs bg-amber-50 text-amber-800 font-medium"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Pending Tasks & Active Alerts */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-blue-600" /> Pending Care Tasks
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {contextData.contextBundle.pendingTasks.map((t) => (
                          <div
                            key={t.id}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
                          >
                            <span>{t.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-rose-600" /> Unresolved Alerts
                      </h4>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        {contextData.contextBundle.activeAlerts.map((a) => (
                          <div
                            key={a.id}
                            className="p-2 rounded-lg bg-rose-50/50 border border-rose-100 flex items-center justify-between"
                          >
                            <span className="font-medium text-rose-900">{a.title}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">
                              {a.severity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Vitals' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-600" /> Recent Vitals Telemetry
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Time</th>
                          <th className="p-3">Blood Pressure</th>
                          <th className="p-3">Heart Rate</th>
                          <th className="p-3">Temp</th>
                          <th className="p-3">SpO2</th>
                          <th className="p-3">Pain</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {contextData.contextBundle.recentVitals.map((v, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 font-medium text-slate-900">{v.recordedAt}</td>
                            <td className="p-3">{v.bloodPressure}</td>
                            <td className="p-3">{v.heartRate}</td>
                            <td className="p-3">{v.temperatureF}</td>
                            <td className="p-3">{v.spO2}</td>
                            <td className="p-3">{v.painLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'Meds' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-600" /> Active Prescriptions & MAR Context
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Medication</th>
                          <th className="p-3">Dosage</th>
                          <th className="p-3">Frequency</th>
                          <th className="p-3">Route</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {contextData.contextBundle.activeMedications.map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-900">{m.name}</td>
                            <td className="p-3">{m.dosage}</td>
                            <td className="p-3">{m.frequency}</td>
                            <td className="p-3">{m.route}</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                                {m.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'Raw' && (
                <div className="bg-slate-900 text-slate-200 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-96">
                  <pre>{JSON.stringify(contextData, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 text-[11px]">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>Task-Specific Context Extraction • Encrypted & Ephemeral</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
