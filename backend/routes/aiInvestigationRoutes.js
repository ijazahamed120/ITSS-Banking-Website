import { respondWithGroundedAi, hasAnyAiProviderConfigured } from '../services/aiService.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Generate investigation note for transaction
 */
export async function handleInvestigationNote(req, res, { transactions, customers, accounts }) {
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

    // Retrieve exact factual records
    const txn = transactions.find((t) => t.txn_id === txnId);
    if (!txn) {
      sendJsonResponse(res, 404, { error: `Transaction ${txnId} not found` });
      return;
    }

    const cust = customers.find((c) => c.customer_id === txn.customer_id);
    const acc = accounts.find((a) => a.account_id === txn.account_id);

    const isSuspicious = txn.is_suspicious === 'Y';
    const amountVal = Math.abs(parseFloat(txn.amount) || 0);

    const formattedAmount = `₹${amountVal.toLocaleString('en-IN')}`;
    const incomeStr = cust ? `₹${parseFloat(cust.monthly_income || 0).toLocaleString('en-IN')}` : 'Not available in supplied data';
    const balanceStr = acc ? `₹${parseFloat(acc.working_balance || 0).toLocaleString('en-IN')}` : 'Not available in supplied data';

    // Derive Indicators
    const derivedIndicators = [];
    if (isSuspicious) {
      derivedIndicators.push({ label: 'Ground-Truth Flagged Suspicious', detail: 'is_suspicious = Y in core ledger' });
    }
    if (cust && cust.monthly_income > 0) {
      const ratio = (amountVal / parseFloat(cust.monthly_income)).toFixed(1);
      if (ratio >= 2.0) {
        derivedIndicators.push({ label: 'Transfer vs Income Ratio', detail: `Transfer value is ${ratio}x greater than declared monthly income` });
      }
    }
    if (acc && acc.working_balance > 0) {
      const balPct = ((amountVal / parseFloat(acc.working_balance)) * 100).toFixed(1);
      if (balPct >= 70.0) {
        derivedIndicators.push({ label: 'Account Liquidity Drain', detail: `Transfer consumes ${balPct}% of working balance` });
      }
    }
    const cp = String(txn.counterparty || '').toUpperCase();
    if (cp.includes('OFFSHORE') || cp.includes('CRYPTO') || cp.includes('VENDOR.Z')) {
      derivedIndicators.push({ label: 'High-Risk Counterparty Keyword', detail: `Beneficiary '${txn.counterparty}' matches high-risk pattern` });
    }
    if (acc && acc.posting_restrict === 'KYC') {
      derivedIndicators.push({ label: 'Account Posting Restriction', detail: 'Posting restrict flag set to KYC on account' });
    }

    // Construct Factual Evidence Context
    const factualContext = `FACTUAL EVIDENCE CONTEXT:
Transaction ID: ${txn.txn_id}
Transaction Date: ${txn.txn_date}
Value Date: ${txn.value_date}
Amount: ${formattedAmount} (INR)
Transaction Type: ${txn.txn_type}
Channel Rail: ${txn.channel}
Beneficiary Counterparty: ${txn.counterparty || 'Not specified'}
Narrative / Purpose: "${txn.narrative}"
Ground-Truth Flag (is_suspicious): ${isSuspicious ? 'Y (FLAGGED SUSPICIOUS)' : 'N (NORMAL)'}

CUSTOMER PROFILE:
Customer ID: ${txn.customer_id}
Name: ${cust ? cust.name_1 : 'Not available in supplied data'}
Mnemonic: ${cust ? cust.mnemonic : 'Not available in supplied data'}
Town/Country: ${cust ? cust.town_country : 'Not available in supplied data'}
Date of Birth: ${cust ? cust.date_of_birth : 'Not available in supplied data'}
Employment Type: ${cust ? cust.employment_type : 'Not available in supplied data'}
Monthly Income: ${incomeStr}
KYC Status: ${cust ? cust.kyc_status : 'Not available in supplied data'}

ACCOUNT CONTEXT:
Account ID: ${txn.account_id}
Account Title: ${acc ? acc.account_title : 'Not available in supplied data'}
Working Balance: ${balanceStr}
Posting Restriction: ${acc && acc.posting_restrict ? acc.posting_restrict : 'None'}
Opening Date: ${acc ? acc.opening_date : 'Not available in supplied data'}

DERIVED RISK INDICATORS:
${derivedIndicators.length > 0 ? derivedIndicators.map((i, idx) => `${idx + 1}. [Derived Indicator] ${i.label}: ${i.detail}`).join('\n') : 'No elevated risk indicators derived.'}`;

    const sectionTwoTitle = isSuspicious ? 'Why This Transaction Was Flagged' : 'Transaction Assessment';

    const systemPrompt = `You are an investigation-note drafting assistant for an internal banking operations and compliance system.

STRICT GROUNDING & COMPLIANCE RULES:
1. Use ONLY the factual evidence provided in the user context data.
2. Do NOT invent risk factors, facts, customer behavior, regulatory conclusions, or fraud claims.
3. If required information is unavailable in the supplied data, explicitly state: 'Not available in supplied data.'
4. Ground-Truth Status Guidance:
   ${isSuspicious 
     ? '- This transaction is FLAGGED SUSPICIOUS (is_suspicious = Y). Explain the observed evidence and derived indicators supporting this classification.'
     : '- This transaction is NORMAL (is_suspicious = N). Clearly state that the supplied data classifies this transaction as NORMAL. Do NOT use the heading "Why This Transaction Was Flagged". Never imply that a NORMAL transaction is suspicious merely because its amount, beneficiary name, narrative, or channel pattern appears unusual.'}
5. Clearly distinguish raw observed CSV data (e.g., amount, counterparty, narrative, KYC status) from derived indicators (e.g., transfer-to-income ratio, working balance drain ratio).
6. Format ALL monetary amounts strictly in Indian Rupees (₹). Never use '$' or USD formatting.
7. Do NOT calculate or infer customer age from Date of Birth. Use the supplied Date of Birth field as-is (e.g., '1982-10-20'). Do not introduce unnecessary derived personal attributes.
8. Do not make the final compliance decision or claim the transaction is fraudulent. The final decision belongs to the human compliance officer.
9. In section 5 (Recommended Checks), provide exactly 3–5 bullet points. Each bullet must be case-specific and grounded in the supplied evidence. Use moderately detailed professional wording — enough for a compliance officer to act on, but avoid long paragraphs or filler. Do not repeat facts already in the evidence/context sections. If the transaction is NORMAL, end with a clear statement: 'No escalation is indicated from the supplied evidence; retain under standard monitoring' or similar.

Generate a structured investigation note with these exact numbered sections:
1. Investigation Summary
2. ${sectionTwoTitle}
3. Supporting Evidence
4. Customer / Account Context
5. Recommended Checks
6. Important Limitations
7. Executive Summary: In 2-3 sentences, summarize the key findings for the compliance officer. Include: (a) the transaction's primary risk or normalized status, (b) the most significant supporting evidence or derived indicator, and (c) the primary action or monitoring recommendation.`;

    await respondWithGroundedAi(res, {
      systemPrompt,
      factualContext,
      sourceDataVersion: 'v1.0.0-transactions.csv',
      workflow: 'E1',
      entityId: txnId,
      requestedByUserId: sessionData.user._id,
    });
  } catch (err) {
    console.error('[AI Routes] Investigation note error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR', message: err.message });
  }
}
