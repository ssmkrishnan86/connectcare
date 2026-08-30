import type {
  AiPatientSummaryData,
  AiCareTeamIntelligenceData,
  AiDischargeReviewData,
  AiPrioritizedAlertItem,
  AiMedicationReviewData,
  AiTaskItem,
  AiOperationsMetricData,
  AiSettingsConfig,
  AiAuditLogEntry,
  AiFeedbackReviewItem,
} from '../types/aiIntegrations';

export const defaultPatient = {
  id: 'pt-john-doe',
  name: 'John Doe',
  mrn: '100201',
  age: 78,
  gender: 'Male',
  dob: '04/10/1946',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  generationDate: 'May 14, 2025 10:30 AM',
  confidenceScore: 92,
  expectedDischarge: 'May 16, 2025',
  lengthOfStay: '5 Days',
  reviewDate: 'May 14, 2025',
};

export const defaultPatientSummaryData: AiPatientSummaryData = {
  patient: defaultPatient,
  clinicalSummary:
    'Patient is a 78-year-old male with a history of hypertension, type 2 diabetes mellitus, and stage 3 chronic kidney disease. Recently admitted for shortness of breath and bilateral lower extremity edema. Echocardiogram shows preserved ejection fraction. Currently stable on diuretics with improved symptoms.',
  activeProblems: [
    'Hypertension',
    'Type 2 Diabetes Mellitus',
    'Chronic Kidney Disease Stage 3',
    'Heart Failure with preserved EF',
    'Hyperlipidemia',
  ],
  keyInsights: [
    { label: 'Risk of readmission', value: 'Medium', severity: 'medium' },
    { label: 'Medication adherence', value: 'Good', severity: 'good' },
    { label: 'Fall Risk', value: 'Moderate', severity: 'moderate' },
    { label: 'Cognitive Status', value: 'Intact', severity: 'intact' },
  ],
  sourceData: {
    clinicalNotes: 12,
    labResults: 8,
    imagingReports: 5,
    medications: 3,
    vitalsRecords: 6,
  },
  safetyStatus: 'No concerns detected',
};

export const defaultCareTeamIntelligenceData: AiCareTeamIntelligenceData = {
  patient: defaultPatient,
  overallRisk: 'High',
  readmissionRisk: 'Medium',
  careComplexity: 'High',
  trend: 'Improving',
  priorities: [
    {
      id: 'p1',
      title: 'Optimize Heart Failure Management',
      description: 'Monitor weight, fluid status, and medication adherence',
      priority: 'High Priority',
    },
    {
      id: 'p2',
      title: 'Renal Function Monitoring',
      description: 'Monitor creatinine and avoid nephrotoxic medications',
      priority: 'High Priority',
    },
    {
      id: 'p3',
      title: 'Diabetes Management',
      description: 'Review A1C and adjust medications as needed',
      priority: 'Medium Priority',
    },
    {
      id: 'p4',
      title: 'Fall Prevention',
      description: 'Implement fall precautions and patient education',
      priority: 'Medium Priority',
    },
  ],
  recommendations: [
    { id: 'r1', role: 'Cardiologist', reviewTimeframe: 'Review in 24h' },
    { id: 'r2', role: 'Nephrologist', reviewTimeframe: 'Review in 48h' },
    { id: 'r3', role: 'Diabetes Educator', reviewTimeframe: 'Review in 72h' },
    { id: 'r4', role: 'Physical Therapist', reviewTimeframe: 'Review in 72h' },
  ],
  aiConfidence: 89,
};

export const defaultDischargeReviewData: AiDischargeReviewData = {
  patient: defaultPatient,
  readinessScore: 85,
  readinessLabel: 'Likely Ready for Discharge',
  readinessCriteriaMet: 86,
  barriers: [
    'Pending PT evaluation',
    'Home support not confirmed',
    'Medication reconciliation incomplete',
  ],
  checklist: [
    { id: 'c1', title: 'Medically stable', status: 'Completed' },
    { id: 'c2', title: 'Vital signs stable', status: 'Completed' },
    { id: 'c3', title: 'Labs reviewed', status: 'Completed' },
    { id: 'c4', title: 'Discharge medications reconciled', status: 'In Progress' },
    { id: 'c5', title: 'Follow-up appointments scheduled', status: 'In Progress' },
    { id: 'c6', title: 'Patient education completed', status: 'Pending' },
    { id: 'c7', title: 'Home support confirmed', status: 'Pending' },
  ],
  recommendations: [
    'Consider home health nursing for medication management and monitoring.',
  ],
};

export const defaultAlertPrioritizationList: AiPrioritizedAlertItem[] = [
  {
    id: 'a1',
    title: 'Sepsis Risk Detected',
    patientName: 'John Doe',
    mrn: '100201',
    priority: 'High',
    metricsSummary: 'HR: 112, Temp: 101.3°F, WBC: 15.2',
    timeAgo: '10 min ago',
  },
  {
    id: 'a2',
    title: 'Medication Interaction Alert',
    patientName: 'Jane Smith',
    mrn: '100102',
    priority: 'High',
    metricsSummary: 'Warfarin + Amiodarone',
    timeAgo: '25 min ago',
  },
  {
    id: 'a3',
    title: 'Fall Risk Increased',
    patientName: 'Robert Brown',
    mrn: '100103',
    priority: 'Medium',
    metricsSummary: 'Morse Fall Score: 60',
    timeAgo: '1 hr ago',
  },
  {
    id: 'a4',
    title: 'Kidney Function Declining',
    patientName: 'Mary Johnson',
    mrn: '100104',
    priority: 'Medium',
    metricsSummary: 'Creatinine increased by 0.3 mg/dL',
    timeAgo: '2 hr ago',
  },
  {
    id: 'a5',
    title: 'Overdue Preventive Care',
    patientName: 'William Davis',
    mrn: '100105',
    priority: 'Low',
    metricsSummary: 'Flu vaccine overdue',
    timeAgo: '3 hr ago',
  },
];

export const defaultMedicationReviewData: AiMedicationReviewData = {
  patient: defaultPatient,
  reviewDate: 'May 14, 2025',
  summaryStats: {
    totalMedications: 12,
    highRiskMeds: 2,
    interactions: 3,
    beersCriteria: 1,
  },
  findings: [
    {
      id: 'f1',
      category: 'High Risk',
      medication: 'Glipizide',
      riskLevel: 'High Risk',
      description: 'Risk of hypoglycemia in elderly patients',
    },
    {
      id: 'f2',
      category: 'Interaction',
      medication: 'Warfarin + Amiodarone',
      riskLevel: 'High Risk',
      description: 'Increased risk of bleeding',
    },
    {
      id: 'f3',
      category: 'Beers Criteria',
      medication: 'Diphenhydramine',
      riskLevel: 'Medium Risk',
      description: 'Avoid in older adults (anticholinergic)',
    },
    {
      id: 'f4',
      category: 'Duplicate Therapy',
      medication: 'Vitamin D',
      riskLevel: 'Low Risk',
      description: 'Consider consolidating dose',
    },
  ],
  recommendations: [
    'Consider deprescribing diphenhydramine and monitor INR closely.',
  ],
};

export const defaultAiTasksList: AiTaskItem[] = [
  {
    id: 't1',
    title: 'Review heart failure management plan',
    patientName: 'John Doe',
    mrn: '100201',
    priority: 'High',
    dueDate: 'Today 2:00 PM',
    assignedRole: 'Cardiologist',
    status: 'Suggested',
  },
  {
    id: 't2',
    title: 'Monitor renal function labs',
    patientName: 'John Doe',
    mrn: '100201',
    priority: 'High',
    dueDate: 'Today 4:00 PM',
    assignedRole: 'Nephrologist',
    status: 'Suggested',
  },
  {
    id: 't3',
    title: 'Patient education: Low sodium diet',
    patientName: 'John Doe',
    mrn: '100201',
    priority: 'Medium',
    dueDate: 'Tomorrow 10:00 AM',
    assignedRole: 'Nurse',
    status: 'Suggested',
  },
  {
    id: 't4',
    title: 'Schedule follow-up appointment',
    patientName: 'John Doe',
    mrn: '100201',
    priority: 'Medium',
    dueDate: 'Tomorrow 2:00 PM',
    assignedRole: 'Care Coordinator',
    status: 'Suggested',
  },
];

export const defaultOperationsMetricData: AiOperationsMetricData = {
  dateRange: 'May 8 – May 14, 2025',
  kpis: {
    aiRequests: { value: '1,248', change: '+12.5%', isPositive: true },
    successRate: { value: '96.2%', change: '+2.1%', isPositive: true },
    avgResponseTime: { value: '2.8s', change: '-0.4s', isPositive: true },
    userFeedback: { value: '4.6/5', change: '+0.3', isPositive: true },
  },
  requestsOverTime: [
    { date: 'May 8', requests: 140 },
    { date: 'May 9', requests: 165 },
    { date: 'May 10', requests: 150 },
    { date: 'May 11', requests: 195 },
    { date: 'May 12', requests: 180 },
    { date: 'May 13', requests: 220 },
    { date: 'May 14', requests: 248 },
  ],
  requestsByFeature: [
    { name: 'Patient Summary', value: 35, color: '#7c3aed', percentage: '35%' },
    { name: 'Care Intelligence', value: 25, color: '#3b82f6', percentage: '25%' },
    { name: 'Discharge Review', value: 15, color: '#06b6d4', percentage: '15%' },
    { name: 'Medication Review', value: 15, color: '#f59e0b', percentage: '15%' },
    { name: 'Other', value: 10, color: '#94a3b8', percentage: '10%' },
  ],
  topModels: [
    { model: 'gpt-4o', successRate: '98.1%' },
    { model: 'gpt-4o-mini', successRate: '94.5%' },
  ],
  recentAlerts: [
    {
      message: 'High failure rate for Discharge Review',
      timestamp: 'May 14, 10:15 AM',
      type: 'warning',
    },
    {
      message: 'Increased response time detected',
      timestamp: 'May 14, 08:45 AM',
      type: 'info',
    },
  ],
};

export const defaultAiSettingsConfig: AiSettingsConfig = {
  enableAiFeatures: true,
  requireHumanReview: true,
  enableAiSuggestions: true,
  autoGenerateSummaries: false,
  storeAiResponses: true,
  activeProvider: 'OpenAI',
  activeModel: 'GPT-4o',
  temperature: 0.2,
};

export const defaultAuditLogsList: AiAuditLogEntry[] = [
  {
    id: 'log-1',
    dateTime: 'May 14, 10:30 AM',
    feature: 'Patient Summary',
    user: 'Dr. Sarah Johnson',
    patient: 'John Doe',
    action: 'Generated',
    status: 'Success',
  },
  {
    id: 'log-2',
    dateTime: 'May 14, 10:15 AM',
    feature: 'Care Intelligence',
    user: 'Dr. Sarah Johnson',
    patient: 'John Doe',
    action: 'Generated',
    status: 'Success',
  },
  {
    id: 'log-3',
    dateTime: 'May 14, 09:45 AM',
    feature: 'Medication Review',
    user: 'Dr. Sarah Johnson',
    patient: 'John Doe',
    action: 'Generated',
    status: 'Success',
  },
  {
    id: 'log-4',
    dateTime: 'May 14, 09:30 AM',
    feature: 'Discharge Review',
    user: 'Dr. Sarah Johnson',
    patient: 'John Doe',
    action: 'Generated',
    status: 'Success',
  },
  {
    id: 'log-5',
    dateTime: 'May 14, 09:15 AM',
    feature: 'Alert Prioritization',
    user: 'System',
    patient: 'Multiple',
    action: 'Processed',
    status: 'Success',
  },
  {
    id: 'log-6',
    dateTime: 'May 14, 08:50 AM',
    feature: 'Doctor Copilot',
    user: 'Dr. Sarah Johnson',
    patient: 'John Doe',
    action: 'Query',
    status: 'Success',
  },
  {
    id: 'log-7',
    dateTime: 'May 14, 08:30 AM',
    feature: 'Nurse Copilot',
    user: 'Nurse Emily Davis',
    patient: 'John Doe',
    action: 'Query',
    status: 'Success',
  },
];

export const defaultFeedbackReviewsList: AiFeedbackReviewItem[] = [
  {
    id: 'rev-1',
    feature: 'Patient Summary',
    patientName: 'John Doe',
    mrn: '100201',
    generatedDate: 'May 14, 10:30 AM',
    status: 'Pending Review',
    contentSummary: 'Clinical narrative summary synthesized for Dr. Sarah Johnson review.',
  },
  {
    id: 'rev-2',
    feature: 'Discharge Review',
    patientName: 'John Doe',
    mrn: '100201',
    generatedDate: 'May 14, 09:30 AM',
    status: 'Pending Review',
    contentSummary: 'Discharge readiness 85% with 3 pending barrier items identified.',
  },
  {
    id: 'rev-3',
    feature: 'Medication Review',
    patientName: 'John Doe',
    mrn: '100201',
    generatedDate: 'May 14, 09:45 AM',
    status: 'Pending Review',
    contentSummary: 'Glipizide hypoglycemia risk and Warfarin + Amiodarone interaction flags.',
  },
];
