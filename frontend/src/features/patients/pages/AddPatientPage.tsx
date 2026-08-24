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

  // Active Tab / Stepper Tab
  const [activeStep, setActiveStep] = useState(1);
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

  // History Sub-resource
  const [historyList, setHistoryList] = useState<any[]>([]);

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
      });
      setSuccessMsg('Vital signs updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update vitals');
    } finally {
      setIsSubmitting(false);
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
      if (!isEditMode) setActiveStep(1);
      return;
    }
    if (!dob) {
      setErrorMsg('Date of Birth is required.');
      if (!isEditMode) setActiveStep(1);
      return;
    }
    if (!gender) {
      setErrorMsg('Gender is required.');
      if (!isEditMode) setActiveStep(1);
      return;
    }
    if (!phone.trim()) {
      setErrorMsg('Phone Number is required.');
      if (!isEditMode) setActiveStep(1);
      return;
    }
    if (!isValidUSPhone(phone)) {
      setErrorMsg('Please enter a valid 10-digit US phone number (e.g. (512) 555-0100).');
      if (!isEditMode) setActiveStep(1);
      return;
    }
    if (email && !isValidEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      if (!isEditMode) setActiveStep(1);
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

  const editTabs = [
    'General & Demographics',
    'Health Records',
    'Medications',
    'Care Plan',
    'Vitals & Trends',
    'Documents',
    'Appointments',
    'Tasks & Notes',
    'History',
  ];

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
              <span>{isEditMode ? 'Save Changes' : 'Create Patient'}</span>
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

      {/* EDIT MODE: 9 FULL WORKSPACE TABS */}
      {isEditMode ? (
        <div className="space-y-6">
          <div className="border-b border-slate-200 bg-white rounded-2xl p-1 shadow-2xs">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {editTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEditTab(tab)}
                  className={`px-4 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all cursor-pointer ${
                    activeEditTab === tab
                      ? 'bg-indigo-600 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
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
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-600" />
                  Live Vital Signs & Baseline Parameters
                </h3>
                <button
                  type="button"
                  onClick={handleSaveVitals}
                  className="px-4 py-1.5 bg-indigo-600 text-white font-extrabold rounded-xl text-xs cursor-pointer hover:bg-indigo-700 shadow-2xs"
                >
                  Save Vitals
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase">Blood Pressure</label>
                  <input
                    type="text"
                    value={bloodPressure}
                    onChange={(e) => setBloodPressure(e.target.value)}
                    placeholder="120/80"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase">Heart Rate (bpm)</label>
                  <input
                    type="text"
                    value={heartRate}
                    onChange={(e) => setHeartRate(e.target.value)}
                    placeholder="72"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase">Blood Sugar (mg/dL)</label>
                  <input
                    type="text"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    placeholder="95"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase">Temperature (°F)</label>
                  <input
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    placeholder="98.6"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900"
                  />
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-[11px] font-extrabold text-slate-500 mb-1.5 uppercase">SpO2 Oxygen (%)</label>
                  <input
                    type="text"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    placeholder="98"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-black text-slate-900"
                  />
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
        </div>
      ) : (
        /* CREATE MODE: 4-STEP WIZARD */
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-black text-slate-900">Step {activeStep} of 4: Patient Registration</h3>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    activeStep === step ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>

          {activeStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender *</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number *</label>
                <PhoneInput
                  value={phone}
                  onChange={(val) => setPhone(val)}
                  placeholder="(XXX) XXX-XXXX"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Care Unit</label>
                <input
                  type="text"
                  value={careUnit}
                  onChange={(e) => setCareUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Room / Floor</label>
                <input
                  type="text"
                  value={floorRoom}
                  onChange={(e) => setFloorRoom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Primary Doctor</label>
                <select
                  value={primaryDoctorId}
                  onChange={(e) => {
                    setPrimaryDoctorId(e.target.value);
                    const d = doctors.find((doc: any) => doc.id === e.target.value);
                    if (d) setPrimaryPhysician(d.name);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Insurance Provider</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Policy Number</label>
                <input
                  type="text"
                  value={policyNumber}
                  onChange={(e) => setPolicyNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Group Number</label>
                <input
                  type="text"
                  value={groupNumber}
                  onChange={(e) => setGroupNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4 text-xs font-semibold">
              <p className="text-slate-700">Please review all information before confirming patient registration.</p>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p><strong>Name:</strong> {firstName} {lastName}</p>
                <p><strong>DOB:</strong> {dob} ({calculateAge(dob)} years old)</p>
                <p><strong>Phone:</strong> {phone}</p>
                <p><strong>Unit:</strong> {careUnit} - {floorRoom}</p>
                <p><strong>Doctor:</strong> {primaryPhysician || 'Not assigned'}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {activeStep > 1 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep - 1)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                Back
              </button>
            ) : <div />}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={() => setActiveStep(activeStep + 1)}
                className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-6 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700"
              >
                Confirm & Create Patient
              </button>
            )}
          </div>
        </div>
      )}

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
    </div>
  );
};
