# HustleGym Backend Implementation Progress

_Last updated: 2026-02-21_

This document captures the **current implementation state** of the `gymBack` backend based on the code that is present now.

---

## 1) Current Snapshot

### Implemented and wired under `/api`

- `auth` module (`/api/auth/*`)
- `gym profile` module (`/api/gym/*`)
- `members` module (`/api/gym-members/*`)
- `plans` module (`/api/membership-plan/*`)

### Present but not implemented / not wired

- Attendance (`src/controllers/attendance.controller.js`, `src/routes/attendance.routes.js`) → empty files
- Membership (`src/controllers/membership.controller.js`, `src/routes/membership.routes.js`) → empty files
- Payment (`src/controllers/payment.controller.js`, `src/routes/payment.routes.js`) → empty files
- Although Prisma models for `Subscription`, `Payment`, and `Attendance` exist, API logic for those domains is not implemented yet.

---

## 2) Runtime and Stack

- Runtime: Node.js + Express 5 (ES Modules)
- ORM/DB: Prisma + PostgreSQL
- Auth: JWT (`jsonwebtoken`)
- Password hashing: `bcryptjs`
- Validation: `zod`
- Dev server: `nodemon` via `npm run dev`

### Server bootstrap

- Entry point: `src/server.js`
- Express app setup: `src/app.js`
- API base mount: `/api`
- JSON body parsing enabled (`express.json()`)
- Invalid JSON payload handler exists (returns `400` for malformed JSON bodies)
- Global error middleware attached at app level

### Config notes (current state)

- `dotenv` is installed in dependencies but not loaded in startup files.
- Prisma singleton helper exists in `src/config/prisma.js`.
- Some services use the singleton (`auth.service.js`), while others instantiate `new PrismaClient()` directly (`member.service.js`, `plan.service.js`, `gym.service.js`).

---

## 3) API Routing (Current Wiring)

Main route registry (`src/routes/index.js`):

- `/api/auth` → `auth.routes.js`
- `/api/gym` → `gym.routes.js`
- `/api/gym-members` → `member.routes.js`
- `/api/membership-plan` → `plan.routes.js`

No route mounts currently exist for attendance, membership, or payment modules.

---

## 4) Authentication and Authorization Behavior

## JWT auth middleware (`auth.middleware.js`)

- Expects `Authorization: Bearer <token>`
- Verifies token using `process.env.JWT_SECRET`
- Adds decoded payload to `req.user`
- Returns `401` if token is missing/invalid/expired

## Role middleware (`role.middleware.js`)

- Signature expects variadic roles: `roleMiddleware("ADMIN", "STAFF")`
- Compares allowed roles against `req.user.role`
- Returns `403` for forbidden role

## Important current implementation details

- `POST /api/auth/register` is currently public (no auth/role middleware applied).
- `POST /api/auth/login` returns HTTP `201` instead of the more typical `200`.

---

## 5) Validation Layer (Zod)

Validation middleware exists and is used on several routes.

### Available schemas

- `auth.schema.js` → `registerSchema`, `loginSchema`, `changePasswordSchema`
- `member.schema.js` → create/update member schemas
- `gymInfo.schema.js` → gym profile payload schema
- `plan.schema.js` → create/update plan schemas

### Current behavior

- Validation middleware uses `schema.parse(req.body)` and returns `400` on parse errors.
- Error response shape includes `message: "Validation failed"` and an `errors` field.

### Schema/handler mismatches to note

- Register service expects `role`, but current register schema does not include `role`.
- Some status enums in validation allow values that do not fully match Prisma enums in all cases (for example member update schema includes `INACTIVE`, while member Prisma enum is `ACTIVE | SUSPENDED | EXPIRED`).

---

## 6) Domain-by-Domain Implementation Details

## A) Auth Module

### Endpoints

- `POST /api/auth/register`
  - Middleware: `validate(registerSchema)`
  - Controller: `register`
  - Service: `registerService`
  - Behavior:
    - Checks duplicate user by email
    - Hashes password with bcrypt (`saltRounds=10`)
    - Creates user record
    - Returns created user summary (`id`, `name`, `role`)

- `POST /api/auth/login`
  - Middleware: `validate(loginSchema)`
  - Controller: `login`
  - Service: `loginService`
  - Behavior:
    - Validates email/password credentials
    - Signs JWT with user `id` and `role` (`expiresIn: 1d`)
    - Returns token + user summary

## B) Gym Profile Module

### Endpoints

- `ALL /api/gym/register-gym` (implemented via `router.use`)
  - Middleware order: `validate(gymInfoSchema)` then controller
  - Current protection: no auth middleware applied
  - Behavior: creates new `GymProfile` record

- `GET /api/gym/gym-profile`
  - Middleware: `authMiddleware`, `roleMiddleware("ADMIN")`
  - Behavior: returns first `GymProfile` record

- `ALL /api/gym/update-gym-profile` (implemented via `router.use`)
  - Middleware order: `validate(gymInfoSchema)` → `authMiddleware` → `roleMiddleware("ADMIN")`
  - Behavior: loads first profile and updates by its id

### Service behavior

- `createGymProfile`: inserts a profile
- `getGymProfile`: fetches first profile
- `updateGymProfile`: fetches first profile, throws if missing, updates existing row

## C) Members Module

### Endpoints

- `POST /api/gym-members/members`
  - Middleware: auth + roles (`ADMIN`, `STAFF`) + validation
  - Behavior: creates member

- `GET /api/gym-members/members`
  - Middleware: auth + role (`ADMIN` only)
  - Behavior: list members ordered by newest `joinDate`

- `GET /api/gym-members/members/:id`
  - Middleware: auth + roles (`ADMIN`, `STAFF`)
  - Behavior: find member by id

- `PUT /api/gym-members/members/:id`
  - Middleware: auth + roles (`ADMIN`, `STAFF`) + validation
  - Behavior: partial update

- `DELETE /api/gym-members/members/:id`
  - Middleware: auth + roles (`ADMIN`, `STAFF`)
  - Behavior: soft delete by setting member `status` to `SUSPENDED`

### Service behavior details

- Accepts either `fullName` or `name` on create/update
- Create currently stores `dateOfBirth: null` (date persistence in create path not active)
- Phone uniqueness enforced at DB level; duplicate phone throws custom message
- Update parses `dateOfBirth` when provided and validates date conversion

## D) Plans Module

### Endpoints

- `POST /api/membership-plan/createPlan`
  - Middleware: auth + role (`ADMIN`) + validation
  - Behavior: create unique plan

- `GET /api/membership-plan/getAllPlans`
  - Middleware: auth
  - Behavior: list all plans

- `GET /api/membership-plan/getPlanById/:id`
  - Currently commented out in route file (not active)

- `PUT /api/membership-plan/updatePlan/:id`
  - Middleware: auth + role (`ADMIN`) + validation
  - Behavior: update existing plan

- `DELETE /api/membership-plan/deletePlan/:id`
  - Middleware: auth + role (`ADMIN`)
  - Behavior: hard delete by id, returns deleted plan name

### Service behavior details

- Create checks duplicate plan name first
- Update checks plan existence first
- Delete handles Prisma `P2025` (not found)
- Update function currently writes `name` and `price`; `duration`/`status` from schema are not applied in service logic

---

## 7) Prisma Data Model Coverage vs API Coverage

### Modeled in Prisma

- `User`
- `Member`
- `Plan`
- `Subscription`
- `Payment`
- `Attendance`
- `GymProfile`

### Exposed through implemented APIs today

- `User` (register/login)
- `Member` (CRUD + soft delete)
- `Plan` (create/list/update/delete)
- `GymProfile` (create/get/update)

### Not yet exposed through API today

- `Subscription`
- `Payment`
- `Attendance`

---

## 8) Error Handling Status

- Global error middleware exists and returns JSON with `success: false` and message.
- Controller error handling is mixed:
  - Some controllers use `next(error)` and global middleware.
  - `gym.controller.js` handles errors inline with direct `500` responses.
- This leads to non-uniform error response formats across modules.

---

## 9) Implementation Gaps / In-Progress Items

1. Implement attendance, membership, and payment controllers/routes/services.
2. Mount attendance/membership/payment routes in `src/routes/index.js`.
3. Make HTTP method usage explicit (`router.post/get/put`) instead of broad `router.use` where not intended.
4. Align validation schemas with service requirements and Prisma enums:
   - Add `role` to register validation if registration keeps requiring role.
   - Reconcile member status validation values with Prisma enum.
5. Normalize response and error payload structures across all controllers.
6. Standardize Prisma client usage to singleton config module.
7. Load environment variables in startup path (dotenv bootstrap).
8. Expose (or intentionally omit) `getPlanById` endpoint consistently.
9. Add tests for auth/member/plan critical flows.

---

## 10) Practical Readiness Summary

- The backend is in a **working in-progress state** with functional auth, member, gym profile, and plan flows.
- Core architecture (route → controller → service + Prisma) is established.
- Major next phase is to complete subscription/payment/attendance flows and improve consistency/hardening for production readiness.
