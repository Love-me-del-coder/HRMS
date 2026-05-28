// ==================== Core Types ====================

export interface Company {
  id: string;
  name: string;
  registrationNumber: string;
  industry: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  currency: string;
  timezone: string;
  plan: 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  logo?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'super_admin' | 'company_admin' | 'hr_manager' | 'department_head' | 'employee';

export interface User {
  id: string;
  companyId: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  employeeId?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export type EmployeeStatus = 'active' | 'on_leave' | 'probation' | 'terminated' | 'resigned';

export interface Employee {
  id: string;
  companyId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationalId: string;
  address: string;
  city: string;
  country: string;
  departmentId: string;
  position: string;
  jobTitle: string;
  managerId?: string;
  hireDate: string;
  status: EmployeeStatus;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  salary: number;
  currency: string;
  bankName?: string;
  bankAccount?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description: string;
  headId?: string;
  parentId?: string;
  budget?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  companyId: string;
  employeeId: string;
  name: string;
  type: string;
  category: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
}

export interface EmploymentHistory {
  id: string;
  companyId: string;
  employeeId: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  effectiveDate: string;
  performedBy: string;
  notes?: string;
  createdAt: string;
}

// ==================== Recruitment Types ====================

export type RequisitionStatus = 'draft' | 'open' | 'in_progress' | 'filled' | 'cancelled';

export interface JobRequisition {
  id: string;
  companyId: string;
  title: string;
  departmentId: string;
  description: string;
  requirements: string[];
  employmentType: 'full_time' | 'part_time' | 'contract' | 'intern';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  location: string;
  openings: number;
  filled: number;
  status: RequisitionStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  postedDate: string;
  closingDate: string;
  hiringManagerId: string;
  createdAt: string;
  updatedAt: string;
}

export type CandidateStage = 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected';

export interface Candidate {
  id: string;
  companyId: string;
  jobRequisitionId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  resumeUrl?: string;
  currentCompany?: string;
  currentPosition?: string;
  experience: number;
  skills: string[];
  stage: CandidateStage;
  rating: number;
  notes?: string;
  source: string;
  appliedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  companyId: string;
  candidateId: string;
  jobRequisitionId: string;
  interviewerId: string;
  scheduledAt: string;
  duration: number;
  type: 'phone' | 'video' | 'onsite' | 'panel';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

// ==================== Payroll Types ====================

export interface PayrollStructure {
  id: string;
  companyId: string;
  name: string;
  components: PayrollComponent[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollComponent {
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'fixed' | 'percentage';
  value: number;
  isStatutory: boolean;
}

export type PayrollRunStatus = 'draft' | 'processing' | 'processed' | 'approved' | 'paid';

export interface PayrollRun {
  id: string;
  companyId: string;
  period: string;
  month: number;
  year: number;
  status: PayrollRunStatus;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  employeeCount: number;
  processedBy?: string;
  approvedBy?: string;
  processedAt?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: string;
  companyId: string;
  payrollRunId: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  earnings: { name: string; amount: number }[];
  deductions: { name: string; amount: number }[];
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: 'generated' | 'sent' | 'viewed';
  createdAt: string;
}

// ==================== Attendance Types ====================

export interface AttendanceRecord {
  id: string;
  companyId: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'present' | 'absent' | 'late' | 'half_day' | 'holiday' | 'weekend';
  hoursWorked?: number;
  overtime?: number;
  notes?: string;
  createdAt: string;
}

export interface Shift {
  id: string;
  companyId: string;
  name: string;
  startTime: string;
  endTime: string;
  breakDuration: number;
  isDefault: boolean;
  createdAt: string;
}

// ==================== Leave Types ====================

export interface LeaveType {
  id: string;
  companyId: string;
  name: string;
  code: string;
  defaultDays: number;
  carryForward: boolean;
  maxCarryForward: number;
  requiresApproval: boolean;
  isPaid: boolean;
  color: string;
  createdAt: string;
}

export type LeaveRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: LeaveRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: string;
  companyId: string;
  employeeId: string;
  leaveTypeId: string;
  year: number;
  entitled: number;
  used: number;
  pending: number;
  balance: number;
  carryForward: number;
  createdAt: string;
}

// ==================== Performance Types ====================

export interface Goal {
  id: string;
  companyId: string;
  employeeId: string;
  title: string;
  description: string;
  category: string;
  startDate: string;
  endDate: string;
  progress: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface KPI {
  id: string;
  companyId: string;
  employeeId: string;
  name: string;
  description: string;
  target: number;
  actual: number;
  unit: string;
  period: string;
  weight: number;
  score: number;
  createdAt: string;
  updatedAt: string;
}

export type ReviewStatus = 'draft' | 'self_review' | 'manager_review' | 'completed';

export interface PerformanceReview {
  id: string;
  companyId: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  type: 'quarterly' | 'annual' | 'probation';
  status: ReviewStatus;
  selfRating?: number;
  managerRating?: number;
  overallRating?: number;
  strengths?: string;
  improvements?: string;
  comments?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== Training Types ====================

export interface Course {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  duration: number;
  durationUnit: 'hours' | 'days';
  instructor: string;
  maxParticipants: number;
  status: 'active' | 'inactive' | 'completed';
  isMandatory: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AssignmentStatus = 'assigned' | 'in_progress' | 'completed' | 'overdue';

export interface TrainingAssignment {
  id: string;
  companyId: string;
  courseId: string;
  employeeId: string;
  assignedBy: string;
  assignedDate: string;
  dueDate: string;
  completedDate?: string;
  status: AssignmentStatus;
  progress: number;
  score?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  companyId: string;
  employeeId: string;
  courseId: string;
  assignmentId: string;
  certificateNumber: string;
  issuedDate: string;
  expiryDate?: string;
  createdAt: string;
}

// ==================== Compliance Types ====================

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending' | 'expired';

export interface ComplianceItem {
  id: string;
  companyId: string;
  title: string;
  description: string;
  category: string;
  status: ComplianceStatus;
  dueDate: string;
  completedDate?: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

// ==================== Notification Types ====================

export interface Notification {
  id: string;
  companyId: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
