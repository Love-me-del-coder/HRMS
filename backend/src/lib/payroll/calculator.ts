/**
 * Payroll Calculation Engine
 */

export interface PayrollResult {
  basic: number;
  grossPay: number;
  totalDeductions: number;
  netPay: number;
  earnings: Record<string, number>;
  deductions: Record<string, number>;
}

export interface PayrollConfig {
  epfRate: number;
  taxThreshold: number;
  taxRate: number;
}

/**
 * Calculates payroll for an employee based on company-specific configuration.
 * Currently defaults to Sri Lankan standard rates as a baseline.
 */
export const calculateEmployeePayroll = (
  basic: number,
  allowances: number = 0,
  config: PayrollConfig = {
    epfRate: 0.08,
    taxThreshold: 100000,
    taxRate: 0.06
  }
): PayrollResult => {
  // EPF: Employee Contribution
  const epfDeduction = basic * config.epfRate;

  // PAYE Tax Calculation
  let payeTax = 0;
  if (basic > config.taxThreshold) {
    payeTax = (basic - config.taxThreshold) * config.taxRate;
  }

  const totalDeductions = epfDeduction + payeTax;
  const grossPay = basic + allowances;
  const netPay = grossPay - totalDeductions;

  return {
    basic,
    grossPay,
    totalDeductions,
    netPay,
    earnings: { allowances },
    deductions: { epf: epfDeduction, paye: payeTax }
  };
};
