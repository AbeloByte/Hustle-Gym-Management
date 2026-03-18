# System Users & Roles (Backend & Frontend Access)

This document explains how roles (`ADMIN`, `STAFF`, `MEMBER`) work in the backend and how the **frontend** can use them for role-based access.

---

## 1. Available Roles

Defined in Prisma enum `Role`:

- `ADMIN`
- `STAFF`


Every `User` row has a `role` field:

```prisma
model User {
  id       String  @id @default(uuid())
  name     String
  email    String  @unique
  password String
  role     Role
  // ...
}
```

---

## 2. How Backend Uses Roles

### 2.1 Authentication

- When a user logs in via `POST /api/auth/login`:
  - Backend validates credentials.
  - Creates a JWT containing (at least) `id`, `email`, `role`.
  - Sets cookie: `token=<JWT>`.

- `authMiddleware`:
  - Reads `token` from cookies.
  - Verifies JWT with `JWT_SECRET`.
  - Sets `req.user = decodedToken`.

### 2.2 Role middleware

Backend uses `roleMiddleware` on routes:

```js
router.post(
  "/members",
  authMiddleware,
  roleMiddleware("ADMIN", "STAFF"),
  createMember,
);
```

`roleMiddleware("ADMIN", "STAFF")` means:

- If `!req.user` → `401 Unauthorized`.
- If `req.user.role` is **not** in `("ADMIN", "STAFF")` → `403 Forbidden`.
- Otherwise, the request continues.

Backend is therefore responsible for **hard security**: even if frontend hides a button, the backend still enforces roles.

---

## 3. How Frontend Gets the Current User & Role

To implement role-based UI, the frontend needs to know the logged-in user and their role.

### 3.1 Login response

On successful login (`POST /api/auth/login`):

- Backend sets the `token` cookie.
- And returns:

```json
{
  "user": {
    "id": "<uuid>",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

On the frontend you should:

1. Call login with `credentials: "include"` or `withCredentials: true` so cookies are stored.
2. Store the returned `user` object in **global state**:
   - e.g. React Context, Redux, Zustand, or simply `useState` in a top-level component.

### 3.2 Current user endpoint (optional)

If you expose something like `GET /api/auth/me` (current backend uses `getCurrentUserController`), you can:

- Use it on app load to:
  - Check if the user is still logged in.
  - Refresh their role in state.

---

## 4. Role-Based Access in the Frontend

On the frontend, you do **not** re-check the JWT; you just use the `user.role` that backend already trusted.

### 4.1 Basic patterns

Assume you have a `currentUser` object in state:

```ts
const currentUser = {
  id: "...",
  name: "...",
  email: "...",
  role: "ADMIN" // or STAFF / MEMBER
};
```

You can create simple helpers:

```ts
const isAdmin = currentUser?.role === "ADMIN";
const isStaff = currentUser?.role === "STAFF";
const isMember = currentUser?.role === "MEMBER";

const isAdminOrStaff = currentUser && ["ADMIN", "STAFF"].includes(currentUser.role);
```

Use these in your components to:

- Show/hide navigation items.
- Disable or hide buttons (e.g. "Create Plan", "Register Member").
- Redirect away from restricted pages.

### 4.2 Example: Protecting a route (React Router)

```tsx
function ProtectedRoute({ allowedRoles, children }) {
  const { currentUser } = useAuthContext();

  if (!currentUser) {
    // Not logged in → send to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Logged in but wrong role → send to unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Usage
<Route
  path="/admin/members"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
      <MembersPage />
    </ProtectedRoute>
  }
/>
```

### 4.3 Example: Controlling buttons / sections

```tsx
function MembersPage() {
  const { currentUser } = useAuthContext();
  const canManageMembers = ["ADMIN", "STAFF"].includes(currentUser?.role ?? "");

  return (
    <div>
      <h1>Members</h1>

      {canManageMembers && (
        <button onClick={openCreateMemberModal}>
          Add New Member
        </button>
      )}

      {/* member list etc. */}
    </div>
  );
}
```

---

## 5. How Frontend and Backend Work Together for RBAC

- **Frontend responsibility**:
  - Read `user.role` from login / `/auth/me`.
  - Use it to control **UX**:
    - What routes are visible.
    - Which menu items, buttons, and forms are shown.
    - Friendly messages like "You don't have access to this section".

- **Backend responsibility**:
  - Always enforce `authMiddleware` + `roleMiddleware` on protected routes.
  - Never trust the frontend alone.

Even if someone bypasses the frontend (e.g. calling the API with Postman) and hits a restricted endpoint:

- `authMiddleware` will reject missing/invalid JWT.
- `roleMiddleware` will reject users whose `role` is not in the required list.

This gives you **defense in depth**:

- Frontend: better user experience and less confusion.
- Backend: real security.

---

## 6. Where to Use Roles in This Project

Some examples mapped to your existing routes:

- `ADMIN` only:
  - Create / update / delete membership plans.
  - Gym configuration pages.

- `ADMIN` or `STAFF`:
  - Member registration and management (`/api/gym-members/members`).
  - Viewing member list and member details.

- `MEMBER`:
  - (Future) Self-service portal: view their own membership, payments, attendance.

On the frontend, mirror these rules by checking `currentUser.role` in:

- Navigation (sidebar/topbar items).
- Page-level route guards (ProtectedRoute).
- Component-level conditional rendering (buttons, forms, sections).

This is all you need to **access and use roles from the frontend** while keeping the backend as the source of truth for permissions.
