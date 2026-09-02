import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import {
  Search,
  Calendar as CalendarIcon,
  Filter,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Upload,
  ChevronUp,
  X,
  Check
} from 'lucide-react';

export const DocumentationsPage: React.FC = () => {
  const { user } = useAuth();
  const [documentations, setDocumentations] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All Documents');

  // Filter States
  const [search, setSearch] = useState('');
  const [careUnitFilter, setCareUnitFilter] = useState('All');
  const [patientFilter, setPatientFilter] = useState('All');
  const [docTypeFilter, setDocTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected Patient for Sidebar
  const [selectedPatient, setSelectedPatient] = useState<any>({
    name: 'Patricia Smith',
    idCode: 'PT-10001',
    ageGender: '68 Y • Female • A+',
    roomLocation: 'Room 302',
    careUnit: 'Cardiology Unit',
    patientType: 'Inpatient',
    avatar: '',
    attendingDoctor: 'Dr. Sarah Wilson',
    careTeamMembers: '3 Members',
    los: '4 Days'
  });

  // Modal for New Documentation
  const initialNewDocForm = {
    documentName: '',
    patientName: '',
    patientIdCode: '',
    roomLocation: '',
    careUnit: '',
    documentType: 'Care Note',
    status: 'Completed',
    notesContent: ''
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDocForm, setNewDocForm] = useState(initialNewDocForm);

  // Upload Document Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadDocForm, setUploadDocForm] = useState({
    documentName: '',
    patientName: '',
    documentType: 'Report',
    status: 'Completed',
    notesContent: ''
  });

  // View & Edit Modal States (Bug 22)
  const [viewDoc, setViewDoc] = useState<any | null>(null);
  const [editDoc, setEditDoc] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docsRes, statsRes, patientsRes] = await Promise.all([
        api.getNurseDocumentations(search, docTypeFilter, statusFilter, careUnitFilter),
        api.getNurseDocumentationStats(),
        api.getPatients().catch(() => [])
      ]);
      const list = Array.isArray(docsRes) ? docsRes : (docsRes as any)?.data || [];
      const ptList = Array.isArray(patientsRes) ? patientsRes : (patientsRes as any)?.data || [];
      setDocumentations(list);
      setStats((statsRes as any)?.data || statsRes);
      if (ptList.length > 0) {
        setPatients(ptList);
      }
    } catch (err) {
      console.error('Failed to fetch documentation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, docTypeFilter, statusFilter, careUnitFilter]);

  const handleCreateDoc = async () => {
    try {
      const matchedPt = patients.find(p => p.name === newDocForm.patientName);
      await api.createNurseDocumentation({
        ...newDocForm,
        patientIdCode: matchedPt?.patientIdCode || matchedPt?.mrn || newDocForm.patientIdCode || 'PT-10001',
        roomLocation: matchedPt?.floorRoom || matchedPt?.roomNumber || newDocForm.roomLocation || 'Room 302',
        careUnit: matchedPt?.careUnit || matchedPt?.department || newDocForm.careUnit || 'Cardiology Unit',
        patientAvatar: matchedPt?.avatar || selectedPatient.avatar,
        ageGender: matchedPt?.ageGender || selectedPatient.ageGender,
        bloodGroup: matchedPt?.bloodType || 'A+',
        patientType: matchedPt?.status === 'Admitted' || matchedPt?.status === 'InCare' ? 'Inpatient' : 'Outpatient',
        createdByName: user?.fullName || (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Emma Johnson'),
        createdByRole: user?.role === 'Nurse' ? 'Staff Nurse' : (user?.role || 'Staff Nurse')
      });
      setNewDocForm(initialNewDocForm);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to create documentation:', err);
    }
  };

  const handleUploadDoc = async () => {
    try {
      const matchedPt = patients.find(p => p.name === uploadDocForm.patientName);
      await api.createNurseDocumentation({
        documentName: uploadDocForm.documentName || (uploadedFileName ? uploadedFileName.replace(/\.[^/.]+$/, "") : 'Uploaded Clinical Document'),
        documentType: uploadDocForm.documentType || 'Report',
        patientName: uploadDocForm.patientName || selectedPatient.name,
        patientIdCode: matchedPt?.patientIdCode || matchedPt?.mrn || selectedPatient.idCode || 'PT-10001',
        roomLocation: matchedPt?.floorRoom || matchedPt?.roomNumber || selectedPatient.roomLocation || 'Room 302',
        careUnit: matchedPt?.careUnit || matchedPt?.department || selectedPatient.careUnit || 'Cardiology Unit',
        status: uploadDocForm.status || 'Completed',
        notesContent: uploadDocForm.notesContent || (uploadedFileName ? `Attached File: ${uploadedFileName}` : 'Uploaded clinical record attachment.'),
        patientAvatar: matchedPt?.avatar || selectedPatient.avatar,
        ageGender: matchedPt?.ageGender || selectedPatient.ageGender,
        bloodGroup: matchedPt?.bloodType || 'A+',
        patientType: matchedPt?.status === 'Admitted' || matchedPt?.status === 'InCare' ? 'Inpatient' : 'Outpatient',
        createdByName: user?.fullName || (user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : 'Emma Johnson'),
        createdByRole: user?.role === 'Nurse' ? 'Staff Nurse' : (user?.role || 'Staff Nurse')
      });
      setUploadDocForm({
        documentName: '',
        patientName: '',
        documentType: 'Report',
        status: 'Completed',
        notesContent: ''
      });
      setUploadedFileName('');
      setIsUploadModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Failed to upload documentation:', err);
    }
  };

  const handleUpdateDoc = async () => {
    if (!editDoc) return;
    setIsSavingEdit(true);
    try {
      if (editDoc.id) {
        await api.updateNurseDocumentation(editDoc.id, editDoc);
      }
      setEditDoc(null);
      fetchData();
    } catch (err) {
      console.error('Failed to update documentation:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  const getDocTypePill = (type: string) => {
    if (type === 'Care Note') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">Care Note</span>;
    }
    if (type === 'Assessment') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-blue-50 text-blue-600 border border-blue-200">Assessment</span>;
    }
    if (type === 'Medication') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">Medication</span>;
    }
    if (type === 'Education') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-teal-50 text-teal-600 border border-teal-200">Education</span>;
    }
    if (type === 'Report') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200">Report</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">{type}</span>;
  };

  const getStatusPill = (status: string) => {
    if (status === 'Completed') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-emerald-50 text-emerald-600 border border-emerald-200">Completed</span>;
    }
    if (status === 'Pending') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-amber-50 text-amber-600 border border-amber-200">Pending</span>;
    }
    if (status === 'Needs Review') {
      return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-rose-50 text-rose-600 border border-rose-200">Needs Review</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-md text-[11px] font-extrabold bg-slate-100 text-slate-500 border border-slate-200">Draft</span>;
  };

  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* Page Header */}
      <PageHeader
        title="Documentations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Documentations' },
        ]}
        actions={
          <DataImportExportToolbar
            moduleKey="documentations"
            data={documentations}
            idField="id"
            onImportSuccess={fetchData}
            customCreateApi={api.createNurseDocumentation}
          />
        }
      />

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 overflow-x-auto">
        {["All Documents", "My Documents", "Care Notes", "Assessment Forms", "Patient Education", "Reports", "Discharge Summary"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all relative cursor-pointer shrink-0 ${
              activeTab === tab
                ? 'text-indigo-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* 3. Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="pl-8 pr-3 py-2 w-52 sm:w-60 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700 cursor-pointer">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            <span>May 22, 2024</span>
          </div>

          {/* Unit / Floor */}
          <select
            value={careUnitFilter}
            onChange={(e) => setCareUnitFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Units / Floors</option>
            <option value="Cardiology Unit">Cardiology Unit</option>
            <option value="Medical Unit">Medical Unit</option>
            <option value="Surgical Unit">Surgical Unit</option>
            <option value="General Ward">General Ward</option>
            <option value="Maternity Unit">Maternity Unit</option>
          </select>

          {/* Patient Dropdown */}
          <select
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Patients</option>
            <option value="Patricia Smith">Patricia Smith</option>
            <option value="Michael Davis">Michael Davis</option>
            <option value="Linda Martinez">Linda Martinez</option>
            <option value="James Brown">James Brown</option>
            <option value="Mary Williams">Mary Williams</option>
          </select>

          {/* Document Type Dropdown */}
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Document Types</option>
            <option value="Care Note">Care Note</option>
            <option value="Assessment">Assessment</option>
            <option value="Medication">Medication</option>
            <option value="Education">Education</option>
            <option value="Report">Report</option>
            <option value="Care Plan">Care Plan</option>
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Needs Review">Needs Review</option>
            <option value="Draft">Draft</option>
          </select>

          <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-extrabold text-indigo-600 hover:bg-indigo-50 cursor-pointer">
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>
        </div>

        {/* Primary New Action Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4 stroke-[3]" />
          New Documentation
        </button>

      </div>

      {/* 4. 5 Stat Summary Cards Row */}
      {(() => {
        const totalDocsCount = documentations.length;
        const completedDocsCount = documentations.filter((d: any) => d.status === 'Completed').length;
        const pendingDocsCount = documentations.filter((d: any) => d.status === 'Pending').length;
        const needsReviewDocsCount = documentations.filter((d: any) => d.status === 'NeedsReview' || d.status === 'Needs Review').length;
        const draftsDocsCount = documentations.filter((d: any) => d.status === 'Draft').length;
        const totalBase = totalDocsCount > 0 ? totalDocsCount : 1;

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Documents */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center font-bold shrink-0">
                <FileText className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{totalDocsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Total Documents</p>
                <p className="text-[10px] font-semibold text-slate-400">All records</p>
              </div>
            </div>

            {/* Completed */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{completedDocsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Completed</p>
                <p className="text-[10px] font-semibold text-emerald-600">{Math.round((completedDocsCount / totalBase) * 100)}%</p>
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center font-bold shrink-0">
                <Clock className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{pendingDocsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Pending</p>
                <p className="text-[10px] font-semibold text-amber-600">{Math.round((pendingDocsCount / totalBase) * 100)}%</p>
              </div>
            </div>

            {/* Needs Review */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center font-bold shrink-0">
                <AlertTriangle className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{needsReviewDocsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Needs Review</p>
                <p className="text-[10px] font-semibold text-rose-600">{Math.round((needsReviewDocsCount / totalBase) * 100)}%</p>
              </div>
            </div>

            {/* Drafts */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center font-bold shrink-0">
                <FileCheck className="h-5 w-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900 leading-none">{draftsDocsCount}</p>
                <p className="text-[11px] font-bold text-slate-500 mt-1">Drafts</p>
                <p className="text-[10px] font-semibold text-blue-600">{Math.round((draftsDocsCount / totalBase) * 100)}%</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 5. Master Split-Screen Layout (Left 8 Columns Table + Right 4 Columns Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Table Section (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Documentation List</h3>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Document Name</th>
                  <th className="py-3 px-3">Patient</th>
                  <th className="py-3 px-3">Document Type</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Created By</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {documentations.map((d: any) => (
                  <tr
                    key={d.id || d.documentCode}
                    onClick={() => {
                      setSelectedPatient({
                        name: d.patientName,
                        idCode: d.patientIdCode || 'PT-10001',
                        ageGender: d.ageGender || '68 Y • Female • A+',
                        roomLocation: d.roomLocation || 'Room 302',
                        careUnit: d.careUnit || 'Cardiology Unit',
                        patientType: d.patientType || 'Inpatient',
                        avatar: d.patientAvatar || '',
                        attendingDoctor: 'Dr. Sarah Wilson',
                        careTeamMembers: '3 Members',
                        los: '4 Days'
                      });
                    }}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    {/* Document Name */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{d.documentName}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{d.documentCode}</p>
                        </div>
                      </div>
                    </td>

                    {/* Patient */}
                    <td className="py-3.5 px-3">
                      <p className="font-extrabold text-slate-900 text-xs">{d.patientName}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{d.roomLocation}</p>
                    </td>

                    {/* Document Type */}
                    <td className="py-3.5 px-3">
                      {getDocTypePill(d.documentType)}
                    </td>

                    {/* Date & Time */}
                    <td className="py-3.5 px-3">
                      <p className="font-extrabold text-slate-800 text-[11px]">{d.dateTimeText?.split(' ')[0]} {d.dateTimeText?.split(' ')[1]}, {d.dateTimeText?.split(' ')[2]}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{d.dateTimeText?.split(' ').slice(3).join(' ')}</p>
                    </td>

                    {/* Created By */}
                    <td className="py-3.5 px-3">
                      <p className="font-extrabold text-slate-900 text-xs">{d.createdByName}</p>
                      <p className="text-[10px] font-semibold text-slate-400">{d.createdByRole}</p>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center">
                      {getStatusPill(d.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewDoc(d);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="View Document"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditDoc({ ...d });
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          title="Edit Document"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Pagination */}
          <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100">
            <span>Showing 1 to 8 of 56 documents</span>
            
            <div className="flex items-center gap-1.5">
              <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button className="h-7 w-7 rounded-lg font-bold bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs cursor-pointer">
                1
              </button>
              <button className="h-7 w-7 rounded-lg font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer">
                2
              </button>
              <button className="h-7 w-7 rounded-lg font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer">
                3
              </button>
              <span className="text-slate-400 px-1">...</span>
              <button className="h-7 w-7 rounded-lg font-bold border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 flex items-center justify-center text-xs cursor-pointer">
                7
              </button>
              <button className="h-7 w-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Persistent Sidebar Panel (4 Columns) */}
        <div className="lg:col-span-4 space-y-4 sticky top-6">
          
          {/* Selected Patient Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-xs">Selected Patient</h3>
              <ChevronUp className="h-4 w-4 text-slate-400 cursor-pointer" />
            </div>

            {/* Patient Header */}
            <div className="flex items-center gap-3">
              {selectedPatient.avatar ? (
                <img
                  src={selectedPatient.avatar}
                  alt={selectedPatient.name}
                  className="h-12 w-12 rounded-full object-cover border-2 border-indigo-100 shrink-0"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border-2 border-indigo-100 shrink-0">
                  {selectedPatient.name ? selectedPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-slate-900 text-sm">{selectedPatient.name}</p>
                </div>
                <p className="text-[11px] font-bold text-slate-400">PID: {selectedPatient.idCode}</p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {selectedPatient.ageGender}
                </p>
                <p className="text-[10px] font-semibold text-slate-500">
                  {selectedPatient.roomLocation} • {selectedPatient.careUnit}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                  {selectedPatient.patientType}
                </span>
              </div>
            </div>

            {/* 3 Metrics */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center text-xs">
              <div>
                <p className="text-[10px] font-bold text-slate-400">Attending Doctor</p>
                <p className="font-extrabold text-slate-900 text-[11px] mt-0.5">{selectedPatient.attendingDoctor}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">Care Team</p>
                <p className="font-extrabold text-slate-900 text-[11px] mt-0.5">{selectedPatient.careTeamMembers}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">LOS</p>
                <p className="font-extrabold text-slate-900 text-[11px] mt-0.5">{selectedPatient.los}</p>
              </div>
            </div>
          </div>

          {/* Document Summary List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Document Summary</h3>
              <button onClick={() => { setActiveTab('All Documents'); setDocTypeFilter('All'); }} className="text-[11px] font-extrabold text-indigo-600 hover:underline cursor-pointer">View All</button>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                  Care Notes
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats?.careNotesCount ?? documentations.filter((d: any) => d.documentType === 'Care Note').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                  Assessments
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats?.assessmentsCount ?? documentations.filter((d: any) => d.documentType === 'Assessment').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Medications
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats?.medicationsCount ?? documentations.filter((d: any) => d.documentType === 'Medication').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                  Education
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats?.educationCount ?? documentations.filter((d: any) => d.documentType === 'Education').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                  Reports
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats?.reportsCount ?? documentations.filter((d: any) => d.documentType === 'Report').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                  Other Documents
                </span>
                <span className="font-extrabold text-slate-900">
                  {stats?.otherDocumentsCount ?? documentations.filter((d: any) => !['Care Note', 'Assessment', 'Medication', 'Education', 'Report'].includes(d.documentType)).length}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs mb-1">Quick Actions</h3>

            <button
              onClick={() => {
                setNewDocForm({ ...newDocForm, documentName: 'Nursing Care Note', documentType: 'Care Note' });
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-start gap-2 py-2 px-3 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Care Note
            </button>

            <button
              onClick={() => {
                setNewDocForm({ ...newDocForm, documentName: 'Wound Assessment', documentType: 'Assessment' });
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-start gap-2 py-2 px-3 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Assessment
            </button>

            <button
              onClick={() => {
                setNewDocForm({ ...newDocForm, documentName: 'Medication Administration Record', documentType: 'Medication' });
                setIsModalOpen(true);
              }}
              className="w-full flex items-center justify-start gap-2 py-2 px-3 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Medication Record
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="w-full flex items-center justify-start gap-2 py-2 px-3 border border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              Upload Document
            </button>
          </div>

          {/* Recent Drafts */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Recent Drafts</h3>
              <button className="text-[11px] font-extrabold text-indigo-600 hover:underline">View All</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Discharge Summary</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Patricia Smith • Room 302</p>
                    <p className="text-[9px] text-slate-400">Last edited: May 22, 2024 06:30 AM</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  Draft
                </span>
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900 text-xs">Care Plan Update</p>
                    <p className="text-[10px] text-slate-400 font-semibold">Michael Davis • Room 201</p>
                    <p className="text-[9px] text-slate-400">Last edited: May 22, 2024 06:15 AM</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                  Draft
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* New Documentation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base">New Documentation</h3>
              <button onClick={() => {
                setNewDocForm(initialNewDocForm);
                setIsModalOpen(false);
              }} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Document Name</label>
                <input
                  type="text"
                  value={newDocForm.documentName}
                  onChange={(e) => setNewDocForm({ ...newDocForm, documentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient</label>
                <select
                  value={newDocForm.patientName}
                  onChange={(e) => {
                    const ptName = e.target.value;
                    const found = patients.find(p => p.name === ptName);
                    setNewDocForm({
                      ...newDocForm,
                      patientName: ptName,
                      patientIdCode: found?.patientIdCode || found?.mrn || '',
                      roomLocation: found?.floorRoom || found?.roomNumber || 'Room 302',
                      careUnit: found?.careUnit || found?.department || 'Cardiology Unit'
                    });
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select Patient</option>
                  {patients.length > 0 ? (
                    patients.map((p: any) => (
                      <option key={p.id || p.patientIdCode} value={p.name}>
                        {p.name} ({p.floorRoom || p.roomNumber || 'Room 101'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Patricia Smith">Patricia Smith (Room 302)</option>
                      <option value="Michael Davis">Michael Davis (Room 201)</option>
                      <option value="Linda Martinez">Linda Martinez (Room 305)</option>
                      <option value="James Brown">James Brown (Room 102)</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Document Type</label>
                <select
                  value={newDocForm.documentType}
                  onChange={(e) => setNewDocForm({ ...newDocForm, documentType: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Care Note">Care Note</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Medication">Medication</option>
                  <option value="Education">Education</option>
                  <option value="Report">Report</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Status</label>
                <select
                  value={newDocForm.status}
                  onChange={(e) => setNewDocForm({ ...newDocForm, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Needs Review">Needs Review</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Documentation Content</label>
                <textarea
                  rows={4}
                  value={newDocForm.notesContent}
                  onChange={(e) => setNewDocForm({ ...newDocForm, notesContent: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Enter clinical notes and observations..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setNewDocForm(initialNewDocForm);
                  setIsModalOpen(false);
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDoc}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Check className="h-4 w-4" />
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-600" />
                Upload Clinical Document
              </h3>
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFileName('');
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-semibold">
              {/* File Dropzone */}
              <div>
                <label className="block text-slate-600 font-bold mb-1">Select File (.pdf, .docx, .png, .jpg, .csv)</label>
                <label className="border-2 border-dashed border-indigo-200 bg-indigo-50/40 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.csv,.txt"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setUploadedFileName(f.name);
                        if (!uploadDocForm.documentName) {
                          setUploadDocForm(prev => ({
                            ...prev,
                            documentName: f.name.replace(/\.[^/.]+$/, "")
                          }));
                        }
                      }
                    }}
                    className="hidden"
                  />
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1.5 shadow-2xs">
                    <Upload className="h-5 w-5" />
                  </div>
                  {uploadedFileName ? (
                    <span className="font-bold text-indigo-700 text-xs truncate max-w-[280px]">
                      {uploadedFileName}
                    </span>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-indigo-600">Click to choose document</span>
                      <span className="text-[10px] text-slate-400 font-medium">PDF, DOC, Images up to 15MB</span>
                    </>
                  )}
                </label>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Document Title</label>
                <input
                  type="text"
                  value={uploadDocForm.documentName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentName: e.target.value })}
                  placeholder="e.g. Lab Report / Discharge Summary"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Patient</label>
                <select
                  value={uploadDocForm.patientName}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, patientName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="">Select Patient</option>
                  {patients.length > 0 ? (
                    patients.map((p: any) => (
                      <option key={p.id || p.patientIdCode} value={p.name}>
                        {p.name} ({p.floorRoom || p.roomNumber || 'Room 101'})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Patricia Smith">Patricia Smith (Room 302)</option>
                      <option value="Michael Davis">Michael Davis (Room 201)</option>
                      <option value="Linda Martinez">Linda Martinez (Room 305)</option>
                      <option value="James Brown">James Brown (Room 102)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Document Type</label>
                  <select
                    value={uploadDocForm.documentType}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, documentType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Report">Report</option>
                    <option value="Care Note">Care Note</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Medication">Medication</option>
                    <option value="Education">Education</option>
                    <option value="Care Plan">Care Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Status</label>
                  <select
                    value={uploadDocForm.status}
                    onChange={(e) => setUploadDocForm({ ...uploadDocForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Notes / Description</label>
                <textarea
                  rows={3}
                  value={uploadDocForm.notesContent}
                  onChange={(e) => setUploadDocForm({ ...uploadDocForm, notesContent: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Enter clinical summary or notes about this file..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFileName('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadDoc}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Upload className="h-4 w-4" />
                Upload & Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Document Modal (Bug 22) */}
      {viewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Document Details: {viewDoc.documentName}
              </h3>
              <button onClick={() => setViewDoc(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 font-semibold">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Patient</p>
                  <p className="text-xs font-bold text-slate-900">{viewDoc.patientName} ({viewDoc.roomLocation || 'Room 101'})</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Document Code</p>
                  <p className="text-xs font-mono font-bold text-slate-700">{viewDoc.documentCode || 'DOC-2026'}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Type & Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getDocTypePill(viewDoc.documentType)}
                    {getStatusPill(viewDoc.status)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Created By</p>
                  <p className="text-xs font-bold text-slate-800">{viewDoc.createdByName || 'Staff Nurse'} • {viewDoc.dateTimeText}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] text-slate-500 font-bold mb-1">Clinical Notes & Observations</p>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap min-h-[100px]">
                  {viewDoc.notesContent || 'No additional notes provided for this documentation.'}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setViewDoc(null)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Document Modal (Bug 22) */}
      {editDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Edit2 className="h-4 w-4 text-indigo-600" />
                Edit Document
              </h3>
              <button onClick={() => setEditDoc(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUpdateDoc();
              }}
              className="space-y-3 font-semibold"
            >
              <div>
                <label className="block text-slate-600 font-bold mb-1">Document Name</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={editDoc.documentName || ''}
                  onChange={(e) => setEditDoc({ ...editDoc, documentName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Document Type</label>
                  <select
                    value={editDoc.documentType || 'Care Note'}
                    onChange={(e) => setEditDoc({ ...editDoc, documentType: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Care Note">Care Note</option>
                    <option value="Assessment">Assessment</option>
                    <option value="Medication">Medication</option>
                    <option value="Education">Education</option>
                    <option value="Report">Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Status</label>
                  <select
                    value={editDoc.status || 'Completed'}
                    onChange={(e) => setEditDoc({ ...editDoc, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Completed">Completed</option>
                    <option value="Pending">Pending</option>
                    <option value="Needs Review">Needs Review</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Documentation Notes</label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={editDoc.notesContent || ''}
                  onChange={(e) => setEditDoc({ ...editDoc, notesContent: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Enter notes..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditDoc(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Update Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DocumentationsPage;
