import http from 'node:http';
import { loadEnvFile } from './config/envLoader.js';
import { PORT, API_ROUTES } from './config/constants.js';
import { loadCSVDatasets } from './services/csvLoader.js';
import { handleCors } from './middleware/corsMiddleware.js';
import { handleLogin, handleSession, handleLogout } from './middleware/authMiddleware.js';
import { createE1Action, getE1Actions } from './routes/e1Routes.js';
import { createE3Decision, getE3Decisions } from './routes/e3Routes.js';
import { createE4Review, getE4Reviews } from './routes/e4Routes.js';
import { handleInvestigationNote } from './routes/aiInvestigationRoutes.js';
import { handleKycSummary } from './routes/aiKycRoutes.js';
import { handleLoanDecisionNote } from './routes/aiLoanRoutes.js';
import { handlePayeeRiskNote } from './routes/aiPayeeRoutes.js';
import { handleComplianceSummary } from './routes/aiComplianceRoutes.js';

// Load environment variables
loadEnvFile();

// Log API keys configuration status
console.log(`[Backend API] GEMINI_API_KEY status: ${process.env.GEMINI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
console.log(`[Backend API] GROQ_API_KEY status: ${process.env.GROQ_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);

// Load CSV datasets
const csvData = loadCSVDatasets();

/**
 * Main HTTP server request handler
 */
const server = http.createServer(async (req, res) => {
  // Handle CORS
  if (handleCors(req, res)) return;

  // Route handling
  try {
    // HEALTH CHECK (No MongoDB required)
    if (req.method === 'GET' && req.url === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ 
        status: 'OK', 
        message: 'Backend server is running',
        timestamp: new Date().toISOString(),
        csvData: {
          transactions: csvData.transactions.length,
          customers: csvData.customers.length,
          accounts: csvData.accounts.length,
          loanApplications: csvData.loanApplications.length,
        }
      }));
      return;
    }

    // AUTH ROUTES
    if (req.method === 'POST' && req.url === API_ROUTES.AUTH_LOGIN) {
      await handleLogin(req, res);
      return;
    }

    if (req.method === 'GET' && req.url === API_ROUTES.AUTH_SESSION) {
      await handleSession(req, res);
      return;
    }

    if (req.method === 'POST' && req.url === API_ROUTES.AUTH_LOGOUT) {
      await handleLogout(req, res);
      return;
    }

    // E1 AUDIT EVENTS ROUTES
    if (req.method === 'POST' && req.url === API_ROUTES.E1_ACTIONS) {
      await createE1Action(req, res);
      return;
    }

    if (req.method === 'GET' && req.url.startsWith(API_ROUTES.E1_ACTIONS)) {
      await getE1Actions(req, res);
      return;
    }

    // E3 LOAN DECISIONS ROUTES
    if (req.method === 'POST' && req.url === API_ROUTES.E3_DECISIONS) {
      await createE3Decision(req, res);
      return;
    }

    if (req.method === 'GET' && req.url.startsWith(API_ROUTES.E3_DECISIONS)) {
      await getE3Decisions(req, res);
      return;
    }

    // E4 PAYEE REVIEWS ROUTES
    if (req.method === 'POST' && req.url === API_ROUTES.E4_REVIEWS) {
      await createE4Review(req, res);
      return;
    }

    if (req.method === 'GET' && req.url.startsWith(API_ROUTES.E4_REVIEWS)) {
      await getE4Reviews(req, res);
      return;
    }

    // AI ROUTES - Parse request body for all AI endpoints
    if (req.method === 'POST' && (
      req.url === API_ROUTES.AI_INVESTIGATION_NOTE ||
      req.url === API_ROUTES.AI_KYC_SUMMARY ||
      req.url === API_ROUTES.AI_LOAN_DECISION_NOTE ||
      req.url === API_ROUTES.AI_PAYEE_RISK_NOTE ||
      req.url === API_ROUTES.AI_COMPLIANCE_SUMMARY
    )) {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk;
      });

      req.on('end', async () => {
        try {
          req.body = body ? JSON.parse(body) : {};

          if (req.url === API_ROUTES.AI_INVESTIGATION_NOTE) {
            await handleInvestigationNote(req, res, csvData);
          } else if (req.url === API_ROUTES.AI_KYC_SUMMARY) {
            await handleKycSummary(req, res, csvData);
          } else if (req.url === API_ROUTES.AI_LOAN_DECISION_NOTE) {
            await handleLoanDecisionNote(req, res, csvData);
          } else if (req.url === API_ROUTES.AI_PAYEE_RISK_NOTE) {
            await handlePayeeRiskNote(req, res, csvData);
          } else if (req.url === API_ROUTES.AI_COMPLIANCE_SUMMARY) {
            await handleComplianceSummary(req, res, csvData);
          }
        } catch (err) {
          console.error('[Main Server] Request parsing error:', err);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'SERVER_ERROR', message: err.message }));
        }
      });
      return;
    }

    // 404 Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  } catch (err) {
    console.error('[Main Server] Unhandled error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'SERVER_ERROR', message: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[Backend API] Server running on http://localhost:${PORT}`);
});
