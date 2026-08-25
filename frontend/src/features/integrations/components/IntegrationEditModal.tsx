import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Edit2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const integrationSchema = z.object({
  name: z.string().min(2, 'Integration Name is required'),
  systemApplication: z.string().min(1, 'System Application is required'),
  category: z.string().min(1, 'Category is required'),
  connectionType: z.string().min(1, 'Connection Type is required'),
  description: z.string().min(3, 'Description is required'),
  status: z.enum(['Active', 'Inactive', 'Failed']),
});

type IntegrationFormData = z.infer<typeof integrationSchema>;

interface IntegrationEditModalProps {
  isOpen: boolean;
  integration: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const IntegrationEditModal: React.FC<IntegrationEditModalProps> = ({
  isOpen,
  integration,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationSchema),
  });

  useEffect(() => {
    if (integration) {
      reset({
        name: integration.name || '',
        systemApplication: integration.systemApplication || 'Epic EHR',
        category: integration.category || 'EHR',
        connectionType: integration.connectionType || 'REST API (OAuth 2.0)',
        description: integration.description || '',
        status: (integration.status as any) || 'Active',
      });
    }
  }, [integration, reset]);

  if (!isOpen || !integration) return null;

  const onSubmit = async (data: IntegrationFormData) => {
    setIsSubmitting(true);
    try {
      await api.updateIntegration(integration.id, {
        ...integration,
        name: data.name,
        systemApplication: data.systemApplication,
        category: data.category,
        connectionType: data.connectionType,
        description: data.description,
        status: data.status,
      });
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update integration:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Edit2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Edit Integration</h2>
              <p className="text-[11px] text-slate-400 font-medium">Update integration details & status for {integration.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Integration Name <span className="text-rose-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Document Storage Integration"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">System / Application <span className="text-rose-500">*</span></label>
              <input
                {...register('systemApplication')}
                placeholder="e.g. AWS S3 / Azure Blob"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.systemApplication && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.systemApplication.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category <span className="text-rose-500">*</span></label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Category</option>
                <option value="EHR">EHR</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="Insurance">Insurance</option>
                <option value="Communication">Communication</option>
                <option value="Telehealth">Telehealth</option>
                <option value="Storage">Storage</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Connection Type <span className="text-rose-500">*</span></label>
              <select
                {...register('connectionType')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="">Select Connection Type</option>
                <option value="REST API (OAuth 2.0)">REST API (OAuth 2.0)</option>
                <option value="HL7 v2 / FHIR Interface">HL7 v2 / FHIR Interface</option>
                <option value="SFTP / Direct File Import">SFTP / Direct File Import</option>
                <option value="Database Replication Sync">Database Replication Sync</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Description <span className="text-rose-500">*</span></label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Describe the data exchange, protocol, and scope..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-slate-50/50 resize-none"
            />
            {errors.description && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Status</label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none font-semibold text-slate-900 bg-white"
            >
              <option value="">Select Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving Changes...</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
