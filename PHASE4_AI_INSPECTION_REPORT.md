# Phase 4 AI Generation History - Inspection Report

**Date:** 2026-08-12  
**Status:** INSPECTION COMPLETE - Ready for Implementation Planning  
**No modifications have been made.**

---

## 1. WHERE AI NOTES ARE GENERATED

### E1: Compliance Suspicious Transfer Investigation Note
**Frontend Function:** `generateInvestigationNote(txnId)`  
**File:** [src/services/api/aiApi.js](src/services/api/aiApi.js#L28)  
**Page Called From:** [TransactionInvestigationPage.jsx](src/pages/transactions/TransactionInvestigationPage.jsx#L141)  
**Backend Endpoint:** `POST /api/ai/investigation-note` (server.js:395)  
**Workflow:** E1_SUSPICIOUS_TRANSFERS  
**Entity:** Transaction ID  

### E2: KYC Profile Summary
**Frontend Function:** `generateKycSummary(customerId)`  
**File:** [src/services/api/aiApi.js](src/services/api/aiApi.js#L105)  
**Page Called From:** [CustomerDetailPage.jsx](src/pages/customers/CustomerDetailPage.jsx#L73)  
**Backend Endpoint:** `POST /api/ai/kyc-summary` (server.js:535)  
**Workflow:** E2  
**Entity:** Customer ID  

### E3: Loan Decision Note
**Frontend Function:** `generateLoanDecisionNote(applicationId)`  
**File:** [src/services/api/aiApi.js](src/services/api/aiApi.js#L184)  
**Page Called From:** [LoanDetailPage.jsx](src/pages/loans/LoanDetailPage.jsx#L104)  
**Backend Endpoint:** `POST /api/ai/loan-decision-note` (server.js:640)  
**Workflow:** E3  
**Entity:** Loan Application ID  

### E4: Payee Risk/Review Note
**Frontend Function:** `generatePayeeRiskNote(txnId)`  
**File:** [src/services/api/aiApi.js](src/services/api/aiApi.js#L262)  
**Page Called From:** [PayeeDetailPage.jsx](src/pages/payees/PayeeDetailPage.jsx#L119)  
**Backend Endpoint:** `POST /api/ai/payee-risk-note` (server.js:755)  
**Workflow:** E4  
**Entity:** Transaction ID (first-time payee)  

### E5: Compliance Risk & Compliance Summary
**Frontend Function:** `generateComplianceSummary(payload)`  
**File:** [src/services/api/aiApi.js](src/services/api/aiApi.js#L343)  
**Backend Endpoint:** `POST /api/ai/compliance-summary` (server.js:923)  
**Workflow:** E5  
**Entity:** Aggregate (no single entity)  

---

## 2. FRONTEND FILES CALLING AI ENDPOINTS

| File | AI Functions Called | Workflow | User Context |
|------|---------------------|----------|--------------|
| [src/services/api/aiApi.js](src/services/api/aiApi.js) | generateInvestigationNote, generateKycSummary, generateLoanDecisionNote, generatePayeeRiskNote, generateComplianceSummary | E1-E5 | No auth (client-side) |
| [src/pages/transactions/TransactionInvestigationPage.jsx](src/pages/transactions/TransactionInvestigationPage.jsx) | generateInvestigationNote | E1 | ✅ useAuth() hook |
| [src/pages/customers/CustomerDetailPage.jsx](src/pages/customers/CustomerDetailPage.jsx) | generateKycSummary | E2 | ✅ useAuth() hook |
| [src/pages/loans/LoanDetailPage.jsx](src/pages/loans/LoanDetailPage.jsx) | generateLoanDecisionNote | E3 | ✅ useAuth() hook |
| [src/pages/payees/PayeeDetailPage.jsx](src/pages/payees/PayeeDetailPage.jsx) | generatePayeeRiskNote | E4 | ✅ useAuth() hook |

**Key Finding:** Frontend pages have authenticated user context via `useAuth()` hook, but AI client functions (aiApi.js) do NOT pass user information to backend endpoints.

---

## 3. BACKEND ENDPOINTS GENERATING AI RESPONSES

### Common Pattern (All 5 Endpoints)

**Route Pattern:**
```
POST /api/ai/[investigation-note|kyc-summary|loan-decision-note|payee-risk-note|compliance-summary]
```

**Current Flow:**
1. Frontend sends entity ID (txnId, customerId, etc.)
2. Backend retrieves CSV data for that entity
3. Constructs factual context from CSV
4. Calls `respondWithGroundedAi()` helper function
5. Helper calls `generateAIResponse()` from aiProvider.js
6. AI provider (Gemini or Groq) processes system prompt + factual context
7. Returns JSON response with:
   - `content`: Generated AI text
   - `generatedAt`: ISO timestamp
   - `disclaimer`: "AI-Assisted Analysis · Review Required Before Action"
   - `sourceDataVersion`: CSV version (e.g., "v1.0.0-transactions.csv")
   - `isRealAi`: boolean
   - `modelUsed`: Model name
   - `provider`: "Gemini" or "Groq"
   - `fallback`: Whether fallback provider was used

**Location of respondWithGroundedAi():** [server.js:74](server.js#L74)

---

## 4. INFORMATION AVAILABLE AT AI GENERATION TIME

### Available Information by Workflow

#### E1 (Investigation Note)
**From Request:**
- txnId ✅

**From CSV Data (Automatically Retrieved):**
- Transaction details (txn_id, txn_date, amount, counterparty, narrative, etc.) ✅
- Customer details (customer_id, name, KYC status, monthly_income, etc.) ✅
- Account details (account_id, working_balance, posting_restrict, etc.) ✅
- Derived indicators (transfer-to-income ratio, account drain %, etc.) ✅

**NOT Available (No Authentication):**
- Authenticated user ID ❌
- User email ❌
- User name ❌
- User role ❌

**Computed:**
- AI provider (Gemini/Groq) ✅
- Fallback status ✅
- Generated text ✅
- Timestamp (`new Date().toISOString()`) ✅

#### E2 (KYC Summary)
**From Request:**
- customerId ✅

**From CSV:**
- Customer profile ✅
- Associated accounts ✅

**NOT Available:**
- Authenticated user (no auth check) ❌

**Computed:**
- AI provider, fallback, text, timestamp ✅

#### E3 (Loan Decision Note)
**From Request:**
- applicationId ✅

**From CSV:**
- Loan application ✅
- Applicant profile ✅
- Associated accounts ✅
- Derived financial indicators (DTI ratio, etc.) ✅

**NOT Available:**
- Authenticated user ❌

**Computed:**
- AI provider, fallback, text, timestamp ✅

#### E4 (Payee Risk Note)
**From Request:**
- txnId ✅

**From CSV:**
- Transaction details ✅
- Customer profile ✅
- Account context ✅
- Derived indicators (first-time status, income ratio, drain %) ✅

**NOT Available:**
- Authenticated user ❌

**Computed:**
- AI provider, fallback, text, timestamp ✅

#### E5 (Compliance Summary)
**From Request:**
- Entire payload (optional) ✅

**From CSV/Aggregation:**
- Transaction metrics (total count, flagged count, volume) ✅
- Customer KYC status distribution ✅
- Loan application portfolio ✅
- Channel breakdown ✅
- First-time payee cases ✅

**NOT Available:**
- Authenticated user ❌

**Computed:**
- AI provider, fallback, text, timestamp ✅

---

## 5. CURRENT AI GENERATION HISTORY STORAGE

**Status: NONE - NO HISTORY IS PERSISTED**

**Evidence:**
- Grep search for `AiGeneration.create` in server.js: **0 results**
- AiGeneration model exists but is never instantiated
- Every "Regenerate" button click makes a fresh API call
- AI responses are only sent to frontend, never saved to MongoDB
- No history, no audit trail, no version control

**Impact:**
- No way to audit who requested which AI generation
- No way to track if notes were edited after generation
- No way to retrieve historical AI analysis for the same entity
- Compliance risk: No record of AI-assisted decisions

---

## 6. EXISTING AiGeneration MODEL INSPECTION

**File:** [server/db/models/AiGeneration.js](server/db/models/AiGeneration.js)

**Schema Structure:**
```javascript
{
  workflow:           String (enum: E1, E2, E3, E4, E5),
  entityId:           String (txn_id, customer_id, application_id, etc.),
  requestedByUserId:  ObjectId (ref: User),
  provider:           String (Gemini, Groq),
  modelUsed:          String (gemini-2.0-flash, groq-model, etc.),
  fallback:           Boolean,
  content:            String (the AI-generated text),
  disclaimer:         String,
  sourceDataVersion:  String (v1.0.0-transactions.csv, etc.),
  generatedAt:        Date (auto-default: now()),
}
```

**Indexes:**
- `{ workflow: 1, entityId: 1, generatedAt: -1 }` - Query by workflow+entity+time
- `{ generatedAt: -1 }` - Query by recency
- `{ requestedByUserId: 1, generatedAt: -1 }` - Query by user

**Assessment: ✅ SCHEMA IS SUFFICIENT**
- All necessary fields present
- Proper indexes for audit trail queries
- Can store complete AI generation history
- No schema changes needed

---

## 7. IS EXISTING MODEL SUFFICIENT?

**Answer: YES ✅**

The existing AiGeneration model has all required fields:

| Requirement | Field | Available |
|-------------|-------|-----------|
| Which workflow generated the note | `workflow` | ✅ |
| Which entity (transaction/customer/loan) | `entityId` | ✅ |
| Who requested the AI generation | `requestedByUserId` | ✅ |
| Which AI provider was used | `provider` | ✅ |
| Which model was used | `modelUsed` | ✅ |
| Whether it was a fallback | `fallback` | ✅ |
| The generated content | `content` | ✅ |
| The disclaimer/version info | `sourceDataVersion` | ✅ |
| When it was generated | `generatedAt` | ✅ |

**No schema modifications required** - only implementation of storage logic.

---

## 8. RECOMMENDED MINIMAL CHANGES

### Design Decision: Where to Capture User Context

**Current State:**
```
Frontend Page (has user) ←→ AI Client (aiApi.js) ←→ Backend Endpoint (no auth)
                                     ↓
                            [AI generated, NO user recorded]
```

**Recommended State:**
```
Frontend Page (has user) ←→ AI Client (aiApi.js) ←→ Backend Endpoint (WITH auth)
                                     ↑                           ↓
                                  Pass user               Record to AiGeneration
                                                          with authenticated user
```

### Implementation Approach (Minimal Changes)

#### **Step 1: Authenticate AI Endpoints**
- Add authentication check to each AI endpoint (like E1/E3/E4 workflow endpoints)
- Extract user from session cookie via `getSessionFromRequest()`
- If not authenticated, return 401 Unauthorized

#### **Step 2: Modify Frontend aiApi.js to Pass Session**
**Current:**
```javascript
fetch(E1_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ txnId })
})
```

**Proposed (Option A - include in header):**
```javascript
fetch(E1_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',  // Send cookies automatically
  body: JSON.stringify({ txnId })
})
```

Note: Already uses `credentials: 'include'` for cookie-based auth - no change needed!

#### **Step 3: Store AI Generation Record**
In each endpoint's `respondWithGroundedAi()` call:
```javascript
const aiGen = await AiGeneration.create({
  workflow: 'E1',
  entityId: txnId,
  requestedByUserId: sessionData.user._id,
  provider: result.providerLabel,
  modelUsed: result.modelUsed,
  fallback: result.fallback,
  content: result.text,
  disclaimer: 'AI-Assisted Analysis · Review Required Before Action',
  sourceDataVersion: 'v1.0.0-transactions.csv',
  generatedAt: new Date()
});
```

#### **Step 4: No Changes to AI Prompts or Providers**
- `server/aiProvider.js` remains untouched
- System prompts remain untouched
- AI output wording remains untouched
- Fallback logic remains untouched

---

## 9. WHAT WILL BE STORED IN MONGODB

### Sample AiGeneration Record

**E1 Example:**
```json
{
  "_id": ObjectId("670abc1234567890abcdef12"),
  "workflow": "E1",
  "entityId": "TXN001",
  "requestedByUserId": ObjectId("507f1f77bcf86cd799439011"),
  "provider": "Gemini",
  "modelUsed": "gemini-2.0-flash",
  "fallback": false,
  "content": "# Investigation Summary\n\n...[full AI-generated text]...",
  "disclaimer": "AI-Assisted Analysis · Review Required Before Action",
  "sourceDataVersion": "v1.0.0-transactions.csv",
  "generatedAt": "2026-08-12T14:32:45.123Z",
  "createdAt": "2026-08-12T14:32:45.123Z",
  "updatedAt": "2026-08-12T14:32:45.123Z"
}
```

**E3 Example:**
```json
{
  "_id": ObjectId("670abc1234567890abcdef13"),
  "workflow": "E3",
  "entityId": "APP001",
  "requestedByUserId": ObjectId("507f1f77bcf86cd799439012"),
  "provider": "Groq",
  "modelUsed": "llama-3.1-70b",
  "fallback": true,
  "content": "# Loan Application Summary\n\n...[full AI-generated text]...",
  "disclaimer": "AI-Assisted Analysis · Review Required Before Action",
  "sourceDataVersion": "v1.0.0-loan_applications.csv",
  "generatedAt": "2026-08-12T15:45:22.456Z",
  "createdAt": "2026-08-12T15:45:22.456Z",
  "updatedAt": "2026-08-12T15:45:22.456Z"
}
```

### What Can Be Queried

Once stored, these records enable:

1. **Audit Trail:**
   - Who requested AI analysis on transaction TXN001?
   - When was it requested?
   - Which AI provider/model was used?

2. **History & Comparison:**
   - All AI generations for a specific loan application
   - How many times was analysis regenerated?
   - Which user regenerated most recently?

3. **Provider Analysis:**
   - How many fallbacks to Groq occurred?
   - Which provider was used for E1 vs E3?

4. **Performance Tracking:**
   - Average generation time per workflow
   - Fallback rate by provider

---

## 10. FILES THAT WILL NEED MODIFICATION

### Backend (server.js)

**Modifications Needed:**
1. Import AiGeneration model at top (already imported as `AiGeneration` from line 1)
2. Add `await connectMongo()` to each AI endpoint (already done in E1/E3/E4 endpoints for reference)
3. Add authentication check: `const sessionData = await getSessionFromRequest(req);`
4. After `respondWithGroundedAi()` completes, create AiGeneration record

**Files Modified:**
- [server.js](server.js) - 5 endpoints need modification:
  - `/api/ai/investigation-note` (line 395)
  - `/api/ai/kyc-summary` (line 535)
  - `/api/ai/loan-decision-note` (line 640)
  - `/api/ai/payee-risk-note` (line 755)
  - `/api/ai/compliance-summary` (line 923)

### Frontend

**NO MODIFICATIONS NEEDED:**
- aiApi.js already sends `credentials: 'include'`
- Pages already have user context
- No UI changes needed

---

## 11. ARCHITECTURE: NO CHANGES NEEDED

**Gemini/Groq Integration:** ✅ Completely preserved  
**AI Prompts:** ✅ Unchanged  
**AI Output:** ✅ Unchanged  
**AI Providers:** ✅ Unchanged  
**Frontend Functionality:** ✅ Unchanged  
**RBAC:** ✅ Unchanged  
**CSV Files:** ✅ Unchanged  
**Session Management:** ✅ Unchanged  
**E1/E3/E4 Workflows:** ✅ Unchanged  

Only addition: Store history in MongoDB after generating.

---

## SUMMARY

| Aspect | Status | Notes |
|--------|--------|-------|
| **Inspection** | ✅ Complete | All AI flows mapped and analyzed |
| **Schema Sufficiency** | ✅ Yes | AiGeneration model is ready to use |
| **Changes Required** | ✅ Minimal | Auth + storage only, no business logic changes |
| **Gemini/Groq** | ✅ Unchanged | No provider modifications |
| **AI Prompts** | ✅ Unchanged | No prompt modifications |
| **Frontend** | ✅ Unchanged | Already sends credentials with requests |
| **RBAC** | ✅ Unchanged | No permission changes |
| **CSV Files** | ✅ Unchanged | Still read-only source of truth |

---

**Report Status: COMPLETE - READY FOR IMPLEMENTATION DESIGN**

No code modifications have been made. Awaiting approval to proceed with implementation.
