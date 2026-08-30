import React from 'react';
import { Maximize2 } from 'lucide-react';
import { AiPatientSummaryScreen } from './AiPatientSummaryScreen';
import { AiCareTeamIntelligenceScreen } from './AiCareTeamIntelligenceScreen';
import { AiDischargeReviewScreen } from './AiDischargeReviewScreen';
import { AiAlertPrioritizationScreen } from './AiAlertPrioritizationScreen';
import { AiMedicationReviewScreen } from './AiMedicationReviewScreen';
import { AiDoctorCopilotScreen } from './AiDoctorCopilotScreen';
import { AiNurseCopilotScreen } from './AiNurseCopilotScreen';
import { AiTaskManagerScreen } from './AiTaskManagerScreen';
import { AiOperationsDashboardScreen } from './AiOperationsDashboardScreen';
import { AiSettingsScreen } from './AiSettingsScreen';
import { AiAuditLogsScreen } from './AiAuditLogsScreen';
import { AiFeedbackReviewScreen } from './AiFeedbackReviewScreen';
import { AiEvaluationScreen } from './AiEvaluationScreen';

interface AiAllScreensGalleryProps {
  patientId?: string;
  patientData?: any;
  onSelectScreen?: (screenIndex: number) => void;
}

export const AiAllScreensGallery: React.FC<AiAllScreensGalleryProps> = ({
  patientId,
  patientData,
  onSelectScreen,
}) => {
  const screens = [
    {
      id: 1,
      title: '1. AI PATIENT SUMMARY',
      component: <AiPatientSummaryScreen patientId={patientId} patientData={patientData} />
    },
    {
      id: 2,
      title: '2. AI CARE TEAM INTELLIGENCE',
      component: <AiCareTeamIntelligenceScreen patientId={patientId} patientData={patientData} />
    },
    {
      id: 3,
      title: '3. AI DISCHARGE REVIEW',
      component: <AiDischargeReviewScreen patientId={patientId} patientData={patientData} />
    },
    {
      id: 4,
      title: '4. AI ALERT PRIORITIZATION',
      component: <AiAlertPrioritizationScreen patientId={patientId} patientData={patientData} />
    },
    {
      id: 5,
      title: '5. AI MEDICATION REVIEW',
      component: <AiMedicationReviewScreen patientId={patientId} patientData={patientData} />
    },
    {
      id: 6,
      title: '6. DOCTOR COPILOT',
      component: <AiDoctorCopilotScreen patientId={patientId} patientName={patientData?.name} />
    },
    {
      id: 7,
      title: '7. NURSE COPILOT',
      component: <AiNurseCopilotScreen patientId={patientId} patientName={patientData?.name} />
    },
    {
      id: 8,
      title: '8. CARE TEAM TASK MANAGEMENT (AI-DRIVEN)',
      component: <AiTaskManagerScreen patientId={patientId} patientName={patientData?.name} />
    },
    {
      id: 9,
      title: '9. AI OPERATIONS DASHBOARD',
      component: <AiOperationsDashboardScreen />
    },
    {
      id: 10,
      title: '10. AI SETTINGS & CONFIGURATION',
      component: <AiSettingsScreen />
    },
    {
      id: 11,
      title: '11. AI AUDIT LOGS',
      component: <AiAuditLogsScreen />
    },
    {
      id: 12,
      title: '12. AI FEEDBACK & HUMAN REVIEW',
      component: <AiFeedbackReviewScreen />
    },
    {
      id: 13,
      title: '13. AI EVALUATION & QUALITY BENCHMARK',
      component: <AiEvaluationScreen />
    },
  ];

  return (
    <div className="space-y-6">
      {/* 4-column Grid layout matching master design image */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {screens.map((item) => (
          <div
            key={item.id}
            className="flex flex-col space-y-2 group"
          >
            {/* Header label with zoom button */}
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                <span>{item.title}</span>
              </h2>
              {onSelectScreen && (
                <button
                  onClick={() => onSelectScreen(item.id)}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 opacity-80 hover:opacity-100 transition cursor-pointer"
                  title="Expand to Full Screen View"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Expand</span>
                </button>
              )}
            </div>

            {/* Screen Container */}
            <div className="flex-1 transition-transform duration-200">
              {item.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AiAllScreensGallery;
