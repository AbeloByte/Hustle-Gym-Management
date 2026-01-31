# 🏋️ Gym Management System – Backend

A structured and scalable backend system for managing gym members, memberships, payments, attendance, and reports. This project follows a **clean, step-by-step feature implementation order** to ensure maintainability and growth.

---

## 🎯 Project Goal

To build a secure and scalable Gym Management System backend using **Node.js + Express**, following best practices in authentication, authorization, and modular architecture.

---

## 🧭 Feature Implementation Order (Very Important)

This order is intentional. Each feature depends on the previous one.

---

## 🥇 1. Project Setup & Core Infrastructure

> **Foundation of the entire system**

### Features

* Express application setup
* Clean folder structure (routes, controllers, services, models)
* Database connection (MongoDB / PostgreSQL)
* Environment configuration
* Global error handling

### Why first?

Without a solid foundation, all future features become hard to maintain and debug.

---

## 🥈 2. Authentication (Auth)

> **Identity of the system**

### Features

* User registration
* User login
* JWT token generation
* Password hashing

### Why second?

* Every secured request depends on authentication
* Authorization and roles rely on logged-in users

---

## 🔐 Authentication & Middleware Logic (How it works)

This backend uses a layered flow: **route → middleware → controller → service → database**.

### 1) Request flow

1. The client calls an endpoint like POST /api/auth/login.
2. The route file matches the URL and attaches any middleware.
3. Middleware runs first (token checks, role checks).
4. If middleware passes, the controller runs.
5. The controller calls the service for business logic.
6. The service talks to Prisma and returns data.

### 2) Authentication (JWT)

**Login** returns a signed JWT. The token contains user id and role.
**Protected routes** require the token in the Authorization header as:

Authorization: Bearer <JWT>

### 3) Middleware responsibilities

**Auth middleware** verifies the JWT and sets req.user.
If missing or invalid, it returns 401.

**Role middleware** checks req.user.role against allowed roles.
If role is not allowed, it returns 403.

### 4) Why register is protected

Register is restricted to ADMIN, so you must already be logged in as an admin to create new users. This prevents random public account creation.

### 5) Where the logic lives

- Routing: [src/routes/auth.routes.js](src/routes/auth.routes.js)
- Controller: [src/controllers/auth.controller.js](src/controllers/auth.controller.js)
- Service: [src/services/auth.service.js](src/services/auth.service.js)
- Auth middleware: [src/middleware/auth.middleware.js](src/middleware/auth.middleware.js)
- Role middleware: [src/middleware/role.middleware.js](src/middleware/role.middleware.js)
- Prisma client: [src/config/prisma.js](src/config/prisma.js)

---

## 🥉 3. Authorization (Roles & Permissions)

> **Access control**

### Roles

* **Admin** – full access
* **Staff** – operational tasks
* **Member** – personal access

### Examples

* Only admins can create membership plans
* Staff can mark attendance
* Members can view their own data

---

## 🏅 4. User Management

> **Core entity of the system**

### Features

* Create gym members
* View all users
* Update user information
* Assign or change roles

---

## 🏋️ 5. Membership Plans

> **Business logic begins here**

### Features

* Create membership plans
* Plan types (monthly, yearly)
* Price definition
* Duration handling

---

## 🧾 6. Membership Assignment

> **Heart of the system**

### Features

* Assign membership plans to users
* Calculate start and end dates
* Track membership status (active / expired)

---

## 💳 7. Payments

> **Money and transaction tracking**

### Features

* Record payments
* Payment history
* Link payments to memberships

---

## 📅 8. Attendance

> **Daily gym operations**

### Features

* Member check-in
* Attendance logs
* Staff-controlled attendance marking

---

## 📊 9. Reports & Dashboard

> **Business insights**

### Features

* Active members report
* Expired memberships report
* Monthly revenue summary

---

## 🚀 10. Advanced Features (Future Enhancements)

> **Scalability & automation**

### Features

* Auto-expire memberships (cron jobs)
* Email / SMS reminders
* Mobile application support
* Admin dashboard

---

## 🧱 Tech Stack (Suggested)

* **Backend**: Node.js, Express
* **Database**: MongoDB / PostgreSQL
* **Auth**: JWT, bcrypt
* **ORM/ODM**: Prisma / Mongoose
* **Scheduling**: node-cron

---

## 📌 Notes

* Follow the feature order strictly
* Each module should be independent and testable
* Keep business logic out of controllers

---

## 👤 Author

**Hebel**

---

✅ This README serves as both **documentation and a development roadmap**.
