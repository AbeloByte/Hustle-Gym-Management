# HustleGym Backend Requirements

This file defines the backend requirements separately from general project documentation.

## 1. Scope

Backend API for:

- Authentication and role-based access
- Gym profile management
- Member management
- Membership plan management
- Future modules: memberships, payments, attendance

## 2. Functional Requirements

### 2.1 Authentication

- System shall provide `POST /api/auth/register` for user creation.
- System shall provide `POST /api/auth/login` and return JWT token on valid credentials.
- Protected endpoints shall require `Authorization: Bearer <token>`.

### 2.2 Authorization

- System shall support roles: `ADMIN`, `STAFF`, `MEMBER`.
- System shall enforce route-level role checks using middleware.
- System shall return `403` for role-forbidden operations.

### 2.3 Gym Profile

- System shall allow gym profile create, read, and update operations.
- System shall persist one active gym profile record used by the API.

### 2.4 Members

- System shall support create/list/get/update/delete for members.
- Member delete shall be soft-delete via status (e.g., `SUSPENDED`) instead of hard delete.
- Member creation shall also create linked user account with role `MEMBER`.

### 2.5 Membership Plans

- System shall support create/list/get/update/delete for plans.
- Plan name shall be unique.
- Plan price and duration shall be positive values.

### 2.6 Future Modules

- System shall include modules for:
  - Membership subscription lifecycle
  - Payment recording and status tracking
  - Attendance check-in/check-out logging

## 3. Validation Requirements (Mandatory)

Validation must be applied before controller logic.

### 3.1 Header Validation

- Protected routes must validate `Authorization` header format and token validity.

### 3.2 Param Validation

- All `:id` path params for member/plan resources must be validated as positive integers.

### 3.3 Body Validation by Module

#### Auth

- Register: `name`, `email`, `password`, `role` required.
- Login: `email`, `password` required.
- `email` must match valid email format.
- `role` must match allowed enum values.

#### Gym

- Create/update gym profile must validate `name`, `phone`, and `email` format (if provided).

#### Members

- Create member requires `name`, `email`, `password`.
- Optional fields (`gender`, `dateOfBirth`) must match schema types/formats.
- Update member must allow only approved fields and reject unknown fields.

#### Plans

- Create/update plan must validate:
  - `name` string with minimum length
  - `price` number greater than `0`
  - `duration` integer greater than `0` (if provided)

### 3.4 Schema Behavior

- Validation schemas shall be strict (reject unknown keys).
- Validation errors shall return HTTP `400` with consistent error shape.

## 4. Error Handling Requirements

- System shall return JSON errors consistently.
- Validation failures shall return `400`.
- Unauthorized requests shall return `401`.
- Forbidden requests shall return `403`.
- Unexpected server errors shall return `500`.

## 5. Security Requirements

- Passwords must be hashed (`bcryptjs`) before persistence.
- JWT secret must be provided via environment variables.
- Public registration policy must be explicitly defined (open or admin-only).
- Production middleware should include rate limiting and secure headers.

## 6. Data & Persistence Requirements

- Database must be PostgreSQL via Prisma.
- Prisma schema enums must be respected in API validation.
- Transactions should be used for multi-entity operations (e.g., create user + member).

## 7. Configuration Requirements

- Required environment variables:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT` (optional default allowed)
  - `NODE_ENV`
- Environment variables must be loaded at runtime reliably.

## 8. Quality Requirements

- Code shall follow route → controller → service separation.
- Shared Prisma client usage shall be standardized.
- API response format should be consistent across modules.
- Automated tests should cover critical auth/member/plan workflows.

## 9. Acceptance Criteria (Minimum)

- Auth login returns valid JWT and protected endpoints accept it.
- Invalid token requests fail with `401`.
- Unauthorized role requests fail with `403`.
- Member and plan create/update requests fail on invalid schema with `400`.
- Member soft-delete updates status rather than hard deleting DB record.
- Prisma migrations apply successfully and API boots with configured environment.
