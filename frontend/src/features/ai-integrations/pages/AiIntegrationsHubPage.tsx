import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Info,
  LayoutGrid,
  Users,
  AlertTriangle,
  ArrowLeft,
  Award
} from 'lucide-react';
import { api } from '@/lib/api';
import { AiAllScreensGallery } from '../components/AiAllScreensGallery';
import { AiPatientSummaryScreen } from '../components/AiPatientSummaryScreen';
import { AiCareTeamIntelligenceScreen } from '../components/AiCareTeamIntelligenceScreen';
import { AiDischargeReviewScreen } from '../components/AiDischargeReviewScreen';
import { AiAlertPrioritizationScreen } from '../components/AiAlertPrioritizationScreen';
import { AiMedicationReviewScreen } from '../components/AiMedicationReviewScreen';
import { AiDoctorCopilotScreen } from '../components/AiDoctorCopilotScreen';
import { AiNurseCopilotScreen } from '../components/AiNurseCopilotScreen';
import { AiTaskManagerScreen } from '../components/AiTaskManagerScreen';
import { AiOperationsDashboardScreen } from '../components/AiOperationsDashboardScreen';
import { AiSettingsScreen } from '../components/AiSettingsScreen';
import { AiAuditLogsScreen } from '../components/AiAuditLogsScreen';
import { AiFeedbackReviewScreen } from '../components/AiFeedbackReviewScreen';
import { AiEvaluationScreen } from '../components/AiEvaluationScreen';

export const AiIntegrationsHubPage: React.FC = () => {
  const [selectedScreenId, setSelectedScreenId] = useState<number>(0); // 0 = All Pages (Grid)
  const [patients, setPatients] = useState<any[]>([]);
  const [activePatient, setActivePatient] = useState<any>(null);

  useEffect(() => {
    api.getPatients()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : res?.data || [];
        if (list.length > 0) {
          setPatients(list);
          setActivePatient(list[0]);
        }
      })
      .catch((err) => {
        console.error('Failed to load patients for AI hub:', err);
      });
  }, []);

  const handleSelectPatient = (patientObj: any) => {
    setActivePatient(patientObj);
  };

  const navTabs = [
    { id: 0, label: 'All Pages (Screen Designs)' },
    { id: 1, label: '1. Patient Summary' },
    { id: 2, label: '2. Care Intelligence' },
    { id: 3, label: '3. Discharge Review' },
    { id: 4, label: '4. Alert Prioritization' },
    { id: 5, label: '5. Medication Review' },
    { id: 6, label: '6. Doctor Copilot' },
    { id: 7, label: '7. Nurse Copilot' },
    { id: 8, label: '8. Task Management' },
    { id: 9, label: '9. AI Operations' },
    { id: 10, label: '10. AI Settings' },
    { id: 11, label: '11. Audit Logs' },
    { id: 12, label: '12. Human Review' },
    { id: 13, label: '13. Evaluation & Quality' },
  ];

  return (
    <div className="space-y-6 max-w-[1720px] mx-auto font-sans pb-16">
      {/* Top Main Dark Banner matching screenshot header */}
      <div className="bg-[#0B132B] text-white p-4 sm:px-6 sm:py-4 rounded-2xl shadow-md border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold tracking-tight flex items-center gap-2">
              <span>ConnectCare AI</span>
              <span className="text-slate-400 font-normal text-xs hidden md:inline">|</span>
              <span className="text-xs sm:text-sm font-bold text-slate-200">
                AI INTEGRATIONS & CLINICAL COPILOT SUITE
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Patient Quick Picker */}
          {patients.length > 0 && activePatient && (
            <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={activePatient.id}
                onChange={(e) => {
                  const p = patients.find((pt) => pt.id === e.target.value);
                  if (p) handleSelectPatient(p);
                }}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer text-xs"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.patientIdCode || p.mrn || 'PT'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Clinician Profile */}
          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center border border-indigo-400/40">
              CC
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">Clinical Provider</p>
              <p className="text-[10px] text-slate-400 font-medium leading-tight">Care Team Intelligence</p>
            </div>
          </div>
        </div>
      </div>

      {/* Screen Selector Tabs Bar */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-1.5 overflow-x-auto">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedScreenId(tab.id)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedScreenId === tab.id
                ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
            }`}
          >
            {tab.id === 0 && <LayoutGrid className="w-3.5 h-3.5 shrink-0" />}
            {tab.id === 13 && <Award className="w-3.5 h-3.5 shrink-0" />}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main View Display */}
      {selectedScreenId === 0 ? (
        <AiAllScreensGallery
          patientId={activePatient?.id}
          patientData={activePatient}
          onSelectScreen={(screenId) => setSelectedScreenId(screenId)}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => setSelectedScreenId(0)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Pages Overview</span>
            </button>
            <span className="text-xs font-semibold text-slate-500">
              Viewing Screen {selectedScreenId} of 13
            </span>
          </div>

          <div className="max-w-5xl mx-auto">
            {selectedScreenId === 1 && (
              <AiPatientSummaryScreen
                patientId={activePatient?.id}
                patientData={activePatient}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 2 && (
              <AiCareTeamIntelligenceScreen
                patientId={activePatient?.id}
                patientData={activePatient}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 3 && (
              <AiDischargeReviewScreen
                patientId={activePatient?.id}
                patientData={activePatient}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 4 && (
              <AiAlertPrioritizationScreen
                patientId={activePatient?.id}
                patientData={activePatient}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 5 && (
              <AiMedicationReviewScreen
                patientId={activePatient?.id}
                patientData={activePatient}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 6 && (
              <AiDoctorCopilotScreen
                patientId={activePatient?.id}
                patientName={activePatient?.name}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 7 && (
              <AiNurseCopilotScreen
                patientId={activePatient?.id}
                patientName={activePatient?.name}
                onBack={() => setSelectedScreenId(0)}
              />
            )}
            {selectedScreenId === 8 && (
              <AiTaskManagerScreen
                patientId={activePatient?.id}
                patientName={activePatient?.name}
              />
            )}
            {selectedScreenId === 9 && (
              <AiOperationsDashboardScreen />
            )}
            {selectedScreenId === 10 && (
              <AiSettingsScreen />
            )}
            {selectedScreenId === 11 && (
              <AiAuditLogsScreen />
            )}
            {selectedScreenId === 12 && (
              <AiFeedbackReviewScreen />
            )}
            {selectedScreenId === 13 && (
              <AiEvaluationScreen />
            )}
          </div>
        </div>
      )}

      {/* Global Bottom Banner & Priority Legend matching screenshot */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-medium">
        <div className="flex items-center gap-2 text-slate-600">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            All AI-generated content must be reviewed and validated by qualified healthcare professionals before clinical use.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-slate-700 font-semibold">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> AI Generated
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Human Review Required
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> High Priority
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium Priority
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Low Priority
          </span>
        </div>
      </div>
    </div>
  );
};

export default AiIntegrationsHubPage;
