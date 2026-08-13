/**
 * AI Investigation, KYC Summary, Loan Decision & Payee Risk Note Service Client
 * Connects frontend securely to backend endpoints:
 * - /api/ai/investigation-note (E1)
 * - /api/ai/kyc-summary (E2)
 * - /api/ai/loan-decision-note (E3)
 * - /api/ai/payee-risk-note (E4)
 * Backend providers: Google Gemini (primary) with Groq fallback.
 */

const E1_ENDPOINT = 'https://itss-banking-website.onrender.com/api/ai/investigation-note';

const E2_ENDPOINT = 'https://itss-banking-website.onrender.com/api/ai/kyc-summary';

const E3_ENDPOINT = 'https://itss-banking-website.onrender.com/api/ai/loan-decision-note';

const E4_ENDPOINT = 'https://itss-banking-website.onrender.com/api/ai/payee-risk-note';

/**
 * Generate grounded AI Investigation Note for a transaction (E1)
 * @param {string} txnId
 * @returns {Promise<{ content: string, generatedAt: string, disclaimer: string, sourceDataVersion: string, isRealAi: boolean, modelUsed: string }>}
 */
export async function generateInvestigationNote(txnId) {
  let response;

  try {
    response = await fetch(E1_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txnId }),
    });

    if (response.status === 404) {
      response = await fetch(E1_FALLBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txnId }),
      });
    }
  } catch (err) {
    response = await fetch(E1_FALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txnId }),
    });
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}` };
    }

    if (errorData.error === 'MISSING_API_KEY') {
      throw new Error(errorData.message || 'AI integration code is ready, but no LLM API key is configured.');
    }

    if (errorData.error === 'BOTH_PROVIDERS_FAILED') {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because both Gemini and Groq providers failed. Please try again later.'
      );
    }

    if (response.status === 429 || errorData.statusCode === 429) {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because the AI provider rate limit or quota has been reached. Please try again later.'
      );
    }

    if (
      errorData.error === 'GEMINI_API_ERROR' ||
      errorData.error === 'GROQ_API_ERROR' ||
      errorData.error === 'ANTHROPIC_API_ERROR' ||
      errorData.error === 'AI_PROVIDER_ERROR'
    ) {
      throw new Error(errorData.message || errorData.details || `API error ${response.status}`);
    }

    throw new Error(errorData.message || errorData.error || errorData.details || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Generate grounded AI KYC Profile Summary for a customer (E2)
 * @param {string} customerId
 * @returns {Promise<{ content: string, generatedAt: string, disclaimer: string, sourceDataVersion: string, isRealAi: boolean, modelUsed: string, provider?: string, fallback?: boolean }>}
 */
export async function generateKycSummary(customerId) {
  let response;

  try {
    response = await fetch(E2_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });

    if (response.status === 404) {
      response = await fetch(E2_FALLBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
    }
  } catch (err) {
    response = await fetch(E2_FALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customerId }),
    });
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}` };
    }

    if (errorData.error === 'MISSING_API_KEY') {
      throw new Error(errorData.message || 'AI integration code is ready, but no LLM API key is configured.');
    }

    if (errorData.error === 'BOTH_PROVIDERS_FAILED') {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because both Gemini and Groq providers failed. Please try again later.'
      );
    }

    if (response.status === 429 || errorData.statusCode === 429) {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because the AI provider rate limit or quota has been reached. Please try again later.'
      );
    }

    if (
      errorData.error === 'GEMINI_API_ERROR' ||
      errorData.error === 'GROQ_API_ERROR' ||
      errorData.error === 'ANTHROPIC_API_ERROR' ||
      errorData.error === 'AI_PROVIDER_ERROR'
    ) {
      throw new Error(errorData.message || errorData.details || `API error ${response.status}`);
    }

    throw new Error(errorData.message || errorData.error || errorData.details || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Generate grounded AI Loan Decision Note for a loan application (E3)
 * @param {string} applicationId
 * @returns {Promise<{ content: string, generatedAt: string, disclaimer: string, sourceDataVersion: string, isRealAi: boolean, modelUsed: string, provider?: string, fallback?: boolean }>}
 */
export async function generateLoanDecisionNote(applicationId) {
  let response;

  try {
    response = await fetch(E3_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ applicationId }),
});

    if (response.status === 404) {
     response = await fetch(E3_FALLBACK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ applicationId }),
});
    }
  } catch (err) {
    response = await fetch(E3_FALLBACK_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({ applicationId }),
});
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}` };
    }

    if (errorData.error === 'MISSING_API_KEY') {
      throw new Error(errorData.message || 'AI integration code is ready, but no LLM API key is configured.');
    }

    if (errorData.error === 'BOTH_PROVIDERS_FAILED') {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because both Gemini and Groq providers failed. Please try again later.'
      );
    }

    if (response.status === 429 || errorData.statusCode === 429) {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because the AI provider rate limit or quota has been reached. Please try again later.'
      );
    }

    if (
      errorData.error === 'GEMINI_API_ERROR' ||
      errorData.error === 'GROQ_API_ERROR' ||
      errorData.error === 'ANTHROPIC_API_ERROR' ||
      errorData.error === 'AI_PROVIDER_ERROR'
    ) {
      throw new Error(errorData.message || errorData.details || `API error ${response.status}`);
    }

    throw new Error(errorData.message || errorData.error || errorData.details || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Generate grounded AI First-Time Payee Risk Note for a DEBIT transaction (E4)
 * @param {string} txnId
 * @returns {Promise<{ content: string, generatedAt: string, disclaimer: string, sourceDataVersion: string, isRealAi: boolean, modelUsed: string, provider?: string, fallback?: boolean }>}
 */
export async function generatePayeeRiskNote(txnId) {
  let response;

  try {
    response = await fetch(E4_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txnId }),
    });

    if (response.status === 404) {
      response = await fetch(E4_FALLBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ txnId }),
      });
    }
  } catch (err) {
    response = await fetch(E4_FALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ txnId }),
    });
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}` };
    }

    if (errorData.error === 'MISSING_API_KEY') {
      throw new Error(errorData.message || 'AI integration code is ready, but no LLM API key is configured.');
    }

    if (errorData.error === 'BOTH_PROVIDERS_FAILED') {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because both Gemini and Groq providers failed. Please try again later.'
      );
    }

    if (response.status === 429 || errorData.statusCode === 429) {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because the AI provider rate limit or quota has been reached. Please try again later.'
      );
    }

    if (
      errorData.error === 'GEMINI_API_ERROR' ||
      errorData.error === 'GROQ_API_ERROR' ||
      errorData.error === 'ANTHROPIC_API_ERROR' ||
      errorData.error === 'AI_PROVIDER_ERROR'
    ) {
      throw new Error(errorData.message || errorData.details || `API error ${response.status}`);
    }

    throw new Error(errorData.message || errorData.error || errorData.details || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

const E5_ENDPOINT = 'https://itss-banking-website.onrender.com/api/ai/compliance-summary';
const E5_FALLBACK_URL = 'https://itss-banking-website.onrender.com/api/ai/compliance-summary';

/**
 * Generate grounded AI Risk & Compliance Summary for compliance management
 * @param {object} [payload]
 * @returns {Promise<{ content: string, generatedAt: string, disclaimer: string, sourceDataVersion: string, isRealAi: boolean, modelUsed: string, provider?: string, fallback?: boolean }>}
 */
export async function generateComplianceSummary(payload = {}) {
  let response;

  try {
    response = await fetch(E5_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 404) {
      response = await fetch(E5_FALLBACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    }
  } catch (err) {
    response = await fetch(E5_FALLBACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: `HTTP error ${response.status}` };
    }

    if (errorData.error === 'MISSING_API_KEY') {
      throw new Error(errorData.message || 'AI integration code is ready, but no LLM API key is configured.');
    }

    if (errorData.error === 'BOTH_PROVIDERS_FAILED') {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because both Gemini and Groq providers failed. Please try again later.'
      );
    }

    if (response.status === 429 || errorData.statusCode === 429) {
      throw new Error(
        errorData.message ||
          'AI generation is temporarily unavailable because the AI provider rate limit or quota has been reached. Please try again later.'
      );
    }

    if (
      errorData.error === 'GEMINI_API_ERROR' ||
      errorData.error === 'GROQ_API_ERROR' ||
      errorData.error === 'ANTHROPIC_API_ERROR' ||
      errorData.error === 'AI_PROVIDER_ERROR'
    ) {
      throw new Error(errorData.message || errorData.details || `API error ${response.status}`);
    }

    throw new Error(errorData.message || errorData.error || errorData.details || `Server returned error ${response.status}`);
  }

  const data = await response.json();
  return data;
}

