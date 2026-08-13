# ITSS Banking Operations - Project Restructuring Guide

This document outlines the new folder structure and code organization of the Banking Operations system after splitting into separate frontend and backend applications.

## 📁 Project Structure

```
ITSS-Banking-Operations/
├── frontend/                      # React/Vite Frontend Application
│   ├── src/                       # Frontend source code
│   │   ├── components/            # Reusable React components
│   │   │   ├── charts/           # Chart components (Recharts)
│   │   │   ├── common/           # Common UI components
│   │   │   ├── domain/           # Domain-specific components
│   │   │   ├── layout/           # Layout components
│   │   │   └── ui/               # Base UI components (Button, Modal, etc.)
│   │   ├── pages/                # Page components (routes)
│   │   ├── services/             # API services and utilities
│   │   ├── context/              # React context (Auth, Toast)
│   │   ├── hooks/                # Custom React hooks
│   │   ├── config/               # Configuration files
│   │   ├── utils/                # Utility functions
│   │   ├── assets/               # Static assets
│   │   ├── App.jsx               # Root component
│   │   ├── main.jsx              # Entry point
│   │   └── index.css/App.css     # Styles
│   ├── public/                   # Static files
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite configuration
│   ├── package.json              # Frontend dependencies
│   └── README.md                 # Frontend documentation
│
├── backend/                       # Node.js Backend Server
│   ├── server.js                 # Main server entry point (refactored)
│   ├── config/                   # Configuration modules
│   │   ├── envLoader.js          # Environment variable loader
│   │   └── constants.js          # API routes and constants
│   ├── middleware/               # Express-like middleware
│   │   ├── corsMiddleware.js     # CORS and preflight handling
│   │   └── authMiddleware.js     # Authentication middleware
│   ├── routes/                   # Route handlers (split by feature)
│   │   ├── e1Routes.js           # E1 audit events endpoints
│   │   ├── e3Routes.js           # E3 loan decisions endpoints
│   │   ├── e4Routes.js           # E4 payee reviews endpoints
│   │   ├── aiInvestigationRoutes.js  # AI investigation note endpoint
│   │   ├── aiKycRoutes.js            # AI KYC summary endpoint
│   │   ├── aiLoanRoutes.js           # AI loan decision endpoint
│   │   ├── aiPayeeRoutes.js          # AI payee risk endpoint
│   │   └── aiComplianceRoutes.js     # AI compliance summary endpoint
│   ├── services/                 # Business logic and services
│   │   ├── csvLoader.js          # CSV data loading utility
│   │   └── aiService.js          # AI response generation service
│   ├── server/                   # Database and auth modules (kept from original)
│   │   ├── auth.js               # Authentication logic
│   │   ├── aiProvider.js         # AI provider integration
│   │   ├── db/                   # Database models and connection
│   │   │   ├── connect.js        # MongoDB connection
│   │   │   ├── index.js          # Model exports
│   │   │   └── models/           # Mongoose schemas
│   │   └── seed/                 # Database seeding scripts
│   ├── data/                     # CSV data files
│   │   ├── transactions.csv
│   │   ├── customers.csv
│   │   ├── accounts.csv
│   │   └── loan_applications.csv
│   ├── package.json              # Backend dependencies
│   └── README.md                 # Backend documentation
│
├── package.json                  # Root package.json (optional, for monorepo)
└── README.md                     # Project overview
```

## 🚀 Getting Started

### Prerequisites
- Node.js v16+ (recommended v18+)
- npm or yarn
- MongoDB instance running (for backend)

### Installation

#### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

#### 2. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

#### 3. Configure Environment Variables
Create a `.env` file in the backend directory:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/banking-ops
GEMINI_API_KEY=your_api_key_here
GROQ_API_KEY=your_api_key_here
```

### Running the Application

#### Backend Server
```bash
cd backend
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:3001`

#### Frontend Development Server
```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (Vite default)

#### Building Frontend for Production
```bash
cd frontend
npm run build
```

## 📦 Code Organization

### Backend Modules

#### **config/**
- `envLoader.js`: Loads environment variables from `.env` file
- `constants.js`: API routes, workflow constants, and configuration

#### **middleware/**
- `corsMiddleware.js`: CORS headers and preflight request handling
- `authMiddleware.js`: Login, session verification, logout handlers

#### **routes/**
Each route module exports specific endpoint handlers:
- `e1Routes.js`: Audit event creation and retrieval
- `e3Routes.js`: Loan decision management
- `e4Routes.js`: Payee review management
- `ai*Routes.js`: AI-powered analysis endpoints

#### **services/**
- `csvLoader.js`: Loads and parses CSV datasets on startup
- `aiService.js`: Generates AI responses and persists audit logs

#### **server/** (Original Structure Preserved)
- `auth.js`: User authentication and session management
- `aiProvider.js`: Integration with Gemini/Groq LLMs
- `db/`: MongoDB models and connection logic

### Frontend Components

#### **components/**
- `charts/`: Data visualization components
- `common/`: Shared UI elements
- `domain/`: Business domain components (Loan, Customer, Transaction, etc.)
- `layout/`: App layout structure
- `ui/`: Base UI components (Button, Modal, Input, etc.)

#### **pages/**
- Organized by feature (customers, loans, transactions, etc.)
- Each page handles its own routing and data fetching

#### **services/**
- API client functions
- Audit service for tracking user actions
- Mock data services for development

## 🔄 Request Flow

### Authentication Flow
1. User logs in via `/api/auth/login`
2. `authMiddleware.handleLogin()` verifies credentials
3. Session is created and stored in MongoDB
4. Session cookie is returned to frontend
5. Subsequent requests include session cookie for authentication

### AI Analysis Flow
1. Frontend requests AI analysis (e.g., `/api/ai/investigation-note`)
2. `aiInvestigationRoutes.handleInvestigationNote()` receives request
3. CSV data is retrieved from `csvData` (loaded at startup)
4. `aiService.respondWithGroundedAi()` generates AI response
5. Response is persisted via `aiService.persistAiGenerationRecord()`
6. JSON response sent to frontend

### Data Flow
```
Frontend (React) → API Request → Backend Router → Middleware → Handler → Service → DB/CSV → Response
```

## 🔐 Security Features

- **CORS Protection**: Controlled origin access
- **Session-based Auth**: Cookie-based authentication
- **Request Validation**: Validates required parameters
- **Error Handling**: Centralized error handling with proper HTTP status codes

## 📝 Environment Variables

```env
PORT=3001                          # Backend server port
MONGODB_URI=mongodb://...          # MongoDB connection string
GEMINI_API_KEY=sk-...              # Google Gemini API key
GROQ_API_KEY=gsk-...               # Groq API key
NODE_ENV=development|production    # Environment (optional)
```

## 🛠️ Development Workflow

### Adding a New Endpoint

1. **Create Route Handler** (`backend/routes/newRoutes.js`):
```javascript
export async function handleNewEndpoint(req, res) {
  const sessionData = await verifySession(req, res);
  if (!sessionData) return;
  // Your logic here
}
```

2. **Add Route Constant** (`backend/config/constants.js`):
```javascript
export const API_ROUTES = {
  // ...
  NEW_ENDPOINT: '/api/new/endpoint',
};
```

3. **Register Route** (`backend/server.js`):
```javascript
if (req.method === 'POST' && req.url === API_ROUTES.NEW_ENDPOINT) {
  await handleNewEndpoint(req, res);
  return;
}
```

### Adding a New React Component

1. Create component in appropriate folder under `frontend/src/components/`
2. Export from index file if in a folder
3. Import and use in parent components

## 🧪 Testing

### Backend API
Use tools like Postman or curl:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Frontend
Vite provides hot module replacement (HMR) for development. Changes are reflected instantly.

## 📚 API Documentation

See individual README files in:
- `backend/README.md` - Backend API reference
- `frontend/README.md` - Frontend component guide

## 🐛 Troubleshooting

### Backend Won't Start
- Check MongoDB connection
- Verify environment variables in `.env`
- Ensure port 3001 is not in use

### Frontend Development Server Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check that backend is running for API requests

### CORS Errors
- Verify backend CORS configuration in `corsMiddleware.js`
- Check that frontend and backend URLs match in vite config

## 🔄 Migration Notes

This refactoring maintains backward compatibility while improving code organization:

- **Original server.js** has been split into modular route handlers
- **CSV loading** moved to dedicated service
- **Authentication** abstracted to middleware
- **Constants** centralized for easier maintenance
- **All endpoints remain the same** - no API changes

## 📄 License

[Add your license here]

## 👥 Contributing

[Add contribution guidelines here]
