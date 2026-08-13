/**
 * Mock AI Notes Demonstrations
 */
export const mockAiNotes = {
  suspiciousTransfer: `INVESTIGATION DRAFT SUMMARY:
Transaction TXN-908214 (₹2,50,000) originates from account ACC-99201482 (Apex Logistics LLC) routed to Vanguard Global Shell LLC in the Cayman Islands.

KEY RISK DRIVERS:
1. Destination Jurisdiction: Cayman Islands (FATF grey-listed territory).
2. Velocity Pattern: 300% increase above historical 90-day baseline average transfer size.
3. Entity Profile: Recipient account was activated 12 days prior to transaction timestamp.

COMPLIANCE RECOMMENDATION:
Elevate to Senior AML Officer for SAR evaluation prior to clearing wire. Request commercial invoice reference #INV-2026-88.`,

  kycSummary: `KYC PROFILE ANALYSIS:
Customer: Elena Rostova (CUST-10482)
Risk Index: 92/100 (CRITICAL)

SUMMARY FINDINGS:
- PEP Flag: Confirmed match on Politically Exposed Persons list (Former Deputy Minister of Trade).
- Document Deficiencies: Proof of Address expired on Jan 2024.
- High Risk Jurisdiction Transfers: 14 incoming SWIFT transfers totaling €4.2M from Eastern Europe within Q2.`,

  loanAssessment: `CREDIT DECISION MEMO DRAFT:
Applicant: Apex Commercial Logistics LLC (LOAN-77391)
Requested: ₹15,00,000 (60 Months)

RISK RATING: HIGH (Score: 72/100)
- DTI Ratio: 48% (exceeds standard 40% commercial policy threshold).
- Collateral Coverage: 1.1x coverage via secondary vehicle fleet pledge.
- Cash Flow Margin: Thin DSCR of 1.15x.

RECOMMENDATION: Conditional Approval subject to personal guarantee of UBO Alexander Vance and minimum 1.3x DSCR covenant.`,

  payeeRiskNote: `FIRST-TIME PAYEE RISK NOTE (showcase sample only):
1. Transfer Summary — grounded ledger DEBIT to counterparty NEW.BEN.777
2. Payee / Counterparty Evidence — counterparty string from transactions.csv
3. First-Time Assessment — no earlier DEBIT for same customer_id + counterparty
4. Limitations — bank name, SWIFT, country, watchlist, and risk score: Not available in supplied data.`,
};
