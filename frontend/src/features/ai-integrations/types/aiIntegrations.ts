export interface PatientHeaderData {
  id: string;
  name: string;
  mrn: string;
  age: number;
  gender: string;
  dob: string;
  avatarUrl?: string;
  generationDate?: string;
  confidenceScore?: number;
  expectedDischarge?: string;
  lengthOfStay?: string;
  reviewDate?: string;
}

export interface AiPatientSummaryData {
  patient: PatientHeaderData;
  clinicalSummary: string;
  activeProblems: string[];
  keyInsights: { label: string; value: string; severity?: 'good' | 'medium' | 'moderate' | 'intact' }[];
  sourceData: {
    clinicalNotes: number;
    labResults: number;
    imagingReports: number;
    medications: number;
    vitalsRecords: number;
  };
  safetyStatus: string;
}

export interface AiCareTeamIntelligenceData {
  patient: PatientHeaderData;
  overallRisk: 'High' | 'Medium' | 'Low';
  readmissionRisk: 'High' | 'Medium' | 'Low';
  careComplexity: 'High' | 'Medium' | 'Low';
  trend: 'Improving' | 'Stable' | 'Declining';
  priorities: {
    id: string;
    title: string;
    description: string;
    priority: 'High Priority' | 'Medium Priority' | 'Low Priority';
  }[];
  recommendations: {
    id: string;
    role: string;
    reviewTimeframe: string;
    icon?: string;
  }[];
  aiConfidence: number;
}

export interface AiDischargeReviewData {
  patient: PatientHeaderData;
  readinessScore: number;
  readinessLabel: string;
  readinessCriteriaMet: number;
  barriers: string[];
  checklist: {
    id: string;
    title: string;
    status: 'Completed' | 'In Progress' | 'Pending';
  }[];
  recommendations: string[];
}

export interface AiPrioritizedAlertItem {
  id: string;
  title: string;
  patientName: string;
  mrn: string;
  priority: 'High' | 'Medium' | 'Low';
  metricsSummary: string;
  timeAgo: string;
  status?: string;
}

export interface AiMedicationReviewData {
  patient: PatientHeaderData;
  reviewDate: string;
  summaryStats: {
    totalMedications: number;
    highRiskMeds: number;
    interactions: number;
    beersCriteria: number;
  };
  findings: {
    id: string;
    category: string;
    medication: string;
    riskLevel: 'High Risk' | 'Medium Risk' | 'Low Risk';
    description: string;
  }[];
  recommendations: string[];
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp?: string;
  suggestions?: string[];
  options?: string[];
  bulletPoints?: { number: number; text: string; tag?: string }[];
  followUpPrompt?: string;
}

export interface AiTaskItem {
  id: string;
  title: string;
  patientName: string;
  mrn: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  assignedRole: string;
  status: 'Suggested' | 'Accepted' | 'Completed';
}

export interface AiOperationsMetricData {
  dateRange: string;
  kpis: {
    aiRequests: { value: string; change: string; isPositive: boolean };
    successRate: { value: string; change: string; isPositive: boolean };
    avgResponseTime: { value: string; change: string; isPositive: boolean };
    userFeedback: { value: string; change: string; isPositive: boolean };
  };
  requestsOverTime: { date: string; requests: number }[];
  requestsByFeature: { name: string; value: number; color: string; percentage: string }[];
  topModels: { model: string; successRate: string }[];
  recentAlerts: { message: string; timestamp: string; type: 'warning' | 'info' }[];
}

export interface AiSettingsConfig {
  enableAiFeatures: boolean;
  requireHumanReview: boolean;
  enableAiSuggestions: boolean;
  autoGenerateSummaries: boolean;
  storeAiResponses: boolean;
  activeProvider: string;
  activeModel: string;
  temperature: number;
}

export interface AiAuditLogEntry {
  id: string;
  dateTime: string;
  feature: string;
  user: string;
  patient: string;
  action: string;
  status: 'Success' | 'Warning' | 'Error';
}

export interface AiFeedbackReviewItem {
  id: string;
  feature: string;
  patientName: string;
  mrn: string;
  generatedDate: string;
  status: 'Pending Review' | 'Reviewed' | 'Rejected';
  contentSummary?: string;
}
