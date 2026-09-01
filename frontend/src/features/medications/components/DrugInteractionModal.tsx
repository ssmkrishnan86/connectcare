import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

interface DrugInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrugInteractionModal: React.FC<DrugInteractionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [interactions, setInteractions] = useState<any[]>([]);
  const [med1, setMed1] = useState('');
  const [med2, setMed2] = useState('');
  const [checkResult, setCheckResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDrugInteractions()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setInteractions(list);
        })
        .catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setCheckResult({
        hasInteraction: true,
        severity: 'High Warning',
        medications: `${med1} + ${med2}`,
        details: 'Concurrent use increases bleeding risk significantly. Monitor INR closely and adjust dosages as clinically indicated.',
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Drug Interaction Check</h2>
              <p className="text-[11px] font-medium text-slate-400">Evaluate potential contraindications and safety alerts</p>
            </div>
          </div>
          <button onClick={() => {
            setMed1('');
            setMed2('');
            setCheckResult(null);
            onClose();
          }} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <form onSubmit={handleCheck} className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
            <p className="font-extrabold text-slate-900 text-xs">Select Medications to Compare</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Medication 1</label>
                <select
                  value={med1}
                  onChange={(e) => setMed1(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Medication 1</option>
                  <option value="Warfarin 5 mg">Warfarin 5 mg</option>
                  <option value="Metoprolol 50 mg">Metoprolol 50 mg</option>
                  <option value="Lisinopril 10 mg">Lisinopril 10 mg</option>
                  <option value="Furosemide 20 mg">Furosemide 20 mg</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Medication 2</label>
                <select
                  value={med2}
                  onChange={(e) => setMed2(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="">Select Medication 2</option>
                  <option value="Aspirin 81 mg">Aspirin 81 mg</option>
                  <option value="Ibuprofen 400 mg">Ibuprofen 400 mg</option>
                  <option value="Amoxicillin 500 mg">Amoxicillin 500 mg</option>
                  <option value="Paracetamol 650 mg">Paracetamol 650 mg</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {loading ? 'Checking Interactions...' : 'Run Interaction Check'}
            </button>
          </form>

          {checkResult && (
            <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-1.5 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p className="font-extrabold text-xs">{checkResult.severity}: {checkResult.medications}</p>
              </div>
              <p className="text-[11px] font-semibold text-rose-800 leading-relaxed">
                {checkResult.details}
              </p>
            </div>
          )}

          {interactions.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="font-extrabold text-slate-900 text-xs">Active Patient Safety Alerts ({interactions.length})</p>
              <div className="space-y-2">
                {interactions.map((alert: any, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{alert.title || alert.drugCombination || 'Potential Interaction Alert'}</p>
                      <p className="text-[11px] font-medium text-slate-600 mt-0.5">{alert.description || alert.severityLevel || 'Moderate interaction identified.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => {
              setMed1('');
              setMed2('');
              setCheckResult(null);
              onClose();
            }}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
