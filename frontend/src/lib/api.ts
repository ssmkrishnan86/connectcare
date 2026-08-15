const API_BASE_URL = 'http://localhost:5231/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  return json.data ?? json;
}

export const api = {
  // Dashboard Endpoints
  getDashboardSummary: () => fetchApi<any>('/dashboard/summary'),
  getAlertSummary: () => fetchApi<any>('/dashboard/alerts-summary'),
  getPatientStatus: () => fetchApi<any>('/dashboard/patient-status'),
  getRecentAlerts: () => fetchApi<any[]>('/dashboard/recent-alerts'),
  getIntegrationsOverview: () => fetchApi<any[]>('/dashboard/integrations'),

  // Patients Endpoints
  getPatients: (search?: string, status?: string, careUnit?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (careUnit) params.append('careUnit', careUnit);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/patients${query}`);
  },
  getPatientById: (id: string) => fetchApi<any>(`/patients/${id}`),
  createPatient: (patientData: any) => fetchApi<any>('/patients', {
    method: 'POST',
    body: JSON.stringify(patientData),
  }),

  // Doctors Endpoints
  getDoctors: (search?: string, specialty?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (specialty) params.append('specialty', specialty);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/doctors${query}`);
  },
  getDoctorStats: () => fetchApi<any>('/doctors/stats'),
  createDoctor: (doctorData: any) => fetchApi<any>('/doctors', {
    method: 'POST',
    body: JSON.stringify(doctorData),
  }),

  // Nurses Endpoints
  getNurses: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<any[]>(`/nurses${query}`);
  },
  getNurseStats: () => fetchApi<any>('/nurses/stats'),
  createNurse: (nurseData: any) => fetchApi<any>('/nurses', {
    method: 'POST',
    body: JSON.stringify(nurseData),
  }),

  // Locations Endpoints
  getLocations: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return fetchApi<any[]>(`/locations${query}`);
  },
  getLocationStats: () => fetchApi<any>('/locations/stats'),
  createLocation: (locationData: any) => fetchApi<any>('/locations', {
    method: 'POST',
    body: JSON.stringify(locationData),
  }),

  // Care Teams Endpoints
  getCareTeams: () => fetchApi<any[]>('/careteams'),
  createCareTeamMember: (memberData: any) => fetchApi<any>('/careteams', {
    method: 'POST',
    body: JSON.stringify(memberData),
  }),

  // Alerts Endpoints
  getAlerts: () => fetchApi<any[]>('/alerts'),
  getAlertStats: () => fetchApi<any>('/alerts/stats'),
  createAlert: (alertData: any) => fetchApi<any>('/alerts', {
    method: 'POST',
    body: JSON.stringify(alertData),
  }),
  acknowledgeAlert: (id: string) => fetchApi<any>(`/alerts/${id}/acknowledge`, {
    method: 'POST',
  }),

  // Tasks Endpoints
  getTasks: () => fetchApi<any[]>('/tasks'),
  getTaskStats: () => fetchApi<any>('/tasks/stats'),
  createTask: (taskData: any) => fetchApi<any>('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  }),

  // Medication Endpoints
  getMedications: (search?: string, status?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status) params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchApi<any[]>(`/medications${query}`);
  },
  getMedicationStats: () => fetchApi<any>('/medications/stats'),
  getMedicationReminders: () => fetchApi<any[]>('/medications/reminders'),
  getExpiringMedications: () => fetchApi<any[]>('/medications/expiring'),
  getDrugInteractions: () => fetchApi<any[]>('/medications/interactions'),

  // Reports Endpoints
  getReportsOverview: () => fetchApi<any>('/reports/overview'),
  getOperationalReports: () => fetchApi<any>('/reports/operational'),
  getClinicalReports: () => fetchApi<any>('/reports/clinical'),
  getFinancialReports: () => fetchApi<any>('/reports/financial'),

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
  getIntegrationStats: () => fetchApi<any>('/integrations/stats'),
  getIntegrationLogs: () => fetchApi<any[]>('/integrations/logs'),
  createIntegration: (integrationData: any) => fetchApi<any>('/integrations', {
    method: 'POST',
    body: JSON.stringify(integrationData),
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

  // AI Operations Endpoints
  getAiOperationsOverview: () => fetchApi<any>('/ai-operations/overview'),
  getAiServices: () => fetchApi<any[]>('/ai-operations/services'),
  getAiWorkflows: () => fetchApi<any[]>('/ai-operations/workflows'),
  getAiActivities: () => fetchApi<any[]>('/ai-operations/activities'),

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

  getSettingsRoles: () => fetchApi<any[]>('/settings/roles'),
  createSettingsRole: (roleData: any) => fetchApi<any>('/settings/roles', {
    method: 'POST',
    body: JSON.stringify(roleData),
  }),

  getSettingsNotifications: () => fetchApi<any[]>('/settings/notifications'),
  getSettingsNotificationStats: () => fetchApi<any>('/settings/notifications/stats'),
  toggleNotificationTemplate: (id: string) => fetchApi<any>(`/settings/notifications/toggle/${id}`, { method: 'POST' }),

  getSettingsLocalization: () => fetchApi<any>('/settings/localization'),
  saveSettingsLocalization: (data: any) => fetchApi<any>('/settings/localization', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsSecurity: () => fetchApi<any>('/settings/security'),
  saveSettingsSecurity: (data: any) => fetchApi<any>('/settings/security', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsBackup: () => fetchApi<any>('/settings/backup'),
  createSettingsBackup: (data: any) => fetchApi<any>('/settings/backup/create', { method: 'POST', body: JSON.stringify(data) }),

  getSettingsSubscription: () => fetchApi<any>('/settings/subscription'),
};
