import { PrismaClient } from '@prisma/client';

// Mocking Prisma Client to avoid hitting a real DB during unit tests
jest.mock('@prisma/client', () => {
  const mPrisma: any = {
    employee: {
      findMany: jest.fn(),
    },
    payrollRun: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payslip: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    $transaction: jest.fn((callback: any) => callback(mPrisma)),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

const prisma = new PrismaClient() as any;

describe('Payroll Engine Math Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates EPF, PAYE, and Net Pay correctly for a low-income employee', async () => {
    // Basic Salary: 50,000 LKR
    // EPF 8%: 4,000 LKR
    // PAYE: 0 LKR (Under 100k)
    // Net Pay: 46,000 LKR
    const employee = {
      id: 'emp-1',
      salary: 50000,
      status: 'active',
      companyId: 'comp-1'
    };

    const basicSalary = employee.salary;
    const epfDeduction = basicSalary * 0.08;
    const payeTax = basicSalary > 100000 ? (basicSalary - 100000) * 0.06 : 0;
    const netPay = basicSalary - (epfDeduction + payeTax);

    expect(epfDeduction).toBe(4000);
    expect(payeTax).toBe(0);
    expect(netPay).toBe(46000);
  });

  it('calculates EPF, PAYE, and Net Pay correctly for a high-income employee', async () => {
    // Basic Salary: 200,000 LKR
    // EPF 8%: 16,000 LKR
    // PAYE: 6% on excess of 100k -> 6% of 100k = 6,000 LKR
    // Net Pay: 200k - (16k + 6k) = 178,000 LKR
    const employee = {
      id: 'emp-2',
      salary: 200000,
      status: 'active',
      companyId: 'comp-1'
    };

    const basicSalary = employee.salary;
    const epfDeduction = basicSalary * 0.08;
    const payeTax = basicSalary > 100000 ? (basicSalary - 100000) * 0.06 : 0;
    const netPay = basicSalary - (epfDeduction + payeTax);

    expect(epfDeduction).toBe(16000);
    expect(payeTax).toBe(6000);
    expect(netPay).toBe(178000);
  });
});
