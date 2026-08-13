# Backend Response Issues - Troubleshooting Guide

## 🔧 Problems Fixed

### Issue 1: MongoDB Hanging
**Problem:** Backend server started but requests hung forever waiting for MongoDB connection.

**Cause:** MongoDB connection was timing out without sending response to client.

**Fix Applied:** Added 5-second timeout to all MongoDB operations. If MongoDB doesn't connect, requests now return error response instead of hanging.

### Issue 2: No Way to Test Without MongoDB
**Problem:** All endpoints required MongoDB, no way to verify if backend was working.

**Cause:** Architecture tightly coupled to database.

**Fix Applied:** Added `/api/health` endpoint that works WITHOUT MongoDB. Use this to verify backend is responding.

---

## ✅ Quick Start (3 Steps)

### Step 1: Kill All Node Processes
```bash
# Option A: Run the batch file
start-backend.bat

# Option B: Manual PowerShell
taskkill /F /IM node.exe
```

### Step 2: Start Backend
```bash
cd backend
node server.js
```

**You should see:**
```
[Backend API] GEMINI_API_KEY status: CONFIGURED
[Backend API] GROQ_API_KEY status: CONFIGURED
[CSV Loader] Loaded 650 transactions, 120 customers, 228 accounts, 180 loan applications.
[Backend API] Server running on http://localhost:3001
```

### Step 3: Test in Another Terminal
```bash
# Option A: Run test script
test-backend.bat

# Option B: Manual PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -Method GET -UseBasicParsing
$response.StatusCode
$response.Content
```

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Backend server is running",
  "timestamp": "2026-08-13T...",
  "csvData": {
    "transactions": 650,
    "customers": 120,
    "accounts": 228,
    "loanApplications": 180
  }
}
```

---

## 🔍 If Still Not Working

### Check 1: Is Port 3001 Free?
```powershell
netstat -ano | findstr :3001
# If you see output, that port is in use
# Kill it: taskkill /PID <PID> /F
```

### Check 2: Check Backend Logs
Look for these lines when server starts:
```
[Backend API] Server running on http://localhost:3001
```

If you don't see this, there's a startup error.

### Check 3: Check Network Connectivity
```powershell
Test-NetConnection -ComputerName localhost -Port 3001
```

Should show: `TcpTestSucceeded : True`

---

## 📊 API Endpoints (Now Available)

### Health Check (No MongoDB Required)
```
GET /api/health
Response: 200 OK with server status
```

### Auth (Requires MongoDB)
```
POST /api/auth/login
GET /api/auth/session  
POST /api/auth/logout
```

### Other Endpoints (Require MongoDB)
```
POST /api/e1/actions
GET /api/e1/actions
POST /api/e3/decisions
GET /api/e3/decisions
POST /api/e4/reviews
GET /api/e4/reviews
POST /api/ai/investigation
POST /api/ai/kyc
POST /api/ai/loan-decision
POST /api/ai/payee-risk
POST /api/ai/compliance
```

---

## 🚨 MongoDB Issues

If you see these errors, MongoDB is not accessible:

### Error: "MONGODB_URI is not configured"
**Fix:** Check `backend/.env` has valid MongoDB connection string
```env
MONGODB_URI=mongodb://...
MONGODB_DB_NAME=itss_banking
```

### Error: "MongoDB connection timeout"
**Fix:** Either:
1. **Use MongoDB Atlas** - Update credentials in `.env`
2. **Use Local MongoDB** - Install locally or use Docker:
   ```bash
   docker run -d -p 27017:27017 mongo
   ```
   Then update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=itss_banking
   ```

---

## ✅ Verification Checklist

- [ ] Run `start-backend.bat` or `node server.js`
- [ ] See "Server running on http://localhost:3001"
- [ ] In new terminal, run `test-backend.bat` or test with curl
- [ ] See status 200 with `"status": "OK"`
- [ ] CSV data counts shown (650, 120, 228, 180)

---

## 🎯 Next Steps

1. **Health Check Works?** ✅
   - Backend is running properly
   - Frontend can now connect
   
2. **Login Needed?**
   - Requires MongoDB
   - Fix MongoDB connection in `.env`
   - Then test POST /api/auth/login

3. **Production Ready?**
   - Get API keys (GEMINI_API_KEY, GROQ_API_KEY)
   - Configure MongoDB Atlas properly
   - Deploy frontend and backend

---

## 💡 Remember

- `/api/health` is your test endpoint - use it first
- MongoDB optional for health check
- All other endpoints require MongoDB to work
- Check `.env` file if anything fails
