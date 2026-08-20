import React, { useState, useEffect } from 'react';
import { X, Package, Calendar, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

interface MedicationInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MedicationInventoryModal: React.FC<MedicationInventoryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api.getExpiringMedications()
        .then((res: any) => {
          const list = Array.isArray(res) ? res : res?.data || [];
          setItems(list);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans select-none">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Medication Inventory</h2>
              <p className="text-[11px] font-medium text-slate-400">Stock levels and expiring batch details</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="bg-purple-50 p-3 rounded-xl border border-purple-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-purple-600 shrink-0" />
            <div>
              <p className="font-extrabold text-purple-900 text-xs">Inventory Expiry Warning</p>
              <p className="text-[11px] font-semibold text-purple-700 mt-0.5">
                The following medication batches are expiring soon. Please reorder stock.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 font-semibold">Loading inventory details...</div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Medication</th>
                    <th className="p-3">Batch Number</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-extrabold text-slate-900">{item.name}</td>
                      <td className="p-3 font-mono text-slate-500">{item.batch}</td>
                      <td className="p-3 flex items-center gap-1.5 text-slate-700">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        {item.expiryDate}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                          {item.daysLeft}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
