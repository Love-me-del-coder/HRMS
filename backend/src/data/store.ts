import {
  Company, User, Employee, Department, Document, EmploymentHistory,
  JobRequisition, Candidate, Interview, PayrollStructure, PayrollRun,
  Payslip, AttendanceRecord, Shift, LeaveType, LeaveRequest, LeaveBalance,
  Goal, KPI, PerformanceReview, Course, TrainingAssignment, Certificate,
  ComplianceItem, AuditLog, Notification
} from '../types';

export class DataStore {
  private static instance: DataStore;

  public companies = new Map<string, Company>();
  public users = new Map<string, User>();
  public employees = new Map<string, Employee>();
  public departments = new Map<string, Department>();
  public documents = new Map<string, Document>();
  public employmentHistory = new Map<string, EmploymentHistory>();
  
  public jobRequisitions = new Map<string, JobRequisition>();
  public candidates = new Map<string, Candidate>();
  public interviews = new Map<string, Interview>();
  
  public payrollStructures = new Map<string, PayrollStructure>();
  public payrollRuns = new Map<string, PayrollRun>();
  public payslips = new Map<string, Payslip>();
  
  public attendanceRecords = new Map<string, AttendanceRecord>();
  public shifts = new Map<string, Shift>();
  
  public leaveTypes = new Map<string, LeaveType>();
  public leaveRequests = new Map<string, LeaveRequest>();
  public leaveBalances = new Map<string, LeaveBalance>();
  
  public goals = new Map<string, Goal>();
  public kpis = new Map<string, KPI>();
  public performanceReviews = new Map<string, PerformanceReview>();
  
  public courses = new Map<string, Course>();
  public trainingAssignments = new Map<string, TrainingAssignment>();
  public certificates = new Map<string, Certificate>();
  
  public complianceItems = new Map<string, ComplianceItem>();
  public auditLogs = new Map<string, AuditLog>();
  public notifications = new Map<string, Notification>();

  private constructor() {}

  public static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  // Generic helper methods
  public getByCompanyId<T extends { companyId: string }>(map: Map<string, T>, companyId: string): T[] {
    return Array.from(map.values()).filter(item => item.companyId === companyId);
  }

  public getById<T>(map: Map<string, T>, id: string): T | undefined {
    return map.get(id);
  }

  public create<T extends { id: string }>(map: Map<string, T>, item: T): T {
    map.set(item.id, item);
    return item;
  }

  public update<T extends { id: string }>(map: Map<string, T>, id: string, data: Partial<T>): T | undefined {
    const existing = map.get(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...data } as T;
    map.set(id, updated);
    return updated;
  }

  public delete<T>(map: Map<string, T>, id: string): boolean {
    return map.delete(id);
  }
}

export const store = DataStore.getInstance();
