# Trust Agro Management System - Phase 1 Backend

Base URL: `http://localhost:8080`

All protected endpoints require:

```http
Authorization: Bearer <jwt>
Content-Type: application/json
```

## Architecture

The backend is a Spring Boot modular monolith. Each business module follows:

```text
controller -> service -> repository -> entity
```

Main Phase 1 packages:

```text
com.trustagro.auth      JWT login and current-user APIs
com.trustagro.user      users, BCrypt passwords, roles
com.trustagro.farm      farms, flocks, daily records, KPIs
com.trustagro.config    Spring Security, JWT filter, CORS, seed data
com.trustagro.common    API response wrapper and global exception handling
```

## Roles

Phase 1 roles:

```text
ADMIN
FARM_MANAGER
VET
STORE
```

The enum also keeps legacy operational roles used by existing non-Phase-1 modules.

## Auth

### Login

`POST /api/auth/login`

Request:

```json
{
  "email": "admin@trustagro.com",
  "password": "Admin@1234"
}
```

Response:

```json
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

### Current User

`GET /api/auth/me`

Roles: any authenticated user.

## User Management

### Create User

`POST /api/users`

Roles: `ADMIN`

Request:

```json
{
  "fullName": "Farm Manager",
  "email": "manager@trustagro.com",
  "phone": "+233200000000",
  "password": "Manager@1234",
  "role": "FARM_MANAGER"
}
```

Response:

```json
{
  "success": true,
  "message": "User created",
  "data": {
    "id": 2,
    "fullName": "Farm Manager",
    "email": "manager@trustagro.com",
    "phone": "+233200000000",
    "role": "FARM_MANAGER",
    "status": "ACTIVE"
  }
}
```

Passwords are stored with BCrypt and are never returned by the API.

## Farms

### Create Farm

`POST /api/farms`

Roles: `ADMIN`

Request:

```json
{
  "name": "North Layer Farm",
  "location": "Kumasi",
  "farmType": "LAYER",
  "capacity": 12000,
  "managerId": 2
}
```

Response:

```json
{
  "success": true,
  "message": "Farm created",
  "data": {
    "id": 1,
    "name": "North Layer Farm",
    "location": "Kumasi",
    "farmType": "LAYER",
    "capacity": 12000,
    "managerId": 2,
    "managerName": "Farm Manager",
    "status": "ACTIVE"
  }
}
```

Backward-compatible aliases are accepted for existing clients: `farmName` and `assignedFarmManagerId`.

### Get Farms

`GET /api/farms`

Roles: `ADMIN`, `FARM_MANAGER`, `VET`, `STORE`

### Get Farm KPIs

`GET /api/farms/{farmId}/kpis`

Roles: `ADMIN`, `FARM_MANAGER`, `VET`

Response:

```json
{
  "success": true,
  "data": {
    "farmId": 1,
    "farmName": "North Layer Farm",
    "totalInitialBirds": 5000,
    "currentBirdCount": 4975,
    "totalMortality": 25,
    "mortalityRate": 0.5,
    "totalFeedUsed": 320.50,
    "totalWaterUsed": 850.00,
    "totalEggProduction": 4300,
    "averageEggProductionPerRecord": 2150.0,
    "feedUsedPerCurrentBird": 0.06
  }
}
```

## Flocks

### Create Flock

`POST /api/flocks`

Roles: `ADMIN`, `FARM_MANAGER`

Request:

```json
{
  "batchCode": "LAYER-2026-001",
  "farmId": 1,
  "type": "LAYER",
  "startDate": "2026-05-04",
  "initialCount": 5000,
  "expectedEndDate": "2027-05-04"
}
```

Response:

```json
{
  "success": true,
  "message": "Flock created",
  "data": {
    "id": 1,
    "batchCode": "LAYER-2026-001",
    "farmId": 1,
    "farmName": "North Layer Farm",
    "type": "LAYER",
    "initialCount": 5000,
    "currentCount": 5000,
    "startDate": "2026-05-04",
    "expectedEndDate": "2027-05-04",
    "status": "ACTIVE"
  }
}
```

Backward-compatible aliases are accepted: `birdType` and `initialBirdCount`.

## Daily Records

### Add Daily Record

`POST /api/daily-farm-records`

Roles: `ADMIN`, `FARM_MANAGER`, `VET`

Request:

```json
{
  "farmId": 1,
  "flockId": 1,
  "date": "2026-05-04",
  "openingBirdCount": 5000,
  "mortality": 10,
  "feedIntake": 160.25,
  "waterIntake": 425.00,
  "averageWeight": 1.85,
  "eggProduction": 2150,
  "remarks": "Normal activity"
}
```

Response:

```json
{
  "success": true,
  "message": "Record created",
  "data": {
    "id": 1,
    "date": "2026-05-04",
    "farmId": 1,
    "farmName": "North Layer Farm",
    "flockId": 1,
    "batchCode": "LAYER-2026-001",
    "openingBirdCount": 5000,
    "mortality": 10,
    "feedIntake": 160.25,
    "waterIntake": 425.00,
    "averageWeight": 1.85,
    "eggProduction": 2150,
    "remarks": "Normal activity",
    "recordedBy": "Farm Manager",
    "mortalityRate": 0.2
  }
}
```

Backward-compatible aliases are accepted: `feedConsumed`, `waterConsumed`, and `symptomsOrRemarks`.

### Get Daily Records By Farm

`GET /api/farms/{farmId}/daily-records`

Alternative: `GET /api/daily-farm-records?farmId={farmId}`

Roles: `ADMIN`, `FARM_MANAGER`, `VET`

## Validation And Errors

All DTOs are validated before service execution. Typical validation response:

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "name": "Farm name is required",
    "farmType": "Farm type is required"
  }
}
```

Business rules include:

- Duplicate daily records are rejected for the same farm, flock, and date.
- A flock must belong to the farm used in the daily record.
- Mortality plus culled birds cannot exceed opening bird count.
- Assigned farm managers must have the `FARM_MANAGER` role.
- Flock batch codes are unique.
- Mortality above `app.alerts.mortality-threshold` triggers alerts.
