/**
 * Mock Customers Foundation Data Structure
 * (Placeholder structure aligned with company customers.csv schema for Stage 1)
 */
export const mockCustomers = [
  {
    customerId: 'CUST-88392',
    fullName: 'Alexander Vance',
    email: 'a.vance@apexlogistics.com',
    phone: '+1 (555) 234-8901',
    kycStatus: 'VERIFIED',
    riskScore: 78,
    riskLevel: 'HIGH',
    accountOpenedDate: '2021-03-15',
    segment: 'Corporate Commercial',
    pepStatus: false,
    country: 'United States',
  },
  {
    customerId: 'CUST-10482',
    fullName: 'Elena Rostova',
    email: 'elena.r@baltictrade.org',
    phone: '+1 (555) 891-3421',
    kycStatus: 'PENDING_REVERIFICATION',
    riskScore: 92,
    riskLevel: 'CRITICAL',
    accountOpenedDate: '2023-09-01',
    segment: 'Private Banking',
    pepStatus: true,
    country: 'Switzerland',
  },
  {
    customerId: 'CUST-39401',
    fullName: 'Marcus Sterling',
    email: 'm.sterling@horizonfin.com',
    phone: '+1 (555) 456-1122',
    kycStatus: 'VERIFIED',
    riskScore: 22,
    riskLevel: 'LOW',
    accountOpenedDate: '2018-11-20',
    segment: 'Retail Banking',
    pepStatus: false,
    country: 'United States',
  },
];
