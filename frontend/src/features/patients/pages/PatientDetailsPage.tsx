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
  X
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { api } from '@/lib/api';

export const PatientDetailsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Action Modals State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notesList, setNotesList] = useState<any[]>([
    { id: 1, author: 'Dr. Sarah Wilson', date: 'May 20, 2024 10:15 AM', content: 'Patient reported stable chest pain levels. Continue current Lisinopril dosage.' },
    { id: 2, author: 'Nurse Emily Clark', date: 'May 19, 2024 04:30 PM', content: 'Vitals recorded. Blood pressure slightly elevated at 135/88. Recommended rest.' }
  ]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
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
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocCategory, setUploadDocCategory] = useState<string>('MedicalDocuments');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState('');

  const getAvatarSrc = (url?: string) => {
    if (!url) return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return `http://localhost:5231${url}`;
    return `http://localhost:5231/${url}`;
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

  useEffect(() => {
    if (patientId) {
      api.getPatientById(patientId)
        .then((data) => {
          if (data) {
            setPatient(data);
            const resolvedId = data.id || data.patientIdCode || patientId;
            loadDocuments(resolvedId);
          }
        })
        .catch(() => {
          api.getPatients()
            .then((list) => {
              if (list && list.length > 0) {
                setPatient(list[0]);
                const resolvedId = list[0].id || list[0].patientIdCode;
                loadDocuments(resolvedId);
              }
            });
        });
    }
  }, [patientId]);

  const displayPatient = patient || {
    id: patientId || 'P-0001',
    patientIdCode: 'PT-10001',
    mrn: 'MRN-2026-10001',
    name: 'Patient Profile',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    ageGender: '67 / Female',
    dob: '1956-05-14',
    phone: '(555) 123-4567',
    email: 'patient@email.com',
    address: '123 Maple Street, Springfield, IL 62704',
    careUnit: 'Cardiology Unit',
    floorRoom: '3rd Floor - 301',
    primaryDoctorName: 'Dr. Sarah Wilson',
    primaryDoctorSpecialty: 'Cardiology',
    primaryDoctorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    status: 'InCare',
    riskLevel: 'High',
    admissionDate: 'Apr 15, 2024',
    careDays: 35,
    dischargePlan: 'Scheduled for May 28',
    bloodPressure: '128/82 mmHg',
    heartRate: '76 bpm',
    bloodSugar: '112 mg/dL',
    temperature: '98.6 °F',
    spO2: '98 %',
    allergies: 'Penicillin, Sulfa drugs, Latex',
    medicalConditions: 'Hypertension, Diabetes Type 2, Cardiac Arrhythmia',
    currentMedications: 'Metformin 500mg, Lisinopril 10mg, Aspirin 81mg',
    pastMedicalHistory: 'Coronary artery stent (2020), Appendectomy (2015)',
    insuranceProvider: 'HealthPlus Insurance',
    insurancePolicyNumber: 'HP987654321',
    insuranceGroupNumber: 'GRP1122',
    insuranceValidUntil: '2026-12-31',
    emergencyContactName: 'James Brown',
    emergencyContactRelationship: 'Son',
    emergencyContactPhone: '(555) 987-6543'
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
  const docName = displayPatient.primaryDoctorName || displayPatient.primaryDoctor?.name || 'Dr. Sarah Wilson';
  const docAvatar = displayPatient.primaryDoctorAvatar || displayPatient.primaryDoctor?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80';
  const docSpecialty = displayPatient.primaryDoctorSpecialty || displayPatient.primaryDoctor?.specialty || 'Cardiology / Emergency Medicine';

  // Helper bindings for allergies & conditions array parsing
  const allergiesList = typeof displayPatient.allergies === 'string' && displayPatient.allergies.trim()
    ? displayPatient.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const conditionsList = typeof displayPatient.medicalConditions === 'string' && displayPatient.medicalConditions.trim()
    ? displayPatient.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const medicationsList = typeof displayPatient.currentMedications === 'string' && displayPatient.currentMedications.trim()
    ? displayPatient.currentMedications.split(',').map((s: string) => s.trim()).filter(Boolean)
    : [];

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 67;
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : 67;
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

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    const newNote = {
      id: Date.now(),
      author: 'Current User',
      date: new Date().toLocaleString(),
      content: noteText.trim()
    };
    setNotesList([newNote, ...notesList]);
    setNoteText('');
    setShowNoteModal(false);
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    const newTask = {
      id: Date.now(),
      title: taskTitle.trim(),
      assignedTo: 'Assigned Staff',
      dueDate: 'Today 05:00 PM',
      status: 'Pending'
    };
    setTasksList([newTask, ...tasksList]);
    setTaskTitle('');
    setShowTaskModal(false);
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
            <img
              src={getAvatarSrc(displayPatient.avatar)}
              alt={displayPatient.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-slate-100"
            />
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
              <div><span className="text-slate-400">Age / Gender:</span> <p className="font-bold text-slate-900">{displayPatient.ageGender || `${calculateAge(displayPatient.dob)} YRS / ${displayPatient.gender}`}</p></div>
              <div><span className="text-slate-400">Date of Birth:</span> <p className="font-bold text-slate-900">{displayPatient.dob || "Oct 12, 1956"}</p></div>
              <div><span className="text-slate-400">Phone:</span> <p className="font-bold text-slate-900">{displayPatient.phone || "(555) 123-4567"}</p></div>
              <div><span className="text-slate-400">Email:</span> <p className="font-bold text-slate-900">{displayPatient.email || "N/A"}</p></div>
            </div>

            <div className="pt-1.5 text-slate-600">
              <span className="text-slate-400">Care Unit & Room:</span> <span className="font-extrabold text-indigo-700">{displayPatient.careUnit || 'General Ward'}, {displayPatient.floorRoom || 'Room 101'}</span>
            </div>
          </div>
        </div>

        {/* Right Side Cards (Doctor, Risk Level, Allergies) */}
        <div className="flex flex-wrap lg:flex-nowrap gap-3 shrink-0 w-full lg:w-auto">
          
          {/* Primary Doctor Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs space-y-1 min-w-[160px] flex-1 lg:flex-initial">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Primary Doctor</p>
            <div className="flex items-center gap-2.5 pt-1">
              <img src={docAvatar} alt={docName} className="h-8 w-8 rounded-full object-cover border border-slate-200" />
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
            <p className="text-[10px] font-semibold text-slate-400 pt-1">Last visit: {displayPatient.lastVisit || 'May 18, 2024'}</p>
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
                <span className="font-bold text-slate-800">{displayPatient.admissionDate || "Apr 15, 2024"}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 font-semibold">
                <span className="text-slate-500">Days in Care</span>
                <span className="font-bold text-slate-800">{displayPatient.careDays || 35} Days</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 font-semibold">
                <span className="text-slate-500">Discharge Schedule</span>
                <span className="font-bold text-slate-800">{displayPatient.dischargePlan || "Scheduled"}</span>
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
            Comprehensive Medical & Clinical Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm text-indigo-700">Diagnosed Medical Conditions</h4>
              {conditionsList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditionsList.map((c: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white border border-indigo-200 text-indigo-800 font-extrabold rounded-xl shadow-2xs">{c}</span>
                  ))}
                </div>
              ) : <p className="text-slate-400">None reported</p>}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h4 className="font-extrabold text-slate-900 text-sm text-rose-700">Allergies & Sensitivities</h4>
              {allergiesList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allergiesList.map((a: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-800 font-extrabold rounded-xl shadow-2xs">{a}</span>
                  ))}
                </div>
              ) : <p className="text-slate-400">No known allergies</p>}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Past Medical & Surgical History</h4>
              <p className="text-slate-700 bg-white p-3 rounded-xl border border-slate-200">{displayPatient.pastMedicalHistory || 'No past surgical history logged.'}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="font-extrabold text-slate-900 text-sm">Emergency Contact Information</h4>
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                <p><span className="text-slate-400">Contact Person:</span> <strong className="text-slate-900">{displayPatient.emergencyContactName || 'James Brown'}</strong></p>
                <p><span className="text-slate-400">Relationship:</span> <strong className="text-slate-900">{displayPatient.emergencyContactRelationship || 'Son'}</strong></p>
                <p><span className="text-slate-400">Phone:</span> <strong className="text-slate-900">{displayPatient.emergencyContactPhone || '(555) 987-6543'}</strong></p>
              </div>
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

          <div className="space-y-3">
            {[
              { title: 'Inpatient Cardiology Consultation', date: 'May 18, 2024', doctor: docName, status: 'Finalized' },
              { title: 'Routine Lab Work & Metabolic Panel', date: 'May 10, 2024', doctor: 'Lab Corp', status: 'Completed' },
              { title: 'Chest X-Ray & Imaging Report', date: 'Apr 28, 2024', doctor: 'Radiology Dept', status: 'Finalized' }
            ].map((rec, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{rec.title}</h4>
                  <p className="text-slate-500 font-semibold mt-0.5">Date: {rec.date} • Attending: {rec.doctor}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-xl text-xs">{rec.status}</span>
              </div>
            ))}
          </div>
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
              <h4 className="font-extrabold text-slate-900 text-sm">Assigned Care Team</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                  <img src={docAvatar} className="h-8 w-8 rounded-full object-cover" />
                  <div><p className="font-black text-slate-900">{docName}</p><p className="text-[10px] text-indigo-600 font-bold">{docSpecialty}</p></div>
                </div>
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
                const fileDownloadUrl = `http://localhost:5231/api/patients/${resolvedId}/documents/${doc.documentType || 'MedicalDocuments'}/${doc.fileName || doc.documentName}`;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          
          {/* Notes Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Clinical Notes Feed
              </h3>
              <button onClick={() => setShowNoteModal(true)} className="px-3 py-1 bg-indigo-600 text-white font-extrabold rounded-lg text-xs cursor-pointer">
                + Note
              </button>
            </div>

            <div className="space-y-3">
              {notesList.map((n) => (
                <div key={n.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-indigo-700">{n.author}</span>
                    <span className="text-slate-400">{n.date}</span>
                  </div>
                  <p className="text-slate-800 font-semibold">{n.content}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tasks Feed */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
                Assigned Nursing Tasks
              </h3>
              <button onClick={() => setShowTaskModal(true)} className="px-3 py-1 bg-indigo-600 text-white font-extrabold rounded-lg text-xs cursor-pointer">
                + Task
              </button>
            </div>

            <div className="space-y-3">
              {tasksList.map((t) => (
                <div key={t.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-bold">
                  <div>
                    <p className="text-slate-900 font-black">{t.title}</p>
                    <p className="text-[11px] text-slate-400">Assigned: {t.assignedTo} • Due: {t.dueDate}</p>
                  </div>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[10px] font-extrabold">{t.status}</span>
                </div>
              ))}
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
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md">Save Note</button>
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
                <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md">Create Task</button>
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
