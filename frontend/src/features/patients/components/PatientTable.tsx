import React from 'react';
import { Eye, Edit2, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { formatDateMMDDYYYY } from '../../../lib/utils';
import { useAuth } from '@/features/auth/context/AuthContext';

interface PatientTableProps {
  patients: any[];
}

export const PatientTable: React.FC<PatientTableProps> = ({ patients }) => {
  const { user } = useAuth();
  const isNurse = user?.role?.toLowerCase() === 'nurse';
  const formatStatus = (statusVal: any): { label: string; variant: any } => {
    if (statusVal === 0 || statusVal === 'InCare' || statusVal === 'In Care') {
      return { label: 'In Care', variant: 'in-care' };
    }
    if (statusVal === 1 || statusVal === 'Admitted') {
      return { label: 'Admitted', variant: 'admitted' };
    }
    if (statusVal === 2 || statusVal === 'Discharged') {
      return { label: 'Discharged', variant: 'discharged' };
    }
    return { label: 'Inactive', variant: 'inactive' };
  };

  const formatRisk = (riskVal: any): { label: string; variant: any } => {
    if (riskVal === 0 || riskVal === 'Critical' || riskVal === 'critical') {
      return { label: 'Critical', variant: 'critical' };
    }
    if (riskVal === 1 || riskVal === 'High' || riskVal === 'high') {
      return { label: 'High', variant: 'high' };
    }
    if (riskVal === 2 || riskVal === 'Medium' || riskVal === 'medium') {
      return { label: 'Medium', variant: 'medium' };
    }
    return { label: 'Low', variant: 'low' };
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3 w-8">
                <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th className="p-3">Patient ID</th>
              <th className="p-3">Patient Name</th>
              <th className="p-3">Age / Gender</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Care Unit</th>
              <th className="p-3">Primary Doctor</th>
              <th className="p-3">Status</th>
              <th className="p-3">Risk Level</th>
              <th className="p-3">Last Visit</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => {
              const displayId = patient.patientIdCode || patient.id;
              const isDocAssigned = Boolean(
                (patient.primaryDoctorName && patient.primaryDoctorName.trim() && !['unassigned', 'not assigned', 'undefined', 'n/a'].includes(patient.primaryDoctorName.trim().toLowerCase())) ||
                (patient.primaryDoctor?.name && patient.primaryDoctor.name.trim() && !['unassigned', 'not assigned', 'undefined', 'n/a'].includes(patient.primaryDoctor.name.trim().toLowerCase()))
              );
              const docName = isDocAssigned ? (patient.primaryDoctorName || patient.primaryDoctor?.name) : 'Not Assigned';

              const statusObj = formatStatus(patient.status);
              const riskObj = formatRisk(patient.riskLevel);

              return (
                <tr key={patient.id || patient.patientIdCode} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{displayId}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {patient.avatar ? (
                        <img src={patient.avatar.startsWith('http') || patient.avatar.startsWith('data:') || patient.avatar.startsWith('/') ? patient.avatar : `/${patient.avatar}`} alt={patient.name} className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 border border-indigo-200">
                          {patient.name ? patient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                        </div>
                      )}
                      <div>
                        <Link to={`/patients/${displayId}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {patient.name}
                        </Link>
                        <p className="text-[10px] text-slate-400">{patient.dob ? formatDateMMDDYYYY(patient.dob) : 'Not specified'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-slate-700">{patient.ageGender || patient.gender || 'Not specified'}</td>
                  <td className="p-3 font-mono text-slate-600">{patient.phone || 'N/A'}</td>
                  <td className="p-3">
                    <p className="font-semibold text-slate-800">{patient.careUnit || 'General Ward'}</p>
                    <p className="text-[10px] text-slate-400">{patient.floorRoom || 'Room Unassigned'}</p>
                  </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {isDocAssigned && (patient.primaryDoctorAvatar || patient.primaryDoctor?.avatar) ? (
                          <img
                            src={patient.primaryDoctorAvatar || patient.primaryDoctor?.avatar}
                            alt={docName}
                            className="h-6 w-6 rounded-full object-cover shrink-0"
                          />
                        ) : isDocAssigned ? (
                          <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                            {docName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200">
                            N/A
                          </div>
                        )}
                        <span className={`font-medium ${isDocAssigned ? 'text-slate-800' : 'text-slate-400 italic'}`}>{docName}</span>
                      </div>
                    </td>
                  <td className="p-3">
                    <Badge variant={statusObj.variant}>
                      {statusObj.label}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={riskObj.variant}>
                      {riskObj.label}
                    </Badge>
                  </td>
                  <td className="p-3 text-[11px] text-slate-500 font-medium">{patient.lastVisit ? formatDateMMDDYYYY(patient.lastVisit) : 'Just now'} </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={`/patients/${displayId}`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      {!isNurse && (
                        <Link
                          to={`/patients/edit/${displayId}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit Patient"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>
                      )}
                      <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
