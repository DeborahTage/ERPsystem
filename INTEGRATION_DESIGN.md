# Trust Agro - Cross-Module Integration Design

## Flow
```
Farm → Disease Case → Treatment → Prescription → Pharmacy Sale → Inventory Update → Finance Record
```

---

## 1. Module Dependency Graph

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Farm      │────►│ DiseaseCase  │────►│ Treatment    │
│   Module     │     │  (Vet)       │     │  Record      │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                                                  │
                         ┌──────────────┐         │
                         │ PharmacySale │◄────────┘
                         │  (linked by  │  Prescription
                         │ prescriptionId)│
                         └──────┬───────┘
                                │
                ┌───────────────┼───────────────┐
                │               │               │
                ▼               ▼               ▼
         ┌──────────┐   ┌──────────┐   ┌──────────┐
         │Inventory │   │Inventory │   │ Finance  │
         │ StockOut │   │Movement  │   │ Income   │
         │  (FEFO)  │   │  (audit) │   │  (auto)  │
         └──────────┘   └──────────┘   └──────────┘
```

---

## 2. Step-by-Step Workflow

### Step 1: Farm Detection (Farm Module)
**Trigger:** Farm manager observes symptoms during daily record entry or routine inspection.

**API:** None yet. This is a human observation.

**Data produced:** Symptoms observed at a specific farm/flock.

---

### Step 2: Disease Case Registration (Veterinary Module)
**Trigger:** Farm manager or vet officer reports the disease.

**API:** `POST /api/vet/disease-cases`

```json
{
  "farmId": 1,
  "flockId": 3,
  "dateDetected": "2026-05-04",
  "symptoms": "Lethargy, reduced feed intake, diarrhea, respiratory distress",
  "suspectedDisease": "Newcastle Disease",
  "numberAffected": 120,
  "numberDead": 15,
  "severity": "HIGH"
}
```

**Validation:**
- `farmId` and `flockId` must exist in Farm module.
- `flock` must belong to `farm` (enforced in `VeterinaryService.validateFarmFlock`).
- `numberDead` <= `numberAffected`.
- `severity` is required when `numberDead` > 0.

**Data stored in `disease_cases` table:**
| Column | Source |
|--------|--------|
| farm_id | FK to `farms.id` |
| flock_id | FK to `flocks.id` |
| date_detected | Request body |
| symptoms | Request body |
| suspected_disease | Request body |
| number_affected | Request body |
| number_dead | Request body |
| severity | Request body |
| status | `ACTIVE` (default) |
| reported_by | Current user (auto) |

**Consistency check:** If the farm or flock does not exist, `ResourceNotFoundException` is thrown. The transaction rolls back.

---

### Step 3: Vet Diagnosis & Treatment (Veterinary Module)
**Trigger:** Vet officer examines the flock and prescribes treatment.

**API 1:** `POST /api/vet/treatments`

```json
{
  "diseaseCaseId": 1,
  "farmId": 1,
  "flockId": 3,
  "drugName": "Lasota Vaccine",
  "dosage": "1 drop per bird",
  "route": "Ocular/Nasal",
  "duration": "Single dose",
  "startDate": "2026-05-04",
  "endDate": "2026-05-04",
  "outcome": "Pending"
}
```

**Link to DiseaseCase:** `diseaseCaseId` is optional but recommended for traceability.

**Data stored in `treatment_records` table:**
| Column | Source |
|--------|--------|
| disease_case_id | FK to `disease_cases.id` (optional) |
| farm_id | FK to `farms.id` |
| flock_id | FK to `flocks.id` |
| drug_name | Request body |
| dosage | Request body |
| vet_officer | Current user (auto) |

---

### Step 4: Prescription (Veterinary Module)
**Trigger:** Vet officer issues a prescription for drugs to be dispensed at pharmacy.

**API:** `POST /api/vet/prescriptions`

```json
{
  "prescriptionNumber": "RX-2026-0001",
  "farmId": 1,
  "diseaseCaseId": 1,
  "drugName": "Newcastle Vaccine (Lasota)",
  "quantity": 500,
  "dosageInstruction": "1 drop per bird via eye dropper. Administer to all birds in flock F-001."
}
```

**Validation:**
- `prescriptionNumber` must be unique across all prescriptions.
- Duplicate check: `prescriptionRepo.existsByPrescriptionNumber()`.

**Data stored in `prescriptions` table:**
| Column | Source |
|--------|--------|
| prescription_number | Request body (unique) |
| farm_id | Request body (denormalized for fast lookup) |
| disease_case_id | Request body (link to disease case) |
| drug_name | Request body |
| quantity | Request body |
| dosage_instruction | Request body |
| status | `PENDING` (default) |
| created_by_vet | Current user (auto) |

**Note:** The prescription stores `farmId` and `diseaseCaseId` as simple `Long` (not FK constraints), allowing loose coupling. The pharmacy can reference it without hard database dependency.

---

### Step 5: Pharmacy Sale (Pharmacy Module)
**Trigger:** Customer (farm manager or external) brings prescription to pharmacy counter.

**API:** `POST /api/pharmacy/sales`

```json
{
  "receiptNumber": "SALE-2026-0001",
  "customerId": 1,
  "saleDate": "2026-05-04",
  "paymentMethod": "CASH",
  "prescriptionId": 1,
  "items": [
    {
      "inventoryItemId": 5,
      "quantity": 500,
      "unitPrice": 2.50
    }
  ]
}
```

**Validation:**
- `receiptNumber` must be unique: `saleRepo.existsByReceiptNumber()`.
- Each `inventoryItemId` must exist in Inventory module.
- Sufficient stock must be available (checked during `inventoryService.stockOut()`).

**Cross-module transaction (all in one `@Transactional`):**

| Sub-step | Module | Action |
|----------|--------|--------|
| 5.1 | Pharmacy | Validate receipt number uniqueness |
| 5.2 | Pharmacy | Save `PharmacySale` header |
| 5.3 | Pharmacy | For each item, create `SaleItem` linked to `InventoryItem` |
| 5.4 | Inventory | Call `inventoryService.stockOut()` → deduct stock via FEFO |
| 5.5 | Finance | Call `financeService.createAutoIncome()` → record income |
| 5.6 | Pharmacy | Calculate total, save sale with items |

**FEFO Stock Deduction (Inventory Module):**
```java
// InventoryService.stockOut()
List<StockBatch> batches = batchRepository.findAvailableBatchesFEFO(itemId, today);
for (StockBatch batch : batches) {
    double deduct = Math.min(batch.getQuantityRemaining(), remaining);
    batch.setQuantityRemaining(batch.getQuantityRemaining() - deduct);
    batchRepository.save(batch);
    remaining -= deduct;
}
```

**StockMovement audit record created:**
```java
recordMovement(item, MovementType.STOCK_OUT, qty, reason,
    IssuedToType.CUSTOMER, null, null, "PHARMACY_SALE", saleId);
```

**Finance auto-income record created:**
```java
financeService.createAutoIncome(
    total,                          // BigDecimal amount
    "Pharmacy Sale - SALE-2026-0001", // description
    "PHARMACY_SALE",                // referenceType
    savedSale.getId()               // referenceId
);
```

**Data stored:**
- `pharmacy_sales` - sale header with `prescriptionId` and `totalAmount`
- `sale_items` - line items linked to `inventory_item`
- `stock_batches` - updated `quantity_remaining`
- `stock_movements` - audit trail of deduction
- `finance_transactions` - auto-created INCOME record

**Consistency guarantee:** The entire sale creation is wrapped in `@Transactional`. If any step fails (e.g., insufficient stock), the entire transaction rolls back. No partial sale, no partial stock deduction, no orphan finance record.

---

### Step 6: Prescription Dispense (Veterinary / Pharmacy Handoff)
**Trigger:** Pharmacy completes the sale linked to a prescription.

**API:** `PATCH /api/vet/prescriptions/{id}/dispense`

```json
// No body required
```

**Business rule:**
- Only `PHARMACY_SALES` role can dispense.
- Prescription must not be `CANCELLED`.
- Status changes: `PENDING` → `DISPENSED`.

**Consistency:** The prescription status update is a separate API call. The pharmacy sale has already recorded `prescriptionId`. The link is established at sale time, not at dispense time. This allows the sale to proceed even if the prescription status update is delayed.

---

### Step 7: Finance Reconciliation (Finance Module)
**Trigger:** Finance officer reviews auto-generated income.

**API:** `GET /api/finance/income`

**Response includes auto-generated records:**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "transactionType": "INCOME",
      "category": "PHARMACY_SALES",
      "amount": 1250.00,
      "referenceType": "PHARMACY_SALE",
      "referenceId": 15,
      "description": "Pharmacy Sale - SALE-2026-0001",
      "transactionDate": "2026-05-04",
      "recordedBy": "pharmacy_user"
    }
  ]
}
```

**Traceability:** Finance record links back to pharmacy sale via `referenceType` + `referenceId`. Pharmacy sale links back to prescription via `prescriptionId`. Prescription links back to disease case via `diseaseCaseId`.

---

## 3. Data Relationship Chain (Full Traceability)

```
finance_transactions
    │ referenceType="PHARMACY_SALE", referenceId=15
    │
    ▼
pharmacy_sales.id=15
    │ prescriptionId=1
    │
    ▼
prescriptions.id=1
    │ diseaseCaseId=1, farmId=1
    │
    ▼
disease_cases.id=1
    │ farm_id=1, flock_id=3
    │
    ├──► farms.id=1
    │
    └──► flocks.id=3
```

**Any finance income can be traced to:**
1. Which pharmacy sale generated it (`referenceId`)
2. Which prescription triggered the sale (`prescriptionId`)
3. Which disease case required the prescription (`diseaseCaseId`)
4. Which farm and flock were affected (`farmId`, `flockId`)

---

## 4. API Sequence Diagram

```
Farm Manager          Vet Officer           Pharmacy Sales        Inventory           Finance
     │                    │                      │                    │                  │
     │ ──observes symptoms──►│                      │                    │                  │
     │                    │                      │                    │                  │
     │                    │ POST /api/vet/       │                    │                  │
     │                    │  disease-cases       │                    │                  │
     │                    │ ─────────────────────►│                    │                  │
     │                    │ {farmId, flockId,   │                    │                  │
     │                    │  symptoms, severity} │                    │                  │
     │                    │◄─────────────────────│                    │                  │
     │                    │ {id: 1, ...}         │                    │                  │
     │                    │                      │                    │                  │
     │                    │ POST /api/vet/       │                    │                  │
     │                    │  prescriptions       │                    │                  │
     │                    │ ─────────────────────►│                    │                  │
     │                    │ {prescriptionNumber, │                    │                  │
     │                    │  farmId,             │                    │                  │
     │                    │  diseaseCaseId, ...} │                    │                  │
     │                    │◄─────────────────────│                    │                  │
     │                    │ {id: 1, status:      │                    │                  │
     │                    │       PENDING}        │                    │                  │
     │                    │                      │                    │                  │
     │ ──brings prescription──►│                    │                    │                  │
     │                    │                      │                    │                  │
     │                    │                      │ POST /api/pharmacy/│                  │
     │                    │                      │  sales             │                  │
     │                    │                      │ ──────────────────────────────────────────►
     │                    │                      │ {receiptNumber,     │                  │
     │                    │                      │  prescriptionId: 1,│                  │
     │                    │                      │  items: [...]}      │                  │
     │                    │                      │                    │                  │
     │                    │                      │──────stockOut()──────────────────────────►
     │                    │                      │                    │ FEFO deduction  │
     │                    │                      │                    │ Movement audit  │
     │                    │                      │◄───────────────────────────────────────────
     │                    │                      │                    │                  │
     │                    │                      │──────createAutoIncome()──────────────────►
     │                    │                      │                    │                  │ INCOME
     │                    │                      │◄───────────────────────────────────────────
     │                    │                      │                    │                  │
     │                    │                      │◄───────────────────────────────────────────
     │                    │                      │ {sale: id:15,      │                  │
     │                    │                      │  totalAmount:1250} │                  │
     │                    │                      │                    │                  │
     │                    │ PATCH /api/vet/      │                    │                  │
     │                    │  prescriptions/1/    │                    │                  │
     │                    │  dispense            │                    │                  │
     │                    │ ─────────────────────►│                    │                  │
     │                    │◄─────────────────────│                    │                  │
     │                    │ {status: DISPENSED}  │                    │                  │
```

---

## 5. Duplicate Prevention Mechanisms

| Entity | Unique Field | Enforcement |
|--------|-------------|-------------|
| Disease Case | No unique constraint | Business logic: same farm + flock + date + suspectedDisease may indicate duplicate. Can be added if needed. |
| Prescription | `prescriptionNumber` | `@Column(unique = true)` + `existsByPrescriptionNumber()` check before save. |
| Pharmacy Sale | `receiptNumber` | `@Column(unique = true)` + `existsByReceiptNumber()` check before save. |
| Stock Batch | `batchNumber` per item | Composite unique: `(item_id, batch_number)`. |
| Daily Record | farm + flock + date | `existsByFarmIdAndFlockIdAndDate()` check. |

---

## 6. Consistency Mechanisms

### 6.1 Transactional Boundaries
- **Pharmacy Sale creation** is a single `@Transactional` method.
- If stock deduction fails (insufficient stock), the entire sale rolls back.
- If finance income creation fails, the entire sale rolls back.
- If sale item linking fails, stock is not deducted.

### 6.2 Referential Integrity (Soft)
- `Prescription.diseaseCaseId` is `Long` (not FK). The disease case may be deleted without breaking prescriptions.
- `PharmacySale.prescriptionId` is `Long` (not FK). The prescription may be deleted without breaking sales.
- `FinanceTransaction.referenceId` is `Long` with `referenceType`. The referenced sale may be deleted without breaking finance records (orphan references are acceptable for audit trails).

### 6.3 Stock Consistency (FEFO)
```
Stock deduction order:
1. Find all available batches for the item.
2. Sort by expiry date ascending (FEFO = First Expired, First Out).
3. Then sort by creation date (FIFO tiebreaker).
4. Deduct from oldest batch first.
5. Continue to next batch until full quantity satisfied.
6. If total available < requested quantity → throw `BusinessException`.
```

This prevents:
- Selling expired stock
- Partial sales without full deduction
- Negative inventory

### 6.4 Alert Consistency
- **Low stock alert:** Triggered during `stockOut()` if `currentStock < minimumStockLevel`.
- **Expiry alert:** Triggered during `stockIn()` if `expiryDate < today + warningDays`.
- **Mortality alert:** Triggered during daily record creation if `mortalityRate > threshold`.

All alerts are created within the same transaction as the triggering action.

---

## 7. Failure Scenarios & Recovery

| Scenario | Behavior | Recovery |
|----------|----------|----------|
| Prescription created but sale never happens | Prescription stays `PENDING` | Pharmacy staff can query `GET /api/vet/prescriptions?status=PENDING` |
| Sale created but dispense API fails | Sale exists, prescription still `PENDING` | Retry `PATCH /api/vet/prescriptions/{id}/dispense` |
| Stock out fails mid-sale | Entire sale transaction rolls back | Fix stock issue, retry sale |
| Finance auto-income fails | Entire sale transaction rolls back | Retry sale after fixing finance module |
| Disease case deleted after prescription | Prescription retains `diseaseCaseId` (orphan reference) | Display "Case no longer available" in UI |

---

## 8. Data Flow Summary Table

| Step | API | Module | Creates/Updates | Links To |
|------|-----|--------|-----------------|----------|
| 1 | `POST /api/vet/disease-cases` | Veterinary | `disease_cases` | `farms`, `flocks` |
| 2 | `POST /api/vet/treatments` | Veterinary | `treatment_records` | `disease_cases` (opt), `farms`, `flocks` |
| 3 | `POST /api/vet/prescriptions` | Veterinary | `prescriptions` | `disease_cases` (opt, via id), `farms` |
| 4 | `POST /api/pharmacy/sales` | Pharmacy | `pharmacy_sales`, `sale_items` | `prescriptions`, `inventory_items`, `customers` |
| 4a | (internal) | Inventory | `stock_batches` (deduct), `stock_movements` | `inventory_items` |
| 4b | (internal) | Finance | `finance_transactions` (INCOME) | `pharmacy_sales` (via referenceType/referenceId) |
| 5 | `PATCH /api/vet/prescriptions/{id}/dispense` | Veterinary | `prescriptions.status` → `DISPENSED` | `pharmacy_sales` (implicit via sale.prescriptionId) |

---

## 9. Recommended Frontend Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Farm List   │───►│ Daily Record │───►│ Report      │───►│ Disease     │
│ (select     │    │ (observe     │    │ Disease     │    │ Case Form   │
│  farm)      │    │  symptoms)   │    │  Case       │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └──────┬──────┘
                                                                  │
                                                                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Finance     │◄───│ Pharmacy     │◄───│ Sale Form   │◄───│ Prescription│
│ Dashboard   │      Receipt      │      (with       │      │ (vet issues) │
│ (view       │      (print)      │      prescription│      │             │
│  auto-income)│                   │      link)       │      │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

---

## 10. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Loose FKs for cross-module links** | `prescriptionId`, `diseaseCaseId`, `referenceId` are `Long` not `@ManyToOne`. Prevents cascade delete issues and allows modules to be extracted to microservices later. |
| **Auto-finance income** | Pharmacy sales automatically create finance records. No manual double-entry. Finance officers only review. |
| **FEFO stock deduction** | Expiring stock is sold first. Reduces waste. Critical for veterinary drugs with short shelf life. |
| **Single transaction for sale** | All-or-nothing: stock deduction + finance record + sale record. No partial states. |
| **Prescription status separate from sale** | Sale can proceed before prescription is marked `DISPENSED`. Allows offline/queued operations. |
| **Stock movement audit trail** | Every stock in/out creates a `stock_movements` row. Immutable audit log for compliance. |
