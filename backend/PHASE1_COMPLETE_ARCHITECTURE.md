# Trust Agro Management System - Phase 1 Complete Architecture

**Status:** All 130 source files compile successfully.

---

## 1. Module Overview

| Module | Entities | Key Features |
|--------|----------|-------------|
| **Auth/User** | User, Role, UserStatus | JWT login, BCrypt, role-based access |
| **Farm** | Farm, Flock, DailyFarmRecord | CRUD, KPIs, mortality alerts |
| **Veterinary** | VaccinationSchedule, DiseaseCase, TreatmentRecord, Prescription | Health tracking, prescription flow |
| **Inventory** | InventoryItem, StockBatch, StockMovement | FEFO stock management, low stock/expiry alerts |
| **Pharmacy** | PharmacyCustomer, PharmacySale, SaleItem | Sales with auto stock-out + auto finance income |
| **Finance** | FinanceTransaction | Income/expense tracking, profit/loss, linked to sales |
| **CRM** | Client, FarmVisit | Client management, farm visits |
| **Notification** | Notification | Auto alerts (mortality, low stock, expiry) |
| **Audit** | AuditLog | Activity logging |

---

## 2. Entity Relationship Diagram

```
User (1) ──────► (N) Farm ──────► (N) Flock ──────► (N) DailyFarmRecord
   │                │                │
   │                │                └──► (N) DiseaseCase ──► (0..1) TreatmentRecord
   │                │                                    │
   │                │                                    └──► (0..1) Prescription
   │                │                                              │
   │                │                                              └──► (0..1) PharmacySale
   │                │                                                       │
   │                │                                                       └──► (N) SaleItem ──► InventoryItem
   │                │
   │                └──► (N) FinanceTransaction (farmId, reference linkage)
   │
   └──► (N) StockBatch ──► (N) StockMovement
```

---

## 3. Package Structure

```
com.trustagro/
├── auth/
│   ├── controller/AuthController.java      # POST /login, GET /me
│   ├── dto/LoginRequest.java, LoginResponse.java
│   └── service/AuthService.java, JwtService.java, CustomUserDetailsService.java
├── user/
│   ├── controller/UserController.java        # CRUD (ADMIN only)
│   ├── dto/UserRequest.java, UserResponse.java
│   ├── entity/User.java, Role.java, UserStatus.java
│   ├── repository/UserRepository.java
│   └── service/UserService.java
├── farm/
│   ├── controller/FarmController.java        # Farms + /{id}/kpis + /{id}/daily-records
│   ├── controller/FlockController.java       # Flock CRUD + /{id}/close
│   ├── controller/DailyFarmRecordController.java
│   ├── dto/FarmRequest.java, FarmResponse.java, FlockRequest.java, FlockResponse.java
│   ├── dto/DailyFarmRecordRequest.java, DailyFarmRecordResponse.java, FarmKpiResponse.java
│   ├── entity/Farm.java, Flock.java, DailyFarmRecord.java, FarmType.java, FarmStatus.java, FlockStatus.java
│   ├── repository/FarmRepository.java, FlockRepository.java, DailyFarmRecordRepository.java
│   └── service/FarmService.java, FlockService.java, DailyFarmRecordService.java
├── veterinary/
│   ├── controller/VeterinaryController.java  # vaccinations, disease-cases, treatments, prescriptions
│   ├── dto/VaccinationRequest.java, VaccinationResponse.java, DiseaseCaseRequest.java, DiseaseCaseResponse.java
│   ├── dto/TreatmentRequest.java, TreatmentResponse.java, PrescriptionRequest.java, PrescriptionResponse.java
│   ├── entity/VaccinationSchedule.java, DiseaseCase.java, TreatmentRecord.java, Prescription.java
│   ├── entity/VaccinationStatus.java, DiseaseStatus.java, DiseaseSeverity.java, PrescriptionStatus.java
│   ├── repository/VaccinationScheduleRepository.java, DiseaseCaseRepository.java
│   ├── repository/TreatmentRecordRepository.java, PrescriptionRepository.java
│   └── service/VeterinaryService.java
├── inventory/
│   ├── controller/InventoryController.java   # items, stock-in, stock-out, current-stock, low-stock, expiry-alerts
│   ├── dto/InventoryItemRequest.java, InventoryItemResponse.java, StockInRequest.java, StockOutRequest.java
│   ├── entity/InventoryItem.java, StockBatch.java, StockMovement.java, ItemCategory.java, ItemUnit.java
│   ├── entity/ItemStatus.java, MovementType.java, IssuedToType.java
│   ├── repository/InventoryItemRepository.java, StockBatchRepository.java, StockMovementRepository.java
│   └── service/InventoryService.java
├── pharmacy/
│   ├── controller/PharmacyController.java     # customers, sales, receipts
│   ├── dto/CustomerRequest.java, SaleRequest.java, SaleItemRequest.java, SaleResponse.java, SaleItemResponse.java
│   ├── entity/PharmacyCustomer.java, PharmacySale.java, SaleItem.java, CustomerType.java
│   ├── repository/PharmacyCustomerRepository.java, PharmacySaleRepository.java
│   └── service/PharmacyService.java          # Auto stock-out + auto finance income
├── finance/
│   ├── controller/FinanceController.java      # transactions, income, expenses, profit-loss
│   ├── dto/TransactionRequest.java, TransactionResponse.java, ProfitLossResponse.java
│   ├── entity/FinanceTransaction.java, TransactionType.java, PaymentMethod.java, IncomeCategory.java, ExpenseCategory.java
│   ├── repository/FinanceTransactionRepository.java
│   └── service/FinanceService.java          # Auto-income from pharmacy sales
├── crm/
│   ├── controller/CrmController.java
│   ├── dto/ClientRequest.java, ClientResponse.java, FarmVisitRequest.java, FarmVisitResponse.java
│   ├── entity/Client.java, FarmVisit.java
│   ├── repository/ClientRepository.java, FarmVisitRepository.java
│   └── service/CrmService.java
├── notification/
│   ├── controller/NotificationController.java
│   ├── dto/NotificationResponse.java
│   ├── entity/Notification.java, NotificationType.java
│   ├── repository/NotificationRepository.java
│   └── service/NotificationService.java
├── audit/
│   ├── controller/AuditLogController.java
│   ├── entity/AuditLog.java
│   ├── repository/AuditLogRepository.java
│   └── service/AuditLogService.java
├── common/
│   ├── exception/BusinessException.java, ResourceNotFoundException.java, GlobalExceptionHandler.java
│   └── response/ApiResponse.java
└── config/
    ├── SecurityConfig.java          # JWT, CORS, BCrypt, stateless sessions
    ├── JwtAuthFilter.java           # Token validation filter
    ├── DataSeeder.java              # Default admin user
    ├── ScheduledTasks.java          # Daily cron jobs
    └── DashboardController.java     # Role-based dashboard endpoints
```

---

## 4. API Endpoints

### Auth
| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/api/auth/login` | Public | `{ email, password }` |
| GET | `/api/auth/me` | Bearer | - |

### Users (ADMIN)
| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/users` | - |
| GET | `/api/users/{id}` | - |
| POST | `/api/users` | `{ fullName, email, phone, password, role }` |
| PUT | `/api/users/{id}` | same as POST |
| PATCH | `/api/users/{id}/status` | `{ "status": "ACTIVE" \| "INACTIVE" }` |

### Farms
| Method | Endpoint | Roles | Body |
|--------|----------|-------|------|
| GET | `/api/farms` | ADMIN, FARM_MANAGER, VET, STORE | - |
| GET | `/api/farms/{id}` | ADMIN, FARM_MANAGER, VET, STORE | - |
| POST | `/api/farms` | ADMIN | `{ name, location, farmType, capacity, managerId }` |
| PUT | `/api/farms/{id}` | ADMIN | same |
| PATCH | `/api/farms/{id}/status` | ADMIN | `{ "status": "ACTIVE" \| "INACTIVE" }` |
| GET | `/api/farms/{id}/daily-records` | ADMIN, FARM_MANAGER, VET | - |
| GET | `/api/farms/{id}/kpis` | ADMIN, FARM_MANAGER, VET | - |

### Flocks
| Method | Endpoint | Roles | Body |
|--------|----------|-------|------|
| GET | `/api/flocks` | ADMIN, FARM_MANAGER, VET, STORE | - |
| POST | `/api/flocks` | ADMIN, FARM_MANAGER | `{ batchCode, farmId, type, initialCount, startDate, expectedEndDate }` |
| PUT | `/api/flocks/{id}` | ADMIN, FARM_MANAGER | same |
| PATCH | `/api/flocks/{id}/close` | ADMIN, FARM_MANAGER | - |

### Daily Farm Records
| Method | Endpoint | Roles | Body |
|--------|----------|-------|------|
| GET | `/api/daily-farm-records` | ADMIN, FARM_MANAGER, VET | `?farmId=, ?flockId=` |
| POST | `/api/daily-farm-records` | ADMIN, FARM_MANAGER, VET | see JSON below |
| PUT | `/api/daily-farm-records/{id}` | ADMIN, FARM_MANAGER, VET | same |

### Veterinary
| Method | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/api/vet/vaccinations` | ADMIN, VETERINARY_OFFICER |
| PATCH | `/api/vet/vaccinations/{id}/complete` | ADMIN, VETERINARY_OFFICER |
| GET/POST | `/api/vet/disease-cases` | ADMIN, VETERINARY_OFFICER, FARM_MANAGER |
| PUT | `/api/vet/disease-cases/{id}` | ADMIN, VETERINARY_OFFICER |
| GET/POST | `/api/vet/treatments` | ADMIN, VETERINARY_OFFICER |
| GET/POST | `/api/vet/prescriptions` | ADMIN, VETERINARY_OFFICER |
| PATCH | `/api/vet/prescriptions/{id}/dispense` | ADMIN, PHARMACY_SALES |

### Inventory
| Method | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/api/inventory/items` | ADMIN, STORE_KEEPER, OPS_MANAGER |
| PUT | `/api/inventory/items/{id}` | ADMIN, STORE_KEEPER, OPS_MANAGER |
| POST | `/api/inventory/stock-in` | ADMIN, STORE_KEEPER |
| POST | `/api/inventory/stock-out` | ADMIN, STORE_KEEPER, FARM_MANAGER |
| GET | `/api/inventory/current-stock` | All authenticated |
| GET | `/api/inventory/low-stock` | All authenticated |
| GET | `/api/inventory/expiry-alerts` | All authenticated |

### Pharmacy
| Method | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/api/pharmacy/customers` | ADMIN, PHARMACY_SALES |
| GET/POST | `/api/pharmacy/sales` | ADMIN, PHARMACY_SALES, FINANCE, GM |
| GET | `/api/pharmacy/sales/{id}/receipt` | All authenticated |

### Finance
| Method | Endpoint | Roles |
|--------|----------|-------|
| GET/POST | `/api/finance/transactions` | ADMIN, FINANCE_OFFICER, GM |
| GET | `/api/finance/income` | ADMIN, FINANCE_OFFICER, GM |
| GET | `/api/finance/expenses` | ADMIN, FINANCE_OFFICER, GM |
| GET | `/api/finance/profit-loss` | ADMIN, FINANCE_OFFICER, GM |

### Dashboard
| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/dashboard/admin` | ADMIN, GM |
| GET | `/api/dashboard/farm-manager` | ADMIN, FARM_MANAGER, OPS_MANAGER |
| GET | `/api/dashboard/store` | ADMIN, STORE_KEEPER |
| GET | `/api/dashboard/vet` | ADMIN, VETERINARY_OFFICER |
| GET | `/api/dashboard/pharmacy` | ADMIN, PHARMACY_SALES |
| GET | `/api/dashboard/finance` | ADMIN, FINANCE_OFFICER, GM |

---

## 5. Example JSON Requests

### Login
```json
POST /api/auth/login
{
  "email": "admin@trustagro.com",
  "password": "Admin@1234"
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "userId": 1,
    "fullName": "System Administrator",
    "email": "admin@trustagro.com",
    "role": "ADMIN"
  }
}
```

### Create Farm
```json
POST /api/farms
Authorization: Bearer <token>
{
  "name": "North Layer Farm",
  "location": "Kumasi",
  "farmType": "LAYER",
  "capacity": 12000,
  "managerId": 2
}
```

### Create Flock
```json
POST /api/flocks
{
  "batchCode": "L-2026-001",
  "farmId": 1,
  "type": "Layer Hen",
  "initialCount": 5000,
  "startDate": "2026-01-15",
  "expectedEndDate": "2027-01-15"
}
```

### Add Daily Record
```json
POST /api/daily-farm-records
{
  "date": "2026-05-04",
  "farmId": 1,
  "flockId": 1,
  "openingBirdCount": 5000,
  "mortality": 10,
  "culledBirds": 5,
  "feedConsumed": 160.25,
  "waterConsumed": 425.00,
  "averageWeight": 1.85,
  "eggProduction": 2150,
  "damagedEggs": 12,
  "symptomsOrRemarks": "Normal activity, good feed intake"
}
```

### Inventory Stock In
```json
POST /api/inventory/stock-in
{
  "itemId": 1,
  "batchNumber": "FD-2026-05-A",
  "quantity": 500,
  "unitCost": 45.50,
  "supplier": "AgroFeed Ltd",
  "expiryDate": "2027-05-01",
  "dateReceived": "2026-05-01"
}
```

### Pharmacy Sale (auto stock-out + auto finance income)
```json
POST /api/pharmacy/sales
{
  "receiptNumber": "RX-0001",
  "customerId": 1,
  "saleDate": "2026-05-04",
  "paymentMethod": "CASH",
  "items": [
    {
      "inventoryItemId": 2,
      "quantity": 10,
      "unitPrice": 25.00
    }
  ]
}
```

### Record Finance Transaction
```json
POST /api/finance/transactions
{
  "transactionType": "EXPENSE",
  "category": "FEED",
  "amount": 22750.00,
  "paymentMethod": "BANK_TRANSFER",
  "department": "FARM",
  "farmId": 1,
  "description": "Layer feed bulk purchase - May 2026",
  "transactionDate": "2026-05-01"
}
```

### Create Prescription
```json
POST /api/vet/prescriptions
{
  "prescriptionNumber": "VP-0001",
  "farmId": 1,
  "diseaseCaseId": 1,
  "drugName": "Tetracycline",
  "quantity": 50,
  "dosageInstruction": "1 tablet per 2L drinking water for 5 days"
}
```

### Complete Vaccination
```json
PATCH /api/vet/vaccinations/1/complete
{}
```

---

## 6. Cross-Module Integration Flows

### Pharmacy Sale Flow
```
1. User POST /api/pharmacy/sales
2. PharmacyService.validate() → check receipt number unique
3. For each item:
   a. InventoryService.stockOut() → deduct from batches (FEFO)
   b. Create SaleItem linked to InventoryItem
4. Save PharmacySale with totalAmount
5. FinanceService.createAutoIncome() → auto-create INCOME transaction
6. If stock below minimum → NotificationService.createLowStockAlert()
```

### Daily Record Flow
```
1. User POST /api/daily-farm-records
2. Validate farm-flock relationship
3. Validate counts (mortality + culled <= opening)
4. Check duplicate (farm + flock + date)
5. Save record, update flock.currentBirdCount
6. If mortalityRate > threshold → NotificationService.createMortalityAlert()
```

### Stock In Flow
```
1. User POST /api/inventory/stock-in
2. Create StockBatch with batchNumber, qtyRemaining = qtyReceived
3. Record StockMovement (STOCK_IN)
4. If expiry within warning days → NotificationService.createExpiryAlert()
```

---

## 7. Security Configuration

```java
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    // JWT filter before UsernamePasswordAuthenticationFilter
    // Stateless sessions
    // CORS configured from app.cors.allowed-origins
    // BCryptPasswordEncoder (strength 10)
    // All endpoints require auth except /api/auth/login
}
```

**Roles Hierarchy:**
- `ADMIN` - Full system access
- `GENERAL_MANAGER` - Dashboard + reports + finance view
- `OPERATIONS_MANAGER` - Farms + inventory + CRM
- `FARM_MANAGER` - Farms, flocks, daily records, stock-out
- `VETERINARY_OFFICER` - Disease cases, treatments, prescriptions, vaccinations
- `STORE_KEEPER` - Inventory management
- `PHARMACY_SALES` - Sales, customer management
- `FINANCE_OFFICER` - All transactions, profit/loss
- `EXTENSION_WORKER` - CRM client visits

---

## 8. KPI Calculations (Farm Module)

`GET /api/farms/{id}/kpis` returns:

| Metric | Calculation |
|--------|-------------|
| mortalityRate | `totalMortality / totalInitialBirds * 100` |
| totalFeedUsed | `SUM(feedConsumed)` for all records |
| totalWaterUsed | `SUM(waterConsumed)` for all records |
| totalEggProduction | `SUM(eggProduction)` for all records |
| avgEggProductionPerRecord | `totalEggs / recordCount` |
| feedUsedPerCurrentBird | `totalFeed / currentBirdCount` |

---

## 9. Database Configuration

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5432/trust_agro_db}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:postgres}
spring.jpa.hibernate.ddl-auto=update
```

---

## 10. Default Login

On first startup, DataSeeder creates:
```
Email:    admin@trustagro.com
Password: Admin@1234
Role:     ADMIN
```
