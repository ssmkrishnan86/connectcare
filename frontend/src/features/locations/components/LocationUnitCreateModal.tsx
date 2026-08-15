import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Building2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const locationSchema = z.object({
  name: z.string().min(2, 'Unit Name is required'),
  code: z.string().min(1, 'Code is required'),
  type: z.string().min(1, 'Type is required'),
  floor: z.string().min(1, 'Floor & Room is required'),
  beds: z.number().min(1, 'Beds capacity must be at least 1'),
  facility: z.string().min(1, 'Facility name is required'),
  status: z.enum(['Active', 'Maintenance', 'Inactive']),
  attentionPriority: z.string().min(1, 'Priority is required'),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationUnitCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const LocationUnitCreateModal: React.FC<LocationUnitCreateModalProps> = ({
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
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      code: `LOC-00${Math.floor(Math.random() * 90) + 10}`,
      type: 'Wing',
      beds: 30,
      facility: 'Connected Care Hospital',
      status: 'Active',
      attentionPriority: 'Medium',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: LocationFormData) => {
    setIsSubmitting(true);
    try {
      await api.createLocation({
        name: data.name,
        code: data.code,
        type: data.type,
        floor: data.floor,
        beds: data.beds,
        capacity: `${data.beds} Beds`,
        occupied: `0 Beds`,
        occupancyRate: `0%`,
        facility: data.facility,
        facilityLocation: 'Chennai, Tamil Nadu',
        status: data.status,
        attentionPriority: data.attentionPriority,
        unitsCount: 1,
      });
      reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to create location:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Add Location / Unit</h2>
              <p className="text-[11px] text-slate-400 font-medium">Create a new care unit or facility location</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit Name <span className="text-rose-500">*</span></label>
              <input
                {...register('name')}
                placeholder="e.g. Oncology Unit"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.name && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit Code <span className="text-rose-500">*</span></label>
              <input
                {...register('code')}
                placeholder="e.g. LOC-009"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.code && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.code.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit Type <span className="text-rose-500">*</span></label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              >
                <option value="Wing">Wing</option>
                <option value="Specialty Center">Specialty Center</option>
                <option value="Emergency">Emergency</option>
                <option value="ICU">ICU</option>
                <option value="Clinic">Clinic</option>
                <option value="Hospital">Hospital</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Floor & Room <span className="text-rose-500">*</span></label>
              <input
                {...register('floor')}
                placeholder="e.g. 5th Floor - 501"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.floor && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.floor.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Total Bed Capacity <span className="text-rose-500">*</span></label>
              <input
                type="number"
                {...register('beds', { valueAsNumber: true })}
                placeholder="e.g. 30"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
              {errors.beds && <p className="text-rose-500 text-[10px] font-semibold mt-1">{errors.beds.message}</p>}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Facility Name <span className="text-rose-500">*</span></label>
              <input
                {...register('facility')}
                placeholder="e.g. Connected Care Hospital"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-slate-50/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Attention Priority</label>
              <select
                {...register('attentionPriority')}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
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
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Save Location'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
