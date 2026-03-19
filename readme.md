# 🏋️ Gym Management System – Backend

A robust, scalable backend API for managing a modern gym. It handles members, subscriptions, payments, attendance, and role-based access control. Built with **Node.js**, **Express**, and **PostgreSQL (via Prisma)**.

## 🚀 Features

-   **🔐 Authentication & Authorization**: Secure user registration and login using JWT. Role-based access control (RBAC) ensuring data security for Admins, Staff, and Members.
-   **👥 Member Management**: Complete CRUD operations for gym members, including tracking their status (Active, Suspended, Expired).
-   **📋 Plan Management**: Create and manage flexible membership plans with different durations and pricing.
-   **💳 Subscription & Payments**: Handle member subscriptions and track payment status (Paid, Pending, Failed).
-   **📅 Attendance Tracking**: Monitor member check-ins and attendance history.
-   **🏢 Gym Profile**: Manage gym branding and contact details.
-   **✅ Data Validation**: Strict payload validation using **Zod** to ensure data integrity.
-   **🧪 Testing included**: Integration tests setup with **Vitest**.

## 🛠️ Tech Stack

-   **Runtime Environment**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: [PostgreSQL](https://www.postgresql.org/)
-   **ORM**: [Prisma](https://www.prisma.io/)
-   **Authentication**: JSON Web Tokens (JWT) & bcryptjs
-   **Validation**: [Zod](https://zod.dev/)
-   **Testing**: [Vitest](https://vitest.dev/) & Supertest
-   **Utilities**: ID generation with `nanoid`, Environment management with `dotenv`

## ▶️ How to Run the Project

From the project root (gymBack/):

1. Install dependencies:
    ```bash
    npm install
    ```
2. Create a .env file in the root (see details below) and make sure DATABASE_URL points to a running PostgreSQL database.
3. Apply database migrations:
    ```bash
    npx prisma migrate dev
    ```
4. Start the development server:
    ```bash
    npm run dev
    ```
    The API will be available at http://localhost:3000 (or the PORT you configured).
5. (Optional) Run tests:
    ```bash
    npm test
    ```

## 📂 Project Structure

```bash
gymBack/
├── prisma/                 # Database schema and migrations
│   └── schema.prisma       # Prisma schema file
├── src/
│   ├── config/             # Configuration files (DB connection, etc.)
│   ├── controllers/        # Request handlers (logic orchestration)
│   ├── middleware/         # Express middleware (Auth, Error, Validation)
│   ├── routes/             # API Route definitions
│   ├── services/           # Business logic layer
│   ├── utils/              # Utility functions
│   ├── validation/         # Zod schemas for input validation
│   ├── app.js              # Express app setup
│   └── server.js           # Server entry point
├── tests/                  # Integration tests
└── package.json            # Project dependencies and scripts
```

## ⚡ Getting Started

Follow these steps to set up the project locally.

### Prerequisites

-   **Node.js** (v18 or higher recommended)
-   **PostgreSQL** installed and running

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository_url>
    cd gymBack
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    PORT=3000
    # Update with your local PostgreSQL credentials
    DATABASE_URL="postgresql://request_user:request_password@localhost:5432/gym_db?schema=public"
    JWT_SECRET="your_super_secret_key_change_this"
    ```

4.  **Database Setup**
    Run Prisma migrations to create the tables in your database:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the Server**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000` (or your defined PORT).

### 🧪 Running Tests

To run the test suite:
```bash
npm test
```

## 📡 API Endpoints Overview

All routes are prefixed with `/api`.

| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/auth/register` | Register a new user |
| | POST | `/auth/login` | Login and receive a JWT |
| | GET | `/auth/me` | Get current user info |
| **Members** | GET | `/members` | List all members |
| | POST | `/members` | Register a new member |
| | GET | `/members/:id` | Get member details |
| **Plans** | GET | `/plans` | Get all membership plans |
| | POST | `/plans` | Create a new plan (Admin) |
| **Gym** | GET | `/gym` | Get gym profile info |
| | PUT | `/gym` | Update gym profile |
| **Payment** | POST | `/payments` | Record a payment |
| **Attendance** | POST | `/attendance/check-in`| Member check-in |

*(Note: This is a high-level summary. Please refer to the route files or API documentation for full details.)*

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
**Happy Coding!** 🏋️‍♂️
