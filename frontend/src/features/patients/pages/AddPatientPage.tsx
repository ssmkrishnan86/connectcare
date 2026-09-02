import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  User,
  Users,
  FileText,
  Upload,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Building2,
  FileCheck,
  Activity,
  Pill,
  Calendar,
  CheckSquare,
  Download,
  History as HistoryIcon,
  Save,
  Camera,
  TrendingUp,
  FileEdit,
  Edit,
  Trash2,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { DateTimePickerInput } from '@/components/common/DateTimePickerInput';
import { PhoneInput } from '@/components/common/PhoneInput';
import { isValidUSPhone, isValidEmail, formatDateMMDDYYYY, formatDateTimeMMDDYYYY, normalizeToISODate } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';


export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const { patientId } = useParams<{ patientId?: string }>();
  const isEditMode = Boolean(patientId);

  // Active Tab State
  const [activeEditTab, setActiveEditTab] = useState<string>('General & Demographics');

  // Loading & Doctors/Nurses State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [careUnits, setCareUnits] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fallbackCareUnits = [
    { name: 'Cardiology Unit', floor: '3rd Floor - 301' },
    { name: 'Med-Surg Unit 2', floor: '2nd Floor - 205' },
    { name: 'Emergency Department', floor: 'Ground Floor - ER1' },
    { name: 'General Ward', floor: '1st Floor - 104' },
    { name: 'ICU Unit', floor: '2nd Floor - 210' },
    { name: 'Neurology Unit', floor: '3rd Floor - 308' },
    { name: 'Pediatrics Unit', floor: '1st Floor - 112' },
  ];

  // 1. Demographics & Personal Details
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');

  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('');
  const [patientIdCode, setPatientIdCode] = useState('');
  const [mrn, setMrn] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Contact & Address
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('USA');

  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyIsPrimary, setEmergencyIsPrimary] = useState(true);

  // 2. Assignment & Medical Info
  const [careUnit, setCareUnit] = useState('');
  const [floorRoom, setFloorRoom] = useState('');
  const [status, setStatus] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [primaryPhysician, setPrimaryPhysician] = useState('');
  const [primaryDoctorId, setPrimaryDoctorId] = useState('');
  const [assignedNurse, setAssignedNurse] = useState('');
  const [assignedNurseId, setAssignedNurseId] = useState('');

  const [conditions, setConditions] = useState<string[]>([]);
  const [newConditionInput, setNewConditionInput] = useState('');

  const [allergies, setAllergies] = useState<string[]>([]);
  const [newAllergyInput, setNewAllergyInput] = useState('');


  const [currentMedications, setCurrentMedications] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');

  // Vitals State
  const [bloodPressure, setBloodPressure] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodSugar, setBloodSugar] = useState('');
  const [temperature, setTemperature] = useState('');
  const [spO2, setSpO2] = useState('');

  // 3. Insurance Details
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Clinical Sub-resources for Edit Mode
  const [clinicalEncounters, setClinicalEncounters] = useState<any[]>([]);
  const [encountersList, setEncountersList] = useState<any[]>([]);
  const [newEncounterType, setNewEncounterType] = useState('');
  const [newEncounterReason, setNewEncounterReason] = useState('');
  const [newEncounterProvider, setNewEncounterProvider] = useState('');
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [showEditEncounterModal, setShowEditEncounterModal] = useState(false);
  const [editEncounterId, setEditEncounterId] = useState('');
  const [editEncounterType, setEditEncounterType] = useState('');
  const [editEncounterReason, setEditEncounterReason] = useState('');
  const [editEncounterProvider, setEditEncounterProvider] = useState('');
  const [editEncounterDate, setEditEncounterDate] = useState('');
  const [isSavingEncounter, setIsSavingEncounter] = useState(false);

  // Prescriptions Sub-resource
  const [prescriptionsList, setPrescriptionsList] = useState<any[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [isSavingMed, setIsSavingMed] = useState(false);

  // Care Plan Sub-resource (No hardcoded default dummy data)
  const [careGoals, setCareGoals] = useState<string[]>([]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [careInterventions, setCareInterventions] = useState('');

  // Documents Sub-resource
  const [patientDocs, setPatientDocs] = useState<any[]>([]);
  const [uploadDocFile, setUploadDocFile] = useState<File | null>(null);
  const [uploadDocCategory, setUploadDocCategory] = useState<string>('');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Appointments Sub-resource
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [newApptDoctor, setNewApptDoctor] = useState('');
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptType, setNewApptType] = useState('Follow-up Consultation');
  const [showApptModal, setShowApptModal] = useState(false);
  const [isSavingAppt, setIsSavingAppt] = useState(false);
  const [showEditApptModal, setShowEditApptModal] = useState(false);
  const [editApptId, setEditApptId] = useState('');
  const [editApptDoctor, setEditApptDoctor] = useState('');
  const [editApptDate, setEditApptDate] = useState('');
  const [editApptType, setEditApptType] = useState('Follow-up Consultation');
  const [editApptStatus, setEditApptStatus] = useState('Scheduled');

  // Tasks & Notes Sub-resource
  const [notesList, setNotesList] = useState<any[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [tasksList, setTasksList] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Vitals Trends & Periodic Rounds Sub-resource
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [vitalsTrendsSummary, setVitalsTrendsSummary] = useState<any>(null);
  const [vitalsChartMetric, setVitalsChartMetric] = useState<'bp' | 'hr' | 'spo2' | 'temp' | 'sugar' | 'all'>('bp');
  const [vitalsTimeRange, setVitalsTimeRange] = useState<'24h' | '7d' | 'all'>('24h');
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [newVitalBp, setNewVitalBp] = useState('');
  const [newVitalHr, setNewVitalHr] = useState('');
  const [newVitalBs, setNewVitalBs] = useState('');
  const [newVitalTemp, setNewVitalTemp] = useState('');
  const [newVitalSpo2, setNewVitalSpo2] = useState('');
  const [newVitalRr, setNewVitalRr] = useState('');
  const [newVitalTime, setNewVitalTime] = useState('');
  const [newVitalDate, setNewVitalDate] = useState('');
  const [newVitalNurse, setNewVitalNurse] = useState('');
  const [isSavingVitalRound, setIsSavingVitalRound] = useState(false);

  // History Sub-resource
  const [historyList, setHistoryList] = useState<any[]>([]);

  const loadVitalsHistory = (pId: string) => {
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
      .catch(() => {});
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


  // Fetch Doctors, Nurses & Care Units
  useEffect(() => {
    api.getDoctors()
      .then((docList) => {
        if (docList && docList.length > 0) {
          setDoctors(docList);
        }
      })
      .catch((err) => console.error('Failed to fetch doctors:', err));

    api.getNurses()
      .then((nurseList) => {
        if (nurseList && nurseList.length > 0) {
          setNurses(nurseList);
          if (user?.role === 'Nurse' && !isEditMode) {
            const currentNurse = nurseList.find((n: any) => n.id === user.nurseId || n.userId === user.userId || n.name.toLowerCase() === (user.fullName || user.username).toLowerCase());
            if (currentNurse) {
              setAssignedNurse(currentNurse.name);
              setAssignedNurseId(currentNurse.id);
            }
          }
        }
      })
      .catch((err) => console.error('Failed to fetch nurses:', err));

    api.getLocations()
      .then((locList) => {
        if (locList && locList.length > 0) {
          const mapped = locList.map((loc: any) => ({
            name: loc.name,
            floor: loc.floor || `${loc.name} Room`,
          }));
          setCareUnits(mapped);
        } else {
          setCareUnits(fallbackCareUnits);
        }
      })
      .catch(() => setCareUnits(fallbackCareUnits));
  }, [user, isEditMode]);

  // Load Patient Details and Sub-resources if in Edit Mode
  const loadPatientData = (pId: string) => {
    setIsLoadingPatient(true);
    api.getPatientById(pId)
      .then((res) => {
        const p = (res && res.data) ? res.data : res;
        if (p) {
          if (p.firstName) setFirstName(p.firstName);
          else if (p.name) setFirstName(p.name.split(' ')[0] || p.name);

          if (p.lastName) setLastName(p.lastName);
          else if (p.name) setLastName(p.name.split(' ').slice(1).join(' ') || '');

          if (p.dob) setDob(normalizeToISODate(p.dob) || p.dob);
          if (p.gender) setGender(p.gender as 'Male' | 'Female' | 'Other');
          if (p.patientIdCode) setPatientIdCode(p.patientIdCode);
          if (p.mrn) setMrn(p.mrn);
          if (p.bloodType) setBloodType(p.bloodType);
          if (p.maritalStatus) setMaritalStatus(p.maritalStatus);
          if (p.avatar) setAvatarUrl(p.avatar);
          if (p.phone) setPhone(p.phone);
          if (p.email) setEmail(p.email);
          if (p.address) setAddress(p.address);
          if (p.city) setCity(p.city);
          if (p.state) setState(p.state);
          if (p.zipCode) setZipCode(p.zipCode);
          if (p.country) setCountry(p.country);

          if (p.emergencyContactName) setEmergencyName(p.emergencyContactName);
          if (p.emergencyContactRelationship) setEmergencyRelationship(p.emergencyContactRelationship);
          if (p.emergencyContactPhone) setEmergencyPhone(p.emergencyContactPhone);
          if (typeof p.emergencyContactIsPrimary === 'boolean') setEmergencyIsPrimary(p.emergencyContactIsPrimary);

          if (p.primaryDoctorName) setPrimaryPhysician(p.primaryDoctorName);
          if (p.primaryDoctorId) setPrimaryDoctorId(p.primaryDoctorId);
          else if (p.patientDoctors && p.patientDoctors.length > 0) {
            const pd = p.patientDoctors[0];
            if (pd.doctor?.name) setPrimaryPhysician(pd.doctor.name);
            if (pd.doctorId) setPrimaryDoctorId(pd.doctorId);
          }

          if (p.assignedNurseName) setAssignedNurse(p.assignedNurseName);
          if (p.assignedNurseId) setAssignedNurseId(p.assignedNurseId);
          else if (p.patientNurses && p.patientNurses.length > 0) {
            const pn = p.patientNurses[0];
            if (pn.nurse?.name) setAssignedNurse(pn.nurse.name);
            if (pn.nurseId) setAssignedNurseId(pn.nurseId);
          }

          if (p.careUnit) setCareUnit(p.careUnit);
          if (p.floorRoom) setFloorRoom(p.floorRoom);

          if (p.bloodPressure) setBloodPressure(p.bloodPressure);
          if (p.heartRate) setHeartRate(p.heartRate);
          if (p.bloodSugar) setBloodSugar(p.bloodSugar);
          if (p.temperature) setTemperature(p.temperature);
          if (p.spO2) setSpO2(p.spO2);

          const rawStatus = String(p.status);
          if (rawStatus === '0' || rawStatus === 'InCare' || rawStatus === 'In Care') setStatus('InCare');
          else if (rawStatus === '1' || rawStatus === 'Admitted') setStatus('Admitted');
          else if (rawStatus === '2' || rawStatus === 'Discharged') setStatus('Discharged');
          else setStatus('InCare');

          const rawRisk = String(p.riskLevel);
          if (rawRisk === '0' || rawRisk === 'Critical' || rawRisk === 'critical') setRiskLevel('Critical');
          else if (rawRisk === '1' || rawRisk === 'High' || rawRisk === 'high') setRiskLevel('High');
          else if (rawRisk === '2' || rawRisk === 'Medium' || rawRisk === 'medium') setRiskLevel('Medium');
          else if (rawRisk === '3' || rawRisk === 'Low' || rawRisk === 'low') setRiskLevel('Low');
          else setRiskLevel('High');

          if (p.medicalConditions) {
            const condArr = typeof p.medicalConditions === 'string'
              ? p.medicalConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
              : p.medicalConditions;
            setConditions(condArr);
          }
          if (p.allergies) {
            const allergyArr = typeof p.allergies === 'string'
              ? p.allergies.split(',').map((s: string) => s.trim()).filter(Boolean)
              : p.allergies;
            setAllergies(allergyArr);
          }

          if (p.currentMedications) {
            setCurrentMedications(p.currentMedications);
            const medArr = typeof p.currentMedications === 'string'
              ? p.currentMedications.split(',').map((s: string, idx: number) => ({ id: idx + 1, name: s.trim(), status: 'Active' })).filter((m: any) => m.name)
              : [];
            setPrescriptionsList(medArr);
          }

          setPastMedicalHistory(p.pastMedicalHistory || '');
          setInsuranceProvider(p.insuranceProvider || '');
          setPolicyNumber(p.insurancePolicyNumber || '');
          setGroupNumber(p.insuranceGroupNumber || '');
          setValidUntil(p.insuranceValidUntil || '');
          setAdditionalNotes(p.additionalNotes || '');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch patient for editing:', err);
        setErrorMsg('Failed to load patient details.');
      })
      .finally(() => setIsLoadingPatient(false));

    // Load sub-resources
    api.getPatientClinicalEncounters(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setClinicalEncounters(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});

    api.getPatientDocuments(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setPatientDocs(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});

    api.getPatientAppointments(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setAppointmentsList(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});

    api.getPatientHistory(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setHistoryList(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});

    api.getTasks(pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setTasksList(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});

    api.getNurseDocumentations(undefined, undefined, undefined, undefined, pId)
      .then((res: any) => {
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setNotesList(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {});

    loadVitalsHistory(pId);
  };


  const resetFormState = () => {
    setFirstName('');
    setLastName('');
    setDob('');
    setGender('Male');
    setPatientIdCode('');
    setMrn('');
    setBloodType('');
    setMaritalStatus('');
    setAvatarUrl('');
    setSelectedAvatarFile(null);
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('');
    setEmergencyName('');
    setEmergencyRelationship('');
    setEmergencyPhone('');
    setEmergencyIsPrimary(true);
    setPrimaryPhysician('');
    setPrimaryDoctorId('');
    setAssignedNurse('');
    setAssignedNurseId('');
    setCareUnit('');
    setFloorRoom('');
    setBloodPressure('');
    setHeartRate('');
    setBloodSugar('');
    setTemperature('');
    setSpO2('');
    setStatus('InCare');
    setRiskLevel('High');
    setConditions([]);
    setAllergies([]);
    setCurrentMedications('');
    setPastMedicalHistory('');
    setInsuranceProvider('');
    setPolicyNumber('');
    setGroupNumber('');
    setValidUntil('');
    setAdditionalNotes('');
    setEncountersList([]);
    setClinicalEncounters([]);
    setVitalsHistory([]);
    setPrescriptionsList([]);
    setCareGoals([]);
    setCareInterventions('');
    setAppointmentsList([]);
    setNotesList([]);
    setTasksList([]);
    setPatientDocs([]);
    setHistoryList([]);
    setFieldErrors({});
    setErrorMsg(null);
    setSuccessMsg(null);
    setNewEncounterType('');
    setNewEncounterProvider('');
    setNewEncounterReason('');
    setEditEncounterId('');
    setEditEncounterType('');
    setEditEncounterReason('');
    setEditEncounterProvider('');
    setEditEncounterDate('');
    setNewVitalBp('');
    setNewVitalHr('');
    setNewVitalTemp('');
    setNewVitalSpo2('');
    setNewVitalBs('');
    setNewVitalRr('');
    setNewVitalTime('');
    setNewVitalDate('');
    setNewVitalNurse('');
    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('Twice Daily');
    setNewApptDoctor('');
    setNewApptDate('');
    setNewApptType('Follow-up Consultation');
    setEditApptId('');
    setEditApptDoctor('');
    setEditApptDate('');
    setEditApptType('Follow-up Consultation');
    setEditApptStatus('Scheduled');
    setNewGoalInput('');
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setNewNoteContent('');
    setUploadDocFile(null);
    setUploadDocCategory('ClinicalNote');
    setNewConditionInput('');
    setNewAllergyInput('');
  };

  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
    } else {
      resetFormState();
    }
  }, [patientId]);

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

  const getAvatarSrc = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Profile picture file size must be less than 5MB.');
      return;
    }

    if (patientId) {
      setIsUploadingAvatar(true);
      try {
        const uploadRes = await api.uploadPatientDocument(patientId, file, 'ProfilePicture');
        if (uploadRes?.data?.fileName) {
          const newAvatarPath = `/api/patients/${patientId}/documents/ProfilePicture/${uploadRes.data.fileName}`;
          setAvatarUrl(newAvatarPath);
          setSelectedAvatarFile(null);
          await api.updatePatient(patientId, { avatar: newAvatarPath });
          toast.success('Profile picture updated successfully.');
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to upload profile picture.');
      } finally {
        setIsUploadingAvatar(false);
      }
    } else {
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCondition = () => {
    if (newConditionInput.trim()) {
      setConditions([...conditions, newConditionInput.trim()]);
      setNewConditionInput('');
    }
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleAddAllergy = () => {
    if (newAllergyInput.trim()) {
      setAllergies([...allergies, newAllergyInput.trim()]);
      setNewAllergyInput('');
    }
  };

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  // Add Clinical Encounter
  const handleAddEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEncounterReason.trim()) return;
    setIsSavingEncounter(true);

    const payload = {
      encounterType: newEncounterType || 'Inpatient Review',
      reasonDiagnosis: newEncounterReason.trim(),
      providerName: newEncounterProvider || (primaryDoctorId ? primaryPhysician : '') || user?.fullName || 'Attending Staff',
      dateText: formatDateMMDDYYYY(new Date()),
    };

    if (patientId) {
      try {
        await api.createPatientClinicalEncounter(patientId, payload);
        const res: any = await api.getPatientClinicalEncounters(patientId);
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setClinicalEncounters(Array.isArray(raw) ? raw : []);
        setEncountersList(Array.isArray(raw) ? raw : []);
        toast.success('Clinical encounter added successfully.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to add clinical encounter');
      }
    } else {
      const newEnc = {
        id: String(Date.now()),
        ...payload,
      };
      setEncountersList([newEnc, ...encountersList]);
      toast.success('Clinical encounter added successfully.');
    }
    setNewEncounterType('');
    setNewEncounterProvider('');
    setNewEncounterReason('');
    setShowEncounterModal(false);
    setIsSavingEncounter(false);
  };

  // Update Clinical Encounter
  const handleUpdateEncounter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEncounterReason.trim() || !editEncounterId) return;
    setIsSavingEncounter(true);

    const updatedData = {
      encounterType: editEncounterType || 'Inpatient Review',
      reasonDiagnosis: editEncounterReason.trim(),
      providerName: editEncounterProvider || (primaryDoctorId ? primaryPhysician : '') || user?.fullName || 'Attending Staff',
      dateText: editEncounterDate || formatDateMMDDYYYY(new Date()),
    };

    if (patientId) {
      try {
        await api.updatePatientClinicalEncounter(patientId, editEncounterId, updatedData);
        const res: any = await api.getPatientClinicalEncounters(patientId);
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setClinicalEncounters(Array.isArray(raw) ? raw : []);
        setEncountersList(Array.isArray(raw) ? raw : []);
        toast.success('Clinical encounter updated successfully.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update clinical encounter');
      }
    } else {
      setEncountersList(encountersList.map((enc: any) => enc.id === editEncounterId ? { ...enc, ...updatedData } : enc));
      toast.success('Clinical encounter updated successfully.');
    }
    setEditEncounterId('');
    setEditEncounterType('');
    setEditEncounterReason('');
    setEditEncounterProvider('');
    setEditEncounterDate('');
    setShowEditEncounterModal(false);
    setIsSavingEncounter(false);
  };

  // Delete Clinical Encounter
  const handleDeleteEncounter = async (encounterId: string) => {
    const confirmed = await confirm({
      title: 'Delete Clinical Encounter',
      message: 'Are you sure you want to delete this clinical encounter?',
      confirmText: 'Delete Encounter',
      variant: 'danger',
    });
    if (!confirmed) return;

    if (patientId) {
      try {
        await api.deletePatientClinicalEncounter(patientId, encounterId);
        const res: any = await api.getPatientClinicalEncounters(patientId);
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setClinicalEncounters(Array.isArray(raw) ? raw : []);
        setEncountersList(Array.isArray(raw) ? raw : []);
        toast.success('Clinical encounter deleted successfully.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete clinical encounter');
      }
    } else {
      setEncountersList(encountersList.filter((e: any) => e.id !== encounterId));
      toast.success('Clinical encounter removed.');
    }
  };

  // Add Prescription
  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;
    setIsSavingMed(true);

    const formattedMed = `${newMedName.trim()} ${newMedDosage.trim()} (${newMedFrequency})`.trim();
    const updatedMedsStr = currentMedications ? `${currentMedications}, ${formattedMed}` : formattedMed;
    setCurrentMedications(updatedMedsStr);
    setPrescriptionsList([...prescriptionsList, { id: Date.now(), name: formattedMed, status: 'Active' }]);

    if (patientId) {
      try {
        await api.updatePatient(patientId, { currentMedications: updatedMedsStr });
        setSuccessMsg('Prescription saved to patient profile.');
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err) {}
    }

    setNewMedName('');
    setNewMedDosage('');
    setNewMedFrequency('Twice Daily');
    setIsSavingMed(false);
    setShowPrescriptionModal(false);
  };

  const handleRemovePrescription = async (index: number) => {
    const updatedList = prescriptionsList.filter((_, i) => i !== index);
    const updatedStr = updatedList.map((m: any) => m.name).join(', ');
    setPrescriptionsList(updatedList);
    setCurrentMedications(updatedStr);

    if (patientId) {
      await api.updatePatient(patientId, { currentMedications: updatedStr });
    }
  };

  // Add Care Plan Goal
  const handleAddCareGoal = () => {
    if (newGoalInput.trim()) {
      setCareGoals([...careGoals, newGoalInput.trim()]);
      setNewGoalInput('');
    }
  };

  const handleRemoveCareGoal = (index: number) => {
    setCareGoals(careGoals.filter((_, i) => i !== index));
  };

  // Save Vitals
  const handleSaveVitals = async () => {
    const newEntry = {
      id: String(Date.now()),
      bloodPressure: bloodPressure || '',
      heartRate: heartRate || '',
      bloodSugar: bloodSugar || '',
      temperature: temperature || '',
      spO2: spO2 || '',
      respiratoryRate: '',
      recordedBy: assignedNurse || 'Staff Nurse',
      timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dateText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (patientId) {
      setIsSubmitting(true);
      try {
        await api.updatePatientVitals(patientId, newEntry);
        loadVitalsHistory(patientId);
        toast.success('Vital signs updated.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to update vitals');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setVitalsHistory([newEntry, ...vitalsHistory]);
      toast.success('Vital signs recorded.');
    }
  };

  // Record New Periodic Telemetry Round
  const handleAddVitalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingVitalRound(true);

    const newEntry = {
      id: String(Date.now()),
      bloodPressure: newVitalBp || bloodPressure || '',
      heartRate: newVitalHr || heartRate || '',
      bloodSugar: newVitalBs || bloodSugar || '',
      temperature: newVitalTemp || temperature || '',
      spO2: newVitalSpo2 || spO2 || '',
      respiratoryRate: newVitalRr || '',
      recordedBy: newVitalNurse || assignedNurse || 'Staff Nurse',
      timeText: newVitalTime.trim() || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      dateText: newVitalDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    if (newVitalBp) setBloodPressure(newVitalBp);
    if (newVitalHr) setHeartRate(newVitalHr);
    if (newVitalBs) setBloodSugar(newVitalBs);
    if (newVitalTemp) setTemperature(newVitalTemp);
    if (newVitalSpo2) setSpO2(newVitalSpo2);

    if (patientId) {
      try {
        await api.updatePatientVitals(patientId, newEntry);
        loadVitalsHistory(patientId);
        toast.success('Periodic telemetry round recorded successfully.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to record telemetry round');
      }
    } else {
      setVitalsHistory([newEntry, ...vitalsHistory]);
      toast.success('Periodic telemetry round recorded.');
    }
    setNewVitalBp('');
    setNewVitalHr('');
    setNewVitalTemp('');
    setNewVitalSpo2('');
    setNewVitalBs('');
    setNewVitalRr('');
    setNewVitalTime('');
    setNewVitalDate('');
    setNewVitalNurse('');
    setShowAddVitalModal(false);
    setIsSavingVitalRound(false);
  };

  // Upload Document
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocFile || !patientId) return;
    setIsUploadingDoc(true);

    try {
      await api.uploadPatientDocument(patientId, uploadDocFile, uploadDocCategory);
      setUploadDocFile(null);
      setUploadDocCategory('ClinicalNote');
      setShowDocModal(false);
      loadPatientData(patientId);
      toast.success('Document uploaded into patient storage.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Schedule Appointment
  const handleScheduleAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId || isSavingAppt) return;
    setIsSavingAppt(true);

    try {
      await api.createPatientAppointment(patientId, {
        physicianName: newApptDoctor || (primaryDoctorId ? primaryPhysician : '') || 'Attending Staff',
        consultationType: newApptType || 'Follow-up Consultation',
        dateTimeText: newApptDate || 'Tomorrow at 10:00 AM',
        status: 'Scheduled',
      });
      setNewApptDoctor('');
      setNewApptDate('');
      setNewApptType('Follow-up Consultation');
      setShowApptModal(false);
      const res: any = await api.getPatientAppointments(patientId);
      const raw = res?.data || (Array.isArray(res) ? res : []);
      setAppointmentsList(Array.isArray(raw) ? raw : []);
      toast.success('Appointment scheduled successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to schedule appointment');
    } finally {
      setIsSavingAppt(false);
    }
  };

  // Delete Appointment
  const handleDeleteAppointment = async (apptId: string) => {
    const confirmed = await confirm({
      title: 'Cancel Appointment',
      message: 'Are you sure you want to cancel / remove this appointment?',
      confirmText: 'Cancel Appointment',
      variant: 'danger',
    });
    if (!confirmed) return;

    if (patientId) {
      try {
        await api.deleteConsultation(apptId);
        const res: any = await api.getPatientAppointments(patientId);
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setAppointmentsList(Array.isArray(raw) ? raw : []);
        toast.success('Appointment removed successfully.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to delete appointment');
      }
    } else {
      setAppointmentsList(appointmentsList.filter((a: any) => a.id !== apptId));
      toast.success('Appointment removed.');
    }
  };

  // Open Edit Appointment Modal
  const handleOpenEditAppt = (app: any) => {
    setEditApptId(app.id);
    setEditApptDoctor(app.physicianName || app.doctor || '');
    setEditApptDate(app.dateTimeText || app.date || '');
    setEditApptType(app.consultationType || app.type || 'Follow-up Consultation');
    setEditApptStatus(app.status || 'Scheduled');
    setShowEditApptModal(true);
  };

  // Update Appointment
  const handleUpdateAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editApptId || isSavingAppt) return;
    setIsSavingAppt(true);

    try {
      if (patientId) {
        await api.updateConsultation(editApptId, {
          physicianName: editApptDoctor || (primaryDoctorId ? primaryPhysician : '') || 'Attending Staff',
          consultationType: editApptType || 'Follow-up Consultation',
          dateTimeText: editApptDate,
          status: editApptStatus,
        });
        const res: any = await api.getPatientAppointments(patientId);
        const raw = res?.data || (Array.isArray(res) ? res : []);
        setAppointmentsList(Array.isArray(raw) ? raw : []);
      } else {
        setAppointmentsList(appointmentsList.map((a: any) => a.id === editApptId ? {
          ...a,
          physicianName: editApptDoctor,
          consultationType: editApptType,
          dateTimeText: editApptDate,
          status: editApptStatus
        } : a));
      }
      setEditApptId('');
      setEditApptDoctor('');
      setEditApptDate('');
      setEditApptType('Follow-up Consultation');
      setEditApptStatus('Scheduled');
      setShowEditApptModal(false);
      toast.success('Appointment updated successfully.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update appointment');
    } finally {
      setIsSavingAppt(false);
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || isSavingNote) return;
    setIsSavingNote(true);

    const noteItem = {
      id: String(Date.now()),
      documentName: 'Clinical Progress Note',
      notesContent: newNoteContent.trim(),
      content: newNoteContent.trim(),
      createdByName: primaryDoctorId ? primaryPhysician : 'Attending Staff',
      author: primaryDoctorId ? primaryPhysician : 'Attending Staff',
      dateTimeText: formatDateTimeMMDDYYYY(new Date()),
      status: 'Completed',
    };

    if (patientId) {
      try {
        await api.createNurseDocumentation({
          patientId,
          patientIdCode: patientIdCode || patientId,
          patientName: `${firstName} ${lastName}`.trim(),
          documentName: 'Clinical Progress Note',
          notesContent: newNoteContent.trim(),
          dateTimeText: formatDateTimeMMDDYYYY(new Date()),
          status: 'Completed',
        });
        loadPatientData(patientId);
        toast.success('Clinical note saved.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to save note');
      }
    } else {
      setNotesList([noteItem, ...notesList]);
      toast.success('Clinical note saved.');
    }
    setNewNoteContent('');
    setShowNoteModal(false);
    setIsSavingNote(false);
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || isSavingTask) return;
    setIsSavingTask(true);

    const taskItem = {
      id: String(Date.now()),
      title: newTaskTitle.trim(),
      assignedCaregiver: newTaskAssignee || assignedNurse || 'Staff Nurse',
      assignedTo: newTaskAssignee || assignedNurse || 'Staff Nurse',
      dueTimeText: 'Today 05:00 PM',
      dueDate: 'Today 05:00 PM',
      statusStr: 'Open',
      status: 0,
    };

    if (patientId) {
      try {
        await api.createTask({
          patientId,
          patientIdCode: patientIdCode || patientId,
          patientName: `${firstName} ${lastName}`.trim(),
          title: newTaskTitle.trim(),
          assignedCaregiver: newTaskAssignee || assignedNurse || 'Staff Nurse',
          dueTimeText: 'Today 05:00 PM',
          statusStr: 'Open',
          status: 0,
        });
        loadPatientData(patientId);
        toast.success('Task created successfully.');
      } catch (err: any) {
        toast.error(err.message || 'Failed to create task');
      }
    } else {
      setTasksList([taskItem, ...tasksList]);
      toast.success('Task created.');
    }
    setNewTaskTitle('');
    setNewTaskAssignee('');
    setShowTaskModal(false);
    setIsSavingTask(false);
    setSuccessMsg('Care task created.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const nurseWarnedRef = useRef(false);
  useEffect(() => {
    if (user?.role?.toLowerCase() === 'nurse' && !nurseWarnedRef.current) {
      nurseWarnedRef.current = true;
      toast.warning('Patient demographic details are view-only for Nurse role.', 'Access Notice');
      navigate(patientId ? `/patients/${patientId}` : '/patients', { replace: true });
    }
  }, [user?.role, patientId, navigate]);

  const validatePatientForm = (): boolean => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required.';
    if (!lastName.trim()) errors.lastName = 'Last name is required.';
    if (!gender) errors.gender = 'Gender is required.';
    if (!dob) {
      errors.dob = 'Date of birth is required.';
    } else {
      const isoDob = normalizeToISODate(dob);
      const todayISO = new Date().toISOString().split('T')[0];
      if (isoDob && isoDob > todayISO) {
        errors.dob = 'Date of birth cannot be in the future.';
      }
    }
    if (!phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!isValidUSPhone(phone)) {
      errors.phone = 'Please enter a valid 10-digit US phone number (e.g. (512) 555-0100).';
    }
    if (email && !isValidEmail(email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!insuranceProvider.trim()) {
      errors.insuranceProvider = 'Insurance provider is required.';
    }
    if (!policyNumber.trim()) {
      errors.policyNumber = 'Insurance policy number is required.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Main Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!validatePatientForm()) {
      setErrorMsg('Please complete all required fields correctly before proceeding.');
      setActiveEditTab('General & Demographics');
      return;
    }


    setIsSubmitting(true);

    try {
      const calculatedAgeVal = calculateAge(dob);
      const ageGenderFormatted = `${calculatedAgeVal} / ${gender}`;

      const payload = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim(),
        dob,
        gender,
        ageGender: ageGenderFormatted,
        patientIdCode: patientIdCode || `PT-${Math.floor(10000 + Math.random() * 90000)}`,
        mrn: mrn || `MRN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        bloodType,
        maritalStatus,
        avatar: selectedAvatarFile ? '' : avatarUrl,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        country,
        emergencyContactName: emergencyName,
        emergencyContactRelationship: emergencyRelationship,
        emergencyContactPhone: emergencyPhone,
        emergencyContactIsPrimary: emergencyIsPrimary,
        primaryDoctorId: primaryDoctorId || undefined,
        primaryDoctorName: primaryDoctorId ? primaryPhysician : '',
        assignedNurseId: assignedNurseId || undefined,
        assignedNurseName: assignedNurseId ? assignedNurse : '',
        medicalConditions: conditions.join(', '),
        allergies: allergies.join(', '),
        currentMedications,
        pastMedicalHistory,
        bloodPressure,
        heartRate,
        bloodSugar,
        temperature,
        spO2,
        insuranceProvider,
        insurancePolicyNumber: policyNumber,
        insuranceGroupNumber: groupNumber,
        insuranceValidUntil: validUntil,
        additionalNotes,
        careUnit: careUnit || 'General Ward',
        floorRoom: floorRoom || '',
        status: status || 'InCare',
        riskLevel: riskLevel || 'High',
        lastVisit: 'May 22, 2024 10:00 AM',
      };

      if (isEditMode && patientId) {
        await api.updatePatient(patientId, payload);
        if (careGoals.length > 0 || careInterventions) {
          try {
            await api.updatePatientCarePlan(patientId, {
              planTitle: `${careUnit || 'Cardiology'} Comprehensive Care Plan`,
              goals: careGoals,
              interventions: careInterventions,
              status: 'Active',
              progressPercentage: 75,
              attendingDoctorName: primaryDoctorId ? primaryPhysician : undefined
            });
          } catch (planErr) {}
        }
        setSuccessMsg('Patient profile and clinical records saved successfully.');
        resetFormState();
        setTimeout(() => {
          navigate(`/patients/${patientId}`);
        }, 800);
      } else {

        const createRes = await api.createPatient(payload);
        const createdPatient = createRes?.data || createRes;
        const createdId = createdPatient?.id || createdPatient?.patientIdCode;

        if (createdId) {
          if (selectedAvatarFile) {
            try {
              await api.uploadPatientDocument(createdId, selectedAvatarFile, 'ProfilePicture');
            } catch (uploadErr) {}
          }

          // Save care plan if user entered goals or interventions
          if (careGoals.length > 0 || careInterventions) {
            try {
              await api.updatePatientCarePlan(createdId, {
                planTitle: `${careUnit || 'General'} Care Plan`,
                goals: careGoals,
                interventions: careInterventions,
                status: 'Active',
                progressPercentage: 50,
                attendingDoctorName: primaryDoctorId ? primaryPhysician : undefined,
              });
            } catch (planErr) {}
          }

          // Save queued clinical encounters
          for (const enc of encountersList) {
            try {
              await api.createPatientClinicalEncounter(createdId, {
                encounterType: enc.encounterType,
                reasonDiagnosis: enc.reasonDiagnosis,
                providerName: enc.providerName,
                dateText: enc.dateText
              });
            } catch (encErr) {}
          }

          // Save queued clinical notes
          for (const note of notesList) {
            try {
              await api.createNurseDocumentation({
                patientId: createdId,
                patientIdCode: createdPatient?.patientIdCode || patientIdCode,
                patientName: `${firstName} ${lastName}`.trim(),
                documentName: note.documentName || 'Clinical Progress Note',
                notesContent: note.notesContent || note.content,
                dateTimeText: note.dateTimeText || formatDateTimeMMDDYYYY(new Date()),
                status: 'Completed'
              });
            } catch (noteErr) {}
          }

          // Save queued tasks
          for (const t of tasksList) {
            try {
              await api.createTask({
                patientId: createdId,
                patientIdCode: createdPatient?.patientIdCode || patientIdCode,
                patientName: `${firstName} ${lastName}`.trim(),
                title: t.title,
                assignedCaregiver: t.assignedCaregiver || t.assignedTo || assignedNurse || 'Staff Nurse',
                dueTimeText: t.dueTimeText || t.dueDate || 'Today 05:00 PM',
                statusStr: 'Open',
                status: 0
              });
            } catch (taskErr) {}
          }

          // Save queued vitals entries
          for (const v of vitalsHistory) {
            try {
              await api.updatePatientVitals(createdId, v);
            } catch (vErr) {}
          }

          resetFormState();
          navigate(`/patients/${createdId}`);
        } else {
          resetFormState();
          navigate('/patients');
        }
      }
    } catch (err: any) {
      console.error('Failed to save patient:', err);
      setErrorMsg(err.message || 'An error occurred while saving the patient record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabsList = [
    { id: 'General & Demographics', label: 'General & Demographics', icon: User },
    { id: 'Insurance & Billing', label: 'Insurance & Billing', icon: Shield },
    { id: 'Medical Information', label: 'Medical Information', icon: FileText },
    { id: 'Health Records', label: 'Health Records', icon: FileText },
    { id: 'Medications', label: 'Medications', icon: Pill },
    { id: 'Care Plan', label: 'Care Plan', icon: CheckCircle2 },
    { id: 'Vitals & Trends', label: 'Vitals & Trends', icon: Activity },
    { id: 'Documents', label: 'Documents', icon: FileCheck },
    { id: 'Appointments', label: 'Appointments', icon: Calendar },
    { id: 'Tasks & Notes', label: 'Clinical Notes & Tasks', icon: CheckSquare },
    { id: 'History', label: 'History', icon: HistoryIcon },
  ];

  const currentTabIndex = Math.max(0, tabsList.findIndex((t) => t.id === activeEditTab));

  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkTabScroll = useCallback(() => {
    const el = tabsContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 5);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkTabScroll();
    window.addEventListener('resize', checkTabScroll);
    return () => window.removeEventListener('resize', checkTabScroll);
  }, [checkTabScroll]);

  // Auto-scroll active tab into view when activeEditTab changes
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    const timer = setTimeout(checkTabScroll, 300);
    return () => clearTimeout(timer);
  }, [activeEditTab, checkTabScroll]);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 260;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkTabScroll, 300);
    }
  };

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto p-4 select-none pb-20 font-sans">
      <PageHeader
        title={isEditMode ? `Edit Patient: ${firstName} ${lastName}`.trim() : 'Add New Patient'}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Patients', href: '/patients' },
          { label: isEditMode ? 'Edit Patient' : 'Add New Patient' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isEditMode ? `/patients/${patientId}` : '/patients')}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              <span>{isEditMode ? 'Save Changes' : 'Confirm & Create Patient'}</span>
            </button>
          </div>
        }
      />

      {isLoadingPatient && (
        <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span>Loading patient records...</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-xs font-bold flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* 11 WORKSPACE TABS WITH SMOOTH HORIZONTAL SCROLLING & ARROWS */}
      <div className="space-y-6">
        <div className="relative border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs group">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollTabs('left')}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-xl shadow-md border border-slate-200 cursor-pointer transition-all"
              title="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          <div
            ref={tabsContainerRef}
            onScroll={checkTabScroll}
            className="flex items-center gap-1.5 overflow-x-auto scroll-smooth py-0.5 px-0.5"
          >
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEditTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={isActive ? activeTabRef : null}
                  type="button"
                  onClick={() => setActiveEditTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-black ring-2 ring-indigo-300'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollTabs('right')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/95 hover:bg-white text-slate-700 hover:text-indigo-600 rounded-xl shadow-md border border-slate-200 cursor-pointer transition-all"
              title="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>


          {/* TAB 1: General & Demographics */}
          {activeEditTab === 'General & Demographics' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <User className="h-4 w-4 text-indigo-600" />
                Demographics & Personal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, firstName: '' }));
                    }}
                    placeholder="Enter first name"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.firstName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.firstName && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, lastName: '' }));
                    }}
                    placeholder="Enter last name"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.lastName ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.lastName && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.lastName}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender <span className="text-rose-500">*</span></label>
                  <select
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value as any);
                      setFieldErrors((prev) => ({ ...prev, gender: '' }));
                    }}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.gender ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.gender && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.gender}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth <span className="text-rose-500">*</span></label>
                  <DatePickerInput
                    value={dob}
                    onChange={(val) => {
                      setDob(val);
                      setFieldErrors((prev) => ({ ...prev, dob: '' }));
                    }}
                    maxDate={new Date().toISOString().split('T')[0]}
                    placeholder="Select or enter DOB"
                    error={fieldErrors.dob}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">US Phone Number <span className="text-rose-500">*</span></label>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      setFieldErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    placeholder="(XXX) XXX-XXXX"
                    className={fieldErrors.phone ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : ''}
                  />
                  {fieldErrors.phone && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.phone}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: '' }));
                    }}
                    placeholder="e.g. patient@example.com"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${fieldErrors.email ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400' : 'border-slate-200'} rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.email && <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.email}</p>}
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pt-4 pb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                Ward Assignment & Care Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Care Unit</label>
                  <select
                    value={careUnit}
                    onChange={(e) => {
                      setCareUnit(e.target.value);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">Select Care Unit</option>
                    {(careUnits.length > 0 ? careUnits : fallbackCareUnits).map((cu) => (
                      <option key={cu.name} value={cu.name}>
                        {cu.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Room / Floor</label>
                  <input
                    type="text"
                    maxLength={30}
                    value={floorRoom}
                    onChange={(e) => setFloorRoom(e.target.value)}
                    placeholder="e.g. Room 101 / 1st Floor"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Select Status</option>
                    <option value="InCare">In Care</option>
                    <option value="Admitted">Admitted</option>
                    <option value="Discharged">Discharged</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Risk Level</label>
                  <select
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Select Risk Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Mandatory Insurance Information Section (Bug 7) */}
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pt-4 pb-3 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-indigo-600" />
                Insurance & Billing Information <span className="text-rose-500 text-xs font-bold">*</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Insurance Provider <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={insuranceProvider}
                    onChange={(e) => {
                      setInsuranceProvider(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, insuranceProvider: '' }));
                    }}
                    placeholder="e.g. Blue Cross Blue Shield"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                      fieldErrors.insuranceProvider
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                        : 'border-slate-200'
                    } rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.insuranceProvider && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.insuranceProvider}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Policy Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={policyNumber}
                    onChange={(e) => {
                      setPolicyNumber(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, policyNumber: '' }));
                    }}
                    placeholder="e.g. POL-98765432"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                      fieldErrors.policyNumber
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                        : 'border-slate-200'
                    } rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.policyNumber && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.policyNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Group Number</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    placeholder="e.g. GRP-45678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Valid Until</label>
                  <DatePickerInput
                    value={validUntil}
                    onChange={(val) => setValidUntil(val)}
                    placeholder="Select expiration date"
                  />
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pt-4 pb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                Primary Caregiver Assignments
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Doctor</label>
                  <select
                    value={primaryDoctorId}
                    onChange={(e) => {
                      setPrimaryDoctorId(e.target.value);
                      const d = doctors.find((doc: any) => doc.id === e.target.value);
                      if (d) setPrimaryPhysician(d.name);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Select Doctor</option>
                    {doctors.map((d: any) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.specialty || 'Physician'})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Nurse</label>
                  <select
                    value={assignedNurseId}
                    onChange={(e) => {
                      setAssignedNurseId(e.target.value);
                      const n = nurses.find((nurse: any) => nurse.id === e.target.value);
                      if (n) setAssignedNurse(n.name);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Select Nurse</option>
                    {nurses.map((n: any) => (
                      <option key={n.id} value={n.id}>{n.name} ({n.department || 'Nursing'})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Avatar Upload */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-5">
                <div className="relative">
                  {avatarUrl ? (
                    <img src={getAvatarSrc(avatarUrl)} alt="Patient Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xl">
                      {firstName ? firstName[0] : <User className="h-8 w-8" />}
                    </div>
                  )}
                  {isUploadingAvatar && (
                    <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
                    </div>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Upload Profile Photo</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Insurance & Billing Information (Mandatory) */}
          {activeEditTab === 'Insurance & Billing' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  Insurance & Billing Coverage Information
                </h3>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-[11px] font-extrabold flex items-center gap-1">
                  <span className="text-rose-500 font-black">*</span> Mandatory Admission Fields
                </span>
              </div>

              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start gap-3">
                <Shield className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <p className="font-bold">Insurance & Coverage Verification</p>
                  <p className="text-indigo-700 text-[11px] mt-0.5">
                    Insurance Provider and Policy / Member Number are mandatory for patient admission and clinical claims processing. Ensure policy details are verified against the patient's card or EHR portal.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Insurance Provider <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={insuranceProvider}
                    onChange={(e) => {
                      setInsuranceProvider(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, insuranceProvider: '' }));
                    }}
                    placeholder="e.g. Blue Cross Blue Shield"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                      fieldErrors.insuranceProvider
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                        : 'border-slate-200'
                    } rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.insuranceProvider && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.insuranceProvider}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Policy / Member Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={50}
                    value={policyNumber}
                    onChange={(e) => {
                      setPolicyNumber(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, policyNumber: '' }));
                    }}
                    placeholder="e.g. POL-98765432"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${
                      fieldErrors.policyNumber
                        ? 'border-rose-400 bg-rose-50/20 ring-1 ring-rose-400'
                        : 'border-slate-200'
                    } rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden`}
                  />
                  {fieldErrors.policyNumber && (
                    <p className="text-[11px] font-bold text-rose-500 mt-1">{fieldErrors.policyNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Group Number</label>
                  <input
                    type="text"
                    maxLength={50}
                    value={groupNumber}
                    onChange={(e) => setGroupNumber(e.target.value)}
                    placeholder="e.g. GRP-45678"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Valid Until</label>
                  <DatePickerInput
                    value={validUntil}
                    onChange={(val) => setValidUntil(val)}
                    placeholder="Select expiration date"
                  />
                </div>
              </div>

              {/* Coverage Summary Preview Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-slate-900 text-xs flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-purple-600" /> Coverage Summary Preview
                </h4>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Provider</span>
                    <strong className="text-slate-900">{insuranceProvider || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Policy / Member #</span>
                    <strong className="text-slate-900">{policyNumber || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Group #</span>
                    <strong className="text-slate-900">{groupNumber || 'Not specified'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold">Valid Until</span>
                    <strong className="text-slate-900">{validUntil || 'Not specified'}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Medical Information (Bug 8) */}
          {activeEditTab === 'Medical Information' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                Medical Diagnoses, Blood Type & Clinical Background
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Blood Type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Select Blood Type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bt) => (
                      <option key={bt} value={bt}>{bt}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Attending Physician</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={primaryPhysician}
                    onChange={(e) => setPrimaryPhysician(e.target.value)}
                    placeholder="e.g. Dr. Sarah Wilson"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Assigned Care Unit</label>
                  <input
                    type="text"
                    maxLength={100}
                    value={careUnit}
                    onChange={(e) => setCareUnit(e.target.value)}
                    placeholder="e.g. Cardiology Unit"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Past Medical History / Clinical Summary</label>
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={pastMedicalHistory}
                  onChange={(e) => setPastMedicalHistory(e.target.value)}
                  placeholder="Enter comprehensive medical history, past surgeries, and underlying chronic conditions..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Diagnosed Medical Conditions</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {conditions.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-bold">
                        {c}
                        <button type="button" onClick={() => handleRemoveCondition(i)} className="hover:text-rose-500"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add condition..."
                      value={newConditionInput}
                      onChange={(e) => setNewConditionInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                    <button type="button" onClick={handleAddCondition} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">Add</button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Allergies & Sensitivities</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {allergies.map((a, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold">
                        {a}
                        <button type="button" onClick={() => handleRemoveAllergy(i)} className="hover:text-rose-900"><X className="h-3 w-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add allergy..."
                      value={newAllergyInput}
                      onChange={(e) => setNewAllergyInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                    />
                    <button type="button" onClick={handleAddAllergy} className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold">Add</button>
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* TAB 2: Health Records */}
          {activeEditTab === 'Health Records' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Clinical Encounters & Electronic Health Records
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEncounterModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-indigo-700 shadow-2xs"
                >
                  <Plus className="h-4 w-4" /> Add Clinical Encounter
                </button>
              </div>

              {((isEditMode ? clinicalEncounters : (encountersList.length > 0 ? encountersList : clinicalEncounters)).length > 0) ? (
                <div className="space-y-3">
                  {(isEditMode ? clinicalEncounters : (encountersList.length > 0 ? encountersList : clinicalEncounters)).map((enc: any) => (
                    <div key={enc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{enc.encounterType || 'Clinical Review'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Date: {enc.dateText} • Provider: {enc.providerName}</p>
                        {enc.reasonDiagnosis && <p className="text-xs text-indigo-700 font-semibold mt-1">{enc.reasonDiagnosis}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditEncounterId(enc.id);
                            setEditEncounterType(enc.encounterType || 'Inpatient Review');
                            setEditEncounterReason(enc.reasonDiagnosis || '');
                            setEditEncounterProvider(enc.providerName || '');
                            setEditEncounterDate(enc.dateText || '');
                            setShowEditEncounterModal(true);
                          }}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Encounter"
                        >
                          <FileEdit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteEncounter(enc.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Encounter"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-extrabold">Recorded</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 font-semibold italic">No clinical encounters recorded yet.</div>
              )}
            </div>
          )}

          {/* TAB 3: Medications */}
          {activeEditTab === 'Medications' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Pill className="h-4 w-4 text-indigo-600" />
                  Active Prescriptions & Medication Management
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-indigo-700 shadow-2xs"
                >
                  <Plus className="h-4 w-4" /> Add Prescription
                </button>
              </div>

              {prescriptionsList.length > 0 ? (
                <div className="space-y-3">
                  {prescriptionsList.map((m: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{m.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Active daily prescription</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePrescription(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                        title="Remove Prescription"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 font-semibold italic">No active prescriptions logged.</div>
              )}
            </div>
          )}

          {/* TAB 4: Care Plan */}
          {activeEditTab === 'Care Plan' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                Care Plan Goals & Interventions
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Individualized Clinical Goals</label>
                  <div className="space-y-2">
                    {careGoals.map((goal, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800">
                        <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> {goal}</span>
                        <button type="button" onClick={() => handleRemoveCareGoal(idx)} className="text-rose-500 hover:text-rose-700"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add new care plan goal..."
                      value={newGoalInput}
                      onChange={(e) => setNewGoalInput(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddCareGoal}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                    >
                      Add Goal
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Care Plan Interventions & Protocols</label>
                  <textarea
                    rows={3}
                    value={careInterventions}
                    onChange={(e) => setCareInterventions(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Vitals & Trends */}
          {activeEditTab === 'Vitals & Trends' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
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
                        type="button"
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
                    type="button"
                    onClick={() => {
                      setNewVitalBp(bloodPressure || '120/80 mmHg');
                      setNewVitalHr(heartRate || '72 bpm');
                      setNewVitalBs(bloodSugar || '110 mg/dL');
                      setNewVitalTemp(temperature || '98.6 °F');
                      setNewVitalSpo2(spO2 || '98 %');
                      setNewVitalRr('18 /min');
                      setNewVitalTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
                      setNewVitalDate(new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }));
                      setShowAddVitalModal(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Record Telemetry Round</span>
                  </button>
                </div>
              </div>

              {/* 5 Live Baseline Inputs with Save Vitals Button */}
              <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Current Baseline Vitals Parameters
                  </h4>
                  <button
                    type="button"
                    onClick={handleSaveVitals}
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-indigo-600 text-white font-extrabold rounded-xl text-xs cursor-pointer hover:bg-indigo-700 shadow-2xs disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Baseline'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase">Blood Pressure</label>
                    <input
                      type="text"
                      value={bloodPressure}
                      onChange={(e) => setBloodPressure(e.target.value)}
                      placeholder="120/80 mmHg"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:bg-white"
                    />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase">Heart Rate (bpm)</label>
                    <input
                      type="text"
                      value={heartRate}
                      onChange={(e) => setHeartRate(e.target.value)}
                      placeholder="72 bpm"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:bg-white"
                    />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase">Blood Sugar (mg/dL)</label>
                    <input
                      type="text"
                      value={bloodSugar}
                      onChange={(e) => setBloodSugar(e.target.value)}
                      placeholder="110 mg/dL"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:bg-white"
                    />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase">Temperature (°F)</label>
                    <input
                      type="text"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      placeholder="98.6 °F"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:bg-white"
                    />
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <label className="block text-[10px] font-extrabold text-slate-500 mb-1 uppercase">SpO2 Oxygen (%)</label>
                    <input
                      type="text"
                      value={spO2}
                      onChange={(e) => setSpO2(e.target.value)}
                      placeholder="98 %"
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-black text-slate-900 focus:bg-white"
                    />
                  </div>
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
                      type="button"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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
                      type="button"
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
                            <linearGradient id="colorSysEdit" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                            </linearGradient>
                            <linearGradient id="colorDiaEdit" x1="0" y1="0" x2="0" y2="1">
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
                          <Area type="monotone" name="Systolic (mmHg)" dataKey="systolic" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSysEdit)" dot={{ r: 3.5, fill: '#4f46e5' }} />
                          <Area type="monotone" name="Diastolic (mmHg)" dataKey="diastolic" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDiaEdit)" dot={{ r: 3.5, fill: '#f43f5e' }} />
                        </AreaChart>
                      ) : vitalsChartMetric === 'hr' ? (
                        <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorHrEdit" x1="0" y1="0" x2="0" y2="1">
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
                          <Area type="monotone" name="Heart Rate (bpm)" dataKey="heartRate" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHrEdit)" dot={{ r: 4, fill: '#f43f5e' }} />
                        </AreaChart>
                      ) : vitalsChartMetric === 'spo2' ? (
                        <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSpo2Edit" x1="0" y1="0" x2="0" y2="1">
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
                          <Area type="monotone" name="SpO2 Saturation (%)" dataKey="spO2" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSpo2Edit)" dot={{ r: 4, fill: '#10b981' }} />
                        </AreaChart>
                      ) : vitalsChartMetric === 'sugar' ? (
                        <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSugarEdit" x1="0" y1="0" x2="0" y2="1">
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
                          <Area type="monotone" name="Blood Sugar (mg/dL)" dataKey="bloodSugar" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSugarEdit)" dot={{ r: 4, fill: '#8b5cf6' }} />
                        </AreaChart>
                      ) : vitalsChartMetric === 'temp' ? (
                        <AreaChart data={formattedChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTempEdit" x1="0" y1="0" x2="0" y2="1">
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
                          <Area type="monotone" name="Body Temp (°F)" dataKey="temperature" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTempEdit)" dot={{ r: 4, fill: '#f59e0b' }} />
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
                            No vital rounds recorded yet. A doctor, nurse, or admin can record vitals using "Record Telemetry Round".
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* TAB 6: Documents */}
          {activeEditTab === 'Documents' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-indigo-600" />
                    Patient Document Storage Library
                  </h3>
                  <p className="text-slate-500 text-[11px] font-mono mt-0.5">Isolated: Files/Patient/{patientId}/</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-indigo-700 shadow-2xs"
                >
                  <Upload className="h-4 w-4" /> Upload Document
                </button>
              </div>

              {patientDocs.length > 0 ? (
                <div className="space-y-3">
                  {patientDocs.map((doc: any, i: number) => (
                    <div key={doc.id || i} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl"><FileText className="h-4 w-4" /></div>
                        <div>
                          <p className="font-extrabold text-slate-900 text-xs">{doc.fileName || doc.documentName}</p>
                          <p className="text-[10px] text-slate-500">{doc.documentType || 'MedicalDocuments'} • {doc.fileSizeText || '1.2 MB'}</p>
                        </div>
                      </div>
                      <a
                        href={`/api/patients/${patientId}/documents/${doc.documentType || 'MedicalDocuments'}/${doc.fileName || doc.documentName}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 font-semibold italic">No documents uploaded yet.</div>
              )}
            </div>
          )}

          {/* TAB 7: Appointments */}
          {activeEditTab === 'Appointments' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  Scheduled Appointments & Consultations
                </h3>
                <button
                  type="button"
                  onClick={() => setShowApptModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-extrabold cursor-pointer hover:bg-indigo-700 shadow-2xs"
                >
                  <Plus className="h-4 w-4" /> Schedule Appointment
                </button>
              </div>

              {appointmentsList.length > 0 ? (
                <div className="space-y-3">
                  {appointmentsList.map((app: any) => (
                    <div key={app.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{app.consultationType || app.type || 'Consultation'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">With {app.physicianName || app.doctor} • {app.dateTimeText || app.date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold">{app.status || 'Scheduled'}</span>
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

          {/* TAB 8: Tasks & Notes */}
          {activeEditTab === 'Tasks & Notes' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Notes */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" /> Clinical Notes</h3>
                  <button type="button" onClick={() => setShowNoteModal(true)} className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-extrabold">+ Note</button>
                </div>
                <div className="space-y-2">
                  {notesList.map((n: any) => (
                    <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <p className="font-bold text-indigo-700">{n.createdByName || n.author || 'Clinical Staff'}</p>
                      <p className="text-slate-800 mt-1">{n.notesContent || n.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2"><CheckSquare className="h-4 w-4 text-indigo-600" /> Care Tasks</h3>
                  <button type="button" onClick={() => setShowTaskModal(true)} className="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-extrabold">+ Task</button>
                </div>
                <div className="space-y-2">
                  {tasksList.map((t: any) => (
                    <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{t.title}</p>
                        <p className="text-[11px] text-slate-500">Assigned: {t.assignedCaregiver || t.assignedTo || 'Nurse'}</p>
                      </div>
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-bold">{t.statusStr || t.status || 'Pending'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: History */}
          {activeEditTab === 'History' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <HistoryIcon className="h-4 w-4 text-indigo-600" />
                Patient Audit & Timeline History
              </h3>

              <div className="space-y-3">
                {historyList.map((h: any, idx: number) => (
                  <div key={h.id || idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-slate-900 text-xs">{h.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">By {h.by} • {h.date}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-extrabold">{h.type || 'Event'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Tab Navigation & Action Footer */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {currentTabIndex > 0 ? (
              <button
                type="button"
                onClick={() => setActiveEditTab(tabsList[currentTabIndex - 1].id)}
                className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
              >
                ← Previous: {tabsList[currentTabIndex - 1].label}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {currentTabIndex < tabsList.length - 1 && (
                <button
                  type="button"
                  onClick={() => setActiveEditTab(tabsList[currentTabIndex + 1].id)}
                  className="px-5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  Next: {tabsList[currentTabIndex + 1].label} →
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span>{isEditMode ? 'Save Changes' : 'Confirm & Create Patient'}</span>
              </button>
            </div>
          </div>
        </div>


      {/* Modal 1: Add Clinical Encounter */}
      {showEncounterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Add Clinical Encounter</h4>
              <button onClick={() => {
                setNewEncounterType('');
                setNewEncounterProvider('');
                setNewEncounterReason('');
                setShowEncounterModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddEncounter} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Encounter Type</label>
                <select
                  value={newEncounterType}
                  onChange={(e) => setNewEncounterType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Encounter Type</option>
                  <option value="Inpatient Review">Inpatient Review</option>
                  <option value="Clinical Consultation">Clinical Consultation</option>
                  <option value="Emergency Evaluation">Emergency Evaluation</option>
                  <option value="Routine Follow-up">Routine Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis / Assessment Note *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical assessment and findings..."
                  value={newEncounterReason}
                  onChange={(e) => setNewEncounterReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attending Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Attending Physician"
                  value={newEncounterProvider}
                  onChange={(e) => setNewEncounterProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setNewEncounterType('');
                  setNewEncounterProvider('');
                  setNewEncounterReason('');
                  setShowEncounterModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingEncounter} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSavingEncounter ? 'Saving...' : 'Record Encounter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 1b: Edit Clinical Encounter */}
      {showEditEncounterModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Edit Clinical Encounter</h4>
              <button onClick={() => {
                setEditEncounterId('');
                setEditEncounterType('');
                setEditEncounterReason('');
                setEditEncounterProvider('');
                setEditEncounterDate('');
                setShowEditEncounterModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdateEncounter} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Encounter Type</label>
                <select
                  value={editEncounterType}
                  onChange={(e) => setEditEncounterType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Encounter Type</option>
                  <option value="Inpatient Review">Inpatient Review</option>
                  <option value="Clinical Consultation">Clinical Consultation</option>
                  <option value="Emergency Evaluation">Emergency Evaluation</option>
                  <option value="Routine Follow-up">Routine Follow-up</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Diagnosis / Assessment Note *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Clinical assessment and findings..."
                  value={editEncounterReason}
                  onChange={(e) => setEditEncounterReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Attending Provider</label>
                <input
                  type="text"
                  placeholder="e.g. Attending Physician"
                  value={editEncounterProvider}
                  onChange={(e) => setEditEncounterProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date</label>
                <input
                  type="text"
                  placeholder="MM/DD/YYYY"
                  value={editEncounterDate}
                  onChange={(e) => setEditEncounterDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setEditEncounterId('');
                  setEditEncounterType('');
                  setEditEncounterReason('');
                  setEditEncounterProvider('');
                  setEditEncounterDate('');
                  setShowEditEncounterModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingEncounter} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSavingEncounter ? 'Saving...' : 'Update Encounter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Prescription */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Add Medication Prescription</h4>
              <button onClick={() => {
                setNewMedName('');
                setNewMedDosage('');
                setNewMedFrequency('Twice Daily');
                setShowPrescriptionModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddPrescription} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Medication Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lisinopril, Metformin"
                  value={newMedName}
                  onChange={(e) => setNewMedName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="e.g. 10mg, 500mg"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Frequency</label>
                <select
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer"
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setNewMedName('');
                  setNewMedDosage('');
                  setNewMedFrequency('Twice Daily');
                  setShowPrescriptionModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingMed} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSavingMed ? 'Saving...' : 'Add Prescription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Upload Document */}
      {showDocModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Upload Patient Document</h4>
              <button onClick={() => {
                setUploadDocFile(null);
                setUploadDocCategory('ClinicalNote');
                setShowDocModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={uploadDocCategory}
                  onChange={(e) => setUploadDocCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Category</option>
                  <option value="MedicalDocuments">Medical Documents</option>
                  <option value="LabReports">Lab Reports</option>
                  <option value="Identification">Identification & Insurance</option>
                  <option value="OtherDocuments">Other Documents</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select File *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadDocFile(e.target.files?.[0] || null)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setUploadDocFile(null);
                  setUploadDocCategory('ClinicalNote');
                  setShowDocModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isUploadingDoc} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isUploadingDoc ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Schedule Appointment */}
      {showApptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Schedule Appointment</h4>
              <button onClick={() => {
                setNewApptDoctor('');
                setNewApptDate('');
                setNewApptType('Follow-up Consultation');
                setShowApptModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleScheduleAppt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor / Specialist</label>
                <select
                  value={newApptDoctor}
                  onChange={(e) => setNewApptDoctor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialty || 'General Medicine'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointment Type</label>
                <input
                  type="text"
                  value={newApptType}
                  onChange={(e) => setNewApptType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <DateTimePickerInput
                  value={newApptDate}
                  onChange={(val) => setNewApptDate(val)}
                  placeholder="e.g. Aug 28, 2026 10:00 AM"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setNewApptDoctor('');
                  setNewApptDate('');
                  setNewApptType('Follow-up Consultation');
                  setShowApptModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingAppt} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSavingAppt ? 'Scheduling...' : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4B: Edit Appointment */}
      {showEditApptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 my-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Edit / Reschedule Appointment</h4>
              <button onClick={() => {
                setEditApptId('');
                setEditApptDoctor('');
                setEditApptDate('');
                setEditApptType('Follow-up Consultation');
                setEditApptStatus('Scheduled');
                setShowEditApptModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdateAppt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor / Specialist</label>
                <select
                  value={editApptDoctor}
                  onChange={(e) => setEditApptDoctor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialty || 'General Medicine'})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Appointment Type</label>
                <input
                  type="text"
                  value={editApptType}
                  onChange={(e) => setEditApptType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <DateTimePickerInput
                  value={editApptDate}
                  onChange={(val) => setEditApptDate(val)}
                  placeholder="e.g. Sep 02, 2026 10:00 PM"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Status</label>
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setEditApptId('');
                  setEditApptDoctor('');
                  setEditApptDate('');
                  setEditApptType('Follow-up Consultation');
                  setEditApptStatus('Scheduled');
                  setShowEditApptModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingAppt} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSavingAppt ? 'Saving...' : 'Update Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Add Note */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Add Clinical Note</h4>
              <button onClick={() => {
                setNewNoteContent('');
                setShowNoteModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Note Content *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Record clinical notes, observations, or handover remarks..."
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setNewNoteContent('');
                  setShowNoteModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingNote} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50">
                  {isSavingNote ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 6: Add Task */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Create Care Task</h4>
              <button onClick={() => {
                setNewTaskTitle('');
                setNewTaskAssignee('');
                setShowTaskModal(false);
              }}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Conduct afternoon vital round"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assignee</label>
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="">Select Assignee</option>
                  {nurses.map((n: any) => (
                    <option key={n.id} value={n.name}>{n.name} (Nurse)</option>
                  ))}
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.name}>{d.name} (Doctor)</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => {
                  setNewTaskTitle('');
                  setNewTaskAssignee('');
                  setShowTaskModal(false);
                }} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingTask} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50">
                  {isSavingTask ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 7: Record Telemetry Round */}
      {showAddVitalModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans text-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-600" />
                Record Telemetry Round
              </h4>
              <button onClick={() => {
                setNewVitalBp('');
                setNewVitalHr('');
                setNewVitalTemp('');
                setNewVitalSpo2('');
                setNewVitalBs('');
                setNewVitalRr('');
                setNewVitalTime('');
                setNewVitalDate('');
                setNewVitalNurse('');
                setShowAddVitalModal(false);
              }} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddVitalEntry} className="space-y-3 font-semibold">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Date</label>
                  <input
                    type="text"
                    placeholder="e.g. Aug 24, 2026"
                    value={newVitalDate}
                    onChange={(e) => setNewVitalDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Time (Telemetry Round)</label>
                  <input
                    type="text"
                    placeholder="e.g. 08:00 AM"
                    value={newVitalTime}
                    onChange={(e) => setNewVitalTime(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Blood Pressure (BP)</label>
                <input
                  type="text"
                  placeholder="e.g. 120/80 mmHg"
                  value={newVitalBp}
                  onChange={(e) => setNewVitalBp(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Heart Rate</label>
                  <input
                    type="text"
                    placeholder="e.g. 72 bpm"
                    value={newVitalHr}
                    onChange={(e) => setNewVitalHr(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">SpO2 Oxygen</label>
                  <input
                    type="text"
                    placeholder="e.g. 98 %"
                    value={newVitalSpo2}
                    onChange={(e) => setNewVitalSpo2(e.target.value)}
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
                    value={newVitalTemp}
                    onChange={(e) => setNewVitalTemp(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Blood Sugar</label>
                  <input
                    type="text"
                    placeholder="e.g. 110 mg/dL"
                    value={newVitalBs}
                    onChange={(e) => setNewVitalBs(e.target.value)}
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
                    value={newVitalRr}
                    onChange={(e) => setNewVitalRr(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Recorded By (Nurse)</label>
                  <input
                    type="text"
                    placeholder="Nurse Emily Clark"
                    value={newVitalNurse}
                    onChange={(e) => setNewVitalNurse(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewVitalBp('');
                    setNewVitalHr('');
                    setNewVitalTemp('');
                    setNewVitalSpo2('');
                    setNewVitalBs('');
                    setNewVitalRr('');
                    setNewVitalTime('');
                    setNewVitalDate('');
                    setNewVitalNurse('');
                    setShowAddVitalModal(false);
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingVitalRound}
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-xl font-extrabold hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingVitalRound ? 'Recording...' : 'Record Telemetry Round'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
