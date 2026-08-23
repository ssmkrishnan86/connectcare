import React from 'react';
import { X, UserCheck, Building2, MapPin, Phone, Mail, Clock, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface CareTeamMemberViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: any | null;
}

export const CareTeamMemberViewModal: React.FC<CareTeamMemberViewModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  if (!isOpen || !member) return null;

  const formatRole = (roleVal: any): { label: string; variant: 'doctor' | 'nurse' | 'allied' | 'support' } => {
    if (roleVal === 0 || roleVal === 'Doctor' || roleVal === 'doctor') {
      return { label: 'Doctor', variant: 'doctor' };
    }
    if (roleVal === 1 || roleVal === 'Nurse' || roleVal === 'nurse') {
      return { label: 'Nurse', variant: 'nurse' };
    }
    if (roleVal === 2 || roleVal === 'AlliedHealth' || roleVal === 'Allied Health' || roleVal === 'alliedhealth') {
      return { label: 'Allied Health', variant: 'allied' };
    }
    return { label: 'Support Staff', variant: 'support' };
  };

  const formatStatus = (statusVal: any): { label: string; variant: 'active' | 'on-leave' | 'inactive' } => {
    if (statusVal === 0 || statusVal === 'Active' || statusVal === 'active') {
      return { label: 'Active', variant: 'active' };
    }
    if (statusVal === 1 || statusVal === 'OnLeave' || statusVal === 'On Leave' || statusVal === 'onleave') {
      return { label: 'On Leave', variant: 'on-leave' };
    }
    return { label: 'Inactive', variant: 'inactive' };
  };

  const roleObj = formatRole(member.role);
  const statusObj = formatStatus(member.status);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <UserCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Care Team Member Details</h2>
              <p className="text-[11px] text-slate-400 font-medium">Viewing practitioner profile information</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Profile Header */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm shrink-0">
                {member.name ? member.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CT'}
              </div>
            )}
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h3 className="text-lg font-bold text-slate-900">{member.name}</h3>
                <Badge variant={roleObj.variant}>{roleObj.label}</Badge>
                <Badge variant={statusObj.variant}>{statusObj.label}</Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono">Member ID: {member.memberIdCode || member.id}</p>
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
                <p className="font-bold text-slate-800 mt-0.5">{member.department || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Assigned Location</p>
                <p className="font-bold text-slate-800 mt-0.5">{member.location || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Phone Number</p>
                <p className="font-mono font-bold text-slate-800 mt-0.5">{member.phone || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Email Address</p>
                <p className="font-medium text-slate-800 mt-0.5 truncate max-w-[200px]">{member.email || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg shrink-0">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">Shift / Schedule</p>
                <p className="font-bold text-slate-800 mt-0.5">{member.shift || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-start gap-3">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-medium">System Status</p>
                <p className="font-bold text-slate-800 mt-0.5">{statusObj.label}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
