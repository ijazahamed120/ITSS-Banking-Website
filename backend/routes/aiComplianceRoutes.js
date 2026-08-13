import { respondWithGroundedAi, hasAnyAiProviderConfigured } from '../services/aiService.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Generate compliance summary with verified metrics
 */
export async function handleComplianceSummary(req, res, { transactions, customers, accounts, loanApplications }) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const payload = req.body || {};

    if (!hasAnyAiProviderConfigured()) {
      sendJsonResponse(res, 503, {
        error: 'MISSING_API_KEY',
        message: 'AI integration code is ready, but no LLM API key (GEMINI_API_KEY or GROQ_API_KEY) is configured.',
        details: 'Please set GEMINI_API_KEY or GROQ_API_KEY in backend environment or .env file.',
        isRealAi: false,
      });
      return;
    }

    // Calculate verified backend metrics
    const totalTxns = transactions.length;
    const flaggedTxns = transactions.filter((t) => t.is_suspicious === 'Y').length;
    const normalTxns = transactions.filter((t) => t.is_suspicious !== 'Y').length;
    const totalVolume = transactions.reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);

    const totalCust = customers.length;
    const pendingKyc = customers.filter((c) => c.kyc_status === 'PENDING').length;
    const expiredKyc = customers.filter((c) => c.kyc_status === 'EXPIRED').length;
    const completeKyc = customers.filter((c) => c.kyc_status === 'COMPLETE').length;

    const totalLoans = loanApplications.length;
    const approvedLoans = loanApplications.filter((l) =>
      ['APPROVE', 'APPROVED'].includes(String(l.decision_label || '').toUpperCase())
    ).length;
    const rejectedLoans = loanApplications.filter((l) =>
      ['REJECT', 'REJECTED'].includes(String(l.decision_label || '').toUpperCase())
    ).length;
    const loansReview = loanApplications.filter((l) =>
      ['REFER', 'REFER_FOR_REVIEW'].includes(String(l.decision_label || '').toUpperCase())
    ).length;

    // Derive First-Time Payee Cases
    const firstTimePayeeCases = transactions.filter((t) => {
      if (t.txn_type !== 'DEBIT') return false;
      const customerId = String(t.customer_id || '').trim();
      const counterparty = String(t.counterparty || '').trim();
      const priorDebits = transactions.filter((p) => {
        if (p.txn_type !== 'DEBIT') return false;
        if (String(p.customer_id).trim() !== customerId) return false;
        if (String(p.counterparty || '').trim() !== counterparty) return false;
        const dateCmp = String(p.txn_date || '').localeCompare(String(t.txn_date || ''));
        if (dateCmp < 0) return true;
        if (dateCmp > 0) return false;
        return String(p.txn_id || '').localeCompare(String(t.txn_id || '')) < 0;
      });
      return priorDebits.length === 0;
    });

    const flaggedFirstTime = firstTimePayeeCases.filter((t) => t.is_suspicious === 'Y').length;
    const normalFirstTime = firstTimePayeeCases.filter((t) => t.is_suspicious !== 'Y').length;

    // Channel Breakdown
    const channelsPresent = [...new Set(transactions.map((t) => t.channel).filter(Boolean))].sort();
    const channelSummary = channelsPresent
      .map((ch) => {
        const rows = transactions.filter((t) => t.channel === ch);
        const vol = rows.reduce((s, t) => s + Math.abs(parseFloat(t.amount) || 0), 0);
        const flg = rows.filter((t) => t.is_suspicious === 'Y').length;
        return `- ${ch}: ${rows.length} Txns | Volume: ₹${vol.toLocaleString('en-IN')} | Flagged: ${flg}`;
      })
      .join('\n');

    const auditActivityCount = payload.totalRecordedActions || (payload.auditLog ? payload.auditLog.length : 0);
    const escalatedCount = payload.escalatedCases || 0;

    const factualContext = `FACTUAL COMPLIANCE & RISK METRICS (Verified Company Ledger):

TRANSACTION METRICS:
- Total Transactions: ${totalTxns}
- Flagged / Suspicious Transactions (is_suspicious = Y): ${flaggedTxns}
- Normal Transactions (is_suspicious = N): ${normalTxns}
- Total Transaction Volume: ₹${totalVolume.toLocaleString('en-IN')}

TRANSACTION CHANNEL ANALYSIS:
${channelSummary || 'Not available in supplied data'}

CUSTOMER & KYC STATUS:
- Total Customers: ${totalCust}
- Completed KYC: ${completeKyc}
- Pending KYC: ${pendingKyc}
- Expired KYC: ${expiredKyc}

LOAN APPLICATION PORTFOLIO:
- Total Loan Applications: ${totalLoans}
- Approved Loans: ${approvedLoans}
- Rejected Loans: ${rejectedLoans}
- Loans Requiring Review (REFER_FOR_REVIEW): ${loansReview}

FIRST-TIME PAYEE CASES (Derived Signal):
- Total First-Time Payee Cases: ${firstTimePayeeCases.length}
- Flagged First-Time Payee Cases: ${flaggedFirstTime}
- Normal First-Time Payee Cases: ${normalFirstTime}
- Note: First-time status is a derived indicator — not automatic proof of misconduct.

COMPLIANCE OFFICER & AUDIT ACTIVITY:
- Persisted Compliance Actions / Audit Events: ${auditActivityCount}
- Escalated Cases Recorded: ${escalatedCount}

DATA LIMITATIONS & UNKNOWN FIELDS:
- Real-time sanctions / watchlist screening feeds: Not available in supplied data.
- Physical identity document scan files: Not available in supplied data.
- Third-party credit score bureau APIs: Not available in supplied data.`;

    const systemPrompt = `You are an AI compliance management assistant for an internal banking operations platform.

STRICT GROUNDING & COMPLIANCE RULES:
1. Use ONLY the factual metrics and evidence provided in the user context data.
2. Every number must come directly from the supplied backend evidence.
3. Do NOT invent risk scores, statistics, customer records, or audit actions.
4. Do NOT claim a transaction is fraudulent merely because it is flagged.
5. First-time payee status is an observed/derived indicator, not proof of misconduct or automatic suspicion.
6. Clearly distinguish verified facts from AI analytical interpretation.
7. Format ALL monetary amounts strictly in Indian Rupees (₹). Never use '$' or USD formatting.
8. If information is unavailable in the supplied context, explicitly state: 'Not available in supplied data.'
9. Do NOT make the final compliance decision. The final decision belongs strictly to the human compliance officer.

PROHIBITED UNSUPPORTED CONCLUSIONS (CRITICAL):
10. Do NOT invent or assign an overall risk rating (e.g. "Low risk", "Moderate risk", "High risk", "elevated risk posture") unless an explicit calculated risk score or rating is present in the supplied backend evidence. If no overall risk score exists in the evidence, state exactly: "No overall risk rating is calculated from the supplied data."
11. Do NOT describe pending or expired KYC as proof or indication of illicit activity, fraud, money laundering, or regulatory breach. Describe KYC counts factually — e.g. "23 customers have pending KYC and 17 have expired KYC. These cases require officer review because their KYC status is not currently complete." Use the actual counts from the supplied evidence.
12. Do NOT claim that IB, RTGS, SWIFT, or any transaction channel is inherently high-risk merely because it has a high count of flagged transactions. Instead, report channel counts factually — e.g. "IB, RTGS and SWIFT have the highest counts of flagged transactions in the supplied data. Channel frequency alone does not establish that a channel is inherently high-risk."
13. Do NOT claim fraud, illicit activity, regulatory non-compliance, sanctions exposure, or money laundering unless the supplied evidence explicitly supports such a statement. Flagged transactions, pending KYC, and first-time payee status are operational signals requiring review — not confirmed misconduct.
14. In section 5 (Transaction Risk), use factual counts from the evidence — e.g. "49 of 650 transactions are flagged in the supplied data." Do not extrapolate beyond the supplied counts.
15. In section 7 (Recommended Officer Focus), provide exactly 3–5 bullet points. Each bullet must be case-specific and grounded in the supplied metrics and evidence. Use moderately detailed professional wording — sufficient for a compliance officer to prioritize and act on, but avoid long paragraphs or generic filler. Do not repeat information already covered in earlier sections. End with a clear statement about the most urgent action or review priority based on the supplied evidence.

OUTPUT FORMAT (CRITICAL — follow exactly):
- Produce ONE concise compliance-management summary only. Do not generate a second copy, alternate version, recap, or duplicate of the summary.
- The response MUST contain exactly 8 numbered sections — no more, no fewer.
- Use these exact section numbers and titles (copy verbatim):
  1. Overall Compliance Status
  2. Key Risk Areas
  3. Highest-Priority Items
  4. KYC Concerns
  5. Transaction Risk
  6. Loan Review Workload
  7. Recommended Officer Focus
  8. Data Limitations
- Start directly with "1. Overall Compliance Status". Do not add introductory text, preamble, or closing remarks (e.g. do not write "Here is the summary", "Here is another summary", or "In conclusion").
- Do not add a section 9 or any content after section 8. Stop immediately after completing section 8.
- Do not repeat, restate, or re-list the 8 sections anywhere in the response.

Section content guidance:
1. Overall Compliance Status — summarize verified metrics only; if no overall risk score exists in the evidence, include "No overall risk rating is calculated from the supplied data."
2. Key Risk Areas — describe areas requiring officer attention based on supplied counts; do not assign Low/Moderate/High ratings.
3. Highest-Priority Items — list items by supplied counts and audit activity; no unsupported misconduct claims.
4. KYC Concerns — factual pending/expired counts and review need only; no illicit-activity language.
5. Transaction Risk — factual flagged vs total transaction counts; no fraud or laundering claims from flags alone.
6. Loan Review Workload — factual loan decision counts from the evidence.
7. Recommended Officer Focus — practical review priorities grounded in supplied metrics only.
8. Data Limitations — restate known gaps from the evidence (sanctions feeds, document scans, bureau APIs, etc.).`;

    await respondWithGroundedAi(res, {
      systemPrompt,
      factualContext,
      sourceDataVersion: 'v1.0.0-compliance-snapshot',
      workflow: 'E5',
      entityId: null,
      requestedByUserId: sessionData.user._id,
    });
  } catch (err) {
    console.error('[AI Routes] Compliance summary error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR', message: err.message });
  }
}
