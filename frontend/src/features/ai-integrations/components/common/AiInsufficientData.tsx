import React from 'react';
import { HelpCircle, ArrowUpRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AiInsufficientDataProps {
  patientId?: string;
  missingDataDetails?: string;
  recommendedAction?: string;
  patientName?: string;
  className?: string;
}

export const AiInsufficientData: React.FC<AiInsufficientDataProps> = ({
  patientId,
  missingDataDetails = 'Insufficient clinical records (notes, vitals, active medications, or diagnoses) found for this resident.',
  recommendedAction = 'Input authoritative patient data in the clinical chart to enable AI synthesis.',
  patientName = 'this resident',
  className = '',
}) => {
  const navigate = useNavigate();

  return (
    <div className={`p-6 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs space-y-4 font-sans ${className}`}>
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
          <HelpCircle className="w-5 h-5" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-amber-950">Insufficient Data for AI Synthesis</h3>
            <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
              Safety Gated
            </span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-normal">
            ConnectCare AI prohibits fabricating default patient diagnoses or care metrics. {missingDataDetails}
          </p>
          <p className="text-xs text-amber-800 font-semibold pt-0.5">
            {recommendedAction}
          </p>
        </div>
      </div>

      {patientId && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-amber-200/60">
          <button
            onClick={() => navigate(`/patients/${patientId}`)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Open Resident Chart for {patientName}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AiInsufficientData;
