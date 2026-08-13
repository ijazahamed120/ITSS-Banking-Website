import { generateAIResponse, hasAnyAiProviderConfigured, sendAiError } from '../server/aiProvider.js';
import { connectMongo } from '../server/db/connect.js';
import { AiGeneration } from '../server/db/index.js';

/**
 * Persist AI generation record to database
 */
export async function persistAiGenerationRecord({
  workflow,
  entityId,
  requestedByUserId,
  provider,
  modelUsed,
  fallback,
  content,
  sourceDataVersion,
}) {
  if (!workflow || !requestedByUserId || !provider || !modelUsed || !content) {
    return;
  }

  try {
    await connectMongo();

    await AiGeneration.create({
      workflow,
      entityId: entityId ? String(entityId).trim() || null : null,
      requestedByUserId,
      provider,
      modelUsed,
      fallback: Boolean(fallback),
      content,
      sourceDataVersion: sourceDataVersion || null,
      generatedAt: new Date(),
    });
  } catch (err) {
    console.error('[AI Service] AI generation history persistence failed:', err.message);
  }
}

/**
 * Generate AI response and send to client with audit logging
 */
export async function respondWithGroundedAi(res, {
  systemPrompt,
  factualContext,
  sourceDataVersion,
  workflow,
  entityId,
  requestedByUserId,
}) {
  try {
    const result = await generateAIResponse({
      systemPrompt,
      userContent: factualContext,
      maxTokens: 1200,
    });

    const responseBody = {
      content: result.text,
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI-Assisted Analysis · Review Required Before Action',
      sourceDataVersion,
      isRealAi: true,
      modelUsed: result.modelUsed,
      provider: result.providerLabel,
      fallback: Boolean(result.fallback),
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(responseBody));

    await persistAiGenerationRecord({
      workflow,
      entityId,
      requestedByUserId,
      provider: result.providerLabel,
      modelUsed: result.modelUsed,
      fallback: Boolean(result.fallback),
      content: result.text,
      sourceDataVersion,
    });
  } catch (err) {
    sendAiError(res, err);
  }
}

/**
 * Check if AI provider is configured
 */
export { hasAnyAiProviderConfigured };
