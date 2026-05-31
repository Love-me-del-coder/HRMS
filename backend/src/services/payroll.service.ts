export interface PayrollCalculationResult {
  basic: number;
  epfDeduction: number;
  payeTax: number;
  allowanceAmount: number;
  totalDeductions: number;
  grossPay: number;
  netPay: number;
}

/**
 * Centralized Payroll Calculation Service
 * Currently implements Sri Lankan tax and EPF rules.
 */
export const calculatePayslip = (salary: number): PayrollCalculationResult => {
  const basic = salary || 0;

  // EPF: 8% from Employee
  const epfDeduction = basic * 0.08;

  // Simplified PAYE Tax (Basic bracket assumption)
  // e.g. Above 100,000 LKR, tax 6% on excess
  let payeTax = 0;
  if (basic > 100000) {
    payeTax = (basic - 100000) * 0.06;
  }

  const allowanceAmount = 0;
  const totalDeductions = epfDeduction + payeTax;
  const grossPay = basic + allowanceAmount;
  const netPay = grossPay - totalDeductions;

  return {
    basic,
    epfDeduction,
    payeTax,
    allowanceAmount,
    totalDeductions,
    grossPay,
    netPay
  };
};
