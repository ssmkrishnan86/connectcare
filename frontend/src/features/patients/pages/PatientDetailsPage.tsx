import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
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
  TrendingUp,
  X,
  FileEdit,
  Trash2
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { DateTimePickerInput } from '@/components/common/DateTimePickerInput';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import {
  formatDateMMDDYYYY,
  formatDateTimeMMDDYYYY
} from '../../../lib/utils';

export const PatientDetailsPage: React.FC = () => {
  const { user } = useAuth();
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();

  const [patient, setPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Action Modals State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [notesList, setNotesList] = useState<any[]>([]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const [tasksList, setTasksList] = useState<any[]>([]);

  const [showApptModal, setShowApptModal] = useState(false);
  const [apptDoctor, setApptDoctor] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptType, setApptType] = useState('Follow-up Consultation');
  const [apptsList, setApptsList] = useState<any[]>([]);
  const [isSavingAppt, setIsSavingAppt] = useState(false);
  const [showEditApptModal, setShowEditApptModal] = useState(false);
  const [editApptId, setEditApptId] = useState('');
  const [editApptDoctor, setEditApptDoctor] = useState('');
  const [editApptDate, setEditApptDate] = useState('');
  const [editApptType, setEditApptType] = useState('Follow-up Consultation');
  const [editApptStatus, setEditApptStatus] = useState('Scheduled');

  // Prescription Modal State
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [newMedDoctor, setNewMedDoctor] = useState('');
  const [isSavingMed, setIsSavingMed] = useState(false);

  // Document Upload State
  const [patientDocs, setPatientDocs] = useState<any[]>([]);
  const [clinicalEncounters, setClinicalEncounters] = useState<any[]>([]);
  const [showDocUploadModal, setShowDocUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocCategory, setUploadDocCategory] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [docError, setDocError] = useState('');
  const [docSuccess, setDocSuccess] = useState('');

  // Clinical Encounter Modal State
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showEditEncounterModal, setShowEditEncounterModal] = useState(false);
  const [editEncounterId, setEditEncounterId] = useState('');
  const [editEncounterType, setEditEncounterType] = useState('');
  const [editEncounterReason, setEditEncounterReason] = useState('');
  const [editEncounterProvider, setEditEncounterProvider] = useState('');
  const [editEncounterDate, setEditEncounterDate] = useState('');
  const [newEncounterType, setNewEncounterType] = useState('');
  const [newEncounterReason, setNewEncounterReason] = useState('');
  const [newEncounterProvider, setNewEncounterProvider] = useState('');
  const [isSavingEncounter, setIsSavingEncounter] = useState(false);

  // Vitals Update Modal & Trends Graph State
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [vitalBp, setVitalBp] = useState('');
  const [vitalHr, setVitalHr] = useState('');
  const [vitalBs, setVitalBs] = useState('');
  const [vitalTemp, setVitalTemp] = useState('');
  const [vitalSpo2, setVitalSpo2] = useState('');
  const [vitalRespiratoryRate, setVitalRespiratoryRate] = useState('');
  const [vitalTimeText, setVitalTimeText] = useState('');
  const [vitalDateText, setVitalDateText] = useState('');
  const [vitalNurseName, setVitalNurseName] = useState('');
  const [isSavingVitals, setIsSavingVitals] = useState(false);

  // Vitals Trend Graph & Multi-record State
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [vitalsTrendsSummary, setVitalsTrendsSummary] = useState<any>(null);
  const [vitalsChartMetric, setVitalsChartMetric] = useState<'bp' | 'hr' | 'spo2' | 'temp' | 'sugar' | 'all'>('bp');
  const [vitalsTimeRange, setVitalsTimeRange] = useState<'24h' | '7d' | 'all'>('24h');

  // Care Plan State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [newGoalText, setNewGoalText] = useState('');
  const [carePlanData, setCarePlanData] = useState<any>(null);
  const [careGoalsList, setCareGoalsList] = useState<string[]>([
    'Maintain blood pressure under 130/80 mmHg',
    'Daily physical therapy mobility exercises',
    'Low-sodium cardiac diet adherence'
  ]);
  const [completedGoals, setCompletedGoals] = useState<Record<number, boolean>>({ 0: true });

  // History State
  const [historyEvents, setHistoryEvents] = useState<any[]>([]);

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

  const loadCarePlan = (pId: string) => {
    api.getPatientCarePlan(pId)
      .then((res: any) => {
        const data = res?.data || res;
        if (data) {
          setCarePlanData(data);
          if (Array.isArray(data.goals) && data.goals.length > 0) {
            setCareGoalsList(data.goals);
          }
        }
      })
      .catch((err) => console.log('Failed to fetch patient care plan:', err));
  };

  const loadVitals = (pId: string) => {
    api.getPatientVitals(pId)
      .then((res: any) => {
        const data = res?.data || res;
        if (data?.history && Array.isArray(data.history)) {
          setVitalsHistory(data.history);
        }
        if (data?.trends) {
          setVitalsTrendsSummary(data.trends);
        }
      })
      .catch((err) => console.log('Failed to fetch patient vitals history:', err));
  };

  const formattedChartData = useMemo(() => {
  if (!vitalsHistory || vitalsHistory.length === 0) return [];

  let filtered = [...vitalsHistory];

  if (vitalsTimeRange === '24h' && filtered.length > 8) {
    filtered = filtered.slice(-8);
  } else if (vitalsTimeRange === '7d' && filtered.length > 20) {
    filtered = filtered.slice(-20);
  }

  return filtered
    .map((item: any, idx: number) => {
      const bpStr = String(item.bloodPressure || '').trim();

      const parts = bpStr.split('/');
      const sys =
        item.systolic ??
        (parts.length > 0 && parts[0].trim()
          ? parseInt(parts[0].replace(/\D/g, ''), 10)
          : null);

      const dia =
        item.diastolic ??
        (parts.length > 1 && parts[1].trim()
          ? parseInt(parts[1].replace(/\D/g, ''), 10)
          : null);

      const hr =
        item.heartRateVal ??
        (item.heartRate
          ? parseInt(String(item.heartRate).replace(/\D/g, ''), 10)
          : null);

      const spo2 =
        item.spO2Val ??
        (item.spO2
          ? parseInt(String(item.spO2).replace(/\D/g, ''), 10)
          : null);

      const sugar =
        item.bloodSugarVal ??
        (item.bloodSugar
          ? parseInt(String(item.bloodSugar).replace(/\D/g, ''), 10)
          : null);

      const temp =
        item.temperatureVal ??
        (item.temperature
          ? parseFloat(
              String(item.temperature).replace(/[^\d.]/g, '')
            )
          : null);

      // Do not render an empty/default telemetry record.
      const hasVitalData =
        sys != null ||
        dia != null ||
        hr != null ||
        spo2 != null ||
        sugar != null ||
        temp != null;

      if (!hasVitalData) {
        return null;
      }

      const timeLabel =
        item.timeText ||
        (item.createdDate
          ? new Date(item.createdDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          : `R${idx + 1}`);

      const dateLabel =
        item.dateText ||
        (item.createdDate
          ? new Date(item.createdDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          : '');

      return {
        name: timeLabel,
        fullLabel: `${dateLabel} ${timeLabel}`.trim(),
        systolic: sys,
        diastolic: dia,
        heartRate: hr,
        spO2: spo2,
        bloodSugar: sugar,
        temperature: temp,
        recordedBy: item.recordedBy || item.recordedByNurseName || '',
        status: item.status || ''
      };
    })
    .filter(Boolean);
}, [vitalsHistory, vitalsTimeRange]);


  const loadHistory = (pId: string) => {
    api.getPatientHistory(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw) && raw.length > 0) {
          setHistoryEvents(raw);
        }
      })
      .catch(() => {});
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

  const loadAppointments = (pId: string) => {
    api.getPatientAppointments(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setApptsList(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => console.log('Failed to fetch patient appointments:', err));
  };

  const loadNotes = (pId: string) => {
    api.getNurseDocumentations(undefined, undefined, undefined, undefined, pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(raw)) {
          const formatted = raw.map((d: any) => ({
            id: d.id,
            author: d.createdByName || d.createdBy || 'Staff Physician',
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
        if (Array.isArray(raw)) {
          const formatted = raw.map((t: any) => ({
            id: t.id,
            title: t.title || t.description || 'Care Task',
            assignedTo: t.assignedCaregiver || t.assigneeRole || 'Attending Staff',
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
            loadAppointments(resolvedId);
            loadNotes(resolvedId);
            loadTasks(resolvedId);
            loadAssignments(resolvedId);
            loadHistory(resolvedId);
            loadCarePlan(resolvedId);
            loadVitals(resolvedId);
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
                loadAppointments(resolvedId);
                loadNotes(resolvedId);
                loadTasks(resolvedId);
                loadAssignments(resolvedId);
                loadHistory(resolvedId);
                loadCarePlan(resolvedId);
                loadVitals(resolvedId);
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
    bloodPressure: '',
    heartRate: '',
    bloodSugar: '',
    temperature: '',
    spO2: '',
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
    if (!noteText.trim() || isSavingNote) return;

    setIsSavingNote(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    const pCode = displayPatient.patientIdCode || pId;
    const pName = displayPatient.name || 'Patient Profile';
    const authorName = user?.fullName || user?.username || docName || 'Attending Staff';
    const authorRole = user?.role || 'Staff';

    try {
      await api.createNurseDocumentation({
        patientId: pId && pId.includes('-') ? pId : undefined,
        patientIdCode: pCode,
        patientName: pName,
        documentName: 'Clinical Progress Note',
        documentCode: `NOTE-${Date.now().toString().slice(-4)}`,
        documentType: 'Care Note',
        createdByName: authorName,
        createdByRole: authorRole,
        notesContent: noteText.trim(),
        dateTimeText: formatDateTimeMMDDYYYY(new Date()),
        status: 'Completed'
      });
      loadNotes(pId);
    } catch (err) {
      console.error('Failed to create note via API:', err);
      const newNote = {
        id: Date.now(),
        author: authorName,
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
    if (!taskTitle.trim() || isSavingTask) return;

    setIsSavingTask(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    const pCode = displayPatient.patientIdCode || pId;
    const pName = displayPatient.name || 'Patient Profile';
    const caregiverName = displayPatient.assignedNurseName || 'Assigned Nurse';

    try {
      await api.createTask({
        patientId: pId && pId.includes('-') ? pId : undefined,
        patientIdCode: pCode,
        patientName: pName,
        title: taskTitle.trim(),
        description: taskTitle.trim(),
        assignedCaregiver: caregiverName,
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
        assignedTo: caregiverName,
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

  const handleAddApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    if (!pId || isSavingAppt) return;

    setIsSavingAppt(true);
    try {
      await api.createPatientAppointment(pId, {
        physicianName: apptDoctor || docName || user?.fullName || 'Attending Staff',
        consultationType: apptType || 'Follow-up Consultation',
        dateTimeText: apptDate || 'Tomorrow at 10:00 AM',
        status: 'Scheduled'
      });
      loadAppointments(pId);
      setShowApptModal(false);
      setApptDoctor('');
      setApptDate('');
      toast.success('Appointment scheduled successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule appointment');
    } finally {
      setIsSavingAppt(false);
    }
  };

  const handleDeleteAppointment = async (apptId: string) => {
    const confirmed = await confirm({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel / remove this appointment?',
      confirmText: 'Cancel Appointment',
      variant: 'danger',
    });
    if (!confirmed) return;

    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    if (pId) {
      try {
        await api.deleteConsultation(apptId);
        toast.success('Appointment cancelled successfully.');
        loadAppointments(pId);
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete appointment');
      }
    } else {
      setApptsList(apptsList.filter((a: any) => a.id !== apptId));
      toast.success('Appointment removed.');
    }
  };

  const handleOpenEditAppt = (app: any) => {
    setEditApptId(app.id);
    setEditApptDoctor(app.physicianName || app.doctor || '');
    setEditApptDate(app.dateTimeText || app.date || '');
    setEditApptType(app.consultationType || app.type || 'Follow-up Consultation');
    setEditApptStatus(app.status || 'Scheduled');
    setShowEditApptModal(true);
  };

  const handleUpdateApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    if (!editApptId || isSavingAppt) return;

    setIsSavingAppt(true);
    try {
      if (pId) {
        await api.updateConsultation(editApptId, {
          physicianName: editApptDoctor || docName || user?.fullName || 'Attending Staff',
          consultationType: editApptType || 'Follow-up Consultation',
          dateTimeText: editApptDate,
          status: editApptStatus
        });
        loadAppointments(pId);
      }
      toast.success('Appointment updated successfully.');
      setShowEditApptModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update appointment');
    } finally {
      setIsSavingAppt(false);
    }
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
    const confirmed = await confirm({
      title: 'Delete Document',
      message: `Are you sure you want to delete "${docName}"?`,
      confirmText: 'Delete Document',
      variant: 'danger',
    });
    if (!confirmed) return;

    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    try {
      await api.deletePatientDocument(pId, docId);
      toast.success(`Document "${docName}" deleted successfully.`);
      loadDocuments(pId);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete document.');
    }
  };

  const handleAddEncounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncounterReason.trim()) return;

    setIsSavingEncounter(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;

    try {
      await api.createPatientClinicalEncounter(pId, {
        encounterType: newEncounterType,
        reasonDiagnosis: newEncounterReason.trim(),
        providerName: newEncounterProvider || docName || user?.fullName || user?.username || 'Attending Staff',
        dateText: formatDateMMDDYYYY(new Date())
      });
      loadClinicalEncounters(pId);
      setNewEncounterReason('');
      toast.success('Clinical encounter recorded successfully.');
      setShowEncounterModal(false);
    } catch (err: any) {
      console.error('Failed to create encounter:', err);
      // Local fallback
      setClinicalEncounters([
        {
          id: Date.now(),
          encounterType: newEncounterType,
          reasonDiagnosis: newEncounterReason.trim(),
          providerName: newEncounterProvider || docName || user?.fullName || user?.username || 'Attending Staff',
          dateText: formatDateMMDDYYYY(new Date())
        },
        ...clinicalEncounters
      ]);
      toast.success('Clinical encounter recorded.');
      setShowEncounterModal(false);
    } finally {
      setIsSavingEncounter(false);
    }
  };

  const handleUpdateEncounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEncounterReason.trim() || !editEncounterId) return;

    setIsSavingEncounter(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;

    try {
      await api.updatePatientClinicalEncounter(pId, editEncounterId, {
        encounterType: editEncounterType,
        reasonDiagnosis: editEncounterReason.trim(),
        providerName: editEncounterProvider || docName || user?.fullName || user?.username || 'Attending Staff',
        dateText: editEncounterDate || formatDateMMDDYYYY(new Date())
      });
      loadClinicalEncounters(pId);
      toast.success('Clinical encounter updated successfully.');
      setShowEditEncounterModal(false);
    } catch (err: any) {
      console.error('Failed to update encounter:', err);
      toast.error(err?.message || 'Failed to update encounter.');
    } finally {
      setIsSavingEncounter(false);
    }
  };

  const handleDeleteEncounter = async (encounterId: string) => {
    const confirmed = await confirm({
      title: 'Delete Clinical Encounter',
      message: 'Are you sure you want to delete this clinical encounter?',
      confirmText: 'Delete Encounter',
      variant: 'danger',
    });
    if (!confirmed) return;

    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;

    try {
      await api.deletePatientClinicalEncounter(pId, encounterId);
      toast.success('Clinical encounter deleted successfully.');
      loadClinicalEncounters(pId);
    } catch (err: any) {
      console.error('Failed to delete encounter:', err);
      toast.error(err?.message || 'Failed to delete encounter.');
    }
  };

  const handleUpdateVitalsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVitals(true);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;

    try {
      await api.updatePatientVitals(pId, {
        bloodPressure: vitalBp,
        heartRate: vitalHr,
        bloodSugar: vitalBs,
        temperature: vitalTemp,
        spO2: vitalSpo2,
        respiratoryRate: vitalRespiratoryRate || '18 /min',
        recordedBy: vitalNurseName || displayPatient.assignedNurseName || 'Staff Nurse',
        timeText: vitalTimeText.trim() || undefined,
        dateText: vitalDateText.trim() || undefined
      });
      setPatient({
        ...displayPatient,
        bloodPressure: vitalBp,
        heartRate: vitalHr,
        bloodSugar: vitalBs,
        temperature: vitalTemp,
        spO2: vitalSpo2
      });
      loadVitals(pId);
      setShowVitalsModal(false);
    } catch (err: any) {
      console.error('Failed to update vitals:', err);
      setPatient({
        ...displayPatient,
        bloodPressure: vitalBp,
        heartRate: vitalHr,
        bloodSugar: vitalBs,
        temperature: vitalTemp,
        spO2: vitalSpo2
      });
      setShowVitalsModal(false);
    } finally {
      setIsSavingVitals(false);
    }
  };


  const handleAddGoalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalText.trim()) return;
    const updatedGoals = [...careGoalsList, newGoalText.trim()];
    setCareGoalsList(updatedGoals);
    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    if (pId) {
      try {
        await api.updatePatientCarePlan(pId, {
          planTitle: carePlanData?.planTitle || `${displayPatient.careUnit || 'Cardiology'} Comprehensive Individualized Care Plan`,
          goals: updatedGoals,
          interventions: carePlanData?.interventions || displayPatient.additionalNotes || 'Daily telemetry monitoring, cardiac diet, physical therapy 2x daily.',
          status: 'Active',
          progressPercentage: 75
        });
        loadCarePlan(pId);
      } catch (err) {
        console.error('Failed to persist care goal:', err);
      }
    }
    setNewGoalText('');
    setShowGoalModal(false);
  };

  const handleToggleCareGoal = (index: number) => {
    setCompletedGoals(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };


  const handleDeleteMedication = async (medIndex: number) => {
    const updatedList = medicationsList.filter((_: any, idx: number) => idx !== medIndex);
    const updatedStr = updatedList.join(', ');
    setPatient({
      ...displayPatient,
      currentMedications: updatedStr
    });

    const pId = displayPatient.id || displayPatient.patientIdCode || patientId;
    if (pId) {
      try {
        await api.updatePatient(pId, {
          ...displayPatient,
          currentMedications: updatedStr
        });
      } catch (err) {
        console.error('Failed to remove medication:', err);
      }
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
            {(() => {
              const raw = String(displayPatient.status || '').toLowerCase();
              let label = 'In Care';
              let badgeVariant: any = 'in-care';
              let badgeBg = 'bg-emerald-500';

              if (raw === '1' || raw === 'admitted') {
                label = 'Admitted';
                badgeVariant = 'admitted';
                badgeBg = 'bg-blue-500';
              } else if (raw === '2' || raw === 'discharged') {
                label = 'Discharged';
                badgeVariant = 'discharged';
                badgeBg = 'bg-purple-500';
              } else if (raw === '3' || raw === 'inactive') {
                label = 'Inactive';
                badgeVariant = 'inactive';
                badgeBg = 'bg-slate-500';
              }

              return (
                <span className={`absolute bottom-0 right-0 p-0.5 ${badgeBg} text-white rounded-full border-2 border-white shadow-xs`}>
                  <Badge variant={badgeVariant} className={`px-2 py-0.5 text-[10px] ${badgeBg} text-white border-none font-bold`}>
                    {label}
                  </Badge>
                </span>
              );
            })()}
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
                  <span className="font-extrabold text-slate-900">{displayPatient.bloodPressure || "--"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Heart Rate</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.heartRate || "--"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Blood Sugar</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.bloodSugar || "--"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">Temperature</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.temperature || "--"}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 font-semibold">
                  <span className="text-slate-600">SpO2 Oxygen</span>
                  <span className="font-extrabold text-slate-900">{displayPatient.spO2 || "--"}</span>
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
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Electronic Health Records & Encounter Logs
            </h3>
            <button
              onClick={() => setShowEncounterModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Encounter</span>
            </button>
          </div>

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

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditEncounterId(rec.id);
                        setEditEncounterType(rec.encounterType || 'Clinical Consultation');
                        setEditEncounterReason(rec.reasonDiagnosis || '');
                        setEditEncounterProvider(rec.providerName || '');
                        setEditEncounterDate(rec.dateText || '');
                        setShowEditEncounterModal(true);
                      }}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Encounter"
                    >
                      <FileEdit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteEncounter(rec.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Encounter"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-xl text-xs">
                      Recorded
                    </span>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold rounded-xl text-xs">Active</span>
                    <button
                      onClick={() => handleDeleteMedication(i)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                      title="Remove Medication"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
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
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs font-sans">
          {/* Care Plan Overview Banner */}
          <div className="p-5 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/40 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                  {carePlanData?.status || 'Active Plan'}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Review Due: <strong className="text-slate-900">{carePlanData?.reviewDate || '14 Days'}</strong>
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900">
                {carePlanData?.planTitle || `${displayPatient.careUnit || 'Cardiology'} Comprehensive Individualized Care Plan`}
              </h3>
              <p className="text-slate-600 font-medium text-[11px]">
                Primary Protocol: Low-sodium cardiac diet, continuous telemetry monitoring, and structured physical rehabilitation.
              </p>
            </div>

            {/* Progress Gauge */}
            <div className="w-full md:w-56 bg-white p-3.5 rounded-xl border border-indigo-100/80 shadow-2xs">
              <div className="flex justify-between items-center text-xs font-extrabold mb-1.5">
                <span className="text-slate-700">Plan Progress</span>
                <span className="text-indigo-600">{carePlanData?.progressPercentage || 75}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${carePlanData?.progressPercentage || 75}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-indigo-600" />
              Individualized Care Goals & Milestone Tracker
            </h4>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-2xs transition-all active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Goal</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Goals List with Toggleable Checkboxes */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                Active Clinical Goals ({careGoalsList.length})
              </h5>
              <div className="space-y-2.5">
                {careGoalsList.map((goal: string, gIdx: number) => {
                  const isDone = completedGoals[gIdx];
                  return (
                    <div
                      key={gIdx}
                      onClick={() => handleToggleCareGoal(gIdx)}
                      className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-50/60 border-emerald-200/80 text-slate-700'
                          : 'bg-white border-slate-200 text-slate-900 hover:border-indigo-300'
                      }`}
                    >
                      <button
                        type="button"
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 bg-slate-50 hover:border-indigo-500'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {goal}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                          {gIdx === 0 ? 'Cardiovascular' : gIdx === 1 ? 'Rehabilitation' : 'Nutrition & Lifestyle'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Interventions & Protocols */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                  Clinical Interventions & Protocols
                </h5>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-extrabold text-slate-900 text-xs">Continuous Telemetry Monitoring</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Maintain continuous ECG & SpO2 logging; notify attending physician if HR &gt; 100 or BP &gt; 140/90.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-extrabold text-slate-900 text-xs">Cardiac Low-Sodium Diet Protocol</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">&lt; 2,000 mg sodium daily; encourage hydration and monitor daily weight.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-extrabold text-slate-900 text-xs">Structured Mobility & PT</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">20-minute daily assisted walking; check vitals pre and post-session.</p>
                  </div>
                </div>
              </div>

              {/* Assigned Care Team */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-500">
                    Care Team
                  </h5>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    {displayPatient.careUnit || 'General Ward'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {patientDoctors.length > 0 ? (
                    patientDoctors.map((pd: any, idx: number) => {
                      const doc = pd.doctor || {};
                      const effectiveDocAvatar = doc.avatar || docAvatar;
                      const effectiveDocName = doc.name || docName;
                      return (
                        <div key={`pd-${idx}`} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                          {effectiveDocAvatar ? (
                            <img src={getAvatarSrc(effectiveDocAvatar)} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                              DR
                            </div>
                          )}
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 text-xs truncate">{effectiveDocName}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{doc.specialty || docSpecialty} • Primary</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                      {docAvatar ? (
                        <img src={getAvatarSrc(docAvatar)} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                          DR
                        </div>
                      )}
                      <div className="truncate">
                        <p className="font-extrabold text-slate-900 text-xs truncate">{docName}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">{docSpecialty} • Primary</p>
                      </div>
                    </div>
                  )}

                  {patientNurses.length > 0 ? (
                    patientNurses.map((pn: any, idx: number) => {
                      const nurse = pn.nurse || {};
                      const nurseAvatar = nurse.avatar || '';
                      const nurseName = nurse.name || displayPatient.assignedNurseName || 'Nurse Emily Clark';
                      return (
                        <div key={`pn-${idx}`} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                          {nurseAvatar ? (
                            <img src={getAvatarSrc(nurseAvatar)} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                              RN
                            </div>
                          )}
                          <div className="truncate">
                            <p className="font-extrabold text-slate-900 text-xs truncate">{nurseName}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{nurse.department || 'General Care'} • {pn.shift || 'Staff Nurse'}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                        RN
                      </div>
                      <div className="truncate">
                        <p className="font-extrabold text-slate-900 text-xs truncate">{displayPatient.assignedNurseName || 'Nurse Emily Clark'}</p>
                        <p className="text-[10px] text-slate-500 font-semibold">Staff Nurse • Day Shift</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* TAB 6: VITALS & TRENDS */}
      {activeTab === 'Vitals & Trends' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6 text-xs font-sans">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-600 animate-pulse" />
                Vitals Telemetry & Periodic Trend Analysis
              </h3>
              <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                Real-time hemodynamic telemetry, chronological rounds log, and automated multi-parameter graphing.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
                {(['24h', '7d', 'all'] as const).map((rng) => (
                  <button
                    key={rng}
                    onClick={() => setVitalsTimeRange(rng)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      vitalsTimeRange === rng
                        ? 'bg-white text-indigo-700 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {rng === '24h' ? '24 Hours' : rng === '7d' ? '7 Days' : 'All Rounds'}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const effectiveRecorder = user ? `${user.role === 'Doctor' ? 'Dr. ' : user.role === 'Nurse' ? 'Nurse ' : ''}${user.fullName || user.username}`.trim() : (displayPatient.assignedNurseName || 'Staff Provider');
                  setVitalBp(displayPatient.bloodPressure || '');
                  setVitalHr(displayPatient.heartRate || '');
                  setVitalBs(displayPatient.bloodSugar || '');
                  setVitalTemp(displayPatient.temperature || '');
                  setVitalSpo2(displayPatient.spO2 || '');
                  setVitalRespiratoryRate(displayPatient.respiratoryRate || '');
                  setVitalNurseName(effectiveRecorder);
                  setVitalTimeText(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                  setVitalDateText(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                  setShowVitalsModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Record Vitals</span>
              </button>
            </div>
          </div>

          {/* 5 Live Vitals Cards with Clinical Ranges */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Blood Pressure</p>
              <p className="text-xl font-black text-slate-900">{displayPatient.bloodPressure || '-- / -- mmHg'}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-md">
                Normal &lt; 130/80
              </span>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Heart Rate</p>
              <p className="text-xl font-black text-slate-900">{displayPatient.heartRate || '-- bpm'}</p>
              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-extrabold rounded-md">
                Optimal (60-100)
              </span>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">SpO2 Oxygen</p>
              <p className="text-xl font-black text-slate-900">{displayPatient.spO2 || '-- %'}</p>
              <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-md">
                Target &gt;= 95%
              </span>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Temperature</p>
              <p className="text-xl font-black text-slate-900">{displayPatient.temperature || '-- °F'}</p>
              <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold rounded-md">
                Afebrile 98.6°
              </span>
            </div>

            <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 text-center space-y-1">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase">Blood Sugar</p>
              <p className="text-xl font-black text-slate-900">{displayPatient.bloodSugar || '-- mg/dL'}</p>
              <span className="inline-block px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold rounded-md">
                Fasting 70-140
              </span>
            </div>
          </div>

          {/* INTERACTIVE TELEMETRY TREND GRAPH */}
          <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Hemodynamic Trends Chart
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Tracking {formattedChartData.length} periodic telemetry rounds over {vitalsTimeRange === '24h' ? 'last 24 hours' : vitalsTimeRange === '7d' ? 'last 7 days' : 'all recorded rounds'}
                  </p>
                </div>
              </div>

              {/* Metric Switcher Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 text-[11px] font-bold">
                <button
                  onClick={() => setVitalsChartMetric('bp')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vitalsChartMetric === 'bp'
                      ? 'bg-indigo-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Blood Pressure
                </button>
                <button
                  onClick={() => setVitalsChartMetric('hr')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vitalsChartMetric === 'hr'
                      ? 'bg-rose-500 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Heart Rate
                </button>
                <button
                  onClick={() => setVitalsChartMetric('spo2')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vitalsChartMetric === 'spo2'
                      ? 'bg-emerald-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  SpO2 Oxygen
                </button>
                <button
                  onClick={() => setVitalsChartMetric('sugar')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vitalsChartMetric === 'sugar'
                      ? 'bg-purple-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Blood Sugar
                </button>
                <button
                  onClick={() => setVitalsChartMetric('temp')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vitalsChartMetric === 'temp'
                      ? 'bg-amber-600 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Temperature
                </button>
                <button
                  onClick={() => setVitalsChartMetric('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    vitalsChartMetric === 'all'
                      ? 'bg-slate-900 text-white font-black shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Overview
                </button>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs h-72 w-full">
              {formattedChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {vitalsChartMetric === 'bp' ? (
                    <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSys" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorDia" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis domain={[50, 160]} stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', fontWeight: 600 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                      <ReferenceLine y={120} stroke="#4f46e5" strokeDasharray="3 3" label={{ value: 'Target Sys (120)', fill: '#4f46e5', fontSize: 10 }} />
                      <ReferenceLine y={80} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Target Dia (80)', fill: '#f43f5e', fontSize: 10 }} />
                      <Area type="monotone" name="Systolic (mmHg)" dataKey="systolic" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSys)" dot={{ r: 3.5, fill: '#4f46e5' }} />
                      <Area type="monotone" name="Diastolic (mmHg)" dataKey="diastolic" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDia)" dot={{ r: 3.5, fill: '#f43f5e' }} />
                    </AreaChart>
                  ) : vitalsChartMetric === 'hr' ? (
                    <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis domain={[50, 120]} stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                      <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Max Normal (100)', fill: '#ef4444', fontSize: 10 }} />
                      <ReferenceLine y={60} stroke="#3b82f6" strokeDasharray="3 3" label={{ value: 'Min Normal (60)', fill: '#3b82f6', fontSize: 10 }} />
                      <Area type="monotone" name="Heart Rate (bpm)" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHr)" dot={{ r: 4, fill: '#f43f5e' }} />
                    </AreaChart>
                  ) : vitalsChartMetric === 'spo2' ? (
                    <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSpo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis domain={[90, 100]} stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                      <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target SpO2 (>= 95%)', fill: '#10b981', fontSize: 10 }} />
                      <Area type="monotone" name="SpO2 Saturation (%)" dataKey="spO2" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpo2)" dot={{ r: 4, fill: '#10b981' }} />
                    </AreaChart>
                  ) : vitalsChartMetric === 'sugar' ? (
                    <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSugar" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis domain={[60, 180]} stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                      <ReferenceLine y={140} stroke="#8b5cf6" strokeDasharray="3 3" label={{ value: 'Post-Meal Max (140)', fill: '#8b5cf6', fontSize: 10 }} />
                      <Area type="monotone" name="Blood Sugar (mg/dL)" dataKey="bloodSugar" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSugar)" dot={{ r: 4, fill: '#8b5cf6' }} />
                    </AreaChart>
                  ) : vitalsChartMetric === 'temp' ? (
                    <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis domain={[96, 102]} stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                      <ReferenceLine y={98.6} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Normal (98.6 °F)', fill: '#f59e0b', fontSize: 10 }} />
                      <Area type="monotone" name="Body Temp (°F)" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTemp)" dot={{ r: 4, fill: '#f59e0b' }} />
                    </AreaChart>
                  ) : (
                    <LineChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} />
                      <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '11px', fontWeight: 600 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700 }} />
                      <Line type="monotone" name="Systolic BP" dataKey="systolic" stroke="#4f46e5" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" name="Diastolic BP" dataKey="diastolic" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" name="Heart Rate" dataKey="heartRate" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" name="Blood Sugar" dataKey="bloodSugar" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 font-semibold">
                  No telemetry records available for charting.
                </div>
              )}
            </div>

            {/* Telemetry Summary Analytics Footer */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Avg. Systolic / Diastolic</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {vitalsTrendsSummary?.totalRounds > 0 ? `${vitalsTrendsSummary.avgSystolic} / ${vitalsTrendsSummary.avgDiastolic} mmHg` : '-- / -- mmHg'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Avg. Heart Rate</p>
                <p className="text-sm font-black text-slate-900 mt-0.5">
                  {vitalsTrendsSummary?.totalRounds > 0 ? `${vitalsTrendsSummary.avgHeartRate} bpm (Min: ${vitalsTrendsSummary.minHeartRate}, Max: ${vitalsTrendsSummary.maxHeartRate})` : '-- bpm'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Avg. Oxygen (SpO2)</p>
                <p className="text-sm font-black text-emerald-600 mt-0.5">
                  {vitalsTrendsSummary?.totalRounds > 0 ? `${vitalsTrendsSummary.avgSpO2}% Optimal` : '-- %'}
                </p>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <p className="text-[10px] font-extrabold text-slate-400 uppercase">Stability Rating</p>
                <p className="text-sm font-black text-indigo-600 mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {vitalsTrendsSummary?.totalRounds > 0 ? (vitalsTrendsSummary.hemodynamicStatus || 'Stable Telemetry') : 'No Telemetry Recorded'}
                </p>
              </div>
            </div>
          </div>

          {/* Historical Telemetry Rounds Table */}
          <div className="space-y-3">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-600" />
              Chronological Telemetry Rounds Log ({formattedChartData.length} Rounds)
            </h4>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 font-extrabold text-slate-600 text-[11px]">
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Blood Pressure</th>
                    <th className="py-3 px-4">Heart Rate</th>
                    <th className="py-3 px-4">SpO2 Oxygen</th>
                    <th className="py-3 px-4">Temperature</th>
                    <th className="py-3 px-4">Blood Sugar</th>
                    <th className="py-3 px-4">Recorded By</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                  {formattedChartData.length > 0 ? (
                    formattedChartData.map((round: any, rIdx: number) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-extrabold text-slate-900 whitespace-nowrap">
                          {round.fullLabel || round.name}
                        </td>
                        <td className="py-3 px-4 font-black text-indigo-700">{round.systolic}/{round.diastolic} mmHg</td>
                        <td className="py-3 px-4">{round.heartRate} bpm</td>
                        <td className="py-3 px-4">{round.spO2} %</td>
                        <td className="py-3 px-4">{round.temperature} °F</td>
                        <td className="py-3 px-4">{round.bloodSugar} mg/dL</td>
                        <td className="py-3 px-4 text-slate-500">{round.recordedBy || 'Staff Nurse'}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold rounded-lg">
                            {round.status || 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-400 font-semibold italic">
                        No vital rounds recorded yet for this patient. A doctor, nurse, or admin can record vitals using "Record Vitals".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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

          {apptsList.length > 0 ? (
            <div className="space-y-3">
              {apptsList.map((app) => (
                <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between font-bold">
                  <div>
                    <h4 className="text-slate-900 text-sm font-black">{app.consultationType || app.type || 'Consultation'}</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">With {app.physicianName || app.doctor || 'Attending Staff'} • {app.dateTimeText || app.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl font-extrabold">{app.status || 'Scheduled'}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenEditAppt(app)}
                      className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit / Reschedule Appointment"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAppointment(app.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete / Cancel Appointment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400 font-semibold italic">No appointments scheduled.</div>
          )}
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
            {(historyEvents.length > 0
              ? historyEvents
              : [
                  { title: 'Patient Profile Created', date: 'Apr 15, 2024 09:00 AM', by: 'System Administrator' },
                  { title: `Vitals Recorded (BP: ${displayPatient.bloodPressure || '128/82 mmHg'})`, date: 'May 18, 2024 10:30 AM', by: displayPatient.assignedNurseName || 'Nurse Emily Clark' },
                  { title: `Medication Prescriptions Active (${displayPatient.currentMedications || 'Lisinopril'})`, date: 'May 19, 2024 02:15 PM', by: docName !== 'Not assigned' ? docName : 'Staff Physician' }
                ]
            ).map((hist: any, i: number) => (
              <div key={hist.id || i} className="flex items-start gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold">
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
                <DateTimePickerInput
                  value={apptDate}
                  onChange={(val) => setApptDate(val)}
                  placeholder="May 28, 2024 11:00 AM"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowApptModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" disabled={isSavingAppt} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md">
                  {isSavingAppt ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2B. Edit Appointment Modal */}
      {showEditApptModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm">Edit / Reschedule Appointment</h3>
              <button onClick={() => setShowEditApptModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateApptSubmit} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Attending Doctor</label>
                <input type="text" value={editApptDoctor} onChange={(e) => setEditApptDoctor(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Appointment Type</label>
                <input type="text" value={editApptType} onChange={(e) => setEditApptType(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Date & Time</label>
                <DateTimePickerInput
                  value={editApptDate}
                  onChange={(val) => setEditApptDate(val)}
                  placeholder="e.g. Sep 02, 2026 10:00 PM"
                />
              </div>
              <div>
                <label className="block text-slate-700 mb-1">Status</label>
                <select
                  value={editApptStatus}
                  onChange={(e) => setEditApptStatus(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Missed">Missed</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowEditApptModal(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold">Cancel</button>
                <button type="submit" disabled={isSavingAppt} className="px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md">
                  {isSavingAppt ? 'Saving...' : 'Update Appointment'}
                </button>
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
                  <option value="">Select Frequency</option>
                  <optgroup label="Specific Time of Day (Daily)">
                    <option value="Morning Only (QAM)">Morning Only (QAM)</option>
                    <option value="Afternoon Only (Midday)">Afternoon Only (Midday)</option>
                    <option value="Evening Only">Evening Only</option>
                    <option value="Night Only (Bedtime / QHS)">Night Only (Bedtime / QHS)</option>
                  </optgroup>
                  <optgroup label="Daily Combinations">
                    <option value="Morning & Night (BID)">Morning & Night (BID)</option>
                    <option value="Morning & Afternoon">Morning & Afternoon</option>
                    <option value="Afternoon & Night">Afternoon & Night</option>
                    <option value="Morning, Afternoon & Night (TID)">Morning, Afternoon & Night (TID)</option>
                    <option value="Four Times Daily (QID)">Four Times Daily (QID)</option>
                  </optgroup>
                  <optgroup label="Hourly Intervals">
                    <option value="Every 4 Hours (Q4H)">Every 4 Hours (Q4H)</option>
                    <option value="Every 6 Hours (Q6H)">Every 6 Hours (Q6H)</option>
                    <option value="Every 8 Hours (Q8H)">Every 8 Hours (Q8H)</option>
                    <option value="Every 12 Hours (Q12H)">Every 12 Hours (Q12H)</option>
                  </optgroup>
                  <optgroup label="Meal-Related">
                    <option value="Before Meals (AC)">Before Meals (AC)</option>
                    <option value="After Meals (PC)">After Meals (PC)</option>
                    <option value="With Meals">With Meals</option>
                    <option value="On Empty Stomach">On Empty Stomach</option>
                  </optgroup>
                  <optgroup label="Periodic & Extended">
                    <option value="Alternate Days (QOD)">Alternate Days (Every Other Day / QOD)</option>
                    <option value="Once Weekly (QW)">Once Weekly (QW)</option>
                    <option value="Twice Weekly">Twice Weekly</option>
                    <option value="Every 2 Weeks (Bi-weekly)">Every 2 Weeks (Bi-weekly)</option>
                    <option value="Once Monthly (QM)">Once Monthly (QM)</option>
                  </optgroup>
                  <optgroup label="Conditional & Urgent">
                    <option value="As Needed (PRN)">As Needed (PRN)</option>
                    <option value="Stat / Immediately (Single Dose)">Stat / Immediately (Single Dose)</option>
                  </optgroup>
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
                  <option value="">Select Category</option>
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

      {/* 6. Add Clinical Encounter Modal */}
      {showEncounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Add Clinical Encounter
              </h3>
              <button onClick={() => setShowEncounterModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEncounterSubmit} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Encounter Type</label>
                <select
                  value={newEncounterType}
                  onChange={(e) => setNewEncounterType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                >
                  <option value="">Select Encounter Type</option>
                  <option value="Clinical Consultation">Clinical Consultation</option>
                  <option value="Inpatient Review">Inpatient Review</option>
                  <option value="Emergency Evaluation">Emergency Evaluation</option>
                  <option value="Follow-up Checkup">Follow-up Checkup</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reason & Clinical Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record symptoms, diagnosis, or clinical observations..."
                  value={newEncounterReason}
                  onChange={(e) => setNewEncounterReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Attending Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Attending Physician"
                  value={newEncounterProvider}
                  onChange={(e) => setNewEncounterProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEncounterModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEncounter}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEncounter ? 'Saving...' : 'Record Encounter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Clinical Encounter Modal */}
      {showEditEncounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <FileEdit className="h-4 w-4 text-indigo-600" />
                Edit Clinical Encounter
              </h3>
              <button onClick={() => setShowEditEncounterModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateEncounterSubmit} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Encounter Type</label>
                <select
                  value={editEncounterType}
                  onChange={(e) => setEditEncounterType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                >
                  <option value="">Select Encounter Type</option>
                  <option value="Clinical Consultation">Clinical Consultation</option>
                  <option value="Inpatient Review">Inpatient Review</option>
                  <option value="Emergency Evaluation">Emergency Evaluation</option>
                  <option value="Follow-up Checkup">Follow-up Checkup</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Reason & Clinical Findings <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record symptoms, diagnosis, or clinical observations..."
                  value={editEncounterReason}
                  onChange={(e) => setEditEncounterReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Attending Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Attending Physician"
                  value={editEncounterProvider}
                  onChange={(e) => setEditEncounterProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Date</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={editEncounterDate}
                  onChange={(e) => setEditEncounterDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditEncounterModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEncounter}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEncounter ? 'Saving...' : 'Update Encounter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Record / Update Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Record Patient Vitals
              </h3>
              <button onClick={() => setShowVitalsModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVitalsSubmit} className="space-y-3 font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 24, 2026"
                    value={vitalDateText}
                    onChange={(e) => setVitalDateText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Time (Telemetry Round)</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM"
                    value={vitalTimeText}
                    onChange={(e) => setVitalTimeText(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Blood Pressure (BP)</label>
                <input
                  type="text"
                  placeholder="e.g. 120/80 mmHg"
                  value={vitalBp}
                  onChange={(e) => setVitalBp(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Heart Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. 72 bpm"
                    value={vitalHr}
                    onChange={(e) => setVitalHr(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">SpO2 Oxygen</label>
                  <input
                    type="text"
                    placeholder="e.g. 98 %"
                    value={vitalSpo2}
                    onChange={(e) => setVitalSpo2(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Temperature</label>
                  <input
                    type="text"
                    placeholder="e.g. 98.6 °F"
                    value={vitalTemp}
                    onChange={(e) => setVitalTemp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Blood Sugar</label>
                  <input
                    type="text"
                    placeholder="e.g. 110 mg/dL"
                    value={vitalBs}
                    onChange={(e) => setVitalBs(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Respiratory Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. 18 /min"
                    value={vitalRespiratoryRate}
                    onChange={(e) => setVitalRespiratoryRate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Recorded By (Nurse)</label>
                  <input
                    type="text"
                    placeholder="Nurse Emily Clark"
                    value={vitalNurseName}
                    onChange={(e) => setVitalNurseName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVitals}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingVitals ? 'Recording...' : 'Record Telemetry Round'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 8. Add Care Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Add Care Goal
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddGoalSubmit} className="space-y-4 font-semibold">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Goal Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Reduce resting heart rate below 75 bpm..."
                  value={newGoalText}
                  onChange={(e) => setNewGoalText(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:bg-white text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Add Goal
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
