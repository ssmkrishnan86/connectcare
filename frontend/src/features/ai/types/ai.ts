export interface AiPatientSummary {
  id: string;
  patientId: string;
  patientName: string;
  patientIdCode: string;
  currentStatus: string;
  recentChanges: string;
  activeConcerns: string;
  outstandingActions: string;
  followUpPlan: string;
  citations: string[];
  dataFreshnessUtc: string;
  modelVersion: string;
  dispositionStatus: 'Draft' | 'Accepted' | 'Edited' | 'Dismissed';
  reviewedBy?: string;
  reviewedDate?: string;
  isAiGenerated: boolean;
  latencyMs: number;
}

export interface AiCarePriorityItem {
  id: string;
  priorityLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  targetRole: 'Doctor' | 'Nurse' | 'CareCoordinator' | 'Pharmacist' | 'SocialWorker';
  title: string;
  rationale: string;
  suggestedAction: string;
  actionType: 'OrderReview' | 'TaskCreation' | 'MedicationRecon' | 'VitalsCheck' | 'CarePlanUpdate';
  urgency: 'Immediate' | 'Today' | 'NextShift' | 'Routine';
  dispositionStatus: 'Pending' | 'Accepted' | 'Dismissed';
  actionedBy?: string;
  actionedDate?: string;
  resultingTaskId?: string;
  resultingTaskIdCode?: string;
}

export interface AiCarePriorities {
  patientId: string;
  patientName: string;
  patientIdCode: string;
  priorities: AiCarePriorityItem[];
  generatedAtUtc: string;
  modelVersion: string;
  latencyMs: number;
}

export interface AiDischargeReview {
  id: string;
  patientId: string;
  patientName: string;
  patientIdCode: string;
  readinessScore: number;
  readinessStatus: 'Ready' | 'Conditional' | 'NotReady';
  summaryFindings: string;
  missingItems: string[];
  conflictingItems: string[];
  riskFlags: string[];
  actionableRecommendations: string[];
  checklistRefId?: string;
  dispositionStatus: string;
  reviewedBy?: string;
  reviewedDate?: string;
  generatedAtUtc: string;
  modelVersion: string;
  latencyMs: number;
}

export interface AiPrioritizedAlert {
  id: string;
  alertId: string;
  aiRankScore: number;
  urgencyLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  clinicalRationale: string;
  suggestedIntervention: string;
  originalSeverity: string;
  originalTitle: string;
  originalType: string;
  originalCreatedAt: string;
  dispositionStatus: string;
}

export interface AiAlertPrioritizationResult {
  patientId: string;
  patientName: string;
  rankedAlerts: AiPrioritizedAlert[];
  totalAlertsEvaluated: number;
  generatedAtUtc: string;
  modelVersion: string;
  latencyMs: number;
}

export interface AiMedicationSafetyAlert {
  severity: 'Critical' | 'Warning' | 'Information';
  title: string;
  description: string;
  recommendation: string;
}

export interface AiMedicationReview {
  id: string;
  patientId: string;
  patientName: string;
  patientIdCode: string;
  safetyScore: number;
  reviewStatus: 'Completed' | 'Warning' | 'ActionRequired';
  clinicalSynthesis: string;
  safetyAlerts: AiMedicationSafetyAlert[];
  beersCriteriaFlags: string[];
  recommendations: string[];
  dispositionStatus: 'Pending' | 'PharmacistSignedOff' | 'PhysicianReviewed' | 'Dismissed';
  reviewedBy?: string;
  reviewedDate?: string;
  modelVersion: string;
  latencyMs: number;
}

export interface AiCopilotQuery {
  patientId?: string;
  patientIdCode?: string;
  patientName?: string;
  promptQuery: string;
  category?: string;
  targetRole?: 'Doctor' | 'Nurse';
}

export interface AiCopilotResponse {
  responseText: string;
  patientName: string;
  patientIdCode: string;
  citations: string[];
  modelVersion: string;
  safetyStatus: string;
  guardrailsEnforced: boolean;
  latencyMs: number;
}

export interface AiContextBundle {
  patientId: string;
  patientName: string;
  patientIdCode: string;
  ageGender: string;
  careUnit: string;
  roomBed: string;
  primaryDoctor: string;
  assignedNurse: string;
  admissionDate: string;
  fallRiskLevel: string;
  activeDiagnoses: string[];
  allergies: string[];
  activeMedications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    status: string;
    prescribedBy?: string;
    startDate?: string;
  }>;
  recentVitals: Array<{
    bloodPressure: string;
    heartRate: string;
    temperatureF: string;
    spO2: string;
    respirationRate: string;
    painLevel: string;
    recordedAt: string;
  }>;
  activeAlerts: Array<{
    id: string;
    title: string;
    severity: string;
    type: string;
    createdAt: string;
  }>;
  pendingTasks: Array<{
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string;
    assignedTo?: string;
  }>;
  dischargeChecklist?: {
    checklistId: string;
    status: string;
    progressPercentage: number;
    completedItemsCount: number;
    totalItemsCount: number;
    pendingItemsCount: number;
    pendingItemTitles: string[];
  };
  contextGeneratedUtc: string;
}

export interface AiContextPreview {
  patientId: string;
  patientName: string;
  patientIdCode: string;
  authorizedScope: string;
  contextBundle: AiContextBundle;
  purpose: string;
  safetyPolicy: string;
  timestampUtc: string;
}

export interface AiFeedbackPayload {
  workflowType: 'PatientSummary' | 'CarePriorities' | 'DischargeReview' | 'AlertPrioritization' | 'MedicationReview' | 'Copilot';
  targetEntityId: string;
  action: 'Accepted' | 'Edited' | 'Dismissed' | 'ReportedIssue';
  feedbackNotes?: string;
  editedContent?: string;
  safetyFlag?: boolean;
  userRole?: string;
  userName?: string;
  resultingTaskId?: string;
  createTaskOnAccept?: boolean;
}

export interface AiTestCaseResult {
  testCaseId: string;
  workflowName: string;
  scenarioDescription: string;
  passed: boolean;
  schemaValid: boolean;
  hallucinationFree: boolean;
  prohibitedActionBlocked: boolean;
  latencyMs: number;
  details: string;
}

export interface AiEvaluationBenchmarkResult {
  evaluationId: string;
  totalTestCases: number;
  passedTestCases: number;
  passRatePercentage: number;
  schemaComplianceRate: number;
  prohibitedActionBlockRate: number;
  hallucinationFreeRate: number;
  averageLatencyMs: number;
  modelEvaluated: string;
  evaluationTimestampUtc: string;
  testCases: AiTestCaseResult[];
}

export interface ClinicalEvidenceGuideline {
  title: string;
  category: string;
  issuingBody: string;
  summaryText: string;
  citationText: string;
  matchingKeywords: string[];
}
