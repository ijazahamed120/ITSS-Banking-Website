/**
 * Mock Risk Analysis & Assessment Data
 */
export const mockRiskReasons = [
  {
    id: 'RR-001',
    category: 'JURISDICTION',
    severity: 'HIGH',
    title: 'High-Risk Destination Jurisdiction',
    description: 'Transaction beneficiary is domiciled in a FATF grey-listed jurisdiction (Cayman Islands).',
  },
  {
    id: 'RR-002',
    category: 'BEHAVIORAL',
    severity: 'CRITICAL',
    title: 'Velocity Spikes / Structuring Alert',
    description: '4 consecutive transfers executed under the ₹10 Lakh CTR reporting threshold within 36 hours.',
  },
  {
    id: 'RR-003',
    category: 'ENTITY',
    severity: 'MEDIUM',
    title: 'Newly Established Entity Payee',
    description: 'Beneficiary account was incorporated less than 45 days prior to transfer execution.',
  },
];

export const mockRecommendedChecks = [
  { id: 'RC-1', text: 'Verify Ultimate Beneficial Ownership (UBO) structure for Apex Offshore Holding.', required: true, completed: false },
  { id: 'RC-2', text: 'Cross-reference beneficiary SWIFT code against latest OFAC/UN Sanctions lists.', required: true, completed: true },
  { id: 'RC-3', text: 'Request Supporting Invoices or Commercial Contracts for ₹2,50,000 wire.', required: true, completed: false },
  { id: 'RC-4', text: 'Conduct Source of Funds (SoF) verification for origin checking account.', required: false, completed: false },
];
