# Frontend-Backend Connection Summary

## Overview
The React frontend is now fully connected to the Spring Boot Phase 1 backend APIs.

## Connection Architecture

### 1. API Layer (`src/api/`)

**axios.js**
- Base URL: `http://localhost:8080` (configurable via env)
- Request interceptor: Adds JWT token from `localStorage`
- Response interceptor: Handles 401 errors with auto-logout
- Timeout: 10 seconds

**index.js**
Exports organized API services:
- `authApi` - Login, current user
- `farmApi` - CRUD operations for farms
- `flockApi` - CRUD operations for flocks/batches  
- `dailyRecordApi` - Daily farm records
- `userApi` - User management (admin only)

### 2. Authentication Flow

```
Login Form → authApi.login() → JWT stored in localStorage
                    ↓
         All API calls include: Authorization: Bearer <token>
                    ↓
         401 response → Clear storage → Redirect to /login
```

**AuthContext.js** provides:
- `user` - Current authenticated user
- `login(email, password)` - Authentication
- `logout()` - Clear session
- `hasRole(...roles)` - Role checking
- `loading` - Auth initialization state

### 3. Custom Hooks (`src/hooks/`)

**useApi.js**
```javascript
// For data fetching with loading/error states
const { data, loading, error, refetch } = useApi(apiFunction, deps);

// For mutations (create/update/delete)
const { execute, loading, error } = useApiMutation();
```

### 4. Reusable Components (`src/components/common/`)

| Component | Purpose |
|-----------|---------|
| `DataTable` | Table with loading spinner, empty state |
| `StatCard` | Dashboard statistic cards |
| `StatusBadge` | Colored status badges |
| `ErrorAlert` | Dismissible error messages |
| `LoadingSpinner` | Centered loading indicator |
| `ProtectedRoute` | Route guard with role checks |

## Phase 1 Features Connected

### Dashboard (`src/pages/dashboard/Dashboard.js`)
**APIs Used:**
- `GET /api/farms` - Farm count
- `GET /api/flocks` - Flock/bird counts  
- `GET /api/daily-farm-records` - Mortality, feed, eggs

**Calculated Stats:**
- Total/active farms and flocks
- Total/current bird counts
- Today's mortality
- Total feed used (kg)
- Total egg production
- Average mortality rate (%)

**Role-based Views:**
- ADMIN: Full stats (10 cards)
- FARM_MANAGER: Farm-focused stats (8 cards)
- VET: Health-focused stats (4 cards)
- STORE: Basic farm/flock info (3 cards)

### Farm Management

**FarmList (`src/pages/farm/FarmList.js`)**
```
GET /api/farms → Display table with:
- Farm name, location, type, capacity
- Assigned manager
- Status badge
- Edit button
```

**FarmForm (`src/pages/farm/FarmForm.js`)**
```
GET /api/users → Load farm managers
POST /api/farms → Create new farm
PUT /api/farms/{id} → Update farm
```

### Flock/Batch Management

**FlockList (`src/pages/farm/FlockList.js`)**
```
GET /api/flocks → Display table with:
- Batch code, farm name, bird type
- Initial/current counts
- Start date
- Status with close action
```

**FlockForm (`src/pages/farm/FlockForm.js`)**
```
GET /api/farms → Load active farms
POST /api/flocks → Create flock
PUT /api/flocks/{id} → Update flock
```

### Daily Records

**DailyFarmRecordList (`src/pages/farm/DailyFarmRecordList.js`)**
```
GET /api/daily-farm-records → Display table with:
- Date, farm, batch code
- Opening count, mortality
- Feed consumed, egg production
- Mortality rate %
- Recorded by
```

**DailyFarmRecordForm (`src/pages/farm/DailyFarmRecordForm.js`)**
```
GET /api/farms → Load active farms
GET /api/flocks → Load flocks (filtered by farm)
POST /api/daily-farm-records → Create record
PUT /api/daily-farm-records/{id} → Update record
```

**Form Fields:**
- Date, Farm (dropdown), Flock (dropdown)
- Opening bird count, mortality, culled birds
- Feed consumed (kg), water consumed (L)
- Average weight (kg), egg production, damaged eggs
- Symptoms/remarks

## Error Handling

### Global (axios.js)
- 401 Unauthorized → Clear token, redirect to login
- Network errors → Rejected promise with error message

### Component Level
```javascript
const [error, setError] = useState(null);

try {
  await apiCall();
} catch (err) {
  setError(err.response?.data?.message || 'Operation failed');
}

// Render
<ErrorAlert message={error} onDismiss={() => setError(null)} />
```

### Loading States
```javascript
const [loading, setLoading] = useState(false);

{loading ? (
  <LoadingSpinner text="Loading farms..." />
) : (
  <DataTable data={data} />
)}
```

## Running the Application

### 1. Start Backend
```bash
cd /home/kalilinux/Documents/ERp/Trust-ERP/backend
./mvnw spring-boot:run
# Backend runs on http://localhost:8080
```

### 2. Start Frontend
```bash
cd /home/kalilinux/Documents/ERp/Trust-ERP/frontend
npm start
# Frontend runs on http://localhost:3000
```

### 3. Default Login
```
Email: admin@trustagro.com
Password: Admin@1234
```

## Testing Checklist

- [ ] Login with valid credentials
- [ ] Login with invalid credentials shows error
- [ ] Dashboard loads with farm/flock/record stats
- [ ] Farm list displays all farms
- [ ] Create new farm (admin only)
- [ ] Flock list displays batches
- [ ] Create new flock linked to farm
- [ ] Daily records list shows entries
- [ ] Add daily record with farm/flock selection
- [ ] Form validation shows errors
- [ ] 401 error redirects to login
- [ ] Role-based menu visibility works

## File Summary

### New Files Created
- `src/hooks/useApi.js` - Data fetching hooks
- `src/hooks/index.js` - Hook exports
- `src/components/common/ErrorAlert.js` - Error display
- `src/components/common/LoadingSpinner.js` - Loading indicator
- `src/components/common/index.js` - Component exports

### Modified Files
- `src/api/axios.js` - Fixed port to 8080
- `src/pages/dashboard/Dashboard.js` - Connected to Phase 1 APIs
- `src/pages/farm/FarmList.js` - Added error handling
- `src/pages/farm/DailyFarmRecordForm.js` - Improved data loading
- `frontend/README.md` - Added API documentation
