// ==========================================
// HRMS SaaS Platform - Core Type Definitions
// ==========================================

// ---- Platform & Auth ----
export interface Company {
  id: string;
  name: string;
  registrationNo: string;
  industry: string;
  logo?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  employeeCount: number;
  timezone: string;
  currency: string;
  subscriptionPlan: 'starter' | 'professional' | 'enterprise';
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

export type UserRole = 
  | 'super_admin' | 'support_admin'
  | 'company_admin' | 'hr_manager' | 'recruiter' 
  | 'payroll_officer' | 'compliance_officer'
  | 'department_manager' | 'trainer' | 'employee';

export interface User {
  id: string;
  companyId: string;
  employeeId?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterCompanyRequest {
  companyName: string;
  registrationNo: string;
  industry: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  company: Company;
}

// ---- Departments ----
export interface Department {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  managerId?: string;
  managerName?: string;
  parentId?: string;
  employeeCount: number;
  createdAt: string;
}

// ---- Employees ----
export type EmployeeStatus = 'active' | 'on_leave' | 'probation' | 'suspended' | 'terminated' | 'resigned';

export interface Employee {
  id: string;
  companyId: string;
  departmentId: string;
  departmentName?: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
  nationality: string;
  address: string;
  city: string;
  country: string;
  position: string;
  jobTitle: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  hireDate: string;
  status: EmployeeStatus;
  salary: number;
  currency: string;
  reportingTo?: string;
  reportingToName?: string;
  avatar?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmploymentHistory {
  id: string;
  employeeId: string;
  type: 'hired' | 'promoted' | 'transferred' | 'salary_change' | 'status_change';
  description: string;
  fromValue?: string;
  toValue?: string;
  effectiveDate: string;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  companyId: string;
  name: string;
  type: 'cv' | 'contract' | 'certification' | 'id_document' | 'other';
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

// ---- Recruitment ----
export type RequisitionStatus = 'draft' | 'open' | 'on_hold' | 'closed' | 'cancelled';
export type CandidateStage = 'applied' | 'screening' | 'shortlisted' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected';

export interface JobRequisition {
  id: string;
  companyId: string;
  departmentId: string;
  departmentName?: string;
  title: string;
  description: string;
  requirements: string[];
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  openings: number;
  filled: number;
  status: RequisitionStatus;
  postedDate?: string;
  closingDate?: string;
  hiringManagerId?: string;
  hiringManagerName?: string;
  candidateCount: number;
  createdAt: string;
}

export interface Candidate {
  id: string;
  companyId: string;
  jobId: string;
  jobTitle?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  coverLetter?: string;
  stage: CandidateStage;
  rating: number;
  source: string;
  experience: number;
  currentCompany?: string;
  expectedSalary?: number;
  notes?: string;
  appliedDate: string;
  lastUpdated: string;
}

export interface Interview {
  id: string;
  companyId: string;
  candidateId: string;
  candidateName?: string;
  jobId: string;
  jobTitle?: string;
  interviewerId: string;
  interviewerName?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: 'phone' | 'video' | 'in_person' | 'panel';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  rating?: number;
  location?: string;
}

// ---- Payroll ----
export type PayrollRunStatus = 'draft' | 'processing' | 'pending_approval' | 'approved' | 'completed' | 'cancelled';

export interface PayrollStructure {
  id: string;
  companyId: string;
  name: string;
  basicPercentage: number;
  components: PayrollComponent[];
}

export interface PayrollComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  category: 'allowance' | 'bonus' | 'overtime' | 'incentive' | 'tax' | 'pension' | 'insurance' | 'loan' | 'custom';
  calculationType: 'fixed' | 'percentage';
  value: number;
  isActive: boolean;
}

export interface PayrollRun {
  id: string;
  companyId: string;
  periodStart: string;
  periodEnd: string;
  runDate: string;
  status: PayrollRunStatus;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  currency: string;
  processedBy?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface Payslip {
  id: string;
  companyId: string;
  payrollRunId: string;
  employeeId: string;
  employeeName?: string;
  employeeNo?: string;
  department?: string;
  position?: string;
  periodStart: string;
  periodEnd: string;
  basic: number;
  earnings: PayslipItem[];
  deductions: PayslipItem[];
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  currency: string;
  status: 'generated' | 'approved' | 'paid';
}

export interface PayslipItem {
  name: string;
  amount: number;
}

// ---- Attendance ----
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday' | 'weekend';

export interface AttendanceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: AttendanceStatus;
  workHours?: number;
  overtime?: number;
  notes?: string;
}

export interface Shift {
  id: string;
  companyId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  isDefault: boolean;
}

// ---- Leave ----
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveType {
  id: string;
  companyId: string;
  name: string;
  daysPerYear: number;
  carryForward: boolean;
  maxCarryForward: number;
  color: string;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  employeeAvatar?: string;
  department?: string;
  leaveTypeId: string;
  leaveTypeName?: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approvedBy?: string;
  approverName?: string;
  comments?: string;
  createdAt: string;
}

export interface LeaveBalance {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  leaveTypeName: string;
  total: number;
  used: number;
  pending: number;
  available: number;
  color: string;
}

// ---- Performance ----
export type GoalStatus = 'not_started' | 'in_progress' | 'completed' | 'overdue';
export type ReviewPeriod = 'Q1' | 'Q2' | 'Q3' | 'Q4' | 'annual';

export interface Goal {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  status: GoalStatus;
  priority: 'low' | 'medium' | 'high' | 'critical';
  startDate: string;
  dueDate: string;
  completedDate?: string;
  createdAt: string;
}

export interface KPI {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  name: string;
  category: string;
  target: number;
  actual: number;
  unit: string;
  weight: number;
  score: number;
  period: string;
}

export interface PerformanceReview {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  employeeAvatar?: string;
  department?: string;
  reviewerId: string;
  reviewerName?: string;
  period: ReviewPeriod;
  year: number;
  overallScore: number;
  strengths: string;
  improvements: string;
  comments: string;
  goals: string[];
  status: 'draft' | 'submitted' | 'acknowledged';
  createdAt: string;
}

// ---- Training ----
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';

export interface Course {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: number;
  durationUnit: 'hours' | 'days';
  instructor: string;
  maxParticipants: number;
  enrolledCount: number;
  completedCount: number;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TrainingAssignment {
  id: string;
  companyId: string;
  courseId: string;
  courseName?: string;
  employeeId: string;
  employeeName?: string;
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  status: AssignmentStatus;
  progress: number;
  score?: number;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  companyId: string;
  employeeId: string;
  employeeName?: string;
  courseId: string;
  courseName?: string;
  issueDate: string;
  expiryDate?: string;
  certificateNo: string;
}

// ---- Compliance ----
export type ComplianceItemType = 'certification' | 'contract' | 'license' | 'policy' | 'regulation';
export type ComplianceStatus = 'compliant' | 'warning' | 'expired' | 'pending';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceItem {
  id: string;
  companyId: string;
  employeeId?: string;
  employeeName?: string;
  type: ComplianceItemType;
  name: string;
  description: string;
  issuedDate: string;
  expiryDate: string;
  status: ComplianceStatus;
  riskLevel: RiskLevel;
  department?: string;
  notes?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  companyId: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// ---- Notifications ----
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

// ---- Dashboard & Reports ----
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeaveToday: number;
  openVacancies: number;
  pendingLeaveRequests: number;
  payrollCost: number;
  attendanceRate: number;
  complianceScore: number;
  trainingCompletion: number;
  newHiresThisMonth: number;
  turnoverRate: number;
  avgPerformanceScore: number;
}

export interface DepartmentDistribution {
  name: string;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  value: number;
  label?: string;
}

// ---- API Response Types ----
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Subscription ----
export interface SubscriptionPlan {
  id: string;
  name: 'starter' | 'professional' | 'enterprise';
  displayName: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  maxEmployees: number;
  maxStorage: number;
}

export interface Invoice {
  id: string;
  companyId: string;
  invoiceNo: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  issuedDate: string;
  dueDate: string;
  paidDate?: string;
}
