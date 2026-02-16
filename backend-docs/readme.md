# GymBack (HustleGym Backend)

Backend API for gym operations built with **Node.js**, **Express**, **Prisma**, and **PostgreSQL**.

This README reflects the **current implemented backend** in this repository.

## Stack

- Node.js + Express 5
- Prisma ORM
- PostgreSQL
- JWT authentication (`jsonwebtoken`)
- Password hashing (`bcryptjs`)

## Project Structure

```text
gymBack/
  prisma/
    schema.prisma
  src/
    app.js
    server.js
    config/
      prisma.js
    controllers/
    middleware/
    routes/
    services/
```

## Current Modules

Implemented and mounted under `/api`:

- `auth` → `/api/auth/*`
- `gym` → `/api/gym/*`
- `gym-members` → `/api/gym-members/*`
- `membership-plan` → `/api/membership-plan/*`

Present but currently empty / not mounted:

- `membership.routes.js`
- `payment.routes.js`
- `attendance.routes.js`

## Prerequisites

- Node.js 18+
- PostgreSQL running locally or remotely

## Environment Variables

Create or update `.env` in `gymBack/` with:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db_name>"
JWT_SECRET="your-secret"
PORT=5000
NODE_ENV=development
```

## Install & Run

From `gymBack/`:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

Server base URL:

```text
http://localhost:5000
```

API base path:

```text
http://localhost:5000/api
```

## Authentication Flow

1. Login using `/api/auth/login`.
2. Receive JWT token.
3. Send token in header for protected routes:

```http
Authorization: Bearer <JWT_TOKEN>
```

Middleware behavior:

- `auth.middleware.js` validates JWT and sets `req.user`.
- `role.middleware.js` checks required roles and returns `403` when denied.

## API Endpoints (Current)

### Auth

- `POST /api/auth/register`
  - Body: `name`, `email`, `password`, `role`
  - Creates a user.

- `POST /api/auth/login`
  - Body: `email`, `password`
  - Returns JWT token + user info.

### Gym Profile

- `ALL /api/gym/register-gym` (implemented via `router.use`)
  - Protected: `ADMIN`
  - Body: `name`, `address`, `phone`, `email`

- `ALL /api/gym/gym-profile` (implemented via `router.use`)
  - Public in current code
  - Returns first gym profile

- `ALL /api/gym/update-gym-profile` (implemented via `router.use`)
  - Public in current code
  - Body: `name`, `address`, `phone`, `email`

### Members

- `POST /api/gym-members/members`
  - Protected: `ADMIN`, `STAFF`
  - Body: `name`, `email`, `password`, optional `gender`, `dateOfBirth`

- `GET /api/gym-members/members`
  - Protected: `ADMIN`, `STAFF`

- `GET /api/gym-members/members/:id`
  - Protected: `ADMIN`, `STAFF`

- `PUT /api/gym-members/members/:id`
  - Protected: `ADMIN`, `STAFF`

- `DELETE /api/gym-members/members/:id`
  - Protected: `ADMIN`, `STAFF`
  - Performs soft delete by setting member status to `SUSPENDED`

### Membership Plans

- `POST /api/membership-plan/createPlan`
  - Protected: authenticated user
  - Body: `name`, `price`, optional `duration`

- `GET /api/membership-plan/getAllPlans`
  - Protected: authenticated user

- `GET /api/membership-plan/getPlanById/:id`
  - Protected: authenticated user

- `PUT /api/membership-plan/updatePlan/:id`
  - Intended: `ADMIN` only

- `DELETE /api/membership-plan/deletePlan/:id`
  - Intended: `ADMIN` only

## Validation Requirements (What Needs Validation)

Apply validation at three levels for every request:

- **Headers** (especially `Authorization` for protected routes)
- **Path params** (for IDs in URL)
- **Request body** (for create/update payloads)

### 1) Auth Module

- `POST /api/auth/register`
  - Validate body: `name`, `email`, `password`, `role`
  - `name`: required, min length
  - `email`: required, valid email format
  - `password`: required, minimum strength policy
  - `role`: must be one of allowed enum values (`ADMIN`, `STAFF`, `MEMBER`)

- `POST /api/auth/login`
  - Validate body: `email`, `password`
  - Reject empty fields and invalid email format

### 2) Gym Profile Module

- `POST /api/gym/register-gym`
  - Validate header token
  - Validate body: `name`, `phone` required; `email` format if provided

- `PUT /api/gym/update-gym-profile` (recommended method)
  - Validate header token (if route is protected)
  - Validate body with partial update rules:
    - If `email` provided, must be valid
    - If `phone` provided, must match accepted phone format

### 3) Members Module

- `POST /api/gym-members/members`
  - Validate header token + role
  - Validate body: `name`, `email`, `password` required
  - Optional fields validation:
    - `gender` in enum (`MALE`, `FEMALE`)
    - `dateOfBirth` valid date

- `GET /api/gym-members/members/:id`
- `PUT /api/gym-members/members/:id`
- `DELETE /api/gym-members/members/:id`
  - Validate `:id` as positive integer

- `PUT /api/gym-members/members/:id`
  - Validate body only for allowed updatable fields (`name`, `email`, `gender`, `dateOfBirth`, `status`, `userId`)
  - `status` should be enum-compatible with Prisma member status

### 4) Membership Plan Module

- `POST /api/membership-plan/createPlan`
  - Validate body:
    - `name`: required, min length
    - `price`: required, numeric, `> 0`
    - `duration`: optional, integer, `> 0`

- `GET /api/membership-plan/getPlanById/:id`
- `PUT /api/membership-plan/updatePlan/:id`
- `DELETE /api/membership-plan/deletePlan/:id`
  - Validate `:id` as positive integer

- `PUT /api/membership-plan/updatePlan/:id`
  - Validate body for only allowed fields (`name`, `price`, `duration`)
  - Do not accept unknown properties

### 5) Future Modules (Membership / Payment / Attendance)

When these routes are implemented, enforce validation from day one:

- **Membership**: `memberId`, `planId`, `startDate`, `endDate`, `status`
- **Payment**: `subscriptionId`, `amount`, `method`, `status`, `paidAt`
- **Attendance**: `memberId`, `checkIn`, `checkOut`

### 6) Global Validation Rules (Recommended)

- Reject unknown body keys (`strict` schemas)
- Normalize strings (`trim`) before validation
- Return consistent `400` response shape for validation failures
- Keep validation in middleware (Zod) and run before controller logic
- Add separate schemas for `body`, `params`, and `query`

## Data Model Summary

Main Prisma models:

- `User` (roles: `ADMIN`, `STAFF`, `MEMBER`)
- `Member`
- `Plan`
- `Subscription`
- `Payment`
- `Attendance`
- `GymProfile`

Enum-driven statuses are defined in `prisma/schema.prisma`.

## Error Handling

- Invalid JSON body returns `400` with message `Invalid JSON in request body`.
- Unhandled errors pass through global `error.middleware.js` and return:

```json
{
  "success": false,
  "message": "<error message>"
}
```

## Notes

- `register` route currently has no auth/role guard in code.
- `gym` routes are using `router.use(...)` rather than explicit HTTP methods.
- Plan `update` and `delete` routes pass `roleMiddleware(["ADMIN"])`, which does not match the middleware signature and can reject all roles.
- Validation middleware exists but is currently commented out for member creation.
- `.env` values are not loaded automatically in current startup code (`dotenv` is installed but not imported in `src/server.js` / `src/app.js`), so export env vars in shell or add dotenv bootstrap before running.
