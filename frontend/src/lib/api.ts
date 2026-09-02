const API_BASE_URL = '/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  console.log(
  `[API] ${options?.method || 'GET'} ${endpoint} -> ${res.status}`
  );

  if (res.status === 401 && !endpoint.includes('/auth/login')) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(errorJson.message || `API Error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  // Auth Endpoints
  login: (credentials: { username: string; password: string; role?: string }) =>
    fetchApi<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  logout: () => fetchApi<any>('/auth/logout', { method: 'POST' }),
  getCurrentUser: () => fetchApi<any>('/auth/me'),

  // Dashboard Endpoints
  getDashboardSummary: () => fetchApi<any>('/dashboard/summary'),
  getAlertSummary: () => fetchApi<any>('/dashboard/alerts-summary'),
  getPatientStatus: () => fetchApi<any>('/dashboard/patient-status'),
  getRecentAlerts: () => fetchApi<any[]>('/dashboard/recent-alerts'),
  getIntegrationsOverview: () => fetchApi<any[]>('/dashboard/integrations'),

  // Patients Endpoints
  getPatients: (search?: string, status?: string, careUnit?: string, doctorId?: string, nurseId?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (careUnit) params.append('careUnit', careUnit);
    if (doctorId) params.append('doctorId', doctorId);
    if (nurseId) params.append('nurseId', nurseId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/patients${query}`);
  },
  getPatientStats: (doctorId?: string, nurseId?: string) => {
    const params = new URLSearchParams();
    if (doctorId) params.append('doctorId', doctorId);
    if (nurseId) params.append('nurseId', nurseId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any>(`/patients/stats${query}`);
  },
  getPatientById: (id: string) => fetchApi<any>(`/patients/${id}`),
  getPatientClinicalEncounters: (patientId: string) =>
    fetchApi<any[]>(`/patients/${patientId}/clinical-encounters`),
  createPatientClinicalEncounter: (patientId: string, encounterData: any) =>
    fetchApi<any>(`/patients/${patientId}/clinical-encounters`, {
      method: 'POST',
      body: JSON.stringify(encounterData),
    }),
  updatePatientClinicalEncounter: (patientId: string, encounterId: string, encounterData: any) =>
    fetchApi<any>(`/patients/${patientId}/clinical-encounters/${encounterId}`, {
      method: 'PUT',
      body: JSON.stringify(encounterData),
    }),
  deletePatientClinicalEncounter: (patientId: string, encounterId: string) =>
    fetchApi<any>(`/patients/${patientId}/clinical-encounters/${encounterId}`, {
      method: 'DELETE',
    }),
  getPatientVitals: (patientId: string) =>
    fetchApi<any>(`/patients/${patientId}/vitals`),
  updatePatientVitals: (patientId: string, vitalsData: any) =>
    fetchApi<any>(`/patients/${patientId}/vitals`, {
      method: 'POST',
      body: JSON.stringify(vitalsData),
    }),
  getPatientCarePlan: (patientId: string) =>
    fetchApi<any>(`/patients/${patientId}/care-plan`),
  updatePatientCarePlan: (patientId: string, planData: any) =>
    fetchApi<any>(`/patients/${patientId}/care-plan`, {
      method: 'POST',
      body: JSON.stringify(planData),
    }),
  getPatientAppointments: (patientId: string) =>
    fetchApi<any[]>(`/patients/${patientId}/appointments`),
  createPatientAppointment: (patientId: string, apptData: any) =>
    fetchApi<any>(`/patients/${patientId}/appointments`, {
      method: 'POST',
      body: JSON.stringify(apptData),
    }),
  getPatientHistory: (patientId: string) =>
    fetchApi<any[]>(`/patients/${patientId}/history`),

  createPatient: (patientData: any) => fetchApi<any>('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  }),
  updatePatient: (id: string, patientData: any) => fetchApi<any>(`/patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(patientData),
  }),
  deletePatient: (id: string) => fetchApi<any>(`/patients/${id}`, {
    method: 'DELETE',
  }),
  getPatientDocuments: (patientId: string) => fetchApi<any[]>(`/patients/${patientId}/documents`),
  uploadPatientDocument: async (patientId: string, file: File, documentType: string) => {
    const formData = new FormData();
    formData.append('patientId', patientId);
    formData.append('documentType', documentType);
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/patients/${patientId}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.message || 'File upload failed.');
    }

    return res.json();
  },
  deletePatientDocument: (patientId: string, documentId: string) => fetchApi<any>(`/patients/${patientId}/documents/${documentId}`, {
    method: 'DELETE'
  }),


  // Doctors Endpoints
  getDoctors: (search?: string, specialty?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialty) params.append('specialty', specialty);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/doctors${query}`);
  },
  getDoctorById: (id: string) => fetchApi<any>(`/doctors/${id}`),
  getDoctorStats: () => fetchApi<any>('/doctors/stats'),
  createDoctor: (doctorData: any) => fetchApi<any>('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctorData),
  }),
  updateDoctor: (id: string, doctorData: any) => fetchApi<any>(`/doctors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(doctorData),
  }),
  deleteDoctor: (id: string) => fetchApi<any>(`/doctors/${id}`, {
    method: 'DELETE',
  }),

  // Nurses Endpoints
  getNurses: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<any[]>(`/nurses${query}`);
  },
  getNurseById: (id: string) => fetchApi<any>(`/nurses/${id}`),
  getNurseStats: () => fetchApi<any>('/nurses/stats'),
  createNurse: (nurseData: any) => fetchApi<any>('/nurses', {
    method: 'POST',
    body: JSON.stringify(nurseData),
  }),
  updateNurse: (id: string, nurseData: any) => fetchApi<any>(`/nurses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(nurseData),
  }),
  deleteNurse: (id: string) => fetchApi<any>(`/nurses/${id}`, {
    method: 'DELETE',
  }),
  getNursePatients: (nurseId: string) => fetchApi<any[]>(`/nurses/${nurseId}/patients`),
  assignPatientToNurse: (nurseId: string, patientId: string, data?: any) => fetchApi<any>(`/nurses/${nurseId}/assign-patient`, {
    method: 'POST',
    body: JSON.stringify({ patientId, ...data }),
  }),
  removePatientFromNurse: (nurseId: string, patientId: string) => fetchApi<any>(`/nurses/${nurseId}/patients/${patientId}`, {
    method: 'DELETE',
  }),

  // Care Units Endpoints
    getCareUnits: (search?: string, activeOnly: boolean = true) => {
    const params = new URLSearchParams();

    if (search) params.append('search', search);
    params.append('activeOnly', String(activeOnly));

    const query = `?${params.toString()}`;

    return fetchApi<any[]>(`/CareUnits${query}`);
  },
  getCareUnitById: (id: string) => fetchApi<any>(`/CareUnits/${id}`),
  createCareUnit: (careUnitData: any) => fetchApi<any>('/CareUnits', {
    method: 'POST',
    body: JSON.stringify(careUnitData),
  }),
  updateCareUnit: (id: string, careUnitData: any) => fetchApi<any>(`/CareUnits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(careUnitData),
  }),
  deleteCareUnit: (id: string) => fetchApi<any>(`/CareUnits/${id}`, {
    method: 'DELETE',
  }),

  // Locations Endpoints
  getLocations: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<any[]>(`/locations${query}`);
  },
  getLocationById: (id: string) => fetchApi<any>(`/locations/${id}`),
  getLocationStats: () => fetchApi<any>('/locations/stats'),
  createLocation: (locationData: any) => fetchApi<any>('/locations', {
    method: 'POST',
    body: JSON.stringify(locationData),
  }),
  updateLocation: (id: string, locationData: any) => fetchApi<any>(`/locations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(locationData),
  }),
  deleteLocation: (id: string) => fetchApi<any>(`/locations/${id}`, {
    method: 'DELETE',
  }),

  // Care Teams Endpoints
  getCareTeams: (params?: { patientId?: string; teamName?: string; doctorId?: string }) => {
    const query = new URLSearchParams();
    if (params?.patientId) query.append('patientId', params.patientId);
    if (params?.teamName) query.append('teamName', params.teamName);
    if (params?.doctorId) query.append('doctorId', params.doctorId);
    const qStr = query.toString();
    return fetchApi<any[]>(`/careteams${qStr ? `?${qStr}` : ''}`);
  },
  getCareTeamMemberById: (id: string) => fetchApi<any>(`/careteams/${id}`),
  createCareTeamMember: (memberData: any) => fetchApi<any>('/careteams', {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),
  updateCareTeamMember: (id: string, memberData: any) => fetchApi<any>(`/careteams/${id}`, {
    method: 'PUT',
    body: JSON.stringify(memberData),
  }),
  deleteCareTeamMember: (id: string) => fetchApi<any>(`/careteams/${id}`, {
    method: 'DELETE',
  }),

  // Assignments Endpoints (patient_doctors & patient_nurses)
  assignDoctorToPatient: (patientId: string, data: { doctorId: string; isPrimary?: boolean; notes?: string }) => fetchApi<any>(`/assignments/patients/${patientId}/doctors`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  removeDoctorFromPatient: (patientId: string, doctorId: string) => fetchApi<any>(`/assignments/patients/${patientId}/doctors/${doctorId}`, {
    method: 'DELETE',
  }),
  getPatientDoctors: (patientId: string) => fetchApi<any[]>(`/assignments/patients/${patientId}/doctors`),
  getDoctorPatients: (doctorId: string) => fetchApi<any[]>(`/assignments/doctors/${doctorId}/patients`),

  assignNurseToPatient: (patientId: string, data: { nurseId: string; isPrimary?: boolean; shift?: string; notes?: string }) => fetchApi<any>(`/assignments/patients/${patientId}/nurses`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  removeNurseFromPatient: (patientId: string, nurseId: string) => fetchApi<any>(`/assignments/patients/${patientId}/nurses/${nurseId}`, {
    method: 'DELETE',
  }),
  getPatientNurses: (patientId: string) => fetchApi<any[]>(`/assignments/patients/${patientId}/nurses`),

  // Alerts Endpoints
  getAlerts: (params?: {
    search?: string;
    severity?: string;
    type?: string;
    status?: string;
    careUnit?: string;
    patientId?: string;
    isAcknowledged?: boolean;
    doctorId?: string;
    nurseId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.severity && params.severity !== 'All') searchParams.append('severity', params.severity);
    if (params?.type && params.type !== 'All') searchParams.append('type', params.type);
    if (params?.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params?.careUnit && params.careUnit !== 'All') searchParams.append('careUnit', params.careUnit);
    if (params?.patientId) searchParams.append('patientId', params.patientId);
    if (typeof params?.isAcknowledged === 'boolean') searchParams.append('isAcknowledged', String(params.isAcknowledged));
    if (params?.doctorId) searchParams.append('doctorId', params.doctorId);
    if (params?.nurseId) searchParams.append('nurseId', params.nurseId);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return fetchApi<any[]>(`/alerts${query}`);
  },
  getAlertById: (id: string) => fetchApi<any>(`/alerts/${id}`),
  getAlertStats: () => fetchApi<any>('/alerts/stats'),
  createAlert: (alertData: any) => fetchApi<any>('/alerts', {
    method: 'POST',
    body: JSON.stringify(alertData),
  }),
  updateAlert: (id: string, alertData: any) => fetchApi<any>(`/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(alertData),
  }),
  acknowledgeAlert: (id: string, acknowledgedBy?: string) => fetchApi<any>(`/alerts/${id}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({ acknowledgedBy }),
  }),
  resolveAlert: (id: string, resolutionNotes?: string, resolvedBy?: string) => fetchApi<any>(`/alerts/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolutionNotes, resolvedBy }),
  }),
  dismissAlert: (id: string, resolutionNotes?: string, resolvedBy?: string) => fetchApi<any>(`/alerts/${id}/dismiss`, {
    method: 'POST',
    body: JSON.stringify({ resolutionNotes, resolvedBy }),
  }),
  bulkAlertAction: (action: 'acknowledge' | 'resolve' | 'dismiss' | 'escalate', alertIds: string[], note?: string, actionBy?: string) => fetchApi<any>('/alerts/bulk-action', {
    method: 'POST',
    body: JSON.stringify({ action, alertIds, note, actionBy }),
  }),
  addAlertNote: (id: string, note: string, author?: string) => fetchApi<any>(`/alerts/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note, author }),
  }),
  escalateAlert: (id: string, reason?: string, escalatedBy?: string) => fetchApi<any>(`/alerts/${id}/escalate`, {
    method: 'POST',
    body: JSON.stringify({ reason, escalatedBy }),
  }),
  notifyCareTeam: (id: string, message?: string, sender?: string) => fetchApi<any>(`/alerts/${id}/notify`, {
    method: 'POST',
    body: JSON.stringify({ message, sender }),
  }),
  updateAlertStatus: (id: string, status: string, updatedBy?: string, note?: string) => fetchApi<any>(`/alerts/${id}/status`, {
    method: 'POST',
    body: JSON.stringify({ status, updatedBy, note }),
  }),
  deleteAlert: (id: string) => fetchApi<any>(`/alerts/${id}`, {

    method: 'DELETE',
  }),


  // Tasks Endpoints
  getTasks: (patientId?: string, search?: string) => {
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId);
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/tasks${query}`);
  },
  getTaskStats: () => fetchApi<any>('/tasks/stats'),
  createTask: (taskData: any) => fetchApi<any>('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),
  toggleTaskStatus: (id: string) => fetchApi<any>(`/tasks/${id}/toggle`, {
    method: 'POST',
  }),
  updateTask: (id: string, taskData: any) => fetchApi<any>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  }),
  deleteTask: (id: string) => fetchApi<any>(`/tasks/${id}`, {
    method: 'DELETE',
  }),

  // Medication Endpoints
  getMedications: (search?: string, status?: string, patientId?: string, nurseId?: string, doctorId?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (patientId) params.append('patientId', patientId);
    if (nurseId) params.append('nurseId', nurseId);
    if (doctorId) params.append('doctorId', doctorId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/medications${query}`);
  },
  getMedicationStats: () => fetchApi<any>('/medications/stats'),
  getMedicationReminders: () => fetchApi<any[]>('/medications/reminders'),
  getExpiringMedications: () => fetchApi<any[]>('/medications/expiring'),
  getDrugInteractions: () => fetchApi<any[]>('/medications/interactions'),
  addMedication: (medicationData: any) => fetchApi<any>('/medications', {
    method: 'POST',
    body: JSON.stringify(medicationData),
  }),
  updateMedication: (id: string, medicationData: any) => fetchApi<any>(`/medications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(medicationData),
  }),
  startMedicationRound: () => fetchApi<any>('/medications/start-round', {
    method: 'POST',
  }),
  deleteMedication: (id: string) => fetchApi<any>(`/medications/${id}`, {
    method: 'DELETE',
  }),

  // Reports Endpoints
  getReportsOverview: () => fetchApi<any>('/reports/overview'),
  getOperationalReports: (period?: string) => fetchApi<any>(`/reports/operational${period ? `?period=${encodeURIComponent(period)}` : ''}`),
  getClinicalReports: (period?: string) => fetchApi<any>(`/reports/clinical${period ? `?period=${encodeURIComponent(period)}` : ''}`),
  getFinancialReports: (period?: string) => fetchApi<any>(`/reports/financial${period ? `?period=${encodeURIComponent(period)}` : ''}`),

  // Custom Reports
  getCustomReports: (search?: string, category?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/custom-reports${query}`);
  },
  createCustomReport: (reportData: any) => fetchApi<any>('/custom-reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
  }),
  getReportPreview: (id: string) => fetchApi<any>(`/custom-reports/preview/${id}`),

  // Integrations Endpoints
  getIntegrations: (search?: string, category?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/integrations${query}`);
  },
  getIntegrationById: (id: string) => fetchApi<any>(`/integrations/${id}`),
  getIntegrationStats: () => fetchApi<any>('/integrations/stats'),
  getIntegrationLogs: (limit?: number) => {
    const query = limit ? `?limit=${limit}` : '';
    return fetchApi<any[]>(`/integrations/logs${query}`);
  },
  createIntegration: (integrationData: any) => fetchApi<any>('/integrations', {
    method: 'POST',
    body: JSON.stringify(integrationData),
  }),
  updateIntegration: (id: string, integrationData: any) => fetchApi<any>(`/integrations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(integrationData),
  }),
  updateIntegrationSettings: (id: string, settingsData: any) => fetchApi<any>(`/integrations/${id}/settings`, {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  }),
  deleteIntegration: (id: string) => fetchApi<any>(`/integrations/${id}`, {
    method: 'DELETE',
  }),
  triggerIntegrationSync: (id: string) => fetchApi<any>(`/integrations/${id}/sync`, { method: 'POST' }),

  // Audit Logs Endpoints
  getAuditLogs: (search?: string, user?: string, module?: string, action?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (user) params.append('user', user);
    if (module) params.append('module', module);
    if (action) params.append('action', action);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/audit-logs${query}`);
  },
  getAuditLogStats: () => fetchApi<any>('/audit-logs/stats'),
  getAuditLogById: (id: string) => fetchApi<any>(`/audit-logs/${id}`),
  createAuditLog: (data: any) => fetchApi<any>('/audit-logs', { method: 'POST', body: JSON.stringify(data) }),

  // AI Operations Endpoints
  getAiOperationsOverview: () => fetchApi<any>('/ai-operations/overview'),
  getAiServices: () => fetchApi<any[]>('/ai-operations/services'),
  getAiWorkflows: () => fetchApi<any[]>('/ai-operations/workflows'),
  createAiWorkflow: (data: any) => fetchApi<any>('/ai-operations/workflows', { method: 'POST', body: JSON.stringify(data) }),
  getAiActivities: () => fetchApi<any[]>('/ai-operations/activities'),
  getAiSettings: () => fetchApi<any>('/ai-operations/settings'),
  saveAiSettings: (data: any) => fetchApi<any>('/ai-operations/settings', { method: 'POST', body: JSON.stringify(data) }),

  // Settings Endpoints
  getSettingsGeneral: () => fetchApi<any>('/settings/general'),
  saveSettingsGeneral: (data: any) => fetchApi<any>('/settings/general', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsOrganization: () => fetchApi<any>('/settings/organization'),
  saveSettingsOrganization: (data: any) => fetchApi<any>('/settings/organization', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsUsers: (search?: string, role?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/settings/users${query}`);
  },
  getSettingsUserStats: () => fetchApi<any>('/settings/users/stats'),
  createSettingsUser: (userData: any) => fetchApi<any>('/settings/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  updateSettingsUser: (id: string, userData: any) => fetchApi<any>(`/settings/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
  deleteSettingsUser: (id: string) => fetchApi<any>(`/settings/users/${id}`, {
    method: 'DELETE',
  }),

  getSettingsRoles: () => fetchApi<any[]>('/settings/roles'),
  createSettingsRole: (roleData: any) => fetchApi<any>('/settings/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  }),
  updateSettingsRole: (id: string, roleData: any) => fetchApi<any>(`/settings/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(roleData),
  }),
  deleteSettingsRole: (id: string) => fetchApi<any>(`/settings/roles/${id}`, {
    method: 'DELETE',
  }),
  getSettingsPermissions: () => fetchApi<any[]>('/settings/permissions'),
  getSettingsRolePermissions: (roleId: string) => fetchApi<any>(`/settings/roles/${roleId}/permissions`),
  saveSettingsRolePermissions: (roleId: string, data: { permissionKeys: string[]; permissionsMatrixJson?: string }) => fetchApi<any>(`/settings/roles/${roleId}/permissions`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Notifications Hub & In-App Alerts
  getNotifications: (params?: { userId?: string; role?: string; type?: string; severity?: string; isRead?: boolean; search?: string; page?: number; pageSize?: number }) => {
    const q = new URLSearchParams();
    if (params?.userId) q.append('userId', params.userId);
    if (params?.role) q.append('role', params.role);
    if (params?.type && params.type !== 'All') q.append('type', params.type);
    if (params?.severity && params.severity !== 'All') q.append('severity', params.severity);
    if (params?.isRead !== undefined) q.append('isRead', String(params.isRead));
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.pageSize) q.append('pageSize', String(params.pageSize));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchApi<any>(`/notifications${qs}`);
  },
  getUnreadNotificationsCount: (userId?: string, role?: string) => {
    const q = new URLSearchParams();
    if (userId) q.append('userId', userId);
    if (role) q.append('role', role);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchApi<any>(`/notifications/unread-count${qs}`);
  },
  createNotification: (data: any) => fetchApi<any>('/notifications', { method: 'POST', body: JSON.stringify(data) }),
  markNotificationRead: (id: string, userId?: string) => {
    const qs = userId ? `?userId=${userId}` : '';
    return fetchApi<any>(`/notifications/${id}/read${qs}`, { method: 'POST' });
  },
  markAllNotificationsRead: (userId?: string, role?: string) => {
    const q = new URLSearchParams();
    if (userId) q.append('userId', userId);
    if (role) q.append('role', role);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchApi<any>(`/notifications/read-all${qs}`, { method: 'POST' });
  },
  deleteNotification: (id: string) => fetchApi<any>(`/notifications/${id}`, { method: 'DELETE' }),
  clearAllReadNotifications: (userId?: string, role?: string) => {
    const q = new URLSearchParams();
    if (userId) q.append('userId', userId);
    if (role) q.append('role', role);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return fetchApi<any>(`/notifications/clear-all${qs}`, { method: 'POST' });
  },
  clearAllNotificationData: () => fetchApi<any>('/notifications/clear-all-data', { method: 'POST' }),

  // Notification Settings & Templates
  getSettingsNotifications: () => fetchApi<any[]>('/settings/notifications'),
  getSettingsNotificationStats: () => fetchApi<any>('/settings/notifications/stats'),
  toggleNotificationTemplate: (id: string) => fetchApi<any>(`/settings/notifications/toggle/${id}`, { method: 'POST' }),
  createNotificationTemplate: (data: any) => fetchApi<any>('/settings/notifications/templates', { method: 'POST', body: JSON.stringify(data) }),
  updateNotificationTemplate: (id: string, data: any) => fetchApi<any>(`/settings/notifications/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteNotificationTemplate: (id: string) => fetchApi<any>(`/settings/notifications/templates/${id}`, { method: 'DELETE' }),
  getNotificationDeliveryHistory: (limit: number = 20) => fetchApi<any>(`/settings/notifications/history?limit=${limit}`),

  getSettingsLocalization: () => fetchApi<any>('/settings/localization'),
  saveSettingsLocalization: (data: any) => fetchApi<any>('/settings/localization', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsSecurity: () => fetchApi<any>('/settings/security'),
  saveSettingsSecurity: (data: any) => fetchApi<any>('/settings/security', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsBackup: () => fetchApi<any>('/settings/backup'),
  createSettingsBackup: (data: any) => fetchApi<any>('/settings/backup/create', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsSubscription: () => fetchApi<any>('/settings/subscription'),

  // Doctor View APIs
  getDoctorOverview: () => fetchApi<any>('/doctor/overview'),
  getDoctorConsultations: () => fetchApi<any>('/doctor/consultations'),
  createDoctorConsultation: (data: any) => fetchApi<any>('/doctor/consultations', { method: 'POST', body: JSON.stringify(data) }),
  getDoctorCarePlans: () => fetchApi<any>('/doctor/care-plans'),
  createDoctorCarePlan: (data: any) => fetchApi<any>('/doctor/care-plans', { method: 'POST', body: JSON.stringify(data) }),
  getDoctorDocuments: () => fetchApi<any>('/doctor/documents'),
  postDoctorAiAssistant: (data: any) => fetchApi<any>('/doctor/ai-assistant', { method: 'POST', body: JSON.stringify(data) }),
  postNurseAiAssistant: (data: any) => fetchApi<any>('/nurse/ai-assistant', { method: 'POST', body: JSON.stringify(data) }),
  getDoctorReportsOverview: () => fetchApi<any>('/doctor/reports-overview'),

  // Nurse View APIs
  getDischargeChecklists: (status?: string, careUnit?: string, search?: string, doctorId?: string, nurseId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (careUnit) params.append('careUnit', careUnit);
    if (search) params.append('search', search);
    if (doctorId) params.append('doctorId', doctorId);
    if (nurseId) params.append('nurseId', nurseId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/discharge-checklists${q}`);
  },
  getDischargeSummary: (doctorId?: string, nurseId?: string) => {
    const params = new URLSearchParams();
    if (doctorId) params.append('doctorId', doctorId);
    if (nurseId) params.append('nurseId', nurseId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any>(`/discharge-checklists/summary${q}`);
  },
  getDischargeChecklistById: (id: string) => fetchApi<any>(`/discharge-checklists/${id}`),
  createDischargeChecklist: (data: any) => fetchApi<any>('/discharge-checklists', { method: 'POST', body: JSON.stringify(data) }),
  updateDischargeChecklist: (id: string, data: any) => fetchApi<any>(`/discharge-checklists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDischargeChecklist: (id: string) => fetchApi<any>(`/discharge-checklists/${id}`, { method: 'DELETE' }),
  completeDischargeChecklist: (id: string) => fetchApi<any>(`/discharge-checklists/${id}/complete`, { method: 'POST' }),

  getConsultations: (filters?: { tab?: string; status?: string; type?: string; patient?: string; careUnit?: string; search?: string; doctorName?: string }) => {
    const params = new URLSearchParams();
    if (filters?.tab) params.append('tab', filters.tab);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.patient) params.append('patient', filters.patient);
    if (filters?.careUnit) params.append('careUnit', filters.careUnit);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.doctorName) params.append('doctorName', filters.doctorName);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/consultations${q}`);
  },
  getConsultationSummary: () => fetchApi<any>('/consultations/summary'),
  getConsultationById: (id: string) => fetchApi<any>(`/consultations/${id}`),
  createConsultation: (data: any) => fetchApi<any>('/consultations', { method: 'POST', body: JSON.stringify(data) }),
  updateConsultation: (id: string, data: any) => fetchApi<any>(`/consultations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteConsultation: (id: string) => fetchApi<any>(`/consultations/${id}`, { method: 'DELETE' }),
  toggleLikeConsultation: (id: string) => fetchApi<any>(`/consultations/${id}/like`, { method: 'POST' }),
  scheduleConsultationFollowUp: (id: string, data: any) => fetchApi<any>(`/consultations/${id}/follow-up`, { method: 'POST', body: JSON.stringify(data) }),
  addConsultationNote: (id: string, data: any) => fetchApi<any>(`/consultations/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),
  referConsultationSpecialist: (id: string, data: any) => fetchApi<any>(`/consultations/${id}/referral`, { method: 'POST', body: JSON.stringify(data) }),
  getRecentConsultations: (patientIdCode: string) => fetchApi<any[]>(`/consultations/recent/${encodeURIComponent(patientIdCode)}`),

  getCarePlans: (filters?: { tab?: string; status?: string; unit?: string; patient?: string; condition?: string; search?: string; doctorName?: string }) => {
    const params = new URLSearchParams();
    if (filters?.tab) params.append('tab', filters.tab);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.unit) params.append('unit', filters.unit);
    if (filters?.patient) params.append('patient', filters.patient);
    if (filters?.condition) params.append('condition', filters.condition);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.doctorName) params.append('doctorName', filters.doctorName);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/care-plans${q}`);
  },
  getCarePlanSummary: () => fetchApi<any>('/care-plans/summary'),
  getCarePlanById: (id: string) => fetchApi<any>(`/care-plans/${id}`),
  createCarePlan: (data: any) => fetchApi<any>('/care-plans', { method: 'POST', body: JSON.stringify(data) }),
  updateCarePlan: (id: string, data: any) => fetchApi<any>(`/care-plans/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCarePlan: (id: string) => fetchApi<any>(`/care-plans/${id}`, { method: 'DELETE' }),
  addCarePlanNote: (id: string, data: any) => fetchApi<any>(`/care-plans/${id}/notes`, { method: 'POST', body: JSON.stringify(data) }),
  reviewCarePlan: (id: string, data: any) => fetchApi<any>(`/care-plans/${id}/review`, { method: 'POST', body: JSON.stringify(data) }),

  getVitalRounds: (status?: string, search?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/vital-rounds${q}`);
  },
  getVitalRoundSummary: () => fetchApi<any>('/vital-rounds/summary'),
  createVitalRound: (data: any) => fetchApi<any>('/vital-rounds', { method: 'POST', body: JSON.stringify(data) }),
  recordVitals: (id: string, data: any) => fetchApi<any>(`/vital-rounds/${id}/record`, { method: 'POST', body: JSON.stringify(data) }),

  getNurseDashboard: (nurseId?: string) => {
    const query = nurseId ? `?nurseId=${encodeURIComponent(nurseId)}` : '';
    return fetchApi<any>(`/dashboard/nurse-overview${query}`);
  },
  getNurseOverview: (nurseId?: string) => {
    const query = nurseId ? `?nurseId=${encodeURIComponent(nurseId)}` : '';
    return fetchApi<any>(`/dashboard/nurse-overview${query}`);
  },

  getShiftHandoverOverview: () => fetchApi<any>('/handovers/overview'),
  saveHandoverNotes: (notes: string) => fetchApi<any>('/handovers/save-notes', { method: 'POST', body: JSON.stringify({ notes }) }),
  completeShiftHandover: () => fetchApi<any>('/handovers/complete', { method: 'POST' }),

  getNurseProfile: () => fetchApi<any>('/nurse-profile'),
  updateNurseProfile: (data: any) => fetchApi<any>('/nurse-profile', { method: 'PUT', body: JSON.stringify(data) }),

  getDoctorProfile: () => fetchApi<any>('/doctor-profile'),
  updateDoctorProfile: (data: any) => fetchApi<any>('/doctor-profile', { method: 'PUT', body: JSON.stringify(data) }),

  getNurseDocumentations: (search?: string, docType?: string, status?: string, careUnit?: string, patientId?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (docType) params.append('docType', docType);
    if (status) params.append('status', status);
    if (careUnit) params.append('careUnit', careUnit);
    if (patientId) params.append('patientId', patientId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/documentations${q}`);
  },
  getNurseDocumentationStats: () => fetchApi<any>('/documentations/stats'),
  createNurseDocumentation: (data: any) => fetchApi<any>('/documentations', { method: 'POST', body: JSON.stringify(data) }),
  updateNurseDocumentation: (id: string, data: any) => fetchApi<any>(`/documentations/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  getChatConversations: (category?: string, search?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any>(`/messages/conversations${q}`);
  },
  getChatMessages: (conversationId: string) => fetchApi<any>(`/messages/conversations/${conversationId}/messages`),
  sendChatMessage: (conversationId: string, payload: any) => {
    const body = typeof payload === 'string' ? { messageText: payload } : payload;
    return fetchApi<any>(`/messages/conversations/${conversationId}/send`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },
  getChatContacts: () => fetchApi<any>('/messages/contacts'),
  createChatConversation: (data: any) =>
    fetchApi<any>('/messages/conversations', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  markChatConversationRead: (conversationId: string) =>
    fetchApi<any>(`/messages/conversations/${conversationId}/read`, {
      method: 'PUT'
    }),
  toggleChatMute: (conversationId: string, isMuted?: boolean) =>
    fetchApi<any>(`/messages/conversations/${conversationId}/mute`, {
      method: 'PUT',
      body: JSON.stringify({ isMuted })
    }),
  deleteChatConversation: (conversationId: string) =>
    fetchApi<any>(`/messages/conversations/${conversationId}`, {
      method: 'DELETE'
    }),

  getNurseReports: (category?: string, search?: string, reportType?: string) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (reportType) params.append('reportType', reportType);
    const q = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/reports/nurse-reports${q}`);
  },
  getNurseReportStats: () => fetchApi<any>('/reports/nurse-stats'),

  // ============================================================
  // Clinical AI & Care Intelligence Endpoints (August 2026 Blueprint)
  // ============================================================
  getAiPatientSummary: (patientId: string, refresh = false) =>
    fetchApi<any>(`/ai/patients/${patientId}/summary?refresh=${refresh}`),
  generateAiPatientSummary: (patientId: string) =>
    fetchApi<any>(`/ai/patients/${patientId}/summary/generate`, { method: 'POST' }),

  getAiCarePriorities: (patientId: string, refresh = false) =>
    fetchApi<any>(`/ai/patients/${patientId}/care-priorities?refresh=${refresh}`),
  generateAiCarePriorities: (patientId: string) =>
    fetchApi<any>(`/ai/patients/${patientId}/care-priorities/generate`, { method: 'POST' }),

  getAiDischargeReview: (patientId: string, refresh = false) =>
    fetchApi<any>(`/ai/patients/${patientId}/discharge-review?refresh=${refresh}`),
  generateAiDischargeReview: (patientId: string) =>
    fetchApi<any>(`/ai/patients/${patientId}/discharge-review/generate`, { method: 'POST' }),

  getAiAlertPrioritization: (patientId: string, refresh = false) =>
    fetchApi<any>(`/ai/patients/${patientId}/alert-prioritization?refresh=${refresh}`),
  generateAiAlertPrioritization: (patientId: string) =>
    fetchApi<any>(`/ai/patients/${patientId}/alert-prioritization/generate`, { method: 'POST' }),

  getAiMedicationReview: (patientId: string, refresh = false) =>
    fetchApi<any>(`/ai/patients/${patientId}/medication-review?refresh=${refresh}`),
  generateAiMedicationReview: (patientId: string) =>
    fetchApi<any>(`/ai/patients/${patientId}/medication-review/generate`, { method: 'POST' }),

  postAiDoctorCopilot: (data: any) =>
    fetchApi<any>('/ai/copilot/doctor', { method: 'POST', body: JSON.stringify(data) }),
  postAiNurseCopilot: (data: any) =>
    fetchApi<any>('/ai/copilot/nurse', { method: 'POST', body: JSON.stringify(data) }),

  getAiContextPreview: (patientId: string) =>
    fetchApi<any>(`/ai/patients/${patientId}/context-preview`),

  submitAiFeedback: (feedback: any) =>
    fetchApi<any>('/ai/feedback', {
      method: 'POST',
      body: JSON.stringify(feedback),
    }),

  // AI Evaluation Benchmark
  getAiEvaluationBenchmark: () =>
    fetchApi<any>('/ai/evaluation/benchmark'),
  runAiEvaluationBenchmark: () =>
    fetchApi<any>('/ai/evaluation/run', { method: 'POST' }),

  // Clinical Practice Guidelines & Evidence
  getClinicalEvidenceGuidelines: () =>
    fetchApi<any[]>('/ai/evidence/guidelines'),
  getPatientClinicalEvidence: (patientId: string, workflow = 'All') =>
    fetchApi<any[]>(`/ai/patients/${patientId}/evidence?workflow=${workflow}`),
};


