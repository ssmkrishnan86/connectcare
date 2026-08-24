import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { PhoneInput } from '@/components/common/PhoneInput';
import { isValidUSPhone, isValidEmail, formatDateMMDDYYYY, formatDateTimeMMDDYYYY } from '@/lib/utils';
import { PageHeader } from '@/components/common/PageHeader';


export const AddPatientPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { patientId } = useParams<{ patientId?: string }>();
  const isEditMode = Boolean(patientId);

  // Active Tab State
  const [activeEditTab, setActiveEditTab] = useState<string>('General & Demographics');

  // Loading & Doctors/Nurses State
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


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
  const [careUnit, setCareUnit] = useState('Cardiology Unit');
  const [floorRoom, setFloorRoom] = useState('');
  const [status, setStatus] = useState('InCare');
  const [riskLevel, setRiskLevel] = useState('High');
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
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [heartRate, setHeartRate] = useState('72');
  const [bloodSugar, setBloodSugar] = useState('95');
  const [temperature, setTemperature] = useState('98.6');
  const [spO2, setSpO2] = useState('98');

  // 3. Insurance Details
  const [insuranceProvider, setInsuranceProvider] = useState('');
  const [policyNumber, setPolicyNumber] = useState('');
  const [groupNumber, setGroupNumber] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Clinical Sub-resources for Edit Mode
  const [clinicalEncounters, setClinicalEncounters] = useState<any[]>([]);
  const [newEncounterType, setNewEncounterType] = useState('Inpatient Review');
  const [newEncounterReason, setNewEncounterReason] = useState('');
  const [newEncounterProvider, setNewEncounterProvider] = useState('');
  const [showEncounterModal, setShowEncounterModal] = useState(false);
  const [isSavingEncounter, setIsSavingEncounter] = useState(false);

  // Prescriptions Sub-resource
  const [prescriptionsList, setPrescriptionsList] = useState<any[]>([]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedFrequency, setNewMedFrequency] = useState('Once Daily (Morning)');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [isSavingMed, setIsSavingMed] = useState(false);

  // Care Plan Sub-resource
  const [careGoals, setCareGoals] = useState<string[]>([
    'Maintain systolic BP < 130 mmHg and resting HR < 80 bpm',
    'Adhere to low-sodium cardiac nutrition plan',
    'Complete daily 20-minute guided mobility therapy'
  ]);
  const [newGoalInput, setNewGoalInput] = useState('');
  const [careInterventions, setCareInterventions] = useState('Daily telemetry logging, morning vital rounds, low-sodium dietary adherence.');

  // Documents Sub-resource
  const [patientDocs, setPatientDocs] = useState<any[]>([]);
  const [uploadDocFile, setUploadDocFile] = useState<File | null>(null);
  const [uploadDocCategory, setUploadDocCategory] = useState<string>('MedicalDocuments');
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  // Appointments Sub-resource
  const [appointmentsList, setAppointmentsList] = useState<any[]>([]);
  const [newApptDoctor, setNewApptDoctor] = useState('Dr. Sarah Wilson');
  const [newApptDate, setNewApptDate] = useState('');
  const [newApptType, setNewApptType] = useState('Follow-up Consultation');
  const [showApptModal, setShowApptModal] = useState(false);

  // Tasks & Notes Sub-resource
  const [notesList, setNotesList] = useState<any[]>([]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [tasksList, setTasksList] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Vitals Trends & Periodic Rounds Sub-resource
  const [vitalsHistory, setVitalsHistory] = useState<any[]>([]);
  const [vitalsTrendsSummary, setVitalsTrendsSummary] = useState<any>(null);
  const [vitalsChartMetric, setVitalsChartMetric] = useState<'bp' | 'hr' | 'spo2' | 'temp' | 'sugar' | 'all'>('bp');
  const [vitalsTimeRange, setVitalsTimeRange] = useState<'24h' | '7d' | 'all'>('24h');
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [newVitalBp, setNewVitalBp] = useState('120/80 mmHg');
  const [newVitalHr, setNewVitalHr] = useState('72 bpm');
  const [newVitalBs, setNewVitalBs] = useState('110 mg/dL');
  const [newVitalTemp, setNewVitalTemp] = useState('98.6 °F');
  const [newVitalSpo2, setNewVitalSpo2] = useState('98 %');
  const [newVitalRr, setNewVitalRr] = useState('18 /min');
  const [newVitalTime, setNewVitalTime] = useState('');
  const [newVitalDate, setNewVitalDate] = useState('');
  const [newVitalNurse, setNewVitalNurse] = useState('Nurse Emily Clark');
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

    return filtered.map((item: any, idx: number) => {
      const bpStr = String(item.bloodPressure || '');
      let sys = item.systolic;
      let dia = item.diastolic;
      if (!sys || !dia) {
        const parts = bpStr.split('/');
        sys = parts.length > 0 ? parseInt(parts[0].replace(/\D/g, '')) || 120 : 120;
        dia = parts.length > 1 ? parseInt(parts[1].replace(/\D/g, '')) || 80 : 80;
      }
      const hr = item.heartRateVal || parseInt(String(item.heartRate || '72').replace(/\D/g, '')) || 72;
      const spo2 = item.spO2Val || parseInt(String(item.spO2 || '98').replace(/\D/g, '')) || 98;
      const sugar = item.bloodSugarVal || parseInt(String(item.bloodSugar || '105').replace(/\D/g, '')) || 105;
      const temp = item.temperatureVal || parseFloat(String(item.temperature || '98.6').replace(/[^\d.]/g, '')) || 98.6;

      const timeLabel = item.timeText || `R${idx + 1}`;
      const dateLabel = item.dateText || '';

      return {
        name: timeLabel,
        fullLabel: `${dateLabel} ${timeLabel}`.trim(),
        systolic: sys,
        diastolic: dia,
        heartRate: hr,
        spO2: spo2,
        bloodSugar: sugar,
        temperature: temp,
        recordedBy: item.recordedBy || 'Staff Nurse',
        status: item.status || 'Normal'
      };
    });
  }, [vitalsHistory, vitalsTimeRange]);


  // Fetch Doctors & Nurses
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

          if (p.dob) setDob(p.dob);
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

          if (p.pastMedicalHistory) setPastMedicalHistory(p.pastMedicalHistory);
          if (p.insuranceProvider) setInsuranceProvider(p.insuranceProvider);
          if (p.insurancePolicyNumber) setPolicyNumber(p.insurancePolicyNumber);
          if (p.insuranceGroupNumber) setGroupNumber(p.insuranceGroupNumber);
          if (p.insuranceValidUntil) setValidUntil(p.insuranceValidUntil);
          if (p.additionalNotes) setAdditionalNotes(p.additionalNotes);
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


  useEffect(() => {
    if (patientId) {
      loadPatientData(patientId);
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
      alert('Profile picture file size must be less than 5MB.');
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
        }
      } catch (err: any) {
        alert(err.message || 'Failed to upload profile picture.');
      } finally {
        setIsUploadingAvatar(false);
      }
    } else {
      setSelectedAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) setAvatarUrl(event.target.result as string);
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
    if (!newEncounterReason.trim() || !patientId) return;
    setIsSavingEncounter(true);

    try {
      await api.createPatientClinicalEncounter(patientId, {
        encounterType: newEncounterType,
        reasonDiagnosis: newEncounterReason.trim(),
        providerName: newEncounterProvider || primaryPhysician || 'Dr. Sarah Wilson',
        dateText: formatDateMMDDYYYY(new Date()),
      });
      loadPatientData(patientId);
      setNewEncounterReason('');
      setShowEncounterModal(false);
      setSuccessMsg('Clinical encounter added successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to add clinical encounter');
    } finally {
      setIsSavingEncounter(false);
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
    if (!patientId) return;
    setIsSubmitting(true);
    try {
      await api.updatePatientVitals(patientId, {
        bloodPressure,
        heartRate,
        bloodSugar,
        temperature,
        spO2,
        respiratoryRate: '18 /min',
        recordedBy: assignedNurse || 'Staff Nurse',
        timeText: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateText: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      loadVitalsHistory(patientId);
      setSuccessMsg('Vital signs updated and telemetry round recorded.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update vitals');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Record New Periodic Telemetry Round
  const handleAddVitalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;
    setIsSavingVitalRound(true);

    try {
      await api.updatePatientVitals(patientId, {
        bloodPressure: newVitalBp,
        heartRate: newVitalHr,
        bloodSugar: newVitalBs,
        temperature: newVitalTemp,
        spO2: newVitalSpo2,
        respiratoryRate: newVitalRr || '18 /min',
        recordedBy: newVitalNurse || assignedNurse || 'Staff Nurse',
        timeText: newVitalTime.trim() || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        dateText: newVitalDate.trim() || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
      setBloodPressure(newVitalBp);
      setHeartRate(newVitalHr);
      setBloodSugar(newVitalBs);
      setTemperature(newVitalTemp);
      setSpO2(newVitalSpo2);
      loadVitalsHistory(patientId);
      setShowAddVitalModal(false);
      setSuccessMsg('Periodic telemetry round recorded successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to record telemetry round');
    } finally {
      setIsSavingVitalRound(false);
    }
  };


  // Upload Document
  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadDocFile || !patientId) return;
    setIsUploadingDoc(true);

    try {
      await api.uploadPatientDocument(patientId, uploadDocFile, uploadDocCategory);
      setUploadDocFile(null);
      setShowDocModal(false);
      loadPatientData(patientId);
      setSuccessMsg('Document uploaded into patient storage.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to upload document');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Schedule Appointment
  const handleScheduleAppt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    try {
      await api.createPatientAppointment(patientId, {
        physicianName: newApptDoctor,
        consultationType: newApptType,
        dateTimeText: newApptDate || 'Tomorrow at 10:00 AM',
        status: 'Scheduled',
      });
      setShowApptModal(false);
      loadPatientData(patientId);
      setSuccessMsg('Appointment scheduled successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to schedule appointment');
    }
  };

  // Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim() || !patientId) return;

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
      setNewNoteContent('');
      setShowNoteModal(false);
      loadPatientData(patientId);
      setSuccessMsg('Clinical note saved.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save note');
    }
  };

  // Add Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !patientId) return;

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
      setNewTaskTitle('');
      setShowTaskModal(false);
      loadPatientData(patientId);
      setSuccessMsg('Care task created.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    }
  };

  // Main Submit Handler
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!firstName.trim() || !lastName.trim()) {
      setErrorMsg('First Name and Last Name are required.');
      setActiveEditTab('General & Demographics');
      return;
    }
    if (!dob) {
      setErrorMsg('Date of Birth is required.');
      setActiveEditTab('General & Demographics');
      return;
    }
    if (!gender) {
      setErrorMsg('Gender is required.');
      setActiveEditTab('General & Demographics');
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone Number is required.');
      setActiveEditTab('General & Demographics');
      return;
    }
    if (!isValidUSPhone(phone)) {
      setErrorMsg('Please enter a valid 10-digit US phone number (e.g. (512) 555-0100).');
      setActiveEditTab('General & Demographics');
      return;
    }
    if (email && !isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
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
        primaryDoctorName: primaryPhysician,
        assignedNurseId: assignedNurseId || undefined,
        assignedNurseName: assignedNurse || '',
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
        floorRoom: floorRoom || '1st Floor - 101',
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
              progressPercentage: 75
            });
          } catch (planErr) {}
        }
        setSuccessMsg('Patient profile and clinical records saved successfully.');
        setTimeout(() => {
          navigate(`/patients/${patientId}`);
        }, 800);
      } else {

        const createRes = await api.createPatient(payload);
        const createdPatient = createRes?.data || createRes;
        const createdId = createdPatient?.id || createdPatient?.patientIdCode;

        if (createdId && selectedAvatarFile) {
          try {
            await api.uploadPatientDocument(createdId, selectedAvatarFile, 'ProfilePicture');
          } catch (uploadErr) {}
        }
        if (createdId) {
          navigate(`/patients/${createdId}`);
        } else {
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
    { id: 'Health Records', label: 'Health Records', icon: FileText },
    { id: 'Medications', label: 'Medications', icon: Pill },
    { id: 'Care Plan', label: 'Care Plan', icon: CheckCircle2 },
    { id: 'Vitals & Trends', label: 'Vitals & Trends', icon: Activity },
    { id: 'Documents', label: 'Documents', icon: FileCheck },
    { id: 'Appointments', label: 'Appointments', icon: Calendar },
    { id: 'Tasks & Notes', label: 'Tasks & Notes', icon: CheckSquare },
    { id: 'History', label: 'History', icon: HistoryIcon },
  ];

  const currentTabIndex = Math.max(0, tabsList.findIndex((t) => t.id === activeEditTab));

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

      {/* 9 WORKSPACE TABS (SHARED FOR BOTH ADD & EDIT PATIENT) */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {tabsList.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeEditTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveEditTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs font-black'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
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
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth *</label>
                  <DatePickerInput
                    value={dob}
                    onChange={(val) => setDob(val)}
                    placeholder="MM/DD/YYYY"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">US Phone Number *</label>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    placeholder="(XXX) XXX-XXXX"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pt-4 pb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                Ward Assignment & Care Status
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Care Unit</label>
                  <input
                    type="text"
                    value={careUnit}
                    onChange={(e) => setCareUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-indigo-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Room / Floor</label>
                  <input
                    type="text"
                    value={floorRoom}
                    onChange={(e) => setFloorRoom(e.target.value)}
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
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
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

              {/* Diagnosed Conditions & Allergies */}
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
                      placeholder="Add condition (e.g. Hypertension)..."
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
                      placeholder="Add allergy (e.g. Penicillin)..."
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

              {clinicalEncounters.length > 0 ? (
                <div className="space-y-3">
                  {clinicalEncounters.map((enc: any) => (
                    <div key={enc.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">{enc.encounterType || 'Clinical Review'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Date: {enc.dateText} • Provider: {enc.providerName}</p>
                        {enc.reasonDiagnosis && <p className="text-xs text-indigo-700 font-semibold mt-1">{enc.reasonDiagnosis}</p>}
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[10px] font-extrabold">Recorded</span>
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
                      {vitalsTrendsSummary?.avgSystolic || 120} / {vitalsTrendsSummary?.avgDiastolic || 80} <span className="text-[10px] text-slate-400 font-semibold">mmHg</span>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Avg. Heart Rate</p>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      {vitalsTrendsSummary?.avgHeartRate || 72} <span className="text-[10px] text-slate-400 font-semibold">bpm (Min: {vitalsTrendsSummary?.minHeartRate || 68}, Max: {vitalsTrendsSummary?.maxHeartRate || 78})</span>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Avg. Oxygen (SpO2)</p>
                    <p className="text-sm font-black text-emerald-600 mt-0.5">
                      {vitalsTrendsSummary?.avgSpO2 || 98.2}% <span className="text-[10px] text-emerald-700 font-semibold">Optimal</span>
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase">Stability Rating</p>
                    <p className="text-sm font-black text-indigo-600 mt-0.5 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      {vitalsTrendsSummary?.hemodynamicStatus || 'Stable Telemetry'}
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
                      {formattedChartData.map((round: any, rIdx: number) => (
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
                      ))}
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
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-extrabold">{app.status || 'Scheduled'}</span>
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
                      <p className="font-bold text-indigo-700">{n.createdByName || n.author || 'Dr. Sarah Wilson'}</p>
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
              <button onClick={() => setShowEncounterModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleAddEncounter} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Encounter Type</label>
                <select
                  value={newEncounterType}
                  onChange={(e) => setNewEncounterType(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
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
                  placeholder="Dr. Sarah Wilson"
                  value={newEncounterProvider}
                  onChange={(e) => setNewEncounterProvider(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowEncounterModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={isSavingEncounter} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">
                  {isSavingEncounter ? 'Saving...' : 'Record Encounter'}
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
              <button onClick={() => setShowPrescriptionModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
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
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                  <option value="Twice Daily (Morning & Evening)">Twice Daily (Morning & Evening)</option>
                  <option value="Three Times Daily">Three Times Daily</option>
                  <option value="As Needed (PRN)">As Needed (PRN)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPrescriptionModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
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
              <button onClick={() => setShowDocModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUploadDoc} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={uploadDocCategory}
                  onChange={(e) => setUploadDocCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
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
                <button type="button" onClick={() => setShowDocModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900">Schedule Appointment</h4>
              <button onClick={() => setShowApptModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleScheduleAppt} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor / Specialist</label>
                <select
                  value={newApptDoctor}
                  onChange={(e) => setNewApptDoctor(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
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
                <input
                  type="text"
                  placeholder="e.g. Aug 28, 2026 10:00 AM"
                  value={newApptDate}
                  onChange={(e) => setNewApptDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowApptModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Schedule</button>
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
              <button onClick={() => setShowNoteModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
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
                <button type="button" onClick={() => setShowNoteModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Save Note</button>
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
              <button onClick={() => setShowTaskModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
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
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 border rounded-xl font-bold">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold">Create Task</button>
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
              <button onClick={() => setShowAddVitalModal(false)} className="text-slate-400 hover:text-slate-600">
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
                  onClick={() => setShowAddVitalModal(false)}
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
