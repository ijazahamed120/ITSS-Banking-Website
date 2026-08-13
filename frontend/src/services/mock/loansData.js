/**
 * Mock Loans Foundation Data Structure
 * (Placeholder structure aligned with company loan_applications.csv schema for Stage 1)
 */
export const mockLoans = [
  {
    loanId: 'LOAN-77391',
    applicantName: 'Apex Commercial Logistics LLC',
    requestedAmount: 1500000.00,
    loanPurpose: 'Equipment Expansion & Fleet Acquisition',
    termMonths: 60,
    riskScore: 72,
    riskLevel: 'HIGH',
    dtiRatio: 0.48,
    creditScore: 670,
    status: 'UNDER_REVIEW',
    submittedDate: '2026-08-01',
  },
  {
    loanId: 'LOAN-10293',
    applicantName: 'Horizon Financial Tech Solutions',
    requestedAmount: 450000.00,
    loanPurpose: 'Working Capital',
    termMonths: 36,
    riskScore: 28,
    riskLevel: 'LOW',
    dtiRatio: 0.22,
    creditScore: 780,
    status: 'APPROVED',
    submittedDate: '2026-08-05',
  },
];
