# 🚀 Quick Start Guide

Get your reorganized project up and running in 5 minutes!

## Prerequisites

- Node.js v16+ (recommended v18+)
- npm or yarn
- MongoDB running locally (or MongoDB Atlas connection string)

## ⚡ Quick Setup

### Step 1: Backend Setup (Terminal 1)

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
echo 'PORT=3001
MONGODB_URI=mongodb://localhost:27017/banking-ops
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here' > .env

# Start backend server
npm run dev
```

**Expected output:**
```
[Backend API] GEMINI_API_KEY status: NOT CONFIGURED
[Backend API] GROQ_API_KEY status: NOT CONFIGURED
[CSV Loader] Loaded X transactions, Y customers, Z accounts...
[Backend API] Server running on http://localhost:3001
```

### Step 2: Frontend Setup (Terminal 2)

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

**Expected output:**
```
Local:        http://localhost:5173/
```

### Step 3: Access Application

Open browser and go to: **http://localhost:5173**

You should see the login page. 🎉

## 📋 Folder Structure at a Glance

```
your-project/
├── backend/          → Node.js server (port 3001)
│   ├── server.js     → Main entry point
│   ├── routes/       → API endpoints
│   ├── middleware/   → Auth & CORS
│   ├── services/     → Business logic
│   ├── data/         → CSV files
│   └── package.json
│
├── frontend/         → React app (port 5173)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   ├── vite.config.js
│   └── package.json
│
└── Documentation
    ├── ARCHITECTURE.md         → Complete architecture
    ├── RESTRUCTURING_SUMMARY.md → What changed
    └── frontend/README.md & backend/README.md → Detailed guides
```

## 🔧 Available Commands

### Backend

```bash
cd backend

npm run dev              # Start development server
npm start               # Start production server
npm run db:seed         # Seed database with initial users
```

### Frontend

```bash
cd frontend

npm run dev             # Start development server (hot reload)
npm run build           # Create production build
npm run preview         # Preview production build
npm run lint            # Run linter
```

## 🧪 Test the Setup

### Test Backend API

```bash
# In a new terminal, test the backend
curl http://localhost:3001/api/auth/session
```

### Test Frontend Connection

1. Open http://localhost:5173 in browser
2. You should see the login page
3. Open DevTools → Network tab
4. Try any action and watch API calls flow through

## 🔑 Default Test Credentials

**Email:** user@example.com  
**Password:** password

(Check backend database seeding for available test users)

## 📁 Key Files to Know

| File | Purpose |
|------|---------|
| `backend/server.js` | Main server entry point |
| `backend/config/constants.js` | API routes and settings |
| `backend/.env` | Environment variables |
| `frontend/src/App.jsx` | Root React component |
| `frontend/vite.config.js` | Frontend build config |
| `ARCHITECTURE.md` | Full architecture docs |

## ❓ Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Run `npm install` in the affected folder

### Issue: "Port already in use"
**Solution:** Change port in `.env` (backend) or use `npm run dev -- --port 3000` (frontend)

### Issue: "Cannot connect to MongoDB"
**Solution:** 
- Start MongoDB locally: `mongod`
- Or update `MONGODB_URI` in `.env` to your MongoDB Atlas string

### Issue: API not responding
**Solution:**
- Verify backend is running on port 3001
- Check browser console for error messages
- Run backend again with `npm run dev`

## 🎯 What's Next?

### To Learn More:
- Read `ARCHITECTURE.md` - Comprehensive guide
- Check `backend/README.md` - Backend API docs
- Check `frontend/README.md` - Frontend component guide

### To Add Features:
- **Backend**: Create new handler in `backend/routes/[feature]Routes.js`
- **Frontend**: Create new component in `frontend/src/components/[type]/`

### To Deploy:
1. Build frontend: `cd frontend && npm run build`
2. Deploy `dist/` folder to hosting (Vercel, Netlify, AWS, etc.)
3. Deploy backend to Node.js hosting (Heroku, Railway, AWS, etc.)

## 📞 Support Resources

1. **Architecture Questions** → Read `ARCHITECTURE.md`
2. **Backend Issues** → Check `backend/README.md`
3. **Frontend Issues** → Check `frontend/README.md`
4. **Code Examples** → Look at existing components/routes
5. **Errors** → Check browser console & terminal logs

## ✅ Success Checklist

- [ ] Backend running on http://localhost:3001
- [ ] Frontend running on http://localhost:5173
- [ ] Can see login page in browser
- [ ] API calls show in DevTools Network tab
- [ ] No errors in browser console
- [ ] No errors in terminal logs

## 🎉 You're All Set!

Your project is now:
- ✅ Properly organized
- ✅ Ready for development
- ✅ Ready for scaling
- ✅ Ready for team collaboration

Happy coding! 🚀

---

**For more detailed information:**
- Backend: Read `backend/README.md`
- Frontend: Read `frontend/README.md`
- Architecture: Read `ARCHITECTURE.md`
