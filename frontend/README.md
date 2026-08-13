# Frontend - ITSS Banking Operations

React + Vite frontend application for banking operations, compliance workflows, and AI-powered analysis system.

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build
```bash
npm run build
```

Creates optimized production build in `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

## 🛠️ Configuration

### Vite Configuration
Edit `vite.config.js` to configure:
- API proxy (default: `/api` → `http://localhost:3001`)
- Path aliases (`@` → `./src`)
- Plugin settings

### Environment Variables (Optional)
Create `.env.local` for local overrides:
```env
VITE_API_URL=http://localhost:3001
VITE_APP_TITLE=ITSS Banking Operations
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/              # React components
│   │   ├── charts/             # Chart components (Recharts)
│   │   │   ├── RiskDistributionDonut.jsx
│   │   │   ├── TransactionHistoryBarChart.jsx
│   │   │   └── TrendLineChart.jsx
│   │   ├── common/             # Common UI components
│   │   │   ├── DataTable.jsx
│   │   │   ├── FilterBar.jsx
│   │   │   ├── SearchBar.jsx
│   │   │   └── ...
│   │   ├── domain/             # Business components
│   │   │   ├── TransactionCard.jsx
│   │   │   ├── CustomerCard.jsx
│   │   │   ├── LoanCard.jsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── AppLayout.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── Footer.jsx
│   │   └── ui/                 # Base UI components
│   │       ├── Button.jsx
│   │       ├── Modal.jsx
│   │       ├── Input.jsx
│   │       ├── Card.jsx
│   │       └── ...
│   ├── pages/                   # Page components (routes)
│   │   ├── auth/               # Auth pages
│   │   │   └── LoginPage.jsx
│   │   ├── dashboard/          # Dashboard
│   │   ├── customers/          # Customer pages
│   │   ├── loans/              # Loan pages
│   │   ├── transactions/       # Transaction pages
│   │   ├── payees/             # Payee pages
│   │   ├── reports/            # Reports
│   │   ├── risk/               # Risk analysis
│   │   └── ...
│   ├── services/                # API services
│   │   ├── api/                # API client functions
│   │   ├── audit/              # Audit logging
│   │   ├── data/               # Data utilities
│   │   └── mock/               # Mock data
│   ├── context/                 # React Context
│   │   ├── AuthContext.jsx     # Auth state management
│   │   └── ToastContext.jsx    # Toast notifications
│   ├── hooks/                   # Custom React hooks
│   │   ├── useAuth.js          # Auth hook
│   │   └── useToast.js         # Toast hook
│   ├── config/                  # Configuration
│   │   ├── navigation.js       # Route configuration
│   │   ├── permissions.js      # Permission settings
│   │   ├── riskConfig.js       # Risk settings
│   │   └── roles.js            # Role definitions
│   ├── utils/                   # Utility functions
│   │   ├── formatters.js       # Format utilities
│   │   ├── formatCurrency.js   # Currency formatting
│   │   ├── riskUtils.js        # Risk calculations
│   │   └── constants.js        # Constants
│   ├── assets/                  # Static assets
│   ├── App.jsx                 # Root component
│   ├── main.jsx                # Entry point
│   ├── App.css                 # Root styles
│   └── index.css               # Global styles
├── public/                      # Static files (copied as-is)
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🎨 Key Features

### Components

#### **Charts** (`components/charts/`)
- Risk distribution donut chart
- Transaction history bar chart
- Trend line chart
- Built with Recharts library

#### **Common Components** (`components/common/`)
Reusable UI elements:
- `DataTable` - Sortable/filterable data display
- `FilterBar` - Transaction filtering
- `SearchBar` - Entity search
- `StatCard` - Metric display
- `LoadingState` - Loading indicator
- `ErrorState` - Error display
- `EmptyState` - No data state
- `RiskBadge` - Risk level badge
- `StatusBadge` - Status indicator

#### **Domain Components** (`components/domain/`)
Business-specific components:
- `TransactionCard` - Transaction details
- `CustomerCard` - Customer profile
- `LoanCard` - Loan application
- `PayeeCard` - Payee information
- `AiNoteCard` - AI-generated note
- `AlertCard` - Alert/notification
- `OfficerActionBar` - Officer actions

#### **Layout** (`components/layout/`)
- `AppLayout` - Main app wrapper
- `Header` - Top navigation
- `Sidebar` - Side navigation
- `PageHeader` - Page title/breadcrumb
- `Footer` - Footer content

#### **UI** (`components/ui/`)
Base components with Tailwind styling:
- `Button` - Button variants
- `Modal` - Dialog component
- `Input` - Text input field
- `Card` - Card container
- `Badge` - Status badges
- `Select` - Dropdown select
- `ConfirmDialog` - Confirmation dialog
- `Toast` - Toast notification

## 🔐 Authentication

### Auth Context
`AuthContext.jsx` manages:
- User login/logout
- Session persistence
- Role-based access control
- Protected route handling

### useAuth Hook
```javascript
const { user, isAuthenticated, login, logout } = useAuth();
```

### Protected Routes
Use `ProtectedRoute` component to guard pages:
```jsx
<ProtectedRoute component={Dashboard} requiredRole="OFFICER" />
```

## 🌐 API Integration

### API Services
Located in `services/api/`:
- Handles all backend communication
- Axios/Fetch client configuration
- Request/response interceptors
- Error handling

### Making API Calls
```javascript
import { fetchTransactions, submitAuditAction } from '@/services/api';

const transactions = await fetchTransactions();
await submitAuditAction(txnId, action, newStatus);
```

## 🎯 Routing

### Route Configuration
Edit `config/navigation.js` to:
- Define route structure
- Set page titles
- Configure permissions
- Set breadcrumbs

### Example Routes
- `/login` - Login page
- `/dashboard` - Main dashboard
- `/customers` - Customer list
- `/customers/:id` - Customer detail
- `/loans` - Loan applications
- `/transactions` - Transaction review
- `/reports` - Reports page

## 🛟 State Management

### Context API
- **AuthContext** - User auth state
- **ToastContext** - Toast notifications

### Custom Hooks
- `useAuth()` - Auth state and methods
- `useToast()` - Toast notifications

## 📱 Responsive Design

### Tailwind CSS
Uses Tailwind for:
- Responsive grid layout
- Component styling
- Dark mode support (optional)
- Utility classes

### Breakpoints
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## 🎭 UI Components

### Button Variants
```jsx
<Button>Default</Button>
<Button variant="primary">Primary</Button>
<Button variant="danger">Danger</Button>
<Button size="lg">Large</Button>
```

### Modals
```jsx
<Modal open={isOpen} onClose={closeModal}>
  <Modal.Header>Title</Modal.Header>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button onClick={closeModal}>Close</Button>
  </Modal.Footer>
</Modal>
```

### Data Table
```jsx
<DataTable 
  columns={columns}
  data={data}
  sortable
  filterable
  onRowClick={handleRow}
/>
```

## 🧪 Testing

### Development Testing
1. Run dev server: `npm run dev`
2. Open browser to `http://localhost:5173`
3. Login with test credentials
4. Navigate through features

### Build Testing
```bash
npm run build
npm run preview
```

## 📦 Dependencies

### Core
- **react** (^19.2.8) - UI framework
- **react-dom** - React rendering
- **react-router-dom** (^7.18.2) - Routing

### Styling
- **tailwindcss** (^4.3.3) - Utility-first CSS
- **tailwind-merge** (^3.6.0) - Merge Tailwind classes
- **clsx** (^2.1.1) - Conditional classes

### Charts
- **recharts** (^3.10.1) - Chart components

### Icons
- **lucide-react** (^1.31.0) - Icon library

### Build Tools
- **vite** (^8.2.0) - Build tool
- **@vitejs/plugin-react** (^6.0.4) - React plugin
- **@tailwindcss/vite** (^4.3.3) - Tailwind Vite plugin
- **oxlint** (^1.75.0) - Linter

## 🚀 Build & Deploy

### Production Build
```bash
npm run build
```

Creates `dist/` folder with optimized production files.

### Deployment Options

#### Static Hosting (Vercel, Netlify)
```bash
npm run build
# Deploy dist/ folder
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
```

#### Nginx
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

## 🐛 Debugging

### Browser DevTools
- React DevTools extension for component inspection
- Redux DevTools if using Redux (not currently)
- Network tab for API calls

### Console Logging
Components log with prefixes for easy filtering:
```javascript
console.log('[TransactionList] Fetching...', filter);
```

### Vite HMR
Hot module replacement automatically reloads components during development.

## 📝 Code Style

### Naming Conventions
- Components: PascalCase (`TransactionList.jsx`)
- Hooks: camelCase with `use` prefix (`useAuth.js`)
- Utilities: camelCase (`formatCurrency.js`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_PAGE_SIZE`)

### Component Structure
```jsx
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function MyComponent() {
  const { user } = useAuth();
  
  return <div>Content</div>;
}
```

## 🤝 Contributing

1. Create feature branch
2. Follow code style guide
3. Test thoroughly
4. Submit pull request

## 📄 License

[Your License Here]

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Use different port
npm run dev -- --port 3000
```

### API Connection Failed
- Ensure backend is running on `http://localhost:3001`
- Check CORS configuration in backend
- Verify network tab in DevTools

### Module Not Found
- Clear node_modules: `rm -rf node_modules && npm install`
- Verify import paths use `@/` alias correctly

### Build Errors
- Check for TypeScript/ESLint errors: `npm run lint`
- Ensure all dependencies installed: `npm install`
- Clear cache: `npm cache clean --force`
