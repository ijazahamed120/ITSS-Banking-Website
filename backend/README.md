# Backend - ITSS Banking Operations

Node.js backend server providing REST API endpoints for banking operations, compliance workflows, and AI-powered analysis.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
# or
node server.js
```

The server will run on `http://localhost:3001` (or PORT specified in .env)

### Database Setup
```bash
npm run db:seed
```

Seeds initial users into MongoDB database.

## 📋 Environment Setup

Create `.env` file in the backend directory:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/banking-ops
GEMINI_API_KEY=your_google_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/session` - Get current session
- `POST /api/auth/logout` - User logout

### E1 Workflow - Suspicious Transaction Review
- `POST /api/e1/actions` - Create audit event
- `GET /api/e1/actions` - Get all audit events

### E3 Workflow - Loan Decisions
- `POST /api/e3/decisions` - Create/update loan decision
- `GET /api/e3/decisions` - Get all loan decisions

### E4 Workflow - Payee Reviews
- `POST /api/e4/reviews` - Create/update payee review
- `GET /api/e4/reviews` - Get all payee reviews

### AI Endpoints
- `POST /api/ai/investigation-note` - Generate AI investigation note for transaction
- `POST /api/ai/kyc-summary` - Generate AI KYC summary for customer
- `POST /api/ai/loan-decision-note` - Generate AI loan decision analysis
- `POST /api/ai/payee-risk-note` - Generate AI first-time payee risk analysis
- `POST /api/ai/compliance-summary` - Generate overall compliance summary

## 🏗️ Architecture

### File Structure
```
backend/
├── server.js                    # Main entry point
├── config/                      # Configuration
│   ├── envLoader.js            # Env var loader
│   └── constants.js            # API routes & constants
├── middleware/                  # Middleware functions
│   ├── corsMiddleware.js       # CORS handling
│   └── authMiddleware.js       # Auth handlers
├── routes/                      # Route handlers (split by feature)
│   ├── e1Routes.js
│   ├── e3Routes.js
│   ├── e4Routes.js
│   ├── aiInvestigationRoutes.js
│   ├── aiKycRoutes.js
│   ├── aiLoanRoutes.js
│   ├── aiPayeeRoutes.js
│   └── aiComplianceRoutes.js
├── services/                    # Business logic
│   ├── csvLoader.js            # CSV parsing
│   └── aiService.js            # AI generation
├── server/                      # Core server modules
│   ├── auth.js                 # Authentication
│   ├── aiProvider.js           # AI providers (Gemini/Groq)
│   ├── db/                     # Database
│   │   ├── connect.js
│   │   ├── index.js
│   │   └── models/
│   └── seed/                   # Database seeding
├── data/                        # CSV datasets
└── package.json
```

### Request Handling Flow

1. **CORS Middleware** - Handles CORS headers and preflight requests
2. **Route Matching** - Routes request to appropriate handler
3. **Auth Verification** - Verifies session if required
4. **Data Processing** - Retrieves and processes data
5. **AI Service** - Generates AI responses when needed
6. **Response** - Returns JSON response to client

## 🔐 Authentication

Endpoints use session-based authentication:

1. Login via `/api/auth/login` with email/employeeId and password
2. Server creates session cookie with JWT token
3. Cookie sent automatically with subsequent requests
4. Middleware verifies session before processing request

## 🤖 AI Integration

### Supported Providers
- **Gemini** (Google) - Set `GEMINI_API_KEY`
- **Groq** - Set `GROQ_API_KEY`

### AI Endpoints
All AI endpoints accept POST requests with entity IDs:
```json
{
  "txnId": "transaction_id",      // for investigation-note
  "customerId": "customer_id",    // for kyc-summary
  "applicationId": "app_id",      // for loan-decision-note
  "txnId": "txn_id"              // for payee-risk-note
}
```

## 📊 Data Sources

### CSV Files Loaded at Startup
- `data/transactions.csv` - Transaction records
- `data/customers.csv` - Customer profiles
- `data/accounts.csv` - Account information
- `data/loan_applications.csv` - Loan applications

Data is loaded into memory for fast access and passed to route handlers.

## 🗄️ Database Models

Mongoose schemas in `server/db/models/`:
- **User** - Employee accounts
- **Session** - Active sessions
- **AuditEvent** - Compliance actions
- **LoanDecision** - Loan review decisions
- **PayeeReview** - Payee validation reviews
- **AiGeneration** - AI analysis history

## 🛠️ Development

### Adding a New Endpoint

1. Create handler in `routes/` folder
2. Add route constant in `config/constants.js`
3. Register route in `server.js`
4. Use `verifySession()` for auth-required endpoints
5. Return JSON via `sendJsonResponse()`

### Example Handler
```javascript
export async function handleMyEndpoint(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;
  
  try {
    // Your logic here
    sendJsonResponse(res, 200, { data: result });
  } catch (err) {
    console.error('[Error]:', err);
    sendJsonResponse(res, 500, { error: 'SERVER_ERROR' });
  }
}
```

## 🧪 Testing

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password"
  }'
```

### Test AI Endpoint
```bash
curl -X POST http://localhost:3001/api/ai/investigation-note \
  -H "Content-Type: application/json" \
  -d '{"txnId": "TXN001"}' \
  -b "cookies.txt"
```

## 🐛 Debugging

### Enable Verbose Logging
All endpoints log to console with `[Module]` prefix for easier debugging:
```javascript
console.log('[Auth Middleware] User logged in:', userId);
console.log('[AI Routes] Generating note for:', txnId);
```

### Check Environment
```bash
node -e "console.log(process.env.GEMINI_API_KEY ? 'OK' : 'MISSING')"
```

## 📦 Dependencies

### Core
- `mongoose` - MongoDB object modeling
- Node.js built-in modules (`http`, `fs`, `path`)

### Environment
- `.env` file support (custom loader)

### Optional (for frontend proxy)
- Server proxies to `/api` endpoints in dev mode

## 🚀 Deployment

1. Set production environment variables
2. Connect to production MongoDB
3. Run `node server.js`
4. Configure reverse proxy (nginx/Apache) if needed
5. Use PM2 or similar for process management

## 📝 Notes

- Server uses native Node.js HTTP module (no Express)
- CSV data loaded synchronously at startup
- Sessions stored in MongoDB
- AI responses persisted for audit trail
- All endpoints return JSON with proper HTTP status codes

## 🤝 Support

For issues or questions, check:
- ARCHITECTURE.md in project root
- Error logs in console output
- API response error messages

## 📄 License

[Your License Here]
