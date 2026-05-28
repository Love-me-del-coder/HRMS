const API_BASE = '/api';

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = JSON.parse(localStorage.getItem('hrms-auth-storage') || '{}')?.state?.token;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function apiUploadFile(file: File): Promise<any> {
  const token = JSON.parse(localStorage.getItem('hrms-auth-storage') || '{}')?.state?.token;
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}


// ---- Auth ----
export const authApi = {
  login: (email: string, password: string) =>
    fetchApi('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data: any) =>
    fetchApi('/auth/register-company', { method: 'POST', body: JSON.stringify(data) }),
  me: () => fetchApi('/auth/me'),
};

// ---- Dashboard ----
export const dashboardApi = {
  getStats: () => fetchApi('/dashboard/stats'),
  getDepartmentDistribution: () => fetchApi('/dashboard/departments'),
  getMonthlyTrends: () => fetchApi('/dashboard/trends'),
  getRecentActivity: () => fetchApi('/dashboard/activity'),
};

// ---- Employees ----
export const employeesApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/employees${query}`);
  },
  get: (id: string) => fetchApi(`/employees/${id}`),
  create: (data: any) => fetchApi('/employees', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/employees/${id}`, { method: 'DELETE' }),
  getHistory: (id: string) => fetchApi(`/employees/${id}/history`),
  getDocuments: (id: string) => fetchApi(`/employees/${id}/documents`),
};

// ---- Departments ----
export const departmentsApi = {
  list: () => fetchApi('/departments'),
  create: (data: any) => fetchApi('/departments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => fetchApi(`/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => fetchApi(`/departments/${id}`, { method: 'DELETE' }),
};

// ---- Recruitment ----
export const recruitmentApi = {
  listJobs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/recruitment/jobs${query}`);
  },
  getJob: (id: string) => fetchApi(`/recruitment/jobs/${id}`),
  createJob: (data: any) => fetchApi('/recruitment/jobs', { method: 'POST', body: JSON.stringify(data) }),
  updateJob: (id: string, data: any) => fetchApi(`/recruitment/jobs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  listCandidates: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/recruitment/candidates${query}`);
  },
  getCandidate: (id: string) => fetchApi(`/recruitment/candidates/${id}`),
  updateCandidateStage: (id: string, stage: string) =>
    fetchApi(`/recruitment/candidates/${id}/stage`, { method: 'PUT', body: JSON.stringify({ stage }) }),
  listInterviews: () => fetchApi('/recruitment/interviews'),
  createInterview: (data: any) => fetchApi('/recruitment/interviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ---- Payroll ----
export const payrollApi = {
  listRuns: () => fetchApi('/payroll/runs'),
  getRun: (id: string) => fetchApi(`/payroll/runs/${id}`),
  createRun: (data: any) => fetchApi('/payroll/runs', { method: 'POST', body: JSON.stringify(data) }),
  processRun: (id: string) => fetchApi(`/payroll/runs/${id}/process`, { method: 'POST' }),
  approveRun: (id: string) => fetchApi(`/payroll/runs/${id}/approve`, { method: 'POST' }),
  listPayslips: (runId: string) => fetchApi(`/payroll/runs/${runId}/payslips`),
  getPayslip: (id: string) => fetchApi(`/payroll/payslips/${id}`),
  getStructures: () => fetchApi('/payroll/structures'),
};

// ---- Attendance ----
export const attendanceApi = {
  list: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/attendance${query}`);
  },
  checkIn: () => fetchApi('/attendance/check-in', { method: 'POST' }),
  checkOut: () => fetchApi('/attendance/check-out', { method: 'POST' }),
  getShifts: () => fetchApi('/attendance/shifts'),
  getSummary: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/attendance/summary${query}`);
  },
};

// ---- Leave ----
export const leaveApi = {
  listTypes: () => fetchApi('/leave/types'),
  listRequests: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/leave/requests${query}`);
  },
  createRequest: (data: any) => fetchApi('/leave/requests', { method: 'POST', body: JSON.stringify(data) }),
  approveRequest: (id: string, comments?: string) =>
    fetchApi(`/leave/requests/${id}/approve`, { method: 'POST', body: JSON.stringify({ comments }) }),
  rejectRequest: (id: string, comments?: string) =>
    fetchApi(`/leave/requests/${id}/reject`, { method: 'POST', body: JSON.stringify({ comments }) }),
  getBalances: (employeeId?: string) => {
    const query = employeeId ? `?employeeId=${employeeId}` : '';
    return fetchApi(`/leave/balances${query}`);
  },
  getCalendar: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/leave/calendar${query}`);
  },
};

// ---- Performance ----
export const performanceApi = {
  listGoals: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/performance/goals${query}`);
  },
  createGoal: (data: any) => fetchApi('/performance/goals', { method: 'POST', body: JSON.stringify(data) }),
  updateGoal: (id: string, data: any) => fetchApi(`/performance/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  listKPIs: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/performance/kpis${query}`);
  },
  listReviews: () => fetchApi('/performance/reviews'),
  createReview: (data: any) => fetchApi('/performance/reviews', { method: 'POST', body: JSON.stringify(data) }),
};

// ---- Training ----
export const trainingApi = {
  listCourses: () => fetchApi('/training/courses'),
  getCourse: (id: string) => fetchApi(`/training/courses/${id}`),
  createCourse: (data: any) => fetchApi('/training/courses', { method: 'POST', body: JSON.stringify(data) }),
  listAssignments: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/training/assignments${query}`);
  },
  completeAssignment: (id: string, score: number) =>
    fetchApi(`/training/assignments/${id}/complete`, { method: 'POST', body: JSON.stringify({ score }) }),
  listCertificates: () => fetchApi('/training/certificates'),
};

// ---- Compliance ----
export const complianceApi = {
  listItems: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/compliance/items${query}`);
  },
  createItem: (data: any) => fetchApi('/compliance/items', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: (id: string, data: any) => fetchApi(`/compliance/items/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getDashboard: () => fetchApi('/compliance/dashboard'),
  getExpiring: () => fetchApi('/compliance/expiring'),
  getAuditLog: () => fetchApi('/compliance/audit-log'),
};

// ---- Reports ----
export const reportsApi = {
  generate: (type: string, params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/reports/${type}${query}`);
  },
  export: (type: string, format: 'csv' | 'excel' | 'pdf') =>
    fetchApi(`/reports/${type}/export?format=${format}`),
};

// ---- Notifications ----
export const notificationsApi = {
  list: () => fetchApi('/notifications'),
  markAsRead: (id: string) => fetchApi(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => fetchApi('/notifications/read-all', { method: 'PUT' }),
  getUnreadCount: () => fetchApi('/notifications/unread-count'),
};

// ---- Settings ----
export const settingsApi = {
  getCompanyProfile: () => fetchApi('/settings/company'),
  updateCompanyProfile: (data: any) => fetchApi('/settings/company', { method: 'PUT', body: JSON.stringify(data) }),
  listUsers: () => fetchApi('/settings/users'),
  createUser: (data: any) => fetchApi('/settings/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id: string, data: any) => fetchApi(`/settings/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};
