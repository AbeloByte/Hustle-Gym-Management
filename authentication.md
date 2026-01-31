# Authentication & Middleware Logic

This backend uses a layered flow: **route → middleware → controller → service → database**.

## Request flow

1. The client calls an endpoint like `POST /api/auth/login`.
2. The route file matches the URL and attaches any middleware.
3. Middleware runs first (token checks, role checks).
4. If middleware passes, the controller runs.
5. The controller calls the service for business logic.
6. The service talks to Prisma and returns data.

## Authentication (JWT)

**Login** returns a signed JWT. The token contains user id and role.

Protected routes require the token in the `Authorization` header as:

```
Authorization: Bearer <JWT>
```

## Middleware responsibilities

**Auth middleware** verifies the JWT and sets `req.user`. If missing or invalid, it returns 401.

**Role middleware** checks `req.user.role` against allowed roles. If role is not allowed, it returns 403.

## Why register is protected

Register is restricted to `ADMIN`, so you must already be logged in as an admin to create new users. This prevents random public account creation.

## Where the logic lives

- Routing: src/routes/auth.routes.js
- Controller: src/controllers/auth.controller.js
- Service: src/services/auth.service.js
- Auth middleware: src/middleware/auth.middleware.js
- Role middleware: src/middleware/role.middleware.js
- Prisma client: src/config/prisma.js
