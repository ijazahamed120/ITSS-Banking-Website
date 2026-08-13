/**
 * Shared AI Provider Service
 * Gemini = PRIMARY, Groq = FALLBACK (availability failures only)
 *
 * API keys remain backend-only. Never log or return key values.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

function getGeminiKey() {
  return process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
}

function getGroqKey() {
  return process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';
}

export function hasAnyAiProviderConfigured() {
  return Boolean(getGeminiKey() || getGroqKey());
}

/**
 * Fallback-eligible Gemini failures: quota/rate limit, temporary 5xx, network/unreachable.
 * Not used for 4xx application/validation errors (except 429).
 */
export function isGeminiFallbackEligible(error) {
  if (!error) return false;
  if (error.code === 'NETWORK_ERROR') return true;
  const status = Number(error.statusCode || error.status || 0);
  if (status === 429) return true;
  if (status >= 500 && status <= 599) return true;
  // Missing Gemini key is a provider-availability condition when Groq is configured
  if (error.code === 'GEMINI_NOT_CONFIGURED') return true;
  return false;
}

function categorizeProviderError(error) {
  if (!error) return 'UNKNOWN';

  const code = String(error.code || '');
  const status = Number(error.statusCode || error.status || 0);

  if (code === 'NETWORK_ERROR') return 'NETWORK_ERROR';
  if (code === 'GEMINI_EMPTY_RESPONSE' || code === 'GROQ_EMPTY_RESPONSE') return 'MODEL_ERROR';
  if (code === 'GEMINI_NOT_CONFIGURED' || code === 'GROQ_NOT_CONFIGURED') return 'AUTHENTICATION';

  if (status === 429) return 'RATE_LIMIT';
  if (status === 401 || status === 403) return 'AUTHENTICATION';
  if (status >= 400 && status <= 499) return 'BAD_REQUEST';
  if (status >= 500 && status <= 599) return 'SERVER_ERROR';

  return 'UNKNOWN';
}

function sanitizeProviderErrorMessage(error, category) {
  switch (category) {
    case 'RATE_LIMIT':
      return 'Rate limit or quota exceeded';
    case 'AUTHENTICATION':
      if (error?.code === 'GEMINI_NOT_CONFIGURED' || error?.code === 'GROQ_NOT_CONFIGURED') {
        return 'Provider API key not configured';
      }
      return 'Authentication or API key rejected';
    case 'BAD_REQUEST':
      return 'Invalid request rejected by provider';
    case 'SERVER_ERROR':
      return 'Provider server error';
    case 'NETWORK_ERROR':
      return 'Network connection failure';
    case 'MODEL_ERROR':
      return 'Empty or invalid model response';
    default:
      return 'Provider request failed';
  }
}

function logProviderFailure(providerName, error) {
  const category = categorizeProviderError(error);
  const status = Number(error?.statusCode || error?.status || 0);
  const message = sanitizeProviderErrorMessage(error, category);
  const statusPart = status >= 100 && status <= 599 ? `status=${status} ` : '';

  console.log(
    `[AI Provider] ${providerName} failed: ${statusPart}category=${category} message=${message}`
  );
}

async function callGemini({ systemPrompt, userContent, maxTokens = 1200 }) {
  const geminiApiKey = getGeminiKey();
  if (!geminiApiKey) {
    const err = new Error('GEMINI_API_KEY is not configured');
    err.code = 'GEMINI_NOT_CONFIGURED';
    err.statusCode = 503;
    throw err;
  }

  // Safe development-only switch to exercise Groq fallback without exhausting Gemini quota.
  // Enable with AI_FORCE_GROQ_FALLBACK=true in backend .env (never enabled by default).
  if (String(process.env.AI_FORCE_GROQ_FALLBACK || '').toLowerCase() === 'true') {
    console.log('[AI Provider] Gemini attempt skipped (AI_FORCE_GROQ_FALLBACK=true)');
    const err = new Error('Gemini forced fallback-eligible failure for safe development testing');
    err.code = 'GEMINI_API_ERROR';
    err.statusCode = 429;
    throw err;
  }

  console.log('[AI Provider] Gemini attempt');

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${geminiApiKey}`;

  let geminiRes;
  try {
    geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            parts: [{ text: userContent }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: maxTokens,
        },
      }),
    });
  } catch (networkErr) {
    const err = new Error(networkErr.message || 'Gemini network connection failure');
    err.code = 'NETWORK_ERROR';
    err.statusCode = 503;
    throw err;
  }

  if (!geminiRes.ok) {
    const errBody = await geminiRes.text();
    const err = new Error(
      geminiRes.status === 429
        ? 'Gemini API rate limit or quota has been reached'
        : `Gemini API returned error status ${geminiRes.status}`
    );
    err.code = 'GEMINI_API_ERROR';
    err.statusCode = geminiRes.status;
    err.details = errBody;
    throw err;
  }

  const geminiData = await geminiRes.json();
  let text = '';
  try {
    text = geminiData.candidates[0].content.parts[0].text;
  } catch (e) {
    text = '';
  }

  if (!text) {
    const err = new Error('No response content returned by Gemini model');
    err.code = 'GEMINI_EMPTY_RESPONSE';
    err.statusCode = 502;
    throw err;
  }

  console.log('[AI Provider] Gemini success');
  return {
    text,
    provider: 'gemini',
    providerLabel: 'Gemini',
    modelUsed: GEMINI_MODEL,
    fallback: false,
    isRealAi: true,
  };
}

async function callGroq({ systemPrompt, userContent, maxTokens = 1200 }) {
  const groqApiKey = getGroqKey();
  if (!groqApiKey) {
    const err = new Error('GROQ_API_KEY is not configured');
    err.code = 'GROQ_NOT_CONFIGURED';
    err.statusCode = 503;
    throw err;
  }

  console.log('[AI Provider] Groq fallback attempt');

  let groqRes;
  try {
    groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: maxTokens,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
      }),
    });
  } catch (networkErr) {
    const err = new Error(networkErr.message || 'Groq network connection failure');
    err.code = 'NETWORK_ERROR';
    err.statusCode = 503;
    throw err;
  }

  if (!groqRes.ok) {
    const errBody = await groqRes.text();
    const err = new Error(
      groqRes.status === 429
        ? 'Groq API rate limit or quota has been reached'
        : `Groq API returned error status ${groqRes.status}`
    );
    err.code = 'GROQ_API_ERROR';
    err.statusCode = groqRes.status;
    err.details = errBody;
    throw err;
  }

  const groqData = await groqRes.json();
  const text =
    groqData.choices && groqData.choices[0] && groqData.choices[0].message
      ? groqData.choices[0].message.content
      : '';

  if (!text) {
    const err = new Error('No response content returned by Groq model');
    err.code = 'GROQ_EMPTY_RESPONSE';
    err.statusCode = 502;
    throw err;
  }

  console.log('[AI Provider] Groq fallback success');
  return {
    text,
    provider: 'groq',
    providerLabel: 'Groq',
    modelUsed: GROQ_MODEL,
    fallback: true,
    isRealAi: true,
  };
}

/**
 * Generate grounded AI text: Gemini primary, Groq fallback on provider availability failures.
 * @param {{ systemPrompt: string, userContent: string, maxTokens?: number }} params
 * @returns {Promise<{ text: string, provider: string, providerLabel: string, modelUsed: string, fallback: boolean, isRealAi: boolean }>}
 */
export async function generateAIResponse({ systemPrompt, userContent, maxTokens = 1200 }) {
  if (!hasAnyAiProviderConfigured()) {
    const err = new Error(
      'AI integration code is ready, but no LLM API key (GEMINI_API_KEY or GROQ_API_KEY) is configured.'
    );
    err.code = 'MISSING_API_KEY';
    err.statusCode = 503;
    throw err;
  }

  try {
    return await callGemini({ systemPrompt, userContent, maxTokens });
  } catch (geminiErr) {
    logProviderFailure('Gemini', geminiErr);

    if (!isGeminiFallbackEligible(geminiErr)) {
      throw geminiErr;
    }

    if (!getGroqKey()) {
      console.log('[AI Provider] Gemini fallback-eligible failure; Groq not configured');
      throw geminiErr;
    }

    console.log('[AI Provider] Gemini fallback-eligible failure; trying Groq');

    try {
      return await callGroq({ systemPrompt, userContent, maxTokens });
    } catch (groqErr) {
      logProviderFailure('Groq', groqErr);
      console.log('[AI Provider] Both providers failed');
      const combined = new Error(
        `AI generation failed. Gemini: ${geminiErr.message}. Groq: ${groqErr.message}`
      );
      combined.code = 'BOTH_PROVIDERS_FAILED';
      combined.statusCode = groqErr.statusCode || geminiErr.statusCode || 503;
      combined.geminiError = {
        code: geminiErr.code,
        statusCode: geminiErr.statusCode,
        message: geminiErr.message,
      };
      combined.groqError = {
        code: groqErr.code,
        statusCode: groqErr.statusCode,
        message: groqErr.message,
      };
      throw combined;
    }
  }
}

/**
 * Write a standardized AI error HTTP response (never includes API keys).
 */
export function sendAiError(res, err) {
  const status = Number(err.statusCode || 500);
  const safeStatus = status >= 400 && status < 600 ? status : 500;

  let message = err.message || 'AI generation failed';
  if (err.code === 'MISSING_API_KEY') {
    message =
      'AI integration code is ready, but no LLM API key (GEMINI_API_KEY or GROQ_API_KEY) is configured.';
  } else if (err.code === 'BOTH_PROVIDERS_FAILED') {
    message =
      'AI generation is temporarily unavailable because both Gemini and Groq providers failed. Please try again later.';
  } else if (err.statusCode === 429) {
    message =
      'AI generation is temporarily unavailable because the AI provider rate limit or quota has been reached. Please try again later.';
  }

  res.writeHead(safeStatus, { 'Content-Type': 'application/json' });
  res.end(
    JSON.stringify({
      error: err.code || 'AI_PROVIDER_ERROR',
      statusCode: safeStatus,
      message,
      isRealAi: false,
    })
  );
}
