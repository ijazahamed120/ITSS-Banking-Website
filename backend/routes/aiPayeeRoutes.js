import { respondWithGroundedAi, hasAnyAiProviderConfigured } from '../services/aiService.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Generate payee risk note for first-time payee transfer
 */
export async function handlePayeeRiskNote(req, res, { transactions, customers, accounts }) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const payload = req.body;
    const { txnId } = payload;

    if (!txnId) {
      sendJsonResponse(res, 400, { error: 'txnId parameter is required' });
      return;
    }

    if (!hasAnyAiProviderConfigured()) {
      sendJsonResponse(res, 503, {
        error: 'MISSING_API_KEY',
        message: 'AI integration code is ready, but no LLM API key (GEMINI_API_KEY or GROQ_API_KEY) is configured.',
        details: 'Please set GEMINI_API_KEY or GROQ_API_KEY in backend environment or .env file.',
        isRealAi: false,
      });
      return;
    }

    const txn = transactions.find((t) => String(t.txn_id).toUpperCase() === String(txnId).trim().toUpperCase());
    if (!txn) {
      sendJsonResponse(res, 404, { error: `Transaction ${txnId} not found` });
      return;
    }

    if (txn.txn_type !== 'DEBIT') {
      sendJsonResponse(res, 400, {
        error: `Transaction ${txnId} is not a DEBIT and cannot be treated as a first-time payee transfer case`
      });
      return;
    }

    const customerId = String(txn.customer_id || '').trim();
    const counterparty = String(txn.counterparty || '').trim();

    const priorDebits = transactions
      .filter((t) => {
        if (t.txn_type !== 'DEBIT') return false;
        if (String(t.customer_id).trim() !== customerId) return false;
        if (String(t.counterparty || '').trim() !== counterparty) return false;
        const dateCmp = String(t.txn_date || '').localeCompare(String(txn.txn_date || ''));
        if (dateCmp < 0) return true;
        if (dateCmp > 0) return false;
        return String(t.txn_id || '').localeCompare(String(txn.txn_id || '')) < 0;
      })
      .sort((a, b) => {
        const d = String(a.txn_date || '').localeCompare(String(b.txn_date || ''));
        if (d !== 0) return d;
        return String(a.txn_id || '').localeCompare(String(b.txn_id || ''));
      });

    const isFirstTimePayee = priorDebits.length === 0;
    if (!isFirstTimePayee) {
      sendJsonResponse(res, 400, {
        error: `Transaction ${txnId} is not a first-time payee case. Earlier DEBIT(s) exist for customer ${customerId} and counterparty '${counterparty}'.`
      });
      return;
    }

    const cust = customers.find((c) => String(c.customer_id) === customerId);
    const acc = accounts.find((a) => String(a.account_id) === String(txn.account_id).trim());
    const absAmount = Math.abs(parseFloat(txn.amount || 0));
    const custIncomeVal = cust ? parseFloat(cust.monthly_income || 0) : 0;
    const incomeRatio = custIncomeVal > 0 ? (absAmount / custIncomeVal).toFixed(2) : 'N/A';
    const workingBal = acc ? parseFloat(acc.working_balance || 0) : 0;
    const drainPct = workingBal > 0 ? ((absAmount / workingBal) * 100).toFixed(1) : 'N/A';

    const derivedLines = [];
    derivedLines.push(`- First-Time Payee Flag: YES (no earlier DEBIT for customer_id=${customerId} + counterparty='${counterparty}'). This is an observed/derived signal only — not proof of fraud.`);
    if (incomeRatio !== 'N/A') {
      derivedLines.push(`- Transfer Amount vs Declared Monthly Income Ratio: ${incomeRatio}x`);
    } else {
      derivedLines.push('- Transfer Amount vs Declared Monthly Income Ratio: Not available in supplied data.');
    }
    if (drainPct !== 'N/A') {
      derivedLines.push(`- Working Balance Drain Ratio: ${drainPct}% of account working_balance`);
    } else {
      derivedLines.push('- Working Balance Drain Ratio: Not available in supplied data.');
    }

    const factualContext = `FACTUAL FIRST-TIME PAYEE TRANSFER CONTEXT:
Transaction ID: ${txn.txn_id}
Account ID: ${txn.account_id}
Customer ID: ${txn.customer_id}
Txn Date: ${txn.txn_date}
Value Date: ${txn.value_date}
Amount (absolute): ₹${absAmount.toLocaleString('en-IN')}
Txn Type: ${txn.txn_type}
Payee / Beneficiary Counterparty: ${txn.counterparty || 'Not available in supplied data'}
Narrative: ${txn.narrative || 'Not available in supplied data'}
Channel: ${txn.channel || 'Not available in supplied data'}
Ground-Truth Flag (is_suspicious): ${txn.is_suspicious === 'Y' ? 'Y (FLAGGED SUSPICIOUS)' : 'N (NORMAL)'}

CUSTOMER CONTEXT (Observed CSV Fields):
Customer Name: ${cust ? cust.name_1 : 'Not available in supplied data'}
KYC Status: ${cust ? cust.kyc_status : 'Not available in supplied data'}
Employment Type: ${cust ? cust.employment_type : 'Not available in supplied data'}
Declared Monthly Income: ${cust ? `₹${custIncomeVal.toLocaleString('en-IN')}` : 'Not available in supplied data'}
Town/Country: ${cust ? cust.town_country : 'Not available in supplied data'}
Nationality: ${cust ? cust.nationality : 'Not available in supplied data'}
Residence: ${cust ? cust.residence : 'Not available in supplied data'}

ACCOUNT CONTEXT (Observed CSV Fields):
Account Title: ${acc ? acc.account_title : 'Not available in supplied data'}
Product: ${acc ? acc.product : 'Not available in supplied data'}
Currency: ${acc ? acc.currency : 'Not available in supplied data'}
Working Balance: ${acc ? `₹${workingBal.toLocaleString('en-IN')}` : 'Not available in supplied data'}
Posting Restriction: ${acc ? (acc.posting_restrict || 'None') : 'Not available in supplied data'}
Opening Date: ${acc ? acc.opening_date : 'Not available in supplied data'}

DERIVED INDICATORS (Factual Derivations — clearly labeled):
${derivedLines.join('\n')}
- Prior DEBIT count to this counterparty for this customer: 0

UNAVAILABLE / ABSENT DATA IN SUPPLIED DATASET:
- Payee bank name / SWIFT / BIC: Not available in supplied data.
- Payee country / jurisdiction registry: Not available in supplied data.
- Sanctions / watchlist screening results: Not available in supplied data.
- Static payee risk score: Not available in supplied data.
- Separate payee master account number (beyond counterparty string): Not available in supplied data.`;

    const systemPrompt = `You are a first-time payee risk note drafting assistant for an internal banking operations and compliance platform.

STRICT GROUNDING & COMPLIANCE RULES:
1. Use ONLY the factual company evidence provided in the user context data.
2. Do NOT invent facts, missing fields, or payee information.
3. Do NOT invent sanctions results, watchlist matches, SWIFT/BIC details, beneficiary bank names, payee country, or payee risk scores.
4. Do NOT claim fraud. Do NOT claim that a first-time payee is automatically suspicious.
5. First-time status is an observed/derived ledger signal only — not proof of misconduct.
6. Clearly distinguish raw observed CSV data from derived indicators.
7. If required information is unavailable in the supplied data, explicitly state: 'Not available in supplied data.'
8. Format ALL monetary amounts strictly in Indian Rupees (₹). Never use '$' or USD formatting.
9. Do NOT make the final compliance decision. The final decision belongs strictly to the human compliance officer.
10. In section 7 (Recommended Manual Checks), provide exactly 3–5 bullet points. Each bullet must be case-specific and grounded in the supplied transfer, customer, and account evidence. Use moderately detailed professional wording — sufficient for a compliance reviewer to act on, but avoid long paragraphs or generic filler. Do not repeat details already covered in the evidence sections. End with a clear statement about whether escalation or further review is warranted based on the supplied evidence.

Generate a structured First-Time Payee Risk Note with these exact numbered sections:
1. Transfer Summary
2. Payee / Counterparty Evidence
3. Customer Context
4. Account Context
5. First-Time Assessment
6. Relevant Derived Indicators
7. Recommended Manual Checks
8. Important Limitations
9. Executive Summary: In 2-3 sentences, summarize the first-time payee risk assessment for the compliance officer. Include: (a) the transfer's primary risk concern or normalized profile (first-time status, amount reasonableness, purpose fit), (b) the most relevant derived indicator or pattern (transfer-to-income ratio, balance drain), and (c) the primary action recommendation for approval or escalation.`;

    await respondWithGroundedAi(res, {
      systemPrompt,
      factualContext,
      sourceDataVersion: 'v1.0.0-transactions.csv',
      workflow: 'E4',
      entityId: txnId,
      requestedByUserId: sessionData.user._id,
    });
  } catch (err) {
    console.error('[AI Routes] Payee risk note error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR', message: err.message });
  }
}
