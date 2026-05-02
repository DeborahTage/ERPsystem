# Trust Agro Consulting & Farming Management System

A modular monolith ERP-style management system for agro-consulting and poultry/farm management.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React.js, React Router, Bootstrap 5, Axios |
| Backend   | Spring Boot 3, Spring Security, JWT     |
| Database  | PostgreSQL                              |

---

## Prerequisites

- Java 17+
- Maven 3.8+
- Node.js 18+
- PostgreSQL 14+

---

## Database Setup

```sql
CREATE DATABASE trust_agro_db;
```

Update credentials in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/trust_agro_db
spring.datasource.username=postgres
spring.datasource.password=postgres
```

---

## Running the Backend

```bash
cd backend
mvn spring-boot:run
```

The backend starts on **http://localhost:8080**

On first run, a default admin user is seeded:
- **Email:** admin@trustagro.com
- **Password:** Admin@1234

---

## Running the Frontend

```bash
cd frontend
npm install
npm start
```

The frontend starts on **http://localhost:3000**

---

## Project Structure

```
Trust ERP/
├── backend/
│   └── src/main/java/com/trustagro/
│       ├── auth/          # JWT authentication
│       ├── config/        # Security, CORS, seeder, dashboard, scheduler
│       ├── user/          # User management & roles
│       ├── farm/          # Farm, Flock, Daily Records
│       ├── inventory/     # Stock management (FEFO)
│       ├── veterinary/    # Vaccinations, Disease, Treatments, Prescriptions
│       ├── pharmacy/      # Sales, Customers, Receipts
│       ├── finance/       # Income, Expenses, Profit/Loss
│       ├── crm/           # Clients, Farm Visits, Follow-ups
│       ├── notification/  # In-app alerts
│       ├── audit/         # Audit logs
│       └── common/        # Shared exceptions, responses
└── frontend/
    └── src/
        ├── api/           # Axios API calls
        ├── context/       # Auth context
        ├── layouts/       # Sidebar, TopBar, MainLayout
        ├── components/    # Reusable components
        ├── pages/         # All page components
        └── utils/         # Helpers, constants
```

---

## Roles & Access

| Role               | Access                                      |
|--------------------|---------------------------------------------|
| ADMIN              | Full access to everything                   |
| GENERAL_MANAGER    | Dashboard, farms, finance, reports          |
| OPERATIONS_MANAGER | Farms, flocks, daily records, inventory     |
| FARM_MANAGER       | Farms, flocks, daily records                |
| VETERINARY_OFFICER | Veterinary records, prescriptions           |
| STORE_KEEPER       | Inventory, stock in/out                     |
| PHARMACY_SALES     | Pharmacy sales, customers                   |
| FINANCE_OFFICER    | Finance transactions, reports               |
| EXTENSION_WORKER   | CRM clients, farm visits                    |

---

## Key API Endpoints

| Method | Endpoint                          | Description              |
|--------|-----------------------------------|--------------------------|
| POST   | /api/auth/login                   | Login                    |
| GET    | /api/auth/me                      | Current user             |
| GET    | /api/farms                        | List farms               |
| POST   | /api/farms                        | Create farm              |
| GET    | /api/flocks                       | List flocks              |
| POST   | /api/daily-farm-records           | Create daily record      |
| POST   | /api/inventory/stock-in           | Record stock in          |
| POST   | /api/inventory/stock-out          | Record stock out         |
| GET    | /api/inventory/low-stock          | Low stock items          |
| GET    | /api/inventory/expiry-alerts      | Expiring items           |
| POST   | /api/vet/vaccinations             | Schedule vaccination     |
| POST   | /api/pharmacy/sales               | Create pharmacy sale     |
| GET    | /api/finance/profit-loss          | Profit/loss summary      |
| GET    | /api/dashboard/admin              | Admin dashboard data     |
| GET    | /api/notifications                | All notifications        |

---

## Business Rules Implemented

- Daily farm records cannot be duplicated for same farm + flock + date
- Mortality rate > threshold triggers automatic alert to Vet Officer & Operations Manager
- Stock out uses FEFO (First Expiry First Out) for drugs/vaccines
- Expired stock cannot be issued or sold
- Low stock triggers notification when below minimum level
- Pharmacy sale automatically reduces inventory stock
- Pharmacy sale automatically creates a Finance income transaction
- Missed vaccinations are auto-detected by daily scheduled job (6 AM)
- CRM follow-ups due today or overdue are highlighted

---

## Configuration

Key settings in `application.properties`:

```properties
app.alerts.mortality-threshold=5.0      # % mortality rate to trigger alert
app.alerts.expiry-warning-days=30       # Days before expiry to warn
app.jwt.expiration=86400000             # JWT expiry: 24 hours
```
