import React, { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { useConfirm } from '@/context/ConfirmContext';
import { PageHeader } from '@/components/common/PageHeader';
import { DataImportExportToolbar } from '@/components/common/DataImportExportToolbar';
import { DateTimePickerInput } from '@/components/common/DateTimePickerInput';
import {
  Search,
  Calendar,
  ClipboardCheck,
  RotateCw,
  CheckCircle2,
  Clock,
  Eye,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  FileText,
  Shield,
  Printer,
  X,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Heart,
  Activity,
  Pill,
  UserCheck,
  Plus
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Discharge Instructions Templates Definition
// ---------------------------------------------------------------------------
export interface DischargeInstructionTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: any;
  badgeColor: string;
  medicationGuidelines: string[];
  activityRestrictions: string[];
  dietAndHydration: string[];
  woundCareAndHygiene: string[];
  warningSignsEmergency: string[];
  followUpPlan: string;
}

export const DISCHARGE_TEMPLATES: Record<string, DischargeInstructionTemplate> = {
  'med-surg': {
    id: 'med-surg',
    name: 'General Medical-Surgical Protocol',
    category: 'General Inpatient',
    description: 'Standard multi-system recovery protocol for post-acute medical and general surgical patients.',
    icon: FileText,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    medicationGuidelines: [
      'Take all prescribed antibiotics and analgesics precisely as directed with full glass of water.',
      'Do not abruptly discontinue medications without consulting your primary attending doctor.',
      'Maintain an updated daily medication log and report any adverse side-effects immediately.'
    ],
    activityRestrictions: [
      'Gradually increase walking duration; avoid strenuous lifting over 10 lbs for 2 weeks.',
      'Get adequate rest (8-10 hours daily). Elevate legs during prolonged sitting if edema occurs.',
      'No driving or operating machinery while taking narcotic/opioid pain management.'
    ],
    dietAndHydration: [
      'Consume high-fiber, nutrient-dense diet rich in lean protein to promote cellular healing.',
      'Drink 6-8 glasses of water daily unless on strict cardiac or renal fluid restrictions.',
      'Limit sodium (< 2,000 mg/day) and avoid alcohol during medication course.'
    ],
    woundCareAndHygiene: [
      'Keep incision or catheter insertion site clean and dry; do not soak in bath/tub.',
      'Inspect surgical sites daily for erythema, purulent drainage, swelling, or opening.',
      'Gentle soap-and-water sponge bathing allowed after 48 hours post-discharge.'
    ],
    warningSignsEmergency: [
      'Fever > 101Â°F (38.3Â°C) or severe shaking chills.',
      'Persistent nausea/vomiting preventing oral medication or fluid retention.',
      'Sudden onset of chest tightness, acute shortness of breath, or calf swelling/pain (Call 911).'
    ],
    followUpPlan: 'Schedule clinical evaluation with Attending Physician within 5 to 7 days post-discharge.'
  },
  'cardio': {
    id: 'cardio',
    name: 'Cardiovascular & Heart Care Protocol',
    category: 'Cardiology',
    description: 'Specialized cardiac protocol for heart failure, post-MI, telemetry, and vascular patients.',
    icon: Heart,
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    medicationGuidelines: [
      'Take Beta-blockers, ACE inhibitors/ARBs, and blood thinners (Anticoagulants) at exact daily times.',
      'Never skip blood pressure medications; hold and call doctor if systolic BP < 90 or HR < 50 bpm.',
      'Keep emergency sublingual Nitroglycerin accessible at all times in original glass container.'
    ],
    activityRestrictions: [
      'Perform light cardiac rehab walking; rest immediately if experiencing palpitations or fatigue.',
      'Avoid heavy pushing, pulling, or lifting > 5 lbs for 4 weeks.',
      'Avoid extreme temperature exposures (very hot showers, saunas, or freezing weather).'
    ],
    dietAndHydration: [
      'Strict Low-Sodium DASH diet (< 1,500 mg sodium daily). Avoid processed/canned foods.',
      'Strict Daily Fluid Restriction: Maximum 1.5 to 2.0 Liters daily as specified by cardiologist.',
      'Log daily morning weight before breakfast after voiding. Report gain > 3 lbs in 1 day or 5 lbs in 1 week.'
    ],
    woundCareAndHygiene: [
      'Monitor femoral or radial vascular access puncture site for hematoma, bruising, or bruits.',
      'Keep access dressing dry for 24-48 hours; do not submerge in water.'
    ],
    warningSignsEmergency: [
      'Recurrent or crushing chest pain radiating to jaw, neck, left arm, or back (Call 911 immediately).',
      'Sudden worsening shortness of breath while lying flat (orthopnea) or waking gasping for air.',
      'Dizziness, syncope (fainting), irregular rapid heart palpitations, or sudden severe leg swelling.'
    ],
    followUpPlan: 'Cardiology outpatient visit & repeat 12-lead ECG within 7 to 10 days.'
  },
  'post-op': {
    id: 'post-op',
    name: 'Post-Operative Wound Care & Suture Protocol',
    category: 'Surgery',
    description: 'Comprehensive surgical incision, drain management, and tissue recovery guideline.',
    icon: Activity,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medicationGuidelines: [
      'Alternate acetaminophen and prescribed NSAIDs/opioids as scheduled for breakthrough pain.',
      'Take stool softeners with opioid analgesics to prevent post-surgical constipation.'
    ],
    activityRestrictions: [
      'Strict lifting restriction (< 10 lbs) for 4 to 6 weeks to protect surgical fascia/staples.',
      'Use abdominal binder or splint incision with pillow when coughing or deep breathing.',
      'Perform ankle pumps and wear sequential compression / TED hose to prevent DVT.'
    ],
    dietAndHydration: [
      'Begin with clear liquids; advance to regular diet as tolerated to prevent post-anesthesia ileus.',
      'High-protein intake (eggs, chicken, legumes, protein shakes) to support tissue re-epithelialization.'
    ],
    woundCareAndHygiene: [
      'Change sterile dressing every 24 hours or if saturated. Wash hands thoroughly before touching.',
      'Steri-strips should remain in place until they curl and peel off naturally (typically 7-10 days).',
      'Record Jackson-Pratt (JP) drain output volume every 12 hours. Notify clinic if output increases.'
    ],
    warningSignsEmergency: [
      'Spreading redness > 2 cm from incision margins, foul-smelling wound discharge, or wound dehiscence.',
      'Uncontrolled pain not relieved by maximum prescribed doses of analgesic medications.',
      'High fever > 101.5Â°F or sudden calf tenderness and unilateral lower extremity swelling.'
    ],
    followUpPlan: 'Suture / staple removal and surgical wound check at Day 10 to 14 post-op.'
  },
  'diabetes': {
    id: 'diabetes',
    name: 'Diabetes Management & Glycemic Protocol',
    category: 'Endocrinology',
    description: 'Targeted blood glucose stabilization, insulin adjustment, and foot safety regimen.',
    icon: Pill,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    medicationGuidelines: [
      'Administer long-acting basal insulin at bedtime and rapid-acting bolus insulin before meals.',
      'Re-check blood glucose before each injection; follow provided sliding scale correction chart.',
      'Keep fast-acting glucose tablets or fruit juice readily available for hypoglycemia management.'
    ],
    activityRestrictions: [
      'Engage in 20-30 minutes of mild post-meal walking to improve peripheral insulin sensitivity.',
      'Always wear supportive, non-binding footwear with socks; never walk barefoot.'
    ],
    dietAndHydration: [
      'Consistent carbohydrate meal planning (45-60g carbs per meal). Avoid concentrated refined sugars.',
      'Hydrate with zero-calorie fluids (water, herbal teas); avoid sugar-sweetened beverages.'
    ],
    woundCareAndHygiene: [
      'Perform daily visual inspection of feet, heels, and between toes with mirror for blisters/cuts.',
      'Apply moisturizing lotion to feet daily, but avoid applying lotion between toes.'
    ],
    warningSignsEmergency: [
      'Hypoglycemia (Blood glucose < 70 mg/dL) with confusion, shakiness, or diaphoresis (Apply 15-15 Rule).',
      'Severe Hyperglycemia (> 300 mg/dL) with positive urine ketones, fruity breath odor, or vomiting (Call 911).',
      'Non-healing foot ulcers, localized skin heat, or spreading toe discoloration.'
    ],
    followUpPlan: 'Endocrine / Diabetes Educator clinic follow-up and HbA1c review in 2 to 3 weeks.'
  },
  'respiratory': {
    id: 'respiratory',
    name: 'Respiratory & Pulmonology Recovery Protocol',
    category: 'Pulmonology',
    description: 'Post-pneumonia, COPD exacerbation, and pulmonary rehabilitation discharge guide.',
    icon: Shield,
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    medicationGuidelines: [
      'Use maintenance inhalers (corticosteroid/LABA) twice daily; rinse mouth after steroid inhalers.',
      'Use rescue inhaler (Albuterol) every 4-6 hours as needed for wheezing or acute dyspnea.',
      'Complete full course of oral steroids (Prednisone taper) and antibiotics as ordered.'
    ],
    activityRestrictions: [
      'Practice pursed-lip breathing during exertion. Take frequent seated breaks during daily tasks.',
      'Use Incentive Spirometer 10 breaths every hour while awake (target > 1,500 mL).'
    ],
    dietAndHydration: [
      'Eat small, frequent, nutrient-dense meals to reduce diaphragm pressure and respiratory fatigue.',
      'Drink 2-3 liters of fluids daily to thin out bronchial secretions for easier expectoration.'
    ],
    woundCareAndHygiene: [
      'Keep home environment free of smoke, aerosol sprays, strong chemicals, and pet dander triggers.'
    ],
    warningSignsEmergency: [
      'Resting Oxygen Saturation (SpO2) drops below 90% (or < 88% in chronic COPD baseline).',
      'Inability to speak in full sentences due to air hunger or blue/gray discoloration of lips/fingers (Call 911).',
      'Coughing up rust-colored or bloody sputum (hemoptysis) or sudden stabbing pleuritic chest pain.'
    ],
    followUpPlan: 'Pulmonology follow-up and Pulmonary Function Test (PFT) in 10 to 14 days.'
  },
  'orthopedic': {
    id: 'orthopedic',
    name: 'Orthopedic & Physical Mobility Protocol',
    category: 'Orthopedics',
    description: 'Post-arthroplasty, fracture reduction, and weight-bearing rehab discharge care.',
    icon: Activity,
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    medicationGuidelines: [
      'Take prescribed anti-inflammatory and muscle relaxant medications with food.',
      'Continue prescribed Aspirin or Eliquis anticoagulant therapy for DVT prophylaxis.'
    ],
    activityRestrictions: [
      'Adhere strictly to designated weight-bearing status (e.g. Weight-Bearing As Tolerated / PWB 50%).',
      'Use assistive device (Walker, Crutches, or Cane) at all times when ambulating or transferring.',
      'Avoid 90-degree hip flexion, leg crossing, or inward rotation if anterior/posterior hip precautions apply.'
    ],
    dietAndHydration: [
      'Ensure adequate dietary Calcium (1,200 mg/day) and Vitamin D3 (2,000 IU/day) for bone remodeling.',
      'Maintain hydration to aid bowel regularity during period of reduced physical mobility.'
    ],
    woundCareAndHygiene: [
      'Keep surgical dressing or waterproof seal intact. Do not submerge limb in pools or baths.',
      'Apply ice pack over incision dressing for 20 minutes every 2 hours to minimize post-op swelling.'
    ],
    warningSignsEmergency: [
      'Sudden severe calf pain, warmth, redness, or asymmetry indicative of deep vein thrombosis.',
      'Loss of sensation, numbness, tingling, or inability to move toes/fingers (compartment syndrome risk).',
      'Popping sensation in operated joint accompanied by acute severe pain or joint deformity.'
    ],
    followUpPlan: 'Physical Therapy home visits begin in 48 hours; Orthopedic surgeon review in 2 weeks.'
  },
  'pediatric': {
    id: 'pediatric',
    name: 'Pediatric & Family Care Guide',
    category: 'Pediatrics',
    description: 'Family-centered discharge protocol with weight-based dosing and infant/child safety.',
    icon: UserCheck,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    medicationGuidelines: [
      'Administer liquid medications using calibrated oral syringe only; never use household kitchen spoons.',
      'Follow exact weight-based pediatric dosing schedule for acetaminophen and ibuprofen.'
    ],
    activityRestrictions: [
      'Keep child well-hydrated and quiet; avoid rough contact sports and playground equipment for 1 week.',
      'Keep sleeping room humidified with cool-mist humidifier cleaned daily.'
    ],
    dietAndHydration: [
      'Offer frequent small sips of oral electrolyte solution (Pedialyte), diluted apple juice, or popsicles.',
      'Monitor wet diaper count: Ensure at least 4 to 6 wet diapers every 24 hours.'
    ],
    woundCareAndHygiene: [
      'Keep minor surgical wounds or cannula sites dry; sponge-bathe infants until pediatrician approval.'
    ],
    warningSignsEmergency: [
      'Lethargy, extreme drowsiness, difficulty waking, or persistent inconsolable crying.',
      'Signs of severe dehydration: No wet diapers for 8 hours, sunken eyes, dry mouth, or no tears when crying.',
      'Respiratory distress: Ribs pulling in (retractions), nostril flaring, grunting sounds, or stridor (Call 911).'
    ],
    followUpPlan: 'Pediatrician outpatient follow-up exam within 48 to 72 hours.'
  }
};

// ---------------------------------------------------------------------------
// Standard 14 Verification Checklist Items
// ---------------------------------------------------------------------------
export const DISCHARGE_VERIFICATION_ITEMS = [
  { id: '1', category: 'Clinical & Medical Clearance', title: 'Attending Physician Final Discharge Authorization', description: 'Physician reviewed clinical stability and signed formal discharge clearance order.' },
  { id: '2', category: 'Clinical & Medical Clearance', title: 'Vital Signs Stable for Past 24 Hours', description: 'Blood pressure, heart rate, temperature, and SpO2 within target discharge baseline.' },
  { id: '3', category: 'Clinical & Medical Clearance', title: 'Diagnostic Labs & Radiology Results Cleared', description: 'All outstanding inpatient laboratory, pathology, and imaging reports reviewed.' },
  { id: '4', category: 'Clinical & Medical Clearance', title: 'Invasive Lines, Catheters & IV Cannulas Removed', description: 'Peripheral IVs, arterial lines, Foley catheters, and telemetry leads safely removed.' },

  { id: '5', category: 'Medication & Pharmacy Reconciliation', title: 'Discharge Prescription List Reconciled', description: 'Home medication regimen reconciled with hospital treatments to avoid drug interactions.' },
  { id: '6', category: 'Medication & Pharmacy Reconciliation', title: 'Pharmacy E-Prescriptions Sent & Verified', description: 'New discharge prescriptions transmitted electronically to patient chosen retail pharmacy.' },
  { id: '7', category: 'Medication & Pharmacy Reconciliation', title: 'Patient / Caregiver Medication Counseling Provided', description: 'Nurse/Pharmacist counseled patient on medication dosages, side-effects, and schedules.' },

  { id: '8', category: 'Discharge Instructions & Education', title: 'Discharge Instructions Template Given & Explained', description: 'Disease-specific discharge instructions reviewed with patient and family members.' },
  { id: '9', category: 'Discharge Instructions & Education', title: 'Dietary & Activity Restrictions Reviewed', description: 'Physical mobility limits, dietary guidelines, and lifting restrictions documented.' },
  { id: '10', category: 'Discharge Instructions & Education', title: 'Red-Flag Warning Signs & Emergency Numbers Provided', description: '24/7 hospital call-in line, nurse triage number, and 911 criteria provided in writing.' },

  { id: '11', category: 'Follow-Up & Care Coordination', title: 'Post-Discharge Follow-Up Appointment Scheduled', description: 'Outpatient clinic visit booked with date, time, clinic location, and physician name.' },
  { id: '12', category: 'Follow-Up & Care Coordination', title: 'Specialist Referrals & Home Health Arranged', description: 'Physical therapy, home health nursing, or medical equipment (DME) ordered if required.' },

  { id: '13', category: 'Administrative & Safe Logistics', title: 'Safe Transportation & Adult Escort Confirmed', description: 'Designated family member or licensed medical transport confirmed for safe ride home.' },
  { id: '14', category: 'Administrative & Safe Logistics', title: 'Personal Belongings & Hospital Valuables Returned', description: 'Clothing, personal items, medications from safe, and hospital ID band removed.' },
];

export const DischargeChecklistPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  // Data states
  const [checklists, setChecklists] = useState<any[]>([]);
  const [patientsList, setPatientsList] = useState<any[]>([]);
  const [_summary, setSummary] = useState<any>({
    totalPatients: 21,
    inProgress: 7,
    readyForDischarge: 9,
    pendingItems: 3,
    dischargedToday: 2,
  });
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [, setLoading] = useState(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('All Patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [unitFilter, setUnitFilter] = useState('All Units / Floors');
  const [patientFilter, setPatientFilter] = useState('All Patients');
  const [statusFilter, setStatusFilter] = useState('All Checklist Status');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Action Menu Dropdown state (row ID with open dropdown)
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // View Checklist Modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewChecklistData, setViewChecklistData] = useState<any>(null);
  const [viewTab, setViewTab] = useState<'checklist' | 'instructions' | 'notes'>('checklist');

  // Edit Checklist Modal
  const initialEditForm = {
    patientName: '',
    roomNumber: '',
    careUnit: '',
    attendingDoctorName: '',
    expectedDischargeText: '',
    admitDateText: '',
    checklistStatus: 'InProgress',
    progressPercentage: 70,
    instructionsTemplate: 'med-surg',
    notes: ''
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingId, setEditingId] = useState<string>('');
  const [editForm, setEditForm] = useState(initialEditForm);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Create New Checklist Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [newPatientName, setNewPatientName] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newCareUnit, setNewCareUnit] = useState('');
  const [newDoctor, setNewDoctor] = useState('');
  const [newDischargeDate, setNewDischargeDate] = useState(
    new Date(Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
  );
  const [newTemplateKey, setNewTemplateKey] = useState('med-surg');
  const [newNotes, setNewNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Quick Action Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedBrowseTemplate, setSelectedBrowseTemplate] = useState('med-surg');
  const [showEducationModal, setShowEducationModal] = useState(false);

  // -------------------------------------------------------------------------
  // Fetch Checklists Data
  // -------------------------------------------------------------------------
  const fetchChecklistsData = async () => {
    setLoading(true);
    try {
      const nurseIdParam = user?.role === 'Nurse' ? user?.nurseId : undefined;
      const doctorIdParam = user?.role === 'Doctor' ? user?.doctorId : undefined;

      const [listRes, sumRes, patRes] = await Promise.all([
        api.getDischargeChecklists(activeTab, unitFilter, searchQuery),
        api.getDischargeSummary(),
        api.getPatients(undefined, undefined, undefined, doctorIdParam, nurseIdParam).catch(() => []),
      ]);

      const listData = Array.isArray(listRes) ? listRes : (listRes as any)?.data || [];
      setChecklists(listData);

      const pats = Array.isArray(patRes) ? patRes : (patRes as any)?.data || [];
      setPatientsList(pats);

      if (listData.length > 0) {
        if (!selectedPatient || !listData.find((c: any) => c.id === selectedPatient.id)) {
          setSelectedPatient(listData[0]);
        } else {
          const updatedSelected = listData.find((c: any) => c.id === selectedPatient.id);
          if (updatedSelected) setSelectedPatient(updatedSelected);
        }
      }

      const sumData = (sumRes as any)?.data || sumRes;
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err) {
      console.error('Failed to fetch discharge checklists:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChecklistsData();
  }, [activeTab, searchQuery, unitFilter, patientFilter, statusFilter, user?.nurseId, user?.doctorId]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, unitFilter, patientFilter, statusFilter, pageSize]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setOpenActionMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // -------------------------------------------------------------------------
  // Filtering & Pagination Calculations
  // -------------------------------------------------------------------------
  const filteredChecklists = useMemo(() => {
    return checklists.filter((item) => {
      // Tab filter
      if (activeTab === 'In Progress') {
        const s = String(item.checklistStatus);
        if (s !== 'InProgress' && s !== '0' && s !== 'In Progress') return false;
      } else if (activeTab === 'Ready for Discharge') {
        const s = String(item.checklistStatus);
        if (s !== 'Ready' && s !== '1' && s !== 'Ready for Discharge') return false;
      } else if (activeTab === 'Discharged') {
        const s = String(item.checklistStatus);
        if (s !== 'Discharged' && s !== '3') return false;
      } else if (activeTab === 'Cancelled') {
        const s = String(item.checklistStatus);
        if (s !== 'Cancelled' && s !== '4') return false;
      }

      // Unit filter
      if (unitFilter !== 'All Units / Floors') {
        if (!item.careUnit?.toLowerCase().includes(unitFilter.toLowerCase())) return false;
      }

      // Patient filter
      if (patientFilter !== 'All Patients') {
        if (!item.patientName?.toLowerCase().includes(patientFilter.toLowerCase())) return false;
      }

      // Status filter
      if (statusFilter !== 'All Checklist Status') {
        const s = String(item.checklistStatus).toLowerCase();
        const sf = statusFilter.toLowerCase();
        if (sf === 'in progress' && !s.includes('progress') && s !== '0') return false;
        if (sf === 'ready for discharge' && !s.includes('ready') && s !== '1') return false;
        if (sf === 'pending items' && !s.includes('pending') && s !== '2') return false;
        if (sf === 'cancelled' && !s.includes('cancel') && s !== '4') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.patientName?.toLowerCase().includes(q);
        const matchPid = item.patientIdCode?.toLowerCase().includes(q);
        const matchRoom = item.roomNumber?.toLowerCase().includes(q);
        const matchUnit = item.careUnit?.toLowerCase().includes(q);
        const matchDoctor = item.attendingDoctorName?.toLowerCase().includes(q);
        if (!matchName && !matchPid && !matchRoom && !matchUnit && !matchDoctor) return false;
      }

      return true;
    });
  }, [checklists, activeTab, unitFilter, patientFilter, statusFilter, searchQuery]);

  const totalItems = filteredChecklists.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedChecklists = useMemo(() => {
    return filteredChecklists.slice(startIndex, endIndex);
  }, [filteredChecklists, startIndex, endIndex]);

  // -------------------------------------------------------------------------
  // Handlers: View, Edit, Complete, Delete
  // -------------------------------------------------------------------------
  const handleOpenViewModal = (item: any) => {
    setSelectedPatient(item);
    setViewChecklistData(item);
    setViewTab('checklist');
    setShowViewModal(true);
    setOpenActionMenuId(null);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingId(item.id);
    setEditForm({
      patientName: item.patientName || '',
      roomNumber: item.roomNumber || 'Room 101',
      careUnit: item.careUnit || 'Cardiology Unit',
      attendingDoctorName: item.attendingDoctorName || 'Dr. Sarah Wilson',
      expectedDischargeText: item.expectedDischargeText || '',
      admitDateText: item.admitDateText || '',
      checklistStatus: item.checklistStatus || 'InProgress',
      progressPercentage: item.progressPercentage ?? 70,
      instructionsTemplate: item.instructionsTemplate || 'med-surg',
      notes: item.notes || ''
    });
    setShowEditModal(true);
    setOpenActionMenuId(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setIsSavingEdit(true);
    try {
      const isReady = editForm.checklistStatus === 'Ready' || editForm.checklistStatus === 'Discharged' || editForm.progressPercentage === 100;
      const finalProgress = isReady ? 100 : Number(editForm.progressPercentage);
      const updatedPayload = {
        patientName: editForm.patientName,
        roomNumber: editForm.roomNumber,
        careUnit: editForm.careUnit,
        attendingDoctorName: editForm.attendingDoctorName,
        expectedDischargeText: editForm.expectedDischargeText,
        admitDateText: editForm.admitDateText,
        checklistStatus: editForm.checklistStatus,
        progressPercentage: finalProgress,
        pendingItemsCount: isReady ? 0 : Math.max(0, 14 - Math.round((finalProgress / 100) * 14)),
        completedItemsCount: isReady ? 14 : Math.round((finalProgress / 100) * 14),
        instructionsTemplate: editForm.instructionsTemplate,
        notes: editForm.notes
      };

      await api.updateDischargeChecklist(editingId, updatedPayload);

      if (selectedPatient?.id === editingId) {
        setSelectedPatient((prev: any) => ({
          ...prev,
          ...updatedPayload,
        }));
      }
      if (showViewModal && viewChecklistData?.id === editingId) {
        setViewChecklistData((prev: any) => ({
          ...prev,
          ...updatedPayload,
        }));
      }

      toast.success('Discharge checklist updated successfully!', 'Changes Saved');
      setShowEditModal(false);
      setEditForm(initialEditForm);
      setEditingId('');
      fetchChecklistsData();
    } catch (err: any) {
      console.error('Failed to update checklist:', err);
      toast.error(err?.message || 'Failed to update checklist.', 'Update Error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleMarkAsReady = async (item: any) => {
    try {
      await api.completeDischargeChecklist(item.id);
      toast.success(`${item.patientName} is now marked as Ready for Discharge (100% Completed)!`, 'Checklist Cleared');
      fetchChecklistsData();
      if (showViewModal && viewChecklistData?.id === item.id) {
        setViewChecklistData({
          ...viewChecklistData,
          checklistStatus: 'Ready',
          progressPercentage: 100,
          pendingItemsCount: 0,
          completedItemsCount: 14
        });
      }
      setOpenActionMenuId(null);
    } catch (err: any) {
      console.error('Failed to mark checklist as ready:', err);
      toast.error(err?.message || 'Failed to update checklist status.', 'Action Failed');
    }
  };

  const handleDeleteChecklist = async (item: any) => {
    setOpenActionMenuId(null);
    const confirmed = await confirm({
      title: 'Delete Discharge Checklist?',
      message: `Are you sure you want to permanently delete the discharge checklist for "${item.patientName}" (${item.patientIdCode || 'N/A'})? This action cannot be undone.`,
      confirmText: 'Delete Checklist',
      cancelText: 'Keep Checklist',
      variant: 'danger',
    });

    if (!confirmed) return;

    try {
      await api.deleteDischargeChecklist(item.id);
      toast.success(`Discharge checklist for ${item.patientName} was deleted.`, 'Checklist Deleted');
      if (selectedPatient?.id === item.id) {
        setSelectedPatient(null);
      }
      if (showViewModal && viewChecklistData?.id === item.id) {
        setShowViewModal(false);
      }
      fetchChecklistsData();
    } catch (err: any) {
      console.error('Failed to delete checklist:', err);
      toast.error(err?.message || 'Failed to delete checklist.', 'Delete Failed');
    }
  };

  const handleSelectPatientForDischarge = (patientId: string) => {
    setSelectedPatientId(patientId);
    const pat = patientsList.find(p => p.id === patientId);
    if (pat) {
      setNewPatientName(pat.name || '');
      setNewRoomNumber(pat.roomNumber || pat.floorRoom || 'Room 101');
      setNewCareUnit(pat.department || pat.careUnit || 'Cardiology Unit');
      setNewDoctor(pat.primaryDoctorName || pat.assignedDoctorName || (user?.role === 'Doctor' ? (user.fullName || user.username) : 'Dr. Sarah Wilson'));
    } else {
      setNewPatientName('');
      setNewRoomNumber('');
      setNewCareUnit('');
      setNewDoctor('');
    }
  };

  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) {
      toast.warning('Please enter patient name', 'Required Field');
      return;
    }

    setIsCreating(true);
    try {
      await api.createDischargeChecklist({
        patientId: selectedPatientId || undefined,
        patientName: newPatientName,
        roomNumber: newRoomNumber || 'Room 101',
        careUnit: newCareUnit || 'General Ward',
        attendingDoctorName: newDoctor || 'Attending Physician',
        expectedDischargeText: newDischargeDate,
        admitDateText: new Date(Date.now() - 4 * 86400000).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        admitDaysText: '4 days',
        instructionsTemplate: newTemplateKey,
        notes: newNotes,
      });

      toast.success(`Discharge checklist initialized for ${newPatientName}!`, 'Checklist Created');
      setShowCreateModal(false);
      setSelectedPatientId('');
      setNewPatientName('');
      setNewRoomNumber('');
      setNewCareUnit('');
      setNewDoctor('');
      setNewNotes('');
      fetchChecklistsData();
    } catch (err: any) {
      console.error('Failed to create discharge checklist:', err);
      toast.error(err?.message || 'Failed to create discharge checklist.', 'Creation Failed');
    } finally {
      setIsCreating(false);
    }
  };

  // -------------------------------------------------------------------------
  // UI Helpers: Status Badges & Readiness Indicators
  // -------------------------------------------------------------------------
  const isChecklistReady = (item: any) => {
    if (!item) return false;
    const s = String(item.checklistStatus);
    return s === 'Ready' || s === '1' || s === 'Ready for Discharge' || s === 'Discharged' || s === '3' || item.progressPercentage === 100;
  };

  const getStatusBadge = (status: string, percentage: number) => {
    const statusStr = String(status);
    const ready = statusStr === 'Ready' || statusStr === '1' || statusStr === 'Ready for Discharge' || percentage === 100;
    const isInProgress = !ready && (statusStr === 'InProgress' || statusStr === '0' || statusStr === 'In Progress');
    const isPending = !ready && (statusStr === 'PendingItems' || statusStr === '2' || statusStr === 'Pending Items');
    const isDischarged = statusStr === 'Discharged' || statusStr === '3';

    if (ready) {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-2xs">
              <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
              Ready for Discharge
            </span>
          </div>
          <div className="text-[10px] font-extrabold text-emerald-600 flex items-center gap-1">
            <Check className="h-3 w-3 text-emerald-600" />
            <span>100% Cleared (All 14 Done)</span>
          </div>
          <div className="h-1.5 w-28 bg-emerald-500 rounded-full"></div>
        </div>
      );
    }

    if (isInProgress) {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
            In Progress
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
            <span className="font-extrabold text-blue-600">{percentage || 70}% Completed</span>
          </div>
          <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full" style={{ width: `${percentage || 70}%` }}></div>
          </div>
        </div>
      );
    }

    if (isPending) {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
            Pending Items
          </span>
          <div className="text-[10px] font-extrabold text-amber-600">{percentage || 50}% Completed</div>
          <div className="h-1.5 w-28 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percentage || 50}%` }}></div>
          </div>
        </div>
      );
    }

    if (isDischarged) {
      return (
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200">
            Discharged
          </span>
          <div className="text-[10px] font-extrabold text-purple-600">Discharge Finalized</div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 text-slate-600">
          Cancelled
        </span>
        <div className="text-[10px] font-semibold text-slate-400">Discharge cancelled</div>
      </div>
    );
  };

  const currentTemplate = useMemo(() => {
    const key = selectedPatient?.instructionsTemplate || 'med-surg';
    return DISCHARGE_TEMPLATES[key] || DISCHARGE_TEMPLATES['med-surg'];
  }, [selectedPatient]);

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <div className="space-y-5 max-w-[1700px] mx-auto select-none font-sans text-slate-800">
      
      {/* 1. Page Header */}
      <PageHeader
        title="Discharge Checklist"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Discharge Checklist' },
        ]}
        actions={
          <DataImportExportToolbar
            moduleKey="discharge-checklists"
            data={checklists}
            idField="id"
            onImportSuccess={fetchChecklistsData}
            customCreateApi={api.createDischargeChecklist}
          />
        }
      />

      {/* 2. Sub-Header Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 bg-white px-6 py-2.5 rounded-2xl shadow-xs text-xs font-bold overflow-x-auto">
        {[
          'All Patients',
          'In Progress',
          'Ready for Discharge',
          'Discharged',
          'Cancelled'
        ].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-1 transition-colors relative cursor-pointer whitespace-nowrap ${
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

      {/* 3. Filter Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by patient, PID, room..."
              className="pl-8 pr-3 py-2 w-52 sm:w-64 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Unit / Floor Dropdown */}
          <div className="relative">
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Units / Floors</option>
              <option>Cardiology Unit</option>
              <option>Medical Unit</option>
              <option>Surgical Unit</option>
              <option>Pediatrics Unit</option>
              <option>Downtown Medical Plaza</option>
              <option>General Ward</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Patient Dropdown */}
          <div className="relative">
            <select
              value={patientFilter}
              onChange={(e) => setPatientFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Patients</option>
              {checklists.map((c) => (
                <option key={c.id} value={c.patientName}>
                  {c.patientName}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Checklist Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option>All Checklist Status</option>
              <option>In Progress</option>
              <option>Ready for Discharge</option>
              <option>Pending Items</option>
              <option>Discharged</option>
              <option>Cancelled</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Reset Filters */}
          {(searchQuery || unitFilter !== 'All Units / Floors' || patientFilter !== 'All Patients' || statusFilter !== 'All Checklist Status') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setUnitFilter('All Units / Floors');
                setPatientFilter('All Patients');
                setStatusFilter('All Checklist Status');
              }}
              className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {/* Start New Checklist Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>New Checklist</span>
        </button>
      </div>

      {/* 4. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Patients */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">{checklists.length}</h3>
            <p className="text-[11px] font-bold text-slate-500">Active Checklists</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Hospital Wide</p>
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <RotateCw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {checklists.filter((c: any) => !isChecklistReady(c) && String(c.checklistStatus).includes('Progress')).length}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">In Progress</p>
            <p className="text-[10px] font-extrabold text-blue-600 mt-0.5">Verification Active</p>
          </div>
        </div>

        {/* Card 3: Ready for Discharge */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-300">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-emerald-900 leading-tight">
              {checklists.filter((c: any) => isChecklistReady(c)).length}
            </h3>
            <p className="text-[11px] font-black text-emerald-700">Ready for Discharge</p>
            <p className="text-[10px] font-extrabold text-emerald-600 mt-0.5">100% Cleared</p>
          </div>
        </div>

        {/* Card 4: Pending Items */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {checklists.filter((c: any) => String(c.checklistStatus).includes('Pending')).length}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">Pending Items</p>
            <p className="text-[10px] font-extrabold text-amber-600 mt-0.5">Awaiting Tests/Labs</p>
          </div>
        </div>

        {/* Card 5: Discharged Today */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <Check className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 leading-tight">
              {checklists.filter((c: any) => String(c.checklistStatus) === 'Discharged').length}
            </h3>
            <p className="text-[11px] font-bold text-slate-500">Discharged</p>
            <p className="text-[10px] font-extrabold text-purple-600 mt-0.5">Summary Archived</p>
          </div>
        </div>

      </div>

      {/* 5. Main Split Screen (8 Cols Table + 4 Cols Sidebar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Section: Discharge Checklist Table (8 Columns) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="font-extrabold text-slate-900 text-sm">Discharge Checklist Records</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-black">
                {filteredChecklists.length}
              </span>
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={5}>5 per page</option>
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-xs font-semibold text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Patient</th>
                  <th className="py-3.5 px-3">Room / Unit</th>
                  <th className="py-3.5 px-3">Admit Date</th>
                  <th className="py-3.5 px-3">Checklist Status</th>
                  <th className="py-3.5 px-3">Pending Items</th>
                  <th className="py-3.5 px-3">Expected Discharge</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedChecklists.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-semibold">
                      <ClipboardCheck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-bold text-slate-600">No discharge checklists found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or create a new checklist.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedChecklists.map((row) => {
                    const ready = isChecklistReady(row);
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedPatient(row)}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          selectedPatient?.id === row.id
                            ? 'bg-indigo-50/40 border-l-4 border-l-indigo-600'
                            : ready
                            ? 'bg-emerald-50/15'
                            : ''
                        }`}
                      >
                        
                        {/* Patient */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            {row.patientAvatar ? (
                              <img
                                src={row.patientAvatar}
                                alt={row.patientName}
                                className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                              />
                            ) : (
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
                                ready
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                              }`}>
                                {row.patientName ? row.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                              </div>
                            )}
                            <div>
                              <p className="font-black text-slate-900 text-xs leading-tight flex items-center gap-1.5">
                                <span>{row.patientName}</span>
                                {ready && (
                                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800">
                                    Ready
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold">PID: {row.patientIdCode || 'PT-10001'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Room / Unit */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <p className="font-extrabold text-slate-900 text-xs leading-tight">{row.roomNumber || '302'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{row.careUnit || 'Cardiology Unit'}</p>
                        </td>

                        {/* Admit Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <p className="font-bold text-slate-900 text-xs leading-tight">{row.admitDateText || 'Aug 24, 2026'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{row.admitDaysText || '4 days in care'}</p>
                        </td>

                        {/* Checklist Status */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {getStatusBadge(row.checklistStatus, row.progressPercentage)}
                        </td>

                        {/* Pending Items */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {ready ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              0 Pending
                            </span>
                          ) : row.pendingItemsCount !== undefined && row.pendingItemsCount !== null && String(row.pendingItemsCount) !== '-' ? (
                            <div>
                              <span className="font-black text-rose-600 text-xs">{row.pendingItemsCount} items remaining</span>
                              <p
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenViewModal(row);
                                }}
                                className="text-[10px] font-extrabold text-indigo-600 hover:underline cursor-pointer"
                              >
                                View Details &rarr;
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>

                        {/* Expected Discharge */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          {row.expectedDischargeText && row.expectedDischargeText !== '-' ? (
                            <div>
                              <p className="font-bold text-slate-900 text-xs leading-tight">{row.expectedDischargeText}</p>
                              <p className={`text-[10px] font-extrabold ${ready ? 'text-emerald-600' : 'text-slate-400'}`}>
                                {ready ? 'Approved' : (row.expectedDischargeRelative || 'Target Date')}
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-bold">-</span>
                          )}
                        </td>

                        {/* Actions (View + More with Edit & Delete) */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1 relative action-menu-container" onClick={(e) => e.stopPropagation()}>
                            
                            {/* 1. View Details Button */}
                            <button
                              onClick={() => handleOpenViewModal(row)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                              title="View Complete Checklist & Instructions"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* 2. More Options Dropdown Button */}
                            <button
                              onClick={() => setOpenActionMenuId(openActionMenuId === row.id ? null : row.id)}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                openActionMenuId === row.id ? 'bg-slate-200 text-slate-800' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                              }`}
                              title="More Options (Edit, Delete, Complete)"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>

                            {/* Floating Action Menu */}
                            {openActionMenuId === row.id && (
                              <div className="absolute right-0 top-8 z-50 bg-white border border-slate-200 shadow-xl rounded-xl w-48 py-1 text-left text-xs font-semibold animate-in fade-in zoom-in-95 duration-100">
                                
                                <button
                                  onClick={() => handleOpenViewModal(row)}
                                  className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-left cursor-pointer"
                                >
                                  <Eye className="h-3.5 w-3.5 text-indigo-600" />
                                  <span>View Details</span>
                                </button>

                                <button
                                  onClick={() => handleOpenEditModal(row)}
                                  className="w-full px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700 text-left cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-blue-600" />
                                  <span>Edit Checklist</span>
                                </button>

                                {!ready && (
                                  <button
                                    onClick={() => handleMarkAsReady(row)}
                                    className="w-full px-3 py-2 hover:bg-emerald-50 flex items-center gap-2 text-emerald-700 text-left cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Mark Ready (100%)</span>
                                  </button>
                                )}

                                <div className="border-t border-slate-100 my-1"></div>

                                <button
                                  onClick={() => handleDeleteChecklist(row)}
                                  className="w-full px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-600 text-left cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                                  <span>Delete Checklist</span>
                                </button>
                              </div>
                            )}

                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold text-slate-500">
            <span>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to {endIndex} of {totalItems} patients
            </span>

            <div className="flex items-center gap-1.5">
              {/* Previous Page */}
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous Page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Numbered Page Buttons */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 rounded-lg font-black text-xs transition-colors cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {/* Next Page */}
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next Page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Section: Sidebar Widgets (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Selected Patient Details */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-extrabold text-slate-900 text-xs">Selected Patient</h3>
              {selectedPatient && (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                  isChecklistReady(selectedPatient)
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  {isChecklistReady(selectedPatient) ? 'Ready for Discharge' : 'In Progress'}
                </span>
              )}
            </div>

            {selectedPatient ? (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  {selectedPatient.patientAvatar ? (
                    <img
                      src={selectedPatient.patientAvatar}
                      alt={selectedPatient.patientName}
                      className="h-12 w-12 rounded-full object-cover shrink-0 border-2 border-indigo-100 shadow-xs"
                    />
                  ) : (
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border-2 ${
                      isChecklistReady(selectedPatient)
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}>
                      {selectedPatient.patientName ? selectedPatient.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                    </div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-sm">{selectedPatient.patientName}</h4>
                    <p className="text-[11px] font-bold text-slate-500">PID: {selectedPatient.patientIdCode || 'PT-10001'}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedPatient.ageGender || '68 Y â€¢ Female â€¢ A+'}</p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                      {selectedPatient.roomNumber || 'Room 302'} â€¢ {selectedPatient.careUnit || 'Cardiology Unit'}
                    </p>
                  </div>
                </div>

                {/* Discharge Readiness Banner in Sidebar */}
                {isChecklistReady(selectedPatient) ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-black text-xs">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>Ready for Discharge</span>
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">
                      All 14 clinical criteria and discharge instructions have been completed & verified.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-black text-blue-900 text-xs">{selectedPatient.progressPercentage || 70}% Complete</p>
                      <p className="text-[10px] text-blue-700 font-semibold">{selectedPatient.pendingItemsCount || 2} items remaining</p>
                    </div>
                    <button
                      onClick={() => handleMarkAsReady(selectedPatient)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-extrabold shadow-xs cursor-pointer"
                    >
                      Mark Ready
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                  <div>
                    <p className="text-[10px] text-slate-400">Admit Date</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.admitDateText || 'Aug 24, 2026'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Expected Discharge</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.expectedDischargeText || 'Aug 28, 2026'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                  <div>
                    <p className="text-[10px] text-slate-400">Attending Doctor</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.attendingDoctorName || 'Dr. Sarah Wilson'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Care Team</p>
                    <p className="font-extrabold text-slate-900 text-xs">{selectedPatient.careTeamMembersCount || 3} Members</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleOpenViewModal(selectedPatient)}
                    className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer shadow-xs text-center"
                  >
                    View Full Details
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(selectedPatient)}
                    className="px-3 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">Select a patient from the checklist table</p>
            )}
          </div>

          {/* Card 2: Checklist Progress Summary */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xs">Checklist Summary</h3>

            {/* Donut Progress Ring */}
            <div className="flex items-center gap-6">
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-100" strokeWidth="4" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path
                    className={isChecklistReady(selectedPatient) ? 'text-emerald-500' : 'text-blue-500'}
                    strokeWidth="4"
                    strokeDasharray={`${isChecklistReady(selectedPatient) ? 100 : (selectedPatient?.progressPercentage || 70)}, 100`}
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900">
                    {isChecklistReady(selectedPatient) ? '100%' : `${selectedPatient?.progressPercentage || 70}%`}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">
                    {isChecklistReady(selectedPatient) ? 'Completed' : 'Progress'}
                  </span>
                </div>
              </div>

              {/* Progress Breakdown */}
              <div className="space-y-1.5 text-xs font-semibold text-slate-600 flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span>Completed</span>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {isChecklistReady(selectedPatient) ? 14 : (selectedPatient?.completedItemsCount || 7)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                    <span>In Progress</span>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {isChecklistReady(selectedPatient) ? 0 : (selectedPatient?.inProgressItemsCount || 4)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span>Pending</span>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {isChecklistReady(selectedPatient) ? 0 : (selectedPatient?.pendingItemsCount || 2)}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-semibold text-slate-400 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Total Verification Items: 14</span>
              {isChecklistReady(selectedPatient) && (
                <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Ready for Discharge
                </span>
              )}
            </p>
          </div>

          {/* Card 3: Discharge Instructions Template Preview */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-xs">Discharge Instructions</h3>
              </div>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black ${currentTemplate.badgeColor}`}>
                {currentTemplate.name}
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {currentTemplate.description}
              </p>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                <p className="font-black text-slate-900 text-[11px] flex items-center gap-1.5">
                  <Pill className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Key Medication Rule:</span>
                </p>
                <p className="text-[11px] text-slate-600">{currentTemplate.medicationGuidelines[0]}</p>
              </div>

              <div className="p-2.5 bg-rose-50/60 border border-rose-100 rounded-xl space-y-1">
                <p className="font-black text-rose-900 text-[11px] flex items-center gap-1.5">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                  <span>Emergency Warning Sign:</span>
                </p>
                <p className="text-[11px] text-rose-700">{currentTemplate.warningSignsEmergency[0]}</p>
              </div>
            </div>

            <button
              onClick={() => {
                setSelectedBrowseTemplate(selectedPatient?.instructionsTemplate || 'med-surg');
                setShowTemplateModal(true);
              }}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-colors cursor-pointer text-center"
            >
              Browse All Instructions Templates
            </button>
          </div>

          {/* Card 4: Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-2.5">
            <h3 className="font-extrabold text-slate-900 text-xs">Quick Actions</h3>

            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <ClipboardCheck className="h-4 w-4 shrink-0 text-indigo-600" />
              <span>Start New Checklist</span>
            </button>

            <button
              onClick={() => setShowTemplateModal(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <FileText className="h-4 w-4 shrink-0" />
              <span>Discharge Instructions Library</span>
            </button>

            <button
              onClick={() => setShowEducationModal(true)}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <Shield className="h-4 w-4 shrink-0" />
              <span>Patient Education Materials</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full flex items-center gap-2.5 py-2 px-3 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-600 rounded-xl text-xs font-black transition-colors cursor-pointer text-left"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span>Print Discharge Summary</span>
            </button>
          </div>

        </div>

      </div>

      {/* ------------------------------------------------------------------- */}
      {/* 6. MODAL: Complete View Discharge Checklist Details                 */}
      {/* ------------------------------------------------------------------- */}
      {showViewModal && viewChecklistData && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border-2 ${
                  isChecklistReady(viewChecklistData)
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                }`}>
                  {viewChecklistData.patientName ? viewChecklistData.patientName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'PT'}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="font-black text-slate-900 text-xl">{viewChecklistData.patientName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-200 text-slate-700">
                      PID: {viewChecklistData.patientIdCode || 'PT-10001'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                      isChecklistReady(viewChecklistData)
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-blue-100 text-blue-800 border-blue-300'
                    }`}>
                      {isChecklistReady(viewChecklistData) ? 'Ready for Discharge' : 'In Progress'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    {viewChecklistData.roomNumber || 'Room 101'} â€¢ {viewChecklistData.careUnit || 'Cardiology Unit'} â€¢ Attending: <span className="text-slate-800 font-bold">{viewChecklistData.attendingDoctorName || 'Dr. Sarah Wilson'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Discharge Readiness Banner */}
            <div className="px-6 pt-4">
              {isChecklistReady(viewChecklistData) ? (
                <div className="p-4 bg-emerald-500 text-white rounded-2xl shadow-sm flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm">âœ… PATIENT IS READY FOR DISCHARGE</h4>
                      <p className="text-xs text-emerald-50 font-medium">
                        All 14 clinical clearance items, medication reconciliations, and discharge education protocols are 100% completed and in order.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-white text-emerald-700 rounded-xl text-xs font-black shrink-0">
                    100% Cleared
                  </span>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-700">
                      <Clock className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900 text-xs">DISCHARGE IN PROGRESS ({viewChecklistData.progressPercentage || 70}%)</h4>
                      <p className="text-[11px] text-amber-700 font-medium">
                        {viewChecklistData.pendingItemsCount || 2} verification items remain pending before patient can safely leave.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkAsReady(viewChecklistData)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Mark All Ready (100%)
                  </button>
                </div>
              )}
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-6 px-6 pt-4 border-b border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewTab('checklist')}
                className={`pb-2.5 transition-colors relative cursor-pointer ${
                  viewTab === 'checklist' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                14 Verification Criteria
                {viewTab === 'checklist' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>}
              </button>
              <button
                onClick={() => setViewTab('instructions')}
                className={`pb-2.5 transition-colors relative cursor-pointer ${
                  viewTab === 'instructions' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Discharge Instructions & Plan
                {viewTab === 'instructions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>}
              </button>
              <button
                onClick={() => setViewTab('notes')}
                className={`pb-2.5 transition-colors relative cursor-pointer ${
                  viewTab === 'notes' ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Clinical Notes & Care Team
                {viewTab === 'notes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"></span>}
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* TAB 1: 14 VERIFICATION ITEMS */}
              {viewTab === 'checklist' && (
                <div className="space-y-4">
                  {['Clinical & Medical Clearance', 'Medication & Pharmacy Reconciliation', 'Discharge Instructions & Education', 'Follow-Up & Care Coordination', 'Administrative & Safe Logistics'].map((categoryName) => {
                    const categoryItems = DISCHARGE_VERIFICATION_ITEMS.filter(i => i.category === categoryName);
                    return (
                      <div key={categoryName} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                          <h4 className="font-extrabold text-slate-900 text-xs tracking-wide uppercase">{categoryName}</h4>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            {isChecklistReady(viewChecklistData) ? `${categoryItems.length}/${categoryItems.length} Verified` : `${Math.max(1, categoryItems.length - 1)}/${categoryItems.length} Complete`}
                          </span>
                        </div>

                        <div className="space-y-2">
                          {categoryItems.map((item, idx) => {
                            const isDone = isChecklistReady(viewChecklistData) || idx < categoryItems.length - 1;
                            return (
                              <div
                                key={item.id}
                                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                                  isDone
                                    ? 'bg-white border-emerald-200 text-slate-800'
                                    : 'bg-amber-50/40 border-amber-200 text-slate-800'
                                }`}
                              >
                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold ${
                                  isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                }`}>
                                  {isDone ? <Check className="h-4 w-4" /> : <Clock className="h-3.5 w-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <p className="font-black text-xs text-slate-900">{item.title}</p>
                                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                      isDone ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {isDone ? 'Completed' : 'Pending'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{item.description}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* TAB 2: DISCHARGE INSTRUCTIONS */}
              {viewTab === 'instructions' && (
                <div className="space-y-5">
                  <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">Active Protocol</span>
                      <h4 className="font-black text-slate-900 text-sm mt-0.5">{currentTemplate.name}</h4>
                      <p className="text-xs text-slate-600 font-medium mt-0.5">{currentTemplate.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-black border ${currentTemplate.badgeColor}`}>
                      {currentTemplate.category}
                    </span>
                  </div>

                  {/* Section 1: Medication Guidelines */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 text-indigo-700">
                      <Pill className="h-4 w-4 text-indigo-600" />
                      <span>Medication & Administration Guidelines</span>
                    </h5>
                    <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 font-medium">
                      {currentTemplate.medicationGuidelines.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 2: Activity & Mobility */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 text-blue-700">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span>Activity & Mobility Restrictions</span>
                    </h5>
                    <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 font-medium">
                      {currentTemplate.activityRestrictions.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 3: Diet & Hydration */}
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <h5 className="font-extrabold text-slate-900 text-xs flex items-center gap-2 text-emerald-700">
                      <Heart className="h-4 w-4 text-emerald-600" />
                      <span>Diet, Nutrition & Fluid Intake</span>
                    </h5>
                    <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 font-medium">
                      {currentTemplate.dietAndHydration.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 4: Emergency Warning Signs */}
                  <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-2">
                    <h5 className="font-extrabold text-rose-900 text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      <span>Emergency Warning Signs (Seek Immediate Medical Care)</span>
                    </h5>
                    <ul className="space-y-1.5 pl-6 list-disc text-xs text-rose-900 font-medium">
                      {currentTemplate.warningSignsEmergency.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Section 5: Follow-Up Consultation */}
                  <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1">
                    <h5 className="font-extrabold text-purple-900 text-xs flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <span>Scheduled Follow-Up Consultation Plan</span>
                    </h5>
                    <p className="text-xs text-purple-950 font-semibold">{currentTemplate.followUpPlan}</p>
                  </div>
                </div>
              )}

              {/* TAB 3: NOTES & CARE TEAM */}
              {viewTab === 'notes' && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-xs">Attending Physician & Care Team</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <p className="text-[10px] text-slate-400">Primary Doctor</p>
                        <p className="font-extrabold text-slate-900 text-xs mt-0.5">{viewChecklistData.attendingDoctorName || 'Dr. Sarah Wilson'}</p>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <p className="text-[10px] text-slate-400">Care Unit</p>
                        <p className="font-extrabold text-slate-900 text-xs mt-0.5">{viewChecklistData.careUnit || 'Cardiology Unit'}</p>
                      </div>
                      <div className="p-3 bg-white border border-slate-200 rounded-xl">
                        <p className="text-[10px] text-slate-400">Assigned Room</p>
                        <p className="font-extrabold text-slate-900 text-xs mt-0.5">{viewChecklistData.roomNumber || 'Room 101'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="font-extrabold text-slate-900 text-xs">Clinical Discharge Notes</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal bg-white p-3 border border-slate-200 rounded-xl">
                      {viewChecklistData.notes || 'Patient demonstrated understanding of home medication regimen and wound care protocols. Family member was present during education. Follow-up consultation confirmed.'}
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleOpenEditModal(viewChecklistData);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Checklist</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {!isChecklistReady(viewChecklistData) && (
                  <button
                    onClick={() => handleMarkAsReady(viewChecklistData)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Mark Ready for Discharge (100%)</span>
                  </button>
                )}
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 7. MODAL: Edit Discharge Checklist Details                          */}
      {/* ------------------------------------------------------------------- */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Edit2 className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Edit Discharge Checklist</h3>
              </div>
              <button onClick={() => {
                setShowEditModal(false);
                setEditForm(initialEditForm);
                setEditingId('');
              }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3.5 text-xs font-semibold">
              
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editForm.patientName}
                  onChange={(e) => setEditForm({ ...editForm, patientName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Room Number</label>
                  <input
                    type="text"
                    value={editForm.roomNumber}
                    onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <input
                    type="text"
                    value={editForm.careUnit}
                    onChange={(e) => setEditForm({ ...editForm, careUnit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Attending Doctor</label>
                  <input
                    type="text"
                    value={editForm.attendingDoctorName}
                    onChange={(e) => setEditForm({ ...editForm, attendingDoctorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Expected Discharge Date</label>
                  <DateTimePickerInput
                    value={editForm.expectedDischargeText}
                    onChange={(val) => setEditForm({ ...editForm, expectedDischargeText: val })}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder="e.g. Aug 30, 2026 10:00 AM"
                  />
                </div>
              </div>

              {/* Status & Progress */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Checklist Status</label>
                  <select
                    value={editForm.checklistStatus}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setEditForm({
                        ...editForm,
                        checklistStatus: newStatus,
                        progressPercentage: newStatus === 'Ready' || newStatus === 'Discharged' ? 100 : (newStatus === 'InProgress' ? 70 : 30)
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="InProgress">In Progress</option>
                    <option value="Ready">Ready for Discharge (100%)</option>
                    <option value="PendingItems">Pending Items</option>
                    <option value="Discharged">Discharged (100%)</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">
                    Progress Percentage ({editForm.progressPercentage}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editForm.progressPercentage}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setEditForm({
                        ...editForm,
                        progressPercentage: val,
                        checklistStatus: val === 100 ? (editForm.checklistStatus === 'Discharged' ? 'Discharged' : 'Ready') : editForm.checklistStatus
                      });
                    }}
                    className="w-full mt-2 accent-indigo-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Instructions Template Selection */}
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Discharge Instructions Protocol</label>
                <select
                  value={editForm.instructionsTemplate}
                  onChange={(e) => setEditForm({ ...editForm, instructionsTemplate: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {Object.values(DISCHARGE_TEMPLATES).map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Clinical Notes & Comments</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="Enter clinical notes..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm(initialEditForm);
                    setEditingId('');
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 8. MODAL: Start New Discharge Checklist                             */}
      {/* ------------------------------------------------------------------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto my-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ClipboardCheck className="h-4 w-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Start New Discharge Checklist</h3>
              </div>
              <button onClick={() => {
                setShowCreateModal(false);
                setSelectedPatientId('');
                setNewPatientName('');
                setNewRoomNumber('');
                setNewCareUnit('');
                setNewDoctor('');
                setNewNotes('');
              }} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChecklist} className="space-y-3.5 text-xs font-semibold">
              
              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Select Admitted Patient</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => handleSelectPatientForDischarge(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- Choose Existing Admitted Patient --</option>
                  {patientsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.patientId ? `(${p.patientId})` : ''} - {p.roomNumber || p.floorRoom || 'Room N/A'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Patient Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newPatientName}
                  onChange={(e) => setNewPatientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 302"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Care Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Cardiology Unit"
                    value={newCareUnit}
                    onChange={(e) => setNewCareUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Attending Doctor</label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sarah Wilson"
                    value={newDoctor}
                    onChange={(e) => setNewDoctor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-extrabold mb-1">Expected Discharge Date</label>
                  <DateTimePickerInput
                    value={newDischargeDate}
                    onChange={(val) => setNewDischargeDate(val)}
                    minDate={new Date().toISOString().split('T')[0]}
                    placeholder="e.g. Aug 30, 2026 10:00 AM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-extrabold mb-1">Discharge Instructions Template</label>
                <select
                  value={newTemplateKey}
                  onChange={(e) => setNewTemplateKey(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                >
                  {Object.values(DISCHARGE_TEMPLATES).map((tmpl) => (
                    <option key={tmpl.id} value={tmpl.id}>
                      {tmpl.name} ({tmpl.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedPatientId('');
                    setNewPatientName('');
                    setNewRoomNumber('');
                    setNewCareUnit('');
                    setNewDoctor('');
                    setNewNotes('');
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                >
                  {isCreating ? 'Creating...' : 'Start Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 9. MODAL: Discharge Instructions Template Library Browser           */}
      {/* ------------------------------------------------------------------- */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg">Discharge Instructions Templates</h3>
                  <p className="text-xs text-slate-500 font-semibold">Standardized clinical recovery protocols by specialty</p>
                </div>
              </div>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-xl cursor-pointer">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
              
              {/* Left Column: Template Selector List */}
              <div className="md:col-span-4 border-r border-slate-100 p-4 space-y-2 overflow-y-auto bg-slate-50/30">
                <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 px-2 mb-2">Available Protocols</p>
                {Object.values(DISCHARGE_TEMPLATES).map((tmpl) => {
                  const isSelected = selectedBrowseTemplate === tmpl.id;
                  const Icon = tmpl.icon;
                  return (
                    <button
                      key={tmpl.id}
                      onClick={() => setSelectedBrowseTemplate(tmpl.id)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-700'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-xs leading-tight truncate">{tmpl.name}</p>
                        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100 font-medium' : 'text-slate-400 font-semibold'}`}>
                          {tmpl.category}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Column: Complete Template Instructions Preview */}
              <div className="md:col-span-8 p-6 overflow-y-auto space-y-5">
                {(() => {
                  const tmpl = DISCHARGE_TEMPLATES[selectedBrowseTemplate] || DISCHARGE_TEMPLATES['med-surg'];
                  return (
                    <div className="space-y-5">
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black border mb-1.5 ${tmpl.badgeColor}`}>
                            {tmpl.category}
                          </span>
                          <h4 className="font-black text-slate-900 text-base">{tmpl.name}</h4>
                          <p className="text-xs text-slate-600 font-medium mt-1">{tmpl.description}</p>
                        </div>
                      </div>

                      {/* Medication Guidelines */}
                      <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                        <h5 className="font-black text-indigo-950 text-xs flex items-center gap-2">
                          <Pill className="h-4 w-4 text-indigo-600" />
                          <span>1. Medication Safety & Regimen</span>
                        </h5>
                        <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 font-medium">
                          {tmpl.medicationGuidelines.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Activity & Mobility */}
                      <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-2">
                        <h5 className="font-black text-blue-950 text-xs flex items-center gap-2">
                          <Activity className="h-4 w-4 text-blue-600" />
                          <span>2. Physical Activity & Lifting Limits</span>
                        </h5>
                        <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 font-medium">
                          {tmpl.activityRestrictions.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Diet & Hydration */}
                      <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                        <h5 className="font-black text-emerald-950 text-xs flex items-center gap-2">
                          <Heart className="h-4 w-4 text-emerald-600" />
                          <span>3. Diet & Fluid Intake</span>
                        </h5>
                        <ul className="space-y-1.5 pl-6 list-disc text-xs text-slate-700 font-medium">
                          {tmpl.dietAndHydration.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Emergency Warning Signs */}
                      <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-2">
                        <h5 className="font-black text-rose-950 text-xs flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                          <span>4. Emergency Warning Signs (Seek Immediate Medical Care)</span>
                        </h5>
                        <ul className="space-y-1.5 pl-6 list-disc text-xs text-rose-900 font-medium">
                          {tmpl.warningSignsEmergency.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Follow-up Plan */}
                      <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-2xl space-y-1">
                        <h5 className="font-black text-purple-950 text-xs flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-600" />
                          <span>5. Recommended Follow-Up Schedule</span>
                        </h5>
                        <p className="text-xs text-purple-900 font-semibold">{tmpl.followUpPlan}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Instructions</span>
              </button>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Close Library
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* 10. MODAL: Patient Education Materials                              */}
      {/* ------------------------------------------------------------------- */}
      {showEducationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Patient Education Materials</h3>
              </div>
              <button onClick={() => setShowEducationModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                <p className="font-black text-emerald-900 text-xs">Printable Patient Education Guides</p>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-700 font-medium">
                  <li>Cardiovascular Health & Home Recovery Protocol</li>
                  <li>Diabetic Diet, Blood Sugar Tracking & Insulin Safety</li>
                  <li>Wound Care, Suture Management & Infection Prevention</li>
                  <li>Mobility Exercises & Home Fall Prevention Plan</li>
                  <li>Pulmonary Breathing Techniques & Inhaler Guide</li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Materials</span>
              </button>
              <button
                onClick={() => setShowEducationModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DischargeChecklistPage;