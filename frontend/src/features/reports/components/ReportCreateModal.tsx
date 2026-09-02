import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, FileSpreadsheet, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const reportSchema = z.object({
  reportName: z.string().min(2, 'Report Name is required').max(100, 'Max 100 characters'),
  description: z.string().min(3, 'Description is required').max(1000, 'Max 1000 characters'),
  category: z.string().min(1, 'Category is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  status: z.string().min(1, 'Status is required'),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportCreateModal: React.FC<ReportCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      category: '',
      frequency: '',
      status: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    try {
      await api.createCustomReport({
        reportName: data.reportName,
        description: data.description,
        category: data.category,
        frequency: data.frequency,
        status: data.status as 'Active' | 'Draft' | 'Archived',
        lastModifiedText: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        createdBy: 'John Admin',
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create custom report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Create New Report</h2>
              <p className="text-[11px] text-slate-400 font-medium">Build a custom clinical or operational analytics report</p>
            </div>
          </div>
          <button onClick={() => {
            reset();
            onClose();
          }} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center justify-between">
            <span>Please complete all required fields correctly before proceeding.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Report Name <span className="text-rose-500">*</span></label>
            <input
              {...register('reportName')}
              maxLength={100}
              placeholder="e.g. Monthly Resident Vitals & Medication Compliance Summary"
              className={`w-full px-3 py-2 border ${errors.reportName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
            />
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 100</p>
            {errors.reportName && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.reportName.message}</p>}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              maxLength={1000}
              rows={3}
              placeholder="Describe the purpose, data sources, and metrics included in this report..."
              className={`w-full px-3 py-2 border ${errors.description ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50 resize-none`}
            />
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Max length: 1000</p>
            {errors.description && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category <span className="text-rose-500">*</span></label>
              <select
                {...register('category')}
                className={`w-full px-3 py-2 border ${errors.category ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50`}
              >
                <option value="">Select Category</option>
                <option value="Clinical">Clinical</option>
                <option value="Operations">Operations</option>
                <option value="Financial">Financial</option>
                <option value="Staffing">Staffing</option>
                <option value="Compliance">Compliance</option>
              </select>
              {errors.category && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Frequency</label>
              <select
                {...register('frequency')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Frequency</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="On-Demand">On-Demand</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                onClose();
              }}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
