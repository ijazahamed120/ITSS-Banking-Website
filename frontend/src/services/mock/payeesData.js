/**
 * Showcase-only sample shaped like a first-time payee ledger case.
 * NOT the E4 source of truth — E4 uses transactions.csv via csvLoader.
 */
export const mockPayees = [
  {
    txn_id: 'FT900075',
    customer_id: '100116',
    account_id: '10011601',
    counterparty: 'NEW.BEN.777',
    amount: -854802.94,
    channel: 'SWIFT',
    narrative: 'GAMBLING TOPUP',
    txn_date: '2026-07-15',
    is_suspicious: 'Y',
    is_first_time_payee: true,
  },
  {
    txn_id: 'FT900004',
    customer_id: '100198',
    account_id: '10019801',
    counterparty: 'SIP.MF',
    amount: -3114.25,
    channel: 'IB',
    narrative: 'UTILITY BILL',
    txn_date: '2026-07-10',
    is_suspicious: 'N',
    is_first_time_payee: true,
  },
];
