# E4 — First-Time Payee Risk Notes

Primary dataset: `data/transactions.csv` (payee identity = `counterparty`).

Routes:
- `/payees` — first-time DEBIT case list
- `/payees/:txnId` — grounded risk note workstation

There is no `payees.csv`. First-time status is derived when no earlier DEBIT
exists for the same `customer_id` + `counterparty` (ordered by `txn_date`, then `txn_id`).
