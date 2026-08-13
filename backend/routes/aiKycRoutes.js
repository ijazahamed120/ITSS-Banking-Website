import { respondWithGroundedAi, hasAnyAiProviderConfigured } from '../services/aiService.js';
import { verifySession } from '../middleware/authMiddleware.js';
import { sendJsonResponse } from '../middleware/corsMiddleware.js';

/**
 * Generate KYC summary for customer
 */
export async function handleKycSummary(req, res, { customers, accounts }) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;

  try {
    const payload = req.body;
    const { customerId } = payload;

    if (!customerId) {
      sendJsonResponse(res, 400, { error: 'customerId parameter is required' });
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

    const cust = customers.find((c) => String(c.customer_id) === String(customerId).trim());
    if (!cust) {
      sendJsonResponse(res, 404, { error: `Customer ${customerId} not found` });
      return;
    }

    const custAccounts = accounts.filter((a) => String(a.customer_id) === String(customerId).trim());

    const incomeStr = cust.monthly_income
      ? `₹${parseFloat(cust.monthly_income).toLocaleString('en-IN')}`
      : 'Not available in supplied data';

    const accountsSummary = custAccounts.length > 0
      ? custAccounts.map((a, idx) => `${idx + 1}. Account ID: ${a.account_id} | Title: ${a.account_title} | Product: ${a.product} | Currency: ${a.currency} | Working Balance: ₹${parseFloat(a.working_balance || 0).toLocaleString('en-IN')} | Posting Restriction: ${a.posting_restrict || 'None'} | Opening Date: ${a.opening_date}`).join('\n')
      : 'No associated accounts found in supplied dataset.';

    const factualContext = `FACTUAL CUSTOMER & KYC CONTEXT:
Customer ID: ${cust.customer_id}
Customer Name: ${cust.name_1}
Short Name: ${cust.short_name}
Mnemonic: ${cust.mnemonic}
Street Address: ${cust.street}
Town/Country: ${cust.town_country}
Nationality: ${cust.nationality}
Residence Country: ${cust.residence}
Sector Code: ${cust.sector}
Account Officer ID: ${cust.account_officer}
Date of Birth: ${cust.date_of_birth}
Customer Status Code: ${cust.customer_status}
KYC Verification Status: ${cust.kyc_status}
Employment Type: ${cust.employment_type}
Monthly Income: ${incomeStr}

ASSOCIATED ACCOUNTS (${custAccounts.length} Account(s)):
${accountsSummary}

UNAVAILABLE / ABSENT DATA IN SUPPLIED DATASET:
- Specific identity document numbers (Aadhaar, PAN, Passport, Voter ID): Not available in supplied data.
- Document verification scan copies or verification dates: Not available in supplied data.
- Politically Exposed Person (PEP) or Sanctions screening results: Not available in supplied data.
- Credit risk score or internal rating numbers: Not available in supplied data.`;

    const systemPrompt = `You are a KYC profile summarization assistant for an internal banking operations and compliance platform.

STRICT GROUNDING & COMPLIANCE RULES:
1. Use ONLY the factual customer and account evidence provided in the user context data.
2. Do NOT invent facts, documents, or verification results.
3. Do NOT claim that specific identity documents (such as Aadhaar, PAN, Passport, or address proof) were verified unless explicitly stated in the supplied data.
4. If required information is unavailable in the supplied data, explicitly state: 'Not available in supplied data.'
5. Do NOT calculate or infer customer age from Date of Birth. Use the Date of Birth field as-is (e.g. '1983-04-08'). Do not introduce unnecessary derived personal attributes.
6. Clearly distinguish raw observed CSV data (e.g., kyc_status, monthly_income, posting_restrict) from any derived analytical observations.
7. Format ALL monetary amounts strictly in Indian Rupees (₹). Never use '$' or USD formatting.
8. Do not make the final KYC approval or rejection decision. The final decision belongs strictly to the human compliance officer.
9. In section 7 (Recommended Manual Review Checks), provide exactly 3–5 bullet points. Each bullet must be case-specific and grounded in the supplied customer and account evidence. Use moderately detailed professional wording — sufficient for a compliance officer to take action, but avoid long paragraphs or generic filler. Do not repeat facts already described in earlier sections. End with a clear statement about whether further review or escalation is warranted based on the supplied evidence.

Generate a structured KYC summary with these exact numbered sections:
1. KYC Summary
2. Customer Profile
3. KYC Status
4. Account Context
5. Available Information
6. Information Not Available in Supplied Data
7. Recommended Manual Review Checks
8. Important Limitations
9. Executive Summary: In 2-3 sentences, summarize the key KYC findings for the compliance officer. Include: (a) the customer's overall KYC status or profile risk level, (b) the most significant documentation gap or compliance issue if any, and (c) the primary recommendation for further review or approval.`;

    await respondWithGroundedAi(res, {
      systemPrompt,
      factualContext,
      sourceDataVersion: 'v1.0.0-customers.csv',
      workflow: 'E2',
      entityId: customerId,
      requestedByUserId: sessionData.user._id,
    });
  } catch (err) {
    console.error('[AI Routes] KYC summary error:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR', message: err.message });
  }
}
