import { respondWithGroundedAi, hasAnyAiProviderConfigured } from '../services/aiService.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Generate loan decision note
 */
export async function handleLoanDecisionNote(req, res, { loanApplications, customers, accounts }) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const payload = req.body;
    const { applicationId } = payload;

    if (!applicationId) {
      sendJsonResponse(res, 400, { error: 'applicationId parameter is required' });
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

    const app = loanApplications.find((l) => String(l.application_id).toUpperCase() === String(applicationId).trim().toUpperCase());
    if (!app) {
      sendJsonResponse(res, 404, { error: `Loan application ${applicationId} not found` });
      return;
    }

    const cust = customers.find((c) => String(c.customer_id) === String(app.customer_id).trim());
    const custAccounts = cust ? accounts.filter((a) => String(a.customer_id) === String(cust.customer_id).trim()) : [];

    const reqAmtVal = parseFloat(app.requested_amount || 0);
    const tenureMonthsVal = parseInt(app.tenure_months || 12, 10);
    const existingEmiVal = parseFloat(app.existing_emi || 0);
    const monthlyEstEmi = tenureMonthsVal > 0 ? reqAmtVal / tenureMonthsVal : 0;
    const totalMonthlyObligation = monthlyEstEmi + existingEmiVal;
    const custIncomeVal = cust ? parseFloat(cust.monthly_income || 0) : 0;
    const dtiRatio = custIncomeVal > 0 ? ((totalMonthlyObligation / custIncomeVal) * 100).toFixed(1) : 'N/A';

    const accountsSummary = custAccounts.length > 0
      ? custAccounts.map((a, idx) => `${idx + 1}. Account ID: ${a.account_id} | Title: ${a.account_title} | Product: ${a.product} | Working Balance: ₹${parseFloat(a.working_balance || 0).toLocaleString('en-IN')} | Posting Restriction: ${a.posting_restrict || 'None'}`).join('\n')
      : 'No associated accounts found in supplied dataset.';

    const factualContext = `FACTUAL LOAN APPLICATION CONTEXT:
Application ID: ${app.application_id}
Customer ID: ${app.customer_id}
Loan Product: ${app.product}
Requested Amount: ₹${reqAmtVal.toLocaleString('en-IN')}
Tenure: ${app.tenure_months} Months
Existing EMI: ₹${existingEmiVal.toLocaleString('en-IN')}
Credit Bureau Score: ${app.credit_score}
Stated Loan Purpose: ${app.purpose}
Recorded Application Status: ${app.decision_label}

APPLICANT PROFILE (Observed CSV Fields):
Applicant Name: ${cust ? cust.name_1 : 'Not available in supplied data'}
Employment Type: ${cust ? cust.employment_type : 'Not available in supplied data'}
Declared Monthly Income: ${cust ? `₹${custIncomeVal.toLocaleString('en-IN')}` : 'Not available in supplied data'}
KYC Verification Status: ${cust ? cust.kyc_status : 'Not available in supplied data'}
Town/Country: ${cust ? cust.town_country : 'Not available in supplied data'}

ASSOCIATED ACCOUNTS (${custAccounts.length} Account(s)):
${accountsSummary}

DERIVED FINANCIAL INDICATORS (Factual Derivations):
- Estimated Monthly Principal Allocation: ₹${monthlyEstEmi.toFixed(2)} per month
- Total Monthly Debt Obligation (Est. Allocation + Existing EMI): ₹${totalMonthlyObligation.toFixed(2)} per month
- Debt-to-Income Ratio (Total Obligation vs Monthly Income): ${dtiRatio !== 'N/A' ? `${dtiRatio}%` : 'Not available in supplied data'}

UNAVAILABLE / ABSENT DATA IN SUPPLIED DATASET:
- Collateral or pledged property asset records: Not available in supplied data.
- Tax returns or bank account statement uploads: Not available in supplied data.
- Internal risk rating score or probability of default model output: Not available in supplied data.`;

    const systemPrompt = `You are a loan decision note drafting assistant for an internal banking credit and compliance platform.

STRICT GROUNDING & COMPLIANCE RULES:
1. Use ONLY the factual loan application, applicant profile, and account evidence provided in the user context data.
2. Do NOT invent facts, missing fields, or credit documents.
3. Do NOT invent collateral, tax return verification, or risk scores not present in the supplied data.
4. If required information is unavailable in the supplied data, explicitly state: 'Not available in supplied data.'
5. Do NOT calculate or infer applicant age from Date of Birth.
6. Clearly distinguish raw observed CSV data (e.g. credit_score, requested_amount, decision_label) from any derived financial indicators.
7. Format ALL monetary amounts strictly in Indian Rupees (₹). Never use '$' or USD formatting.
8. Do NOT make the final lending decision. The final decision belongs strictly to the human lending officer.
9. In section 7 (Recommended Manual Checks), provide exactly 3–5 bullet points. Each bullet must be case-specific and grounded in the supplied application and account evidence. Use moderately detailed professional wording — sufficient for a loan/compliance officer to act on, but avoid long paragraphs or generic filler. Do not repeat facts already covered in the evidence sections. End with a clear statement about whether the application warrants further review or escalation based on the supplied evidence.

Generate a structured Loan Decision Note with these exact numbered sections:
1. Loan Application Summary
2. Applicant / Customer Context
3. Financial / Loan Evidence
4. Existing Application Status
5. Relevant Derived Indicators
6. Decision Considerations
7. Recommended Manual Checks
8. Important Limitations
9. Executive Summary: In 2-3 sentences, summarize the loan assessment for the lending officer. Include: (a) the loan application's key credit profile (DTI, income adequacy, repayment capacity), (b) the most material risk factor or mitigating evidence, and (c) the primary recommendation for approval, conditional approval, or further review.`;

    await respondWithGroundedAi(res, {
      systemPrompt,
      factualContext,
      sourceDataVersion: 'v1.0.0-loan_applications.csv',
      workflow: 'E3',
      entityId: applicationId,
      requestedByUserId: sessionData.user._id,
    });
  } catch (err) {
    console.error('[AI Routes] Loan decision note error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR', message: err.message });
  }
}
