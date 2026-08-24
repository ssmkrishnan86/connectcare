import React from 'react';
import { X, Stethoscope, Building2, MapPin, Phone, Mail, Award, Video } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';


interface DoctorViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any | null;
}

export const DoctorViewModal: React.FC<DoctorViewModalProps> = ({
  isOpen,
  onClose,
  doctor,
}) => {
  if (!isOpen || !doctor) return null;

  const getStatusBadge = (statusVal: any) => {
    const s = String(statusVal).toLowerCase();
    if (s === '0' || s === 'active') return <Badge variant="active">Active</Badge>;
    if (s === '1' || s === 'onleave' || s === 'on leave') return <Badge variant="on-leave">On Leave</Badge>;
    return <Badge variant="inactive">Inactive</Badge>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Stethoscope className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Doctor Profile Details</h2>
              <p className="text-[11px] text-slate-400 font-medium">Viewing physician credentials and clinic schedule</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Details Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {doctor.avatar ? (
              <img
                src={doctor.avatar}
                alt={doctor.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm shrink-0">
                {doctor.name ? doctor.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
              </div>
            )}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                {getStatusBadge(doctor.status)}
              </div>
              <p className="text-xs text-slate-500 font-mono">Doctor ID: {doctor.doctorIdCode || doctor.id}</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold text-xs mt-1">
                <span>{doctor.specialtyIcon || '💙'}</span> {doctor.specialty || 'General Medicine'}
              </span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Department</p>
                <p className="font-bold text-slate-800 mt-0.5">{doctor.department || 'Internal Medicine'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Practice Location</p>
                <p className="font-bold text-slate-800 mt-0.5">{doctor.location || 'Main Campus'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Phone Number</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{doctor.phone || '(512) 555-0100'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Email Address</p>
                <p className="font-bold text-blue-600 mt-0.5 truncate max-w-[170px]">{doctor.email || 'doctor@connectcare.com'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Clinical Experience</p>
                <p className="font-bold text-slate-800 mt-0.5">{doctor.experience || '5 Years'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-teal-50 text-teal-600 rounded-lg shrink-0">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Teleconsultation</p>
                <p className={`font-bold mt-0.5 ${doctor.teleconsultationEnabled !== false ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {doctor.teleconsultationEnabled !== false ? 'Available' : 'Disabled'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors cursor-pointer text-xs"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DoctorViewModal;
