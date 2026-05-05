-- ============================================================================
-- Trust Agro Management System - Phase 1 PostgreSQL Schema
-- Production-ready database design with indexing, constraints, and partitioning
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM ENUM TYPES
-- ============================================================================

-- User & Auth
CREATE TYPE user_role AS ENUM (
    'ADMIN', 'GENERAL_MANAGER', 'OPERATIONS_MANAGER', 'FARM_MANAGER',
    'VETERINARY_OFFICER', 'STORE_KEEPER', 'PHARMACY_SALES', 'FINANCE_OFFICER',
    'EXTENSION_WORKER'
);

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE');

-- Farm
CREATE TYPE farm_type AS ENUM ('BROILER', 'LAYER', 'MIXED');
CREATE TYPE farm_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE flock_status AS ENUM ('ACTIVE', 'CLOSED');

-- Inventory
CREATE TYPE item_category AS ENUM ('FEED', 'DRUG', 'EQUIPMENT', 'VACCINE', 'SUPPLY');
CREATE TYPE item_unit AS ENUM ('KG', 'L', 'UNITS', 'BAGS', 'BOXES', 'BOTTLES', 'TUBES');
CREATE TYPE item_status AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE movement_type AS ENUM ('STOCK_IN', 'STOCK_OUT');
CREATE TYPE issued_to_type AS ENUM ('FARM', 'CUSTOMER', 'VET', 'PHARMACY', 'INTERNAL');

-- Veterinary
CREATE TYPE vaccination_status AS ENUM ('SCHEDULED', 'COMPLETED', 'MISSED');
CREATE TYPE disease_status AS ENUM ('ACTIVE', 'CONTROLLED', 'RESOLVED');
CREATE TYPE disease_severity AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
CREATE TYPE prescription_status AS ENUM ('PENDING', 'DISPENSED', 'CANCELLED');

-- Pharmacy
CREATE TYPE customer_type AS ENUM ('INDIVIDUAL', 'FARM', 'RETAIL', 'VET');

-- Finance
CREATE TYPE transaction_type AS ENUM ('INCOME', 'EXPENSE');
CREATE TYPE payment_method AS ENUM ('CASH', 'MOMO', 'BANK_TRANSFER', 'CREDIT');

-- CRM
CREATE TYPE client_status AS ENUM ('LEAD', 'PROSPECT', 'ACTIVE_CLIENT', 'INACTIVE');

-- Notification
CREATE TYPE notification_type AS ENUM ('INFO', 'WARNING', 'ALERT', 'SYSTEM');

-- ============================================================================
-- 2. CORE TABLES - USER & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id                      BIGSERIAL PRIMARY KEY,
    full_name               VARCHAR(255) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    phone                   VARCHAR(20),
    password                VARCHAR(255) NOT NULL,
    role                    user_role NOT NULL,
    status                  user_status NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE users IS 'System users with role-based access control';
COMMENT ON COLUMN users.role IS 'Defines module access permissions';
COMMENT ON COLUMN users.status IS 'ACTIVE users can login; INACTIVE users are suspended';

-- Index: fast login lookup by email
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_status ON users(role, status) WHERE status = 'ACTIVE';

-- ============================================================================
-- 3. FARM MANAGEMENT MODULE
-- ============================================================================

-- 3.1 Farms
CREATE TABLE farms (
    id                      BIGSERIAL PRIMARY KEY,
    farm_name               VARCHAR(255) NOT NULL,
    location                VARCHAR(255),
    farm_type               farm_type,
    capacity                INTEGER CHECK (capacity > 0),
    assigned_farm_manager_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status                  farm_status NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE farms IS 'Individual farm locations managed by the system';
COMMENT ON COLUMN farms.assigned_farm_manager_id IS 'FK to users.id; only FARM_MANAGER role users should be assigned';

CREATE INDEX idx_farms_status ON farms(status);
CREATE INDEX idx_farms_manager ON farms(assigned_farm_manager_id);
CREATE INDEX idx_farms_location ON farms(location);
CREATE INDEX idx_farms_type_status ON farms(farm_type, status);

-- 3.2 Flocks (Batches)
CREATE TABLE flocks (
    id                      BIGSERIAL PRIMARY KEY,
    batch_code              VARCHAR(50) NOT NULL UNIQUE,
    farm_id                 BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    bird_type               VARCHAR(100),
    initial_bird_count      INTEGER CHECK (initial_bird_count >= 0),
    current_bird_count      INTEGER CHECK (current_bird_count >= 0),
    start_date              DATE,
    expected_end_date       DATE,
    status                  flock_status NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_flock_dates CHECK (expected_end_date IS NULL OR expected_end_date >= start_date)
);

COMMENT ON TABLE flocks IS 'Bird batches/groups within a farm';
COMMENT ON COLUMN flocks.batch_code IS 'Unique identifier for the batch (e.g., L-2026-001)';

CREATE INDEX idx_flocks_farm ON flocks(farm_id);
CREATE INDEX idx_flocks_status ON flocks(status);
CREATE INDEX idx_flocks_batch_code ON flocks(batch_code);
CREATE INDEX idx_flocks_farm_status ON flocks(farm_id, status);

-- 3.3 Daily Farm Records
CREATE TABLE daily_farm_records (
    id                      BIGSERIAL PRIMARY KEY,
    record_date             DATE NOT NULL,
    farm_id                 BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    flock_id                BIGINT NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
    opening_bird_count      INTEGER CHECK (opening_bird_count >= 0),
    mortality               INTEGER CHECK (mortality >= 0) DEFAULT 0,
    culled_birds            INTEGER CHECK (culled_birds >= 0) DEFAULT 0,
    feed_consumed           DECIMAL(12,2) CHECK (feed_consumed >= 0),
    water_consumed          DECIMAL(12,2) CHECK (water_consumed >= 0),
    average_weight          DECIMAL(8,3) CHECK (average_weight >= 0),
    egg_production          INTEGER CHECK (egg_production >= 0) DEFAULT 0,
    damaged_eggs            INTEGER CHECK (damaged_eggs >= 0) DEFAULT 0,
    symptoms_or_remarks     TEXT,
    recorded_by             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Business constraint: only one record per farm-flock-date combination
    CONSTRAINT uq_daily_record_farm_flock_date UNIQUE (farm_id, flock_id, record_date),
    -- Business constraint: mortality + culled cannot exceed opening count
    CONSTRAINT chk_mortality_culled CHECK (mortality + culled_birds <= COALESCE(opening_bird_count, mortality + culled_birds))
);

COMMENT ON TABLE daily_farm_records IS 'Daily metrics recorded per farm and flock';
COMMENT ON CONSTRAINT uq_daily_record_farm_flock_date ON daily_farm_records
    IS 'Prevents duplicate daily entries for the same farm, flock, and date';

CREATE INDEX idx_daily_records_date ON daily_farm_records(record_date);
CREATE INDEX idx_daily_records_farm ON daily_farm_records(farm_id);
CREATE INDEX idx_daily_records_flock ON daily_farm_records(flock_id);
CREATE INDEX idx_daily_records_farm_date ON daily_farm_records(farm_id, record_date DESC);
CREATE INDEX idx_daily_records_flock_date ON daily_farm_records(flock_id, record_date DESC);
CREATE INDEX idx_daily_records_recorded_by ON daily_farm_records(recorded_by);

-- ============================================================================
-- 4. VETERINARY MODULE
-- ============================================================================

-- 4.1 Vaccination Schedules
CREATE TABLE vaccination_schedules (
    id                      BIGSERIAL PRIMARY KEY,
    farm_id                 BIGINT REFERENCES farms(id) ON DELETE CASCADE,
    flock_id                BIGINT REFERENCES flocks(id) ON DELETE CASCADE,
    vaccine_name            VARCHAR(255) NOT NULL,
    disease_protected_against VARCHAR(255),
    scheduled_date          DATE NOT NULL,
    actual_date             DATE,
    status                  vaccination_status NOT NULL DEFAULT 'SCHEDULED',
    given_by                BIGINT REFERENCES users(id) ON DELETE SET NULL,
    remarks                 TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_vaccination_dates CHECK (actual_date IS NULL OR actual_date >= scheduled_date)
);

COMMENT ON TABLE vaccination_schedules IS 'Vaccination calendar for farms and flocks';

CREATE INDEX idx_vaccinations_farm ON vaccination_schedules(farm_id);
CREATE INDEX idx_vaccinations_flock ON vaccination_schedules(flock_id);
CREATE INDEX idx_vaccinations_scheduled ON vaccination_schedules(scheduled_date);
CREATE INDEX idx_vaccinations_status ON vaccination_schedules(status);
CREATE INDEX idx_vaccinations_farm_status ON vaccination_schedules(farm_id, status);
CREATE INDEX idx_vaccinations_date_status ON vaccination_schedules(scheduled_date, status)
    WHERE status = 'SCHEDULED';

-- 4.2 Disease Cases
CREATE TABLE disease_cases (
    id                      BIGSERIAL PRIMARY KEY,
    farm_id                 BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    flock_id                BIGINT NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
    date_detected           DATE NOT NULL DEFAULT CURRENT_DATE,
    symptoms                TEXT,
    suspected_disease       VARCHAR(255),
    number_affected         INTEGER CHECK (number_affected >= 0),
    number_dead             INTEGER CHECK (number_dead >= 0),
    severity                disease_severity NOT NULL DEFAULT 'MODERATE',
    status                  disease_status NOT NULL DEFAULT 'ACTIVE',
    reported_by             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_disease_affected CHECK (number_dead <= number_affected)
);

COMMENT ON TABLE disease_cases IS 'Disease outbreak tracking per farm and flock';

CREATE INDEX idx_disease_cases_farm ON disease_cases(farm_id);
CREATE INDEX idx_disease_cases_flock ON disease_cases(flock_id);
CREATE INDEX idx_disease_cases_status ON disease_cases(status);
CREATE INDEX idx_disease_cases_severity ON disease_cases(severity);
CREATE INDEX idx_disease_cases_date ON disease_cases(date_detected DESC);
CREATE INDEX idx_disease_cases_farm_status ON disease_cases(farm_id, status);
CREATE INDEX idx_disease_cases_active ON disease_cases(status) WHERE status = 'ACTIVE';

-- 4.3 Treatment Records
CREATE TABLE treatment_records (
    id                      BIGSERIAL PRIMARY KEY,
    disease_case_id         BIGINT REFERENCES disease_cases(id) ON DELETE SET NULL,
    farm_id                 BIGINT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    flock_id                BIGINT NOT NULL REFERENCES flocks(id) ON DELETE CASCADE,
    drug_name               VARCHAR(255) NOT NULL,
    dosage                  VARCHAR(255),
    route                   VARCHAR(100),
    duration                VARCHAR(100),
    start_date              DATE,
    end_date                DATE,
    vet_officer             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    outcome                 VARCHAR(255),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_treatment_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

COMMENT ON TABLE treatment_records IS 'Treatment administered for disease cases';

CREATE INDEX idx_treatments_disease ON treatment_records(disease_case_id);
CREATE INDEX idx_treatments_farm ON treatment_records(farm_id);
CREATE INDEX idx_treatments_flock ON treatment_records(flock_id);
CREATE INDEX idx_treatments_vet ON treatment_records(vet_officer);
CREATE INDEX idx_treatments_drug ON treatment_records(drug_name);

-- 4.4 Prescriptions
CREATE TABLE prescriptions (
    id                      BIGSERIAL PRIMARY KEY,
    prescription_number     VARCHAR(50) NOT NULL UNIQUE,
    farm_id                 BIGINT REFERENCES farms(id) ON DELETE SET NULL,
    client_id               BIGINT,
    disease_case_id         BIGINT,
    drug_name               VARCHAR(255) NOT NULL,
    quantity                DECIMAL(10,2) CHECK (quantity > 0),
    dosage_instruction      TEXT,
    status                  prescription_status NOT NULL DEFAULT 'PENDING',
    created_by_vet          BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE prescriptions IS 'Vet prescriptions to be dispensed at pharmacy';
COMMENT ON COLUMN prescriptions.disease_case_id IS 'Soft reference (Long) to disease_cases.id for traceability';
COMMENT ON COLUMN prescriptions.client_id IS 'Soft reference to pharmacy customers or CRM clients';

CREATE INDEX idx_prescriptions_number ON prescriptions(prescription_number);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_prescriptions_farm ON prescriptions(farm_id);
CREATE INDEX idx_prescriptions_disease ON prescriptions(disease_case_id);
CREATE INDEX idx_prescriptions_pending ON prescriptions(status) WHERE status = 'PENDING';

-- ============================================================================
-- 5. INVENTORY MODULE
-- ============================================================================

-- 5.1 Inventory Items (Master Catalog)
CREATE TABLE inventory_items (
    id                      BIGSERIAL PRIMARY KEY,
    item_name               VARCHAR(255) NOT NULL,
    category                item_category,
    unit                    item_unit,
    minimum_stock_level     DECIMAL(10,2) CHECK (minimum_stock_level >= 0),
    expiry_required         BOOLEAN NOT NULL DEFAULT FALSE,
    status                  item_status NOT NULL DEFAULT 'ACTIVE',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE inventory_items IS 'Master catalog of all inventory items (feed, drugs, vaccines, equipment)';

CREATE INDEX idx_inventory_items_category ON inventory_items(category);
CREATE INDEX idx_inventory_items_status ON inventory_items(status);
CREATE INDEX idx_inventory_items_name ON inventory_items(item_name);
CREATE INDEX idx_inventory_items_category_status ON inventory_items(category, status);

-- 5.2 Stock Batches (FEFO/FIFO tracking)
CREATE TABLE stock_batches (
    id                      BIGSERIAL PRIMARY KEY,
    item_id                 BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    batch_number            VARCHAR(100) NOT NULL,
    quantity_received       DECIMAL(12,2) NOT NULL CHECK (quantity_received > 0),
    quantity_remaining      DECIMAL(12,2) NOT NULL CHECK (quantity_remaining >= 0),
    unit_cost               DECIMAL(12,2) CHECK (unit_cost >= 0),
    supplier                VARCHAR(255),
    expiry_date             DATE,
    date_received           DATE NOT NULL DEFAULT CURRENT_DATE,
    received_by             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Unique batch per item
    CONSTRAINT uq_stock_batch_item_batch UNIQUE (item_id, batch_number),
    -- Remaining cannot exceed received
    CONSTRAINT chk_batch_remaining CHECK (quantity_remaining <= quantity_received)
);

COMMENT ON TABLE stock_batches IS 'Individual stock receipts tracked by batch for FEFO/FIFO deduction';

CREATE INDEX idx_stock_batches_item ON stock_batches(item_id);
CREATE INDEX idx_stock_batches_expiry ON stock_batches(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_stock_batches_available ON stock_batches(item_id, quantity_remaining)
    WHERE quantity_remaining > 0;
CREATE INDEX idx_stock_batches_fefo ON stock_batches(item_id, expiry_date ASC NULLS LAST, created_at ASC)
    WHERE quantity_remaining > 0;

-- 5.3 Stock Movements (Audit Trail)
CREATE TABLE stock_movements (
    id                      BIGSERIAL PRIMARY KEY,
    item_id                 BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    movement_type           movement_type NOT NULL,
    quantity                DECIMAL(12,2) NOT NULL CHECK (quantity > 0),
    reason                  VARCHAR(500),
    issued_to_type          issued_to_type,
    farm_id                 BIGINT REFERENCES farms(id) ON DELETE SET NULL,
    department              VARCHAR(100),
    reference_type          VARCHAR(50),
    reference_id            BIGINT,
    performed_by            BIGINT REFERENCES users(id) ON DELETE SET NULL,
    movement_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE stock_movements IS 'Immutable audit log of all stock in/out transactions';
COMMENT ON COLUMN stock_movements.reference_type IS 'E.g., PHARMACY_SALE, FARM_ISSUE, DISEASE_TREATMENT';

CREATE INDEX idx_stock_movements_item ON stock_movements(item_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date DESC);
CREATE INDEX idx_stock_movements_farm ON stock_movements(farm_id);
CREATE INDEX idx_stock_movements_reference ON stock_movements(reference_type, reference_id);
CREATE INDEX idx_stock_movements_performed_by ON stock_movements(performed_by);

-- ============================================================================
-- 6. PHARMACY MODULE
-- ============================================================================

-- 6.1 Pharmacy Customers
CREATE TABLE pharmacy_customers (
    id                      BIGSERIAL PRIMARY KEY,
    customer_name           VARCHAR(255) NOT NULL,
    phone                   VARCHAR(20),
    location                VARCHAR(255),
    customer_type           customer_type NOT NULL DEFAULT 'INDIVIDUAL',
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE pharmacy_customers IS 'Customers who purchase from the pharmacy';

CREATE INDEX idx_pharmacy_customers_name ON pharmacy_customers(customer_name);
CREATE INDEX idx_pharmacy_customers_phone ON pharmacy_customers(phone);
CREATE INDEX idx_pharmacy_customers_type ON pharmacy_customers(customer_type);

-- 6.2 Pharmacy Sales
CREATE TABLE pharmacy_sales (
    id                      BIGSERIAL PRIMARY KEY,
    receipt_number          VARCHAR(50) NOT NULL UNIQUE,
    customer_id             BIGINT REFERENCES pharmacy_customers(id) ON DELETE SET NULL,
    sale_date               DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method          payment_method,
    total_amount            DECIMAL(12,2) NOT NULL CHECK (total_amount >= 0),
    prescription_id         BIGINT,
    sold_by                 BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_sale_amount CHECK (total_amount >= 0)
);

COMMENT ON TABLE pharmacy_sales IS 'Pharmacy sales transactions with optional prescription linkage';
COMMENT ON COLUMN pharmacy_sales.prescription_id IS 'Soft reference to prescriptions.id; allows prescription to be deleted';

CREATE INDEX idx_pharmacy_sales_receipt ON pharmacy_sales(receipt_number);
CREATE INDEX idx_pharmacy_sales_customer ON pharmacy_sales(customer_id);
CREATE INDEX idx_pharmacy_sales_date ON pharmacy_sales(sale_date DESC);
CREATE INDEX idx_pharmacy_sales_prescription ON pharmacy_sales(prescription_id) WHERE prescription_id IS NOT NULL;
CREATE INDEX idx_pharmacy_sales_sold_by ON pharmacy_sales(sold_by);

-- 6.3 Sale Items (Line Items)
CREATE TABLE sale_items (
    id                      BIGSERIAL PRIMARY KEY,
    sale_id                 BIGINT NOT NULL REFERENCES pharmacy_sales(id) ON DELETE CASCADE,
    inventory_item_id       BIGINT NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    quantity                DECIMAL(10,2) NOT NULL CHECK (quantity > 0),
    unit_price              DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price             DECIMAL(12,2) NOT NULL CHECK (total_price >= 0),

    CONSTRAINT uq_sale_item UNIQUE (sale_id, inventory_item_id)
);

COMMENT ON TABLE sale_items IS 'Individual line items within a pharmacy sale';

CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
CREATE INDEX idx_sale_items_inventory ON sale_items(inventory_item_id);

-- ============================================================================
-- 7. FINANCE MODULE
-- ============================================================================

CREATE TABLE finance_transactions (
    id                      BIGSERIAL PRIMARY KEY,
    transaction_type        transaction_type NOT NULL,
    category                VARCHAR(100) NOT NULL,
    amount                  DECIMAL(14,2) NOT NULL CHECK (amount > 0),
    payment_method          payment_method,
    department              VARCHAR(100),
    farm_id                 BIGINT REFERENCES farms(id) ON DELETE SET NULL,
    client_id               BIGINT,
    reference_type          VARCHAR(50),
    reference_id            BIGINT,
    description             TEXT,
    transaction_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    recorded_by             BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE finance_transactions IS 'All income and expense transactions with cross-module reference linkage';
COMMENT ON COLUMN finance_transactions.reference_type IS 'Source module: PHARMACY_SALE, FARM_SALE, DAILY_RECORD, etc.';
COMMENT ON COLUMN finance_transactions.reference_id IS 'ID of the source record in the referenced module';

CREATE INDEX idx_finance_type ON finance_transactions(transaction_type);
CREATE INDEX idx_finance_category ON finance_transactions(category);
CREATE INDEX idx_finance_date ON finance_transactions(transaction_date DESC);
CREATE INDEX idx_finance_farm ON finance_transactions(farm_id);
CREATE INDEX idx_finance_reference ON finance_transactions(reference_type, reference_id);
CREATE INDEX idx_finance_recorded_by ON finance_transactions(recorded_by);
CREATE INDEX idx_finance_type_date ON finance_transactions(transaction_type, transaction_date DESC);

-- ============================================================================
-- 8. CRM MODULE
-- ============================================================================

CREATE TABLE crm_clients (
    id                      BIGSERIAL PRIMARY KEY,
    client_name             VARCHAR(255) NOT NULL,
    phone                   VARCHAR(20),
    location                VARCHAR(255),
    farm_type               VARCHAR(100),
    farm_size               VARCHAR(100),
    number_of_birds         INTEGER CHECK (number_of_birds >= 0),
    status                  client_status NOT NULL DEFAULT 'LEAD',
    assigned_extension_worker_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE crm_clients IS 'External client and farm prospect tracking';

CREATE INDEX idx_crm_clients_status ON crm_clients(status);
CREATE INDEX idx_crm_clients_worker ON crm_clients(assigned_extension_worker_id);
CREATE INDEX idx_crm_clients_name ON crm_clients(client_name);
CREATE INDEX idx_crm_clients_location ON crm_clients(location);

CREATE TABLE farm_visits (
    id                      BIGSERIAL PRIMARY KEY,
    client_id               BIGINT NOT NULL REFERENCES crm_clients(id) ON DELETE CASCADE,
    visit_date              DATE NOT NULL DEFAULT CURRENT_DATE,
    visited_by              BIGINT REFERENCES users(id) ON DELETE SET NULL,
    purpose                 VARCHAR(255),
    observation             TEXT,
    advice_given            TEXT,
    next_follow_up_date     DATE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE farm_visits IS 'Extension worker farm visit logs';

CREATE INDEX idx_farm_visits_client ON farm_visits(client_id);
CREATE INDEX idx_farm_visits_date ON farm_visits(visit_date DESC);
CREATE INDEX idx_farm_visits_visitor ON farm_visits(visited_by);
CREATE INDEX idx_farm_visits_followup ON farm_visits(next_follow_up_date) WHERE next_follow_up_date IS NOT NULL;

-- ============================================================================
-- 9. NOTIFICATION MODULE
-- ============================================================================

CREATE TABLE notifications (
    id                      BIGSERIAL PRIMARY KEY,
    title                   VARCHAR(255) NOT NULL,
    message                 TEXT,
    type                    notification_type NOT NULL DEFAULT 'INFO',
    target_role             user_role,
    target_user_id          BIGINT REFERENCES users(id) ON DELETE CASCADE,
    related_module          VARCHAR(50),
    related_id              BIGINT,
    is_read                 BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE notifications IS 'System alerts: low stock, expiry, mortality threshold, etc.';

CREATE INDEX idx_notifications_user ON notifications(target_user_id) WHERE target_user_id IS NOT NULL;
CREATE INDEX idx_notifications_role ON notifications(target_role) WHERE target_role IS NOT NULL;
CREATE INDEX idx_notifications_unread ON notifications(is_read, created_at DESC) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_module ON notifications(related_module, related_id);

-- ============================================================================
-- 10. AUDIT MODULE
-- ============================================================================

CREATE TABLE audit_logs (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT,
    user_email              VARCHAR(255),
    action                  VARCHAR(100) NOT NULL,
    module                  VARCHAR(50) NOT NULL,
    record_id               BIGINT,
    old_value               TEXT,
    new_value               TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON TABLE audit_logs IS 'Immutable change log for compliance and debugging';

CREATE INDEX idx_audit_module ON audit_logs(module);
CREATE INDEX idx_audit_user ON audit_logs(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_record ON audit_logs(module, record_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);

-- ============================================================================
-- 11. VIEWS FOR REPORTING & DASHBOARD
-- ============================================================================

-- 11.1 Current Stock View
CREATE VIEW v_current_stock AS
SELECT
    ii.id AS item_id,
    ii.item_name,
    ii.category,
    ii.unit,
    ii.minimum_stock_level,
    COALESCE(SUM(sb.quantity_remaining), 0) AS current_stock,
    ii.minimum_stock_level IS NOT NULL AND COALESCE(SUM(sb.quantity_remaining), 0) < ii.minimum_stock_level AS is_low_stock,
    MIN(sb.expiry_date) FILTER (WHERE sb.quantity_remaining > 0 AND sb.expiry_date IS NOT NULL) AS nearest_expiry
FROM inventory_items ii
LEFT JOIN stock_batches sb ON sb.item_id = ii.id AND sb.quantity_remaining > 0
WHERE ii.status = 'ACTIVE'
GROUP BY ii.id, ii.item_name, ii.category, ii.unit, ii.minimum_stock_level;

COMMENT ON VIEW v_current_stock IS 'Real-time stock levels per item with low stock flag';

-- 11.2 Farm KPI Summary View
CREATE VIEW v_farm_kpis AS
SELECT
    f.id AS farm_id,
    f.farm_name,
    COALESCE(SUM(fl.initial_bird_count), 0) AS total_initial_birds,
    COALESCE(SUM(fl.current_bird_count), 0) AS current_bird_count,
    COALESCE(SUM(dfr.mortality), 0) AS total_mortality,
    CASE WHEN COALESCE(SUM(fl.initial_bird_count), 0) > 0
        THEN ROUND((COALESCE(SUM(dfr.mortality), 0)::NUMERIC / SUM(fl.initial_bird_count) * 100), 2)
        ELSE 0
    END AS mortality_rate_pct,
    COALESCE(SUM(dfr.feed_consumed), 0) AS total_feed_used,
    COALESCE(SUM(dfr.egg_production), 0) AS total_egg_production,
    COUNT(DISTINCT dfr.id) AS total_records,
    COUNT(DISTINCT fl.id) AS total_flocks
FROM farms f
LEFT JOIN flocks fl ON fl.farm_id = f.id
LEFT JOIN daily_farm_records dfr ON dfr.farm_id = f.id
WHERE f.status = 'ACTIVE'
GROUP BY f.id, f.farm_name;

COMMENT ON VIEW v_farm_kpis IS 'Pre-aggregated farm performance metrics for dashboard';

-- 11.3 Profit & Loss Summary View
CREATE VIEW v_profit_loss AS
SELECT
    COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE 0 END), 0) AS total_income,
    COALESCE(SUM(CASE WHEN transaction_type = 'EXPENSE' THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN transaction_type = 'INCOME' THEN amount ELSE -amount END), 0) AS net_profit_loss,
    MIN(transaction_date) AS earliest_date,
    MAX(transaction_date) AS latest_date
FROM finance_transactions;

COMMENT ON VIEW v_profit_loss IS 'Overall financial position across all time';

-- ============================================================================
-- 12. FUNCTIONS & TRIGGERS
-- ============================================================================

-- 12.1 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER trg_farms_updated_at BEFORE UPDATE ON farms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_flocks_updated_at BEFORE UPDATE ON flocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_daily_records_updated_at BEFORE UPDATE ON daily_farm_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_vaccinations_updated_at BEFORE UPDATE ON vaccination_schedules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_disease_cases_updated_at BEFORE UPDATE ON disease_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_treatments_updated_at BEFORE UPDATE ON treatment_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_inventory_items_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_crm_clients_updated_at BEFORE UPDATE ON crm_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_farm_visits_updated_at BEFORE UPDATE ON farm_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 12.2 Low stock notification trigger (example)
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a simplified example; the application handles this in Java service layer
    -- But could be enhanced with LISTEN/NOTIFY for real-time alerts
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stock_batch_check
    AFTER UPDATE OF quantity_remaining ON stock_batches
    FOR EACH ROW
    WHEN (NEW.quantity_remaining < 10)
    EXECUTE FUNCTION check_low_stock();

-- ============================================================================
-- 13. PARTITIONING SETUP (for high-volume tables)
-- ============================================================================

-- 13.1 Partition daily_farm_records by month (for large operations)
-- Uncomment when table grows beyond 1M rows
/*
CREATE TABLE daily_farm_records_partitioned (
    LIKE daily_farm_records INCLUDING ALL
) PARTITION BY RANGE (record_date);

CREATE TABLE daily_farm_records_2026_01 PARTITION OF daily_farm_records_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE daily_farm_records_2026_02 PARTITION OF daily_farm_records_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
-- ... add more partitions as needed
*/

-- 13.2 Partition stock_movements by year (for audit compliance)
/*
CREATE TABLE stock_movements_partitioned (
    LIKE stock_movements INCLUDING ALL
) PARTITION BY RANGE (movement_date);

CREATE TABLE stock_movements_2026 PARTITION OF stock_movements_partitioned
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
*/

-- ============================================================================
-- 14. ROW-LEVEL SECURITY (optional, for multi-tenant future)
-- ============================================================================

-- Enable RLS on key tables (disabled by default for single-tenant)
-- ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE daily_farm_records ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE finance_transactions ENABLE ROW LEVEL SECURITY;

-- Example policy: farm managers only see their assigned farms
/*
CREATE POLICY farm_manager_policy ON farms
    FOR ALL
    TO app_user
    USING (
        assigned_farm_manager_id = current_setting('app.current_user_id')::BIGINT
        OR current_setting('app.current_user_role') = 'ADMIN'
    );
*/

-- ============================================================================
-- 15. INITIAL DATA SEED
-- ============================================================================

-- Default admin user (password must be hashed by application layer)
INSERT INTO users (full_name, email, phone, password, role, status)
VALUES (
    'System Administrator',
    'admin@trustagro.com',
    '+233000000000',
    '$2a$10$...',  -- BCrypt hash: Admin@1234 (generate via application)
    'ADMIN',
    'ACTIVE'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 16. PERFORMANCE NOTES
-- ============================================================================

-- Estimated index count per table:
-- users: 4 indexes
-- farms: 4 indexes
-- flocks: 4 indexes
-- daily_farm_records: 6 indexes (consider partitioning after 1M rows)
-- disease_cases: 7 indexes
-- treatment_records: 5 indexes
-- prescriptions: 5 indexes
-- stock_batches: 4 indexes (partial indexes for performance)
-- stock_movements: 6 indexes (consider partitioning after 5M rows)
-- pharmacy_sales: 5 indexes
-- finance_transactions: 7 indexes
-- notifications: 5 indexes (partial indexes for unread)
-- audit_logs: 4 indexes (consider archiving after 1 year)

-- Total tables: 18
-- Total custom types: 12 ENUMs
-- Total indexes: ~70
-- Total views: 3
-- Total triggers: 10 auto-update + 1 stock check
