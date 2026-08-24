import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Share2,
  Printer,
  Edit,
  Star,
  AlertTriangle,
  Plus,
  Calendar,
  CheckSquare,
  MessageSquare,
  Heart,
  Activity,
  FileText,
  Clock,
  Pill,
  Stethoscope,
  CheckCircle2,
  Download,
  Upload,
  FileCheck,
  History as HistoryIcon,
  User,
  Shield,
  MapPin,
  X
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';
import {
  formatDateMMDDYYYY,
  formatDateTimeMMDDYYYY
} from '../../../lib/utils';

export const PatientDetailsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Action Modals State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesList, setNotesList] = useState<any[]>([
    { id: 1, author: 'Dr. Sarah Wilson', date: 'May 20, 2024 10:15 AM', content: 'Patient reported stable chest pain levels. Continue current Lisinopril dosage.' },
    { id: 2, author: 'Nurse Emily Clark', date: 'May 19, 2024 04:30 PM', content: 'Vitals recorded. Blood pressure slightly elevated at 135/88. Recommended rest.' }
  ]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [tasksList, setTasksList] = useState<any[]>([
    { id: 1, title: 'Morning Vital Check & ECG', assignedTo: 'Nurse Emily Clark', dueDate: 'Today 09:00 AM', status: 'Completed' },
    { id: 2, title: 'Post-Medication Follow-up', assignedTo: 'Dr. Sarah Wilson', dueDate: 'Today 02:00 PM', status: 'Pending' }
  ]);

  const [showApptModal, setShowApptModal] = useState(false);
  const [apptDoctor, setApptDoctor] = useState('Dr. Sarah Wilson');
  const [apptDate, setApptDate] = useState('');
  const [apptType, setApptType] = useState('Follow-up Consultation');
  const [apptsList, setApptsList] = useState<any[]>([
    { id: 1, doctor: 'Dr. Sarah Wilson', type: 'Cardiology Review', date: 'May 25, 2024 10:00 AM', status: 'Scheduled' },
    { id: 2, doctor: 'Dr. Michael Brown', type: 'Routine Wellness Exam', date: 'Jun 02, 2024 02:30 PM', status: 'Scheduled' }
  ]);

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('Twice Daily');
  const [newMedDoctor, setNewMedDoctor] = useState('');
  const [isSavingMed, setIsSavingMed] = useState(false);

  // Document Upload State
  const [patientDocs, setPatientDocs] = useState<any[]>([]);
  const [clinicalEncounters, setClinicalEncounters] = useState<any[]>([]);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocCategory, setUploadDocCategory] = useState<string>('MedicalDocuments');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState('');

  const getAvatarSrc = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const loadClinicalEncounters = (pId: string) => {
  api.getPatientClinicalEncounters(pId)
    .then((res: any) => {
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setClinicalEncounters(Array.isArray(raw) ? raw : []);
    })
    .catch((err) =>
      console.log('Failed to fetch patient clinical encounters:', err)
    );
};

  const loadDocuments = (pId: string) => {
    api.getPatientDocuments(pId)
      .then((res: any) => {
        if (res && res.data) {
          setPatientDocs(res.data);
        } else if (Array.isArray(res)) {
          setPatientDocs(res);
        }
      })
      .catch((err) => console.log('Failed to fetch patient documents:', err));
  };

  const loadNotes = (pId: string) => {
    api.getNurseDocumentations(undefined, undefined, undefined, undefined, pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          const formatted = raw.map((d: any) => ({
            id: d.id,
            author: d.createdByName || d.createdBy || 'Dr. Sarah Wilson',
            date: d.dateTimeText ? formatDateTimeMMDDYYYY(d.dateTimeText) : d.createdDate ? formatDateTimeMMDDYYYY(d.createdDate) : 'Recent',
            content: d.notesContent || d.documentName || 'Clinical progress note'
          }));
          setNotesList(formatted);
        }
      })
      .catch((err) => console.log('Failed to fetch patient notes:', err));
  };

  const loadTasks = (pId: string) => {
    api.getTasks(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          const formatted = raw.map((t: any) => ({
            id: t.id,
            title: t.title || t.description || 'Care Task',
            assignedTo: t.assignedCaregiver || t.assigneeRole || 'Nurse Emily Clark',
            dueDate: t.dueTimeText || t.dueDate || 'Today 09:00 AM',
            status: t.statusStr || (t.status === 2 || t.status === 'Completed' ? 'Completed' : 'Pending')
          }));
          setTasksList(formatted);
        }
      })
      .catch((err) => console.log('Failed to fetch patient tasks:', err));
  };

  // Care Team Assignments State (patient_doctors & patient_nurses)
  const [patientDoctors, setPatientDoctors] = useState<any[]>([]);
  const [patientNurses, setPatientNurses] = useState<any[]>([]);

  const loadAssignments = (pId: string) => {
    api.getPatientDoctors(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setPatientDoctors(raw);
      })
      .catch((err) => console.log('Failed to fetch patient doctors:', err));

    api.getPatientNurses(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setPatientNurses(raw);
      })
      .catch((err) => console.log('Failed to fetch patient nurses:', err));
  };

  useEffect(() => {
    if (patientId) {
      api.getPatientById(patientId)
        .then((res: any) => {
          const data = (res && res.data) ? res.data : res;
          if (data) {
            setPatient(data);
            const resolvedId = data.id || data.patientIdCode || patientId;
            loadClinicalEncounters(resolvedId);
            loadDocuments(resolvedId);
            loadNotes(resolvedId);
            loadTasks(resolvedId);
            loadAssignments(resolvedId);
          }
        })
        .catch(() => {
          api.getPatients()
            .then((list) => {
              if (list && list.length > 0) {
                const first = (list[0] && list[0].data) ? list[0].data : list[0];
                setPatient(first);
                const resolvedId = first.id || first.patientIdCode;
                loadClinicalEncounters(resolvedId);
                loadDocuments(resolvedId);
                loadNotes(resolvedId);
                loadTasks(resolvedId);
                loadAssignments(resolvedId);
              }
            });
        });
    }
  }, [patientId]);

  const displayPatient = patient || {
    id: patientId || '',
    patientIdCode: patientId || '',
    mrn: '',
    name: 'Patient Profile',
    avatar: '',
    ageGender: '',
    dob: '',
    gender: 'Female',
    bloodType: '',
    maritalStatus: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    careUnit: 'General Ward',
    floorRoom: '1st Floor - 101',
    primaryDoctorName: '',
    primaryDoctorSpecialty: '',
    primaryDoctorAvatar: '',
    assignedNurseName: '',
    status: 'InCare',
    riskLevel: 'Medium',
    admissionDate: '',
    careDays: 1,
    dischargePlan: 'Not Scheduled',
    bloodPressure: '120/80 mmHg',
    heartRate: '72 bpm',
    bloodSugar: '110 mg/dL',
    temperature: '98.6 °F',
    spO2: '98 %',
    allergies: '',
    medicalConditions: '',
    currentMedications: '',
    pastMedicalHistory: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceGroupNumber: '',
    insuranceValidUntil: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: '',
    emergencyContactIsPrimary: true,
    additionalNotes: ''
  };

  const tabs = [
    'Overview',
    'Medical Information',
    'Health Records',
    'Medications',
    'Care Plan',
    'Vitals & Trends',
    'Documents',
    'Appointments',
    'Tasks & Notes',
    'History',
  ];

  // Helper bindings for real doctor details
  const docName = displayPatient.primaryDoctorName || displayPatient.primaryDoctor?.name || 'Not assigned';
  const docAvatar = displayPatient.primaryDoctorAvatar || displayPatient.primaryDoctor?.avatar || '';
  const docSpecialty = displayPatient.primaryDoctorSpecialty || displayPatient.primaryDoctor?.specialty || 'General Medicine';

  // Helper bindings for allergies & conditions array parsing
  const allergiesList = typeof displayPatient.allergies === 'string' && displayPatient.allergies.trim()
    ? displayPatient.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(displayPatient.allergies) ? displayPatient.allergies : [];

  const conditionsList = typeof displayPatient.medicalConditions === 'string' && displayPatient.medicalConditions.trim()
    ? displayPatient.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(displayPatient.medicalConditions) ? displayPatient.medicalConditions : [];

  const medicationsList = typeof displayPatient.currentMedications === 'string' && displayPatient.currentMedications.trim()
    ? displayPatient.currentMedications.split(',').map((s: string) => s.trim()).filter(Boolean)
    : Array.isArray(displayPatient.currentMedications) ? displayPatient.currentMedications : [];

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditPatient = () => {
    const pId = displayPatient.id || displayPatient.patientIdCode;
    navigate(`/patients/edit/${pId}`);
  };

  const handleAddNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setIsSavingNote(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    const pCode = displayPatient.patientIdCode || pId;
    const pName = displayPatient.name || 'Patient Profile';

    try {
      await api.createNurseDocumentation({
        patientId: pId && pId.includes('-') ? pId : undefined,
        patientIdCode: pCode,
        patientName: pName,
        documentName: 'Clinical Progress Note',
        documentCode: `NOTE-${Date.now().toString().slice(-4)}`,
        documentType: 'Care Note',
        createdByName: 'Dr. Sarah Wilson',
        createdByRole: 'Physician',
        notesContent: noteText.trim(),
        dateTimeText: formatDateTimeMMDDYYYY(new Date()),
        status: 'Completed'
      });
      loadNotes(pId);
    } catch (err) {
      console.error('Failed to create note via API:', err);
      const newNote = {
        id: Date.now(),
        author: 'Dr. Sarah Wilson',
        date: formatDateTimeMMDDYYYY(new Date()),
        content: noteText.trim()
      };
      setNotesList([newNote, ...notesList]);
    } finally {
      setIsSavingNote(false);
      setNoteText('');
      setShowNoteModal(false);
    }
  };

  const handleAddTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    setIsSavingTask(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    const pCode = displayPatient.patientIdCode || pId;
    const pName = displayPatient.name || 'Patient Profile';

    try {
      await api.createTask({
        patientId: pId && pId.includes('-') ? pId : undefined,
        patientIdCode: pCode,
        patientName: pName,
        title: taskTitle.trim(),
        description: taskTitle.trim(),
        assignedCaregiver: 'Nurse Emily Clark',
        assigneeRole: 'Nurse',
        dueTimeText: 'Today 05:00 PM',
        statusStr: 'Pending',
        status: 0
      });
      loadTasks(pId);
    } catch (err) {
      console.error('Failed to create task via API:', err);
      const newTask = {
        id: Date.now(),
        title: taskTitle.trim(),
        assignedTo: 'Nurse Emily Clark',
        dueDate: 'Today 05:00 PM',
        status: 'Pending'
      };
      setTasksList([newTask, ...tasksList]);
    } finally {
      setIsSavingTask(false);
      setTaskTitle('');
      setShowTaskModal(false);
    }
  };

  const handleToggleTaskStatus = async (taskId: any) => {
    if (typeof taskId === 'string' && taskId.includes('-')) {
      try {
        await api.toggleTaskStatus(taskId);
        const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
        loadTasks(pId);
        return;
      } catch (err) {
        console.error('Failed to toggle task status via API:', err);
      }
    }
    setTasksList(tasksList.map(t => t.id === taskId ? {
      ...t,
      status: t.status === 'Completed' ? 'Pending' : 'Completed'
    } : t));
  };

  const handleAddApptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newAppt = {
      id: Date.now(),
      doctor: apptDoctor,
      type: apptType,
      date: apptDate || 'Tomorrow 10:00 AM',
      status: 'Scheduled'
    };
    setApptsList([newAppt, ...apptsList]);
    setShowApptModal(false);
  };

  const handleAddPrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    setIsSavingMed(true);
    const dosageFormatted = newMedDosage.trim() ? `${newMedDosage.trim()}` : '';
    const freqFormatted = newMedFrequency ? `, ${newMedFrequency}` : '';
    const formattedMed = `${newMedName.trim()} ${dosageFormatted}${freqFormatted}`.trim();

    const existingMeds = displayPatient.currentMedications || '';
    const updatedMedsStr = existingMeds
      ? `${existingMeds}, ${formattedMed}`
      : formattedMed;

    // Update local state
    const updatedPatient = {
      ...displayPatient,
      currentMedications: updatedMedsStr
    };
    setPatient(updatedPatient);

    // Save to PostgreSQL via API
    const pId = displayPatient.id || displayPatient.patientIdCode;
    if (pId) {
      try {
        await api.updatePatient(pId, {
          ...displayPatient,
          currentMedications: updatedMedsStr
        });
      } catch (err) {
        console.error('Failed to update patient prescription on API:', err);
      }
    }

    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('Twice Daily');
    setIsSavingMed(false);
    setShowPrescriptionModal(false);
  };

  const handleUploadDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setDocError('Please select a file to upload.');
      return;
    }

    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    if (!pId) {
      setDocError('Invalid Patient ID.');
      return;
    }

    setIsUploadingDoc(true);
    setDocError('');
    setDocSuccess('');

    try {
      const res = await api.uploadPatientDocument(pId, uploadFile, uploadDocCategory);
      setDocSuccess('Document uploaded successfully!');
      setUploadFile(null);

      // Refresh list
      loadDocuments(pId);

      // If ProfilePicture, refresh patient avatar
      if (uploadDocCategory === 'ProfilePicture' && res?.data) {
        api.getPatientById(pId).then((updatedP) => {
          if (updatedP) setPatient(updatedP);
        });
      }

      setTimeout(() => {
        setShowDocUploadModal(false);
        setDocSuccess('');
      }, 1200);
    } catch (err: any) {
      setDocError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${docName}"?`)) return;

    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    try {
      await api.deletePatientDocument(pId, docId);
      loadDocuments(pId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete document.');
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto p-4 select-none pb-16 font-sans">
      
      {/* 1. Header & Actions */}
      <PageHeader
        title="Patient Profile"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: displayPatient.name || 'Patient Profile' },
        ]}
        actions={
          <>
            <button
              onClick={handleShareProfile}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="h-4 w-4 text-indigo-600" />
              <span>{copiedLink ? 'Link Copied!' : 'Share Profile'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3.5 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="h-4 w-4 text-indigo-600" />
              <span>Print Report</span>
            </button>

            <button
              onClick={handleEditPatient}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Patient</span>
            </button>
          </>
        }
      />

      {/* 2. Patient Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center">
        
        {/* Left Side: Avatar & Core Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="relative shrink-0">
            {displayPatient.avatar ? (
              <img
                src={getAvatarSrc(displayPatient.avatar)}
                alt={displayPatient.name}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
              />
            ) : (
              <div className="h-24 w-24 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-2xl border-4 border-white shadow-md">
                {displayPatient.name ? displayPatient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : <User className="h-10 w-10 text-indigo-400" />}
              </div>
            )}
            <span className="absolute bottom-0 right-0 p-1 bg-emerald-500 text-white rounded-full border-2 border-white">
              <Badge variant="in-care" className="px-2 py-0.5 text-[10px] bg-emerald-500 text-white border-none font-bold">
                {String(displayPatient.status) === '0' || String(displayPatient.status) === 'InCare' ? 'In Care' : String(displayPatient.status)}
              </Badge>
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{displayPatient.name}</h2>
              <Star className="h-5 w-5 fill-amber-400 text-amber-400 cursor-pointer" />
            </div>

            <div className="flex flex-wrap items-center gap-3 text-slate-500 font-semibold pt-0.5">
              <span>Patient ID: <strong className="text-indigo-900 font-extrabold">{displayPatient.patientIdCode || displayPatient.id}</strong></span>
              <span>MRN: <strong className="text-slate-800 font-bold">{displayPatient.mrn || 'N/A'}</strong></span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 pt-2 text-slate-600">
              <div><span className="text-slate-400">Age / Gender:</span> <p className="font-bold text-slate-900">{displayPatient.ageGender || `${calculateAge(displayPatient.dob)} YRS / ${displayPatient.gender || 'Not specified'}`}</p></div>
              <div><span className="text-slate-400">Date of Birth:</span> <p className="font-bold text-slate-900">{displayPatient.dob ? formatDateMMDDYYYY(displayPatient.dob) : 'Not specified'}</p></div>
              <div><span className="text-slate-400">Phone:</span> <p className="font-bold text-slate-900">{displayPatient.phone || 'Not provided'}</p></div>
              <div><span className="text-slate-400">Email:</span> <p className="font-bold text-slate-900">{displayPatient.email || 'Not provided'}</p></div>
            </div>

            <div className="pt-1.5 text-slate-600">
              <span className="text-slate-400">Care Unit & Room:</span> <span className="font-extrabold text-indigo-700">{displayPatient.careUnit || 'General Ward'}{displayPatient.floorRoom ? `, ${displayPatient.floorRoom}` : ''}</span>
            </div>
          </div>
        </div>

        {/* Right Side Cards (Doctor, Risk Level, Allergies) */}
        <div className="flex flex-wrap lg:flex-nowrap gap-3 shrink-0 w-full lg:w-auto">
          
          {/* Primary Doctor Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs space-y-1 min-w-[160px] flex-1 lg:flex-initial">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Doctor</p>
            <div className="flex items-center gap-2.5 pt-1">
              {docAvatar ? (
                <img src={docAvatar} alt={docName} className="h-8 w-8 rounded-full object-cover border border-slate-200 shrink-0" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200">
                  {docName !== 'Not assigned' ? docName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                </div>
              )}
              <div>
                <p className="font-black text-slate-900 leading-tight">{docName}</p>
                <p className="text-[10px] font-bold text-indigo-600">{docSpecialty}</p>
              </div>
            </div>
          </div>

          {/* Risk Level Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs space-y-1 min-w-[130px] flex-1 lg:flex-initial">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Risk Level</p>
            <div className="pt-1">
              <Badge variant={String(displayPatient.riskLevel).toLowerCase() === 'high' || String(displayPatient.riskLevel) === '0' ? 'high' : 'medium'}>
                {String(displayPatient.riskLevel) === '0' ? 'High' : String(displayPatient.riskLevel) === '1' ? 'Medium' : displayPatient.riskLevel || 'High'}
              </Badge>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 pt-1">Last visit: {displayPatient.lastVisit ? formatDateMMDDYYYY(displayPatient.lastVisit) : '05/18/2024'}</p>
          </div>

          {/* Real Allergies Card */}
          <div className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-2xl text-xs space-y-1 min-w-[170px] flex-1 lg:flex-initial">
            <div className="flex items-center gap-1.5 text-rose-700 font-black text-[11px]">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
              <span>Allergies</span>
            </div>
            <div className="pt-1">
              {allergiesList.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {allergiesList.slice(0, 2).map((a: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 bg-rose-100 text-rose-800 font-extrabold rounded-md text-[10px] border border-rose-200">
                      {a}
                    </span>
                  ))}
                  {allergiesList.length > 2 && (
                    <span className="text-[10px] font-bold text-rose-600 pl-1">+{allergiesList.length - 2} more</span>
                  )}
                </div>
              ) : (
                <p className="text-[11px] font-bold text-slate-500 italic">No known allergies</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. The 10 Tab Navigation Bar */}
      <div className="border-b border-slate-200 bg-white rounded-2xl p-1 shadow-2xs">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tab Contents View */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
          
          {/* Column 1: Vitals & Conditions */}
          <div className="space-y-6">
            {/* Vitals Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Recent Vitals
                </h3>
                <button onClick={() => setActiveTab('Vitals & Trends')} className="text-xs font-extrabold text-indigo-600 hover:underline">
                  View Trends
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Blood Pressure</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.bloodPressure || "128/82 mmHg"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Heart Rate</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.heartRate || "76 bpm"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Blood Sugar</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.bloodSugar || "112 mg/dL"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Temperature</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.temperature || "98.6 °F"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">SpO2 Oxygen</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.spO2 || "98 %"}</span>
                </div>
              </div>
            </div>

            {/* Real Medical Conditions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                <Heart className="h-4 w-4 text-rose-500" />
                Diagnosed Medical Conditions
              </h3>
              {conditionsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditionsList.map((c: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold rounded-xl border border-indigo-100 text-xs shadow-2xs">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-semibold italic">No recorded conditions.</p>
              )}
            </div>
          </div>

          {/* Column 2: Status & Medications */}
          <div className="space-y-6">
            {/* Status Information */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <h3 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Hospital & Care Status
              </h3>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 font-semibold">
                <span className="text-slate-500">Admission Date</span>
                <span className="font-bold text-slate-800">{displayPatient.admissionDate ? formatDateMMDDYYYY(displayPatient.admissionDate) : 'Not specified'}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 font-semibold">
                <span className="text-slate-500">Days in Care</span>
                <span className="font-bold text-slate-800">{displayPatient.careDays || 1} Day{displayPatient.careDays === 1 ? '' : 's'}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 font-semibold">
                <span className="text-slate-500">Discharge Schedule</span>
                <span className="font-bold text-slate-800">{displayPatient.dischargePlan || "Not Scheduled"}</span>
              </div>
            </div>

            {/* Active Medications Preview */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                  <Pill className="h-4 w-4 text-indigo-600" />
                  Active Medications
                </h3>
                <button onClick={() => setActiveTab('Medications')} className="text-xs font-extrabold text-indigo-600 hover:underline">
                  Manage All
                </button>
              </div>

              {medicationsList.length > 0 ? (
                <div className="space-y-2">
                  {medicationsList.map((m: string, idx: number) => (
                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl font-bold text-slate-800 border border-slate-100 flex items-center justify-between">
                      <span>{m}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200 font-extrabold">Active</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 font-semibold italic">No active prescriptions.</p>
              )}
            </div>
          </div>

          {/* Column 3: Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <h3 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowNoteModal(true)}
                  className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="h-4 w-4 text-indigo-600" />
                  <span>Add Clinical Note</span>
                </button>

                <button
                  onClick={() => setShowApptModal(true)}
                  className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span>Schedule Appointment</span>
                </button>

                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
                >
                  <CheckSquare className="h-4 w-4 text-indigo-600" />
                  <span>Create Nursing Task</span>
                </button>

                <button
                  onClick={() => navigate('/care-teams')}
                  className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all cursor-pointer shadow-2xs"
                >
                  <MessageSquare className="h-4 w-4 text-indigo-600" />
                  <span>Contact Care Team</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MEDICAL INFORMATION */}
      {activeTab === 'Medical Information' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs font-semibold">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-indigo-600" />
            Comprehensive Medical, Clinical & Insurance Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Diagnosed Conditions */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm text-indigo-700 flex items-center gap-2">
                <Heart className="h-4 w-4 text-indigo-600" /> Diagnosed Medical Conditions
              </h4>
              {conditionsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditionsList.map((c: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-indigo-200 text-indigo-800 font-extrabold rounded-xl shadow-2xs">{c}</span>
                  ))}
                </div>
              ) : <p className="text-slate-400 font-medium italic">None reported</p>}
            </div>

            {/* Allergies */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm text-rose-700 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-600" /> Allergies & Sensitivities
              </h4>
              {allergiesList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergiesList.map((a: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 font-extrabold rounded-xl shadow-2xs">{a}</span>
                  ))}
                </div>
              ) : <p className="text-slate-400 font-medium italic">No known allergies</p>}
            </div>

            {/* Current Medications */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm text-emerald-700 flex items-center gap-2">
                <Pill className="h-4 w-4 text-emerald-600" /> Current Medications
              </h4>
              {medicationsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {medicationsList.map((m: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold rounded-xl shadow-2xs">{m}</span>
                  ))}
                </div>
              ) : <p className="text-slate-400 font-medium italic">None reported</p>}
            </div>

            {/* Past Medical & Surgical History */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Past Medical & Surgical History</h4>
              <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 min-h-[60px]">
                {displayPatient.pastMedicalHistory || 'No past surgical history logged.'}
              </p>
            </div>

            {/* Emergency Contact */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Emergency Contact Information</h4>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <p><span className="text-slate-400">Contact Person:</span> <strong className="text-slate-900">{displayPatient.emergencyContactName || 'Not provided'}</strong></p>
                <p><span className="text-slate-400">Relationship:</span> <strong className="text-slate-900">{displayPatient.emergencyContactRelationship || 'Not provided'}</strong></p>
                <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-900">{displayPatient.emergencyContactPhone || 'Not provided'}</strong></p>
                <p><span className="text-slate-400">Primary Contact:</span> <strong className="text-slate-900">{displayPatient.emergencyContactIsPrimary !== false ? 'Yes' : 'No'}</strong></p>
              </div>
            </div>

            {/* Insurance Coverage */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-purple-600" /> Insurance & Coverage Details
              </h4>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <p><span className="text-slate-400">Provider:</span> <strong className="text-slate-900">{displayPatient.insuranceProvider || 'Not specified'}</strong></p>
                <p><span className="text-slate-400">Policy / Member #:</span> <strong className="text-slate-900">{displayPatient.insurancePolicyNumber || 'Not specified'}</strong></p>
                <p><span className="text-slate-400">Group Number:</span> <strong className="text-slate-900">{displayPatient.insuranceGroupNumber || 'Not specified'}</strong></p>
                <p><span className="text-slate-400">Valid Until:</span> <strong className="text-slate-900">{displayPatient.insuranceValidUntil || 'Not specified'}</strong></p>
              </div>
            </div>

            {/* Residential Address & Contact Details */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-indigo-600" /> Residential & Contact Address
              </h4>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <p><span className="text-slate-400">Street:</span> <strong className="text-slate-900">{displayPatient.address || 'Not provided'}</strong></p>
                <p><span className="text-slate-400">City, State, ZIP:</span> <strong className="text-slate-900">{[displayPatient.city, displayPatient.state, displayPatient.zipCode].filter(Boolean).join(', ') || 'Not provided'}</strong></p>
                <p><span className="text-slate-400">Country:</span> <strong className="text-slate-900">{displayPatient.country || 'USA'}</strong></p>
                <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-900">{displayPatient.phone || 'Not provided'}</strong></p>
                <p><span className="text-slate-400">Email:</span> <strong className="text-slate-900">{displayPatient.email || 'Not provided'}</strong></p>
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 md:col-span-2">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-indigo-600" /> Special Instructions & Clinical Notes
              </h4>
              <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200 min-h-[60px]">
                {displayPatient.additionalNotes || 'No additional clinical notes provided.'}
              </p>
            </div>
          </div>
        </div>
      )}

     {/* TAB 3: HEALTH RECORDS */}
      {activeTab === 'Health Records' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            Electronic Health Records & Encounter Logs
          </h3>

          {clinicalEncounters.length === 0 ? (
            <div className="py-10 text-center text-slate-400 font-semibold">
              No clinical encounters recorded for this patient.
            </div>
          ) : (
            <div className="space-y-3">
              {clinicalEncounters.map((rec: any) => (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">
                      {rec.encounterType || 'Clinical Encounter'}
                    </h4>

                    <p className="text-slate-500 font-semibold mt-0.5">
                      Date:{' '}
                      {rec.dateText
                        ? formatDateMMDDYYYY(rec.dateText)
                        : 'N/A'}
                      {' • '}
                      Attending: {rec.providerName || 'N/A'}
                    </p>

                    {rec.reasonDiagnosis && (
                      <p className="text-slate-500 text-[11px] mt-1">
                        {rec.reasonDiagnosis}
                      </p>
                    )}
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-xl text-xs">
                    Recorded
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MEDICATIONS */}
      {activeTab === 'Medications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Pill className="h-5 w-5 text-indigo-600" />
              Medication Administration & Active Prescriptions
            </h3>
            <button
              onClick={() => {
                setNewMedDoctor(docName);
                setShowPrescriptionModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Prescription</span>
            </button>
          </div>

          <div className="space-y-3">
            {medicationsList.length > 0 ? (
              medicationsList.map((m: string, i: number) => (
                <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-semibold">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{m}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">Prescribed by {docName} • Take orally twice daily with meals</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-xl text-xs">Active</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No active prescriptions logged.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: CARE PLAN */}
      {activeTab === 'Care Plan' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
            Active Clinical Care Plan & Goals
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm">Primary Care Goals</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Maintain blood pressure under 130/80 mmHg</li>
                <li className="flex items-center gap-2 font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Daily physical therapy mobility exercises</li>
                <li className="flex items-center gap-2 font-bold text-slate-700"><CheckCircle2 className="h-4 w-4 text-amber-500" /> Low-sodium cardiac diet adherence</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm">Assigned Care Team</h4>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  <Shield className="h-3 w-3 text-indigo-500" />
                  {patient?.careUnit || patient?.CareUnit ? `${patient.careUnit || patient.CareUnit} Care Team` : 'Cardiology Alpha Team'}
                </span>
              </div>
              <div className="space-y-2">
                {/* Doctors List */}
                {patientDoctors.length > 0 ? (
                  patientDoctors.map((pd: any, idx: number) => {
                    const doc = pd.doctor || {};
                    const effectiveDocAvatar = doc.avatar || docAvatar;
                    const effectiveDocName = doc.name || docName;
                    return (
                      <div key={`pd-${idx}`} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                          {effectiveDocAvatar ? (
                            <img src={getAvatarSrc(effectiveDocAvatar)} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200">
                              {effectiveDocName ? effectiveDocName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                            </div>
                          )}
                          <div>
                            <p className="font-black text-slate-900">{effectiveDocName}</p>
                            <p className="text-[10px] text-indigo-600 font-bold">{doc.specialty || 'Physician'} {pd.isPrimary ? '• Primary' : ''}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-md">Doctor</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3">
                      {docAvatar ? (
                        <img src={getAvatarSrc(docAvatar)} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-200">
                          {docName !== 'Not assigned' ? docName.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR'}
                        </div>
                      )}
                      <div>
                        <p className="font-black text-slate-900">{docName}</p>
                        <p className="text-[10px] text-indigo-600 font-bold">{docSpecialty} • Primary</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-extrabold rounded-md">Doctor</span>
                  </div>
                )}

                {/* Nurses List */}
                {patientNurses.map((pn: any, idx: number) => {
                  const nurse = pn.nurse || {};
                  const nurseAvatar = nurse.avatar || '';
                  const nurseName = nurse.name || 'Assigned Nurse';
                  return (
                    <div key={`pn-${idx}`} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        {nurseAvatar ? (
                          <img src={getAvatarSrc(nurseAvatar)} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-emerald-200">
                            {nurseName ? nurseName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'RN'}
                          </div>
                        )}
                        <div>
                          <p className="font-black text-slate-900">{nurseName}</p>
                          <p className="text-[10px] text-emerald-600 font-bold">{nurse.department || 'General Care'} • {pn.shift || nurse.shift || 'Staff Nurse'}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md">Nurse</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VITALS & TRENDS */}
      {activeTab === 'Vitals & Trends' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Vitals Monitoring & Historical Trends
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center"><p className="text-[11px] font-bold text-slate-400">BP</p><p className="text-lg font-black text-slate-900 mt-1">{displayPatient.bloodPressure || '128/82'}</p></div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center"><p className="text-[11px] font-bold text-slate-400">Heart Rate</p><p className="text-lg font-black text-slate-900 mt-1">{displayPatient.heartRate || '76 bpm'}</p></div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center"><p className="text-[11px] font-bold text-slate-400">SpO2</p><p className="text-lg font-black text-slate-900 mt-1">{displayPatient.spO2 || '98%'}</p></div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center"><p className="text-[11px] font-bold text-slate-400">Temp</p><p className="text-lg font-black text-slate-900 mt-1">{displayPatient.temperature || '98.6°F'}</p></div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center"><p className="text-[11px] font-bold text-slate-400">Blood Sugar</p><p className="text-lg font-black text-slate-900 mt-1">{displayPatient.bloodSugar || '112 mg/dL'}</p></div>
          </div>
        </div>
      )}

      {/* TAB 7: DOCUMENTS */}
      {activeTab === 'Documents' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs font-sans">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-indigo-600" />
                Patient Documents & Storage Library
              </h3>
              <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                Isolated files stored under <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold">Files/Patient/&#123;PatientId&#125;/&#123;DocumentType&#125;/</code>
              </p>
            </div>
            <button
              onClick={() => {
                setDocError('');
                setDocSuccess('');
                setShowDocUploadModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-all active:scale-95"
            >
              <Upload className="h-4 w-4" /> Upload New Document
            </button>
          </div>

          <div className="space-y-3">
            {patientDocs.length > 0 ? (
              patientDocs.map((doc: any, i: number) => {
                const resolvedId = displayPatient.id || displayPatient.patientIdCode || patientId;
                const fileDownloadUrl = `/api/patients/${resolvedId}/documents/${doc.documentType || 'MedicalDocuments'}/${doc.fileName || doc.documentName}`;

                return (
                  <div key={doc.id || i} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl border border-slate-200 flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-slate-900 font-extrabold text-sm">{doc.fileName || doc.documentName}</p>
                          <span className={`px-2 py-0.5 text-[10px] font-black rounded-lg border ${
                            doc.documentType === 'ProfilePicture'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : doc.documentType === 'OtherDocuments'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}>
                            {doc.documentType || 'MedicalDocuments'}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          {doc.fileSizeText || '1.2 MB'} • Uploaded {doc.uploadedDate || 'Today'} • Path: <span className="font-mono text-[10px] text-slate-600">{doc.filePath || `Patient/${resolvedId}/${doc.documentType || 'MedicalDocuments'}/${doc.fileName}`}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={fileDownloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-bold transition-all shadow-2xs"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download</span>
                      </a>

                      <button
                        onClick={() => handleDeleteDocument(doc.id || doc.fileName, doc.fileName || doc.documentName)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                        title="Delete Document"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                <FileText className="h-8 w-8 text-slate-300 mx-auto" />
                <p className="text-slate-500 font-bold">No documents uploaded for this patient yet.</p>
                <p className="text-slate-400 text-xs">Click "Upload New Document" above to upload files into the patient's isolated storage folder.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 8: APPOINTMENTS */}
      {activeTab === 'Appointments' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              Scheduled Appointments & Consultations
            </h3>
            <button onClick={() => setShowApptModal(true)} className="px-3.5 py-1.5 bg-indigo-600 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs">
              + Schedule Appointment
            </button>
          </div>

          <div className="space-y-3">
            {apptsList.map((app) => (
              <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between font-bold">
                <div>
                  <h4 className="text-slate-900 text-sm font-black">{app.type}</h4>
                  <p className="text-slate-500 text-[11px] mt-0.5">With {app.doctor} • {app.date}</p>
                </div>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-extrabold">{app.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: TASKS & NOTES */}
      {activeTab === 'Tasks & Notes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
          
          {/* Notes Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 min-w-0">
                <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="truncate">Clinical Notes Feed</span>
              </h3>
              <button
                onClick={() => setShowNoteModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs shrink-0 active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Note</span>
              </button>
            </div>

            <div className="space-y-3">
              {notesList.length > 0 ? (
                notesList.map((n) => (
                  <div key={n.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-indigo-700 font-extrabold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                        {n.author}
                      </span>
                      <span className="text-slate-400 font-semibold">{n.date}</span>
                    </div>
                    <p className="text-slate-800 font-medium leading-relaxed pt-0.5">{n.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 italic">No notes logged for this patient.</div>
              )}
            </div>
          </div>

          {/* Tasks Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2 min-w-0">
                <CheckSquare className="h-4 w-4 text-indigo-600 shrink-0" />
                <span className="truncate">Assigned Nursing Tasks</span>
              </h3>
              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs shrink-0 active:scale-95 transition-all"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Task</span>
              </button>
            </div>

            <div className="space-y-3">
              {tasksList.length > 0 ? (
                tasksList.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-2xl border border-slate-200 flex items-center justify-between gap-3 font-semibold">
                    <div className="space-y-0.5 min-w-0">
                      <p className={`text-slate-900 font-black text-sm ${t.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">Assigned: <strong className="text-slate-700">{t.assignedTo}</strong> • Due: {t.dueDate}</p>
                    </div>
                    <button
                      onClick={() => handleToggleTaskStatus(t.id)}
                      className={`px-3 py-1 rounded-xl text-[11px] font-extrabold border cursor-pointer shrink-0 transition-all active:scale-95 ${
                        t.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                      title="Click to toggle task status"
                    >
                      {t.status}
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 italic">No assigned tasks logged for this patient.</div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 10: HISTORY */}
      {activeTab === 'History' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs">
          <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-indigo-600" />
            Patient Audit & Activity Timeline Log
          </h3>

          <div className="space-y-4">
            {[
              { title: 'Patient Profile Created', date: 'Apr 15, 2024 09:00 AM', by: 'System Administrator' },
              { title: 'Vitals Recorded (BP: 128/82 mmHg)', date: 'May 18, 2024 10:30 AM', by: 'Nurse Emily Clark' },
              { title: 'Medication Lisinopril Prescribed', date: 'May 19, 2024 02:15 PM', by: 'Dr. Sarah Wilson' }
            ].map((hist, i) => (
              <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">{hist.title}</p>
                  <p className="text-slate-500 text-[11px]">{hist.date} • Logged by {hist.by}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK ACTION MODALS */}

      {/* 1. Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Add Clinical Progress Note</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNoteSubmit} className="space-y-4 text-xs font-semibold">
              <textarea
                rows={4}
                required
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Enter nursing shift observation or physician note..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" disabled={isSavingNote} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md cursor-pointer disabled:opacity-50">
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Schedule Appointment Modal */}
      {showApptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Schedule New Appointment</h3>
              <button onClick={() => setShowApptModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddApptSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Attending Doctor</label>
                <input type="text" value={apptDoctor} onChange={(e) => setApptDoctor(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Appointment Type</label>
                <input type="text" value={apptType} onChange={(e) => setApptType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Date & Time</label>
                <input type="text" placeholder="May 28, 2024 11:00 AM" value={apptDate} onChange={(e) => setApptDate(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowApptModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md">Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Create Care Task</h3>
              <button onClick={() => setShowTaskModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTaskSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Task Title</label>
                <input type="text" required placeholder="e.g. Check vital signs at 02:00 PM" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" disabled={isSavingTask} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md cursor-pointer disabled:opacity-50">
                  {isSavingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Prescription Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Pill className="h-4 w-4 text-indigo-600" />
                Add New Prescription
              </h3>
              <button onClick={() => setShowPrescriptionModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddPrescriptionSubmit} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Medication Name & Strength <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amoxicillin 500mg"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Dosage & Route</label>
                <input
                  type="text"
                  placeholder="e.g. 1 capsule orally"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Frequency</label>
                <select
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 cursor-pointer"
                >
                  <option value="Once Daily">Once Daily (QD)</option>
                  <option value="Twice Daily">Twice Daily (BID)</option>
                  <option value="Three Times Daily">Three Times Daily (TID)</option>
                  <option value="Four Times Daily">Four Times Daily (QID)</option>
                  <option value="As Needed (PRN)">As Needed (PRN)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Prescribing Doctor</label>
                <input
                  type="text"
                  value={newMedDoctor}
                  onChange={(e) => setNewMedDoctor(e.target.value)}
                  placeholder="Doctor Name"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingMed}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingMed ? 'Saving...' : 'Save Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Upload Patient Document Modal */}
      {showDocUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Upload className="h-4 w-4 text-indigo-600" />
                Upload Patient File / Document
              </h3>
              <button onClick={() => setShowDocUploadModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {docError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded-xl">
                {docError}
              </div>
            )}

            {docSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl">
                {docSuccess}
              </div>
            )}

            <form onSubmit={handleUploadDocumentSubmit} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Document Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={uploadDocCategory}
                  onChange={(e) => setUploadDocCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white text-slate-900 cursor-pointer font-bold"
                >
                  <option value="MedicalDocuments">MedicalDocuments (Blood tests, Prescriptions, Reports, Scans)</option>
                  <option value="OtherDocuments">OtherDocuments (Insurance, Referrals, ID documents)</option>
                  <option value="ProfilePicture">ProfilePicture (Patient profile avatar image)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  Saved under: Files/Patient/&#123;PatientId&#125;/{uploadDocCategory}/
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Select File <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setUploadFile(f);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-extrabold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Supported formats: PDF, JPG, PNG, DOCX, CSV, TXT (Max 15MB)
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isUploadingDoc ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDetailsPage;
