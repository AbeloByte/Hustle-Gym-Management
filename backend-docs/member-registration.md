# Member Registration Flow

This document explains how the member registration process works in the backend and what the frontend must send.

---

## 1. Endpoint & Auth

- **URL**: `POST /api/gym-members/members`
- **Full local URL**: `http://localhost:5000/api/gym-members/members`
- **Auth required**:
    - User must be logged in.
    - `role` in JWT must be `ADMIN` or `STAFF`.
- **Auth mechanism**:
    - Backend reads the JWT from the `token` cookie.
    - Frontend **must** send cookies: `credentials: "include"` (fetch) or `withCredentials: true` (Axios).

---

## 2. Required & Optional Fields

Validation is in `createMemberSchema`.

### Required (for basic registration)

You must send at least:

- `fullName` **or** `name` (string, min length 2)
- `phone` (string, min length 7)
- `gender` (string; backend uppercases and expects `MALE` or `FEMALE`)

Minimal example payload (no plan):

````json
{
  "fullName": "John Doe",
  "phone": "0712345678",
  "gender": "male",
  "email": "john@example.com",
  "dateOfBirth": "1995-06-15"
}
``

### Optional fields

- `email` — valid email format if present.
- `dateOfBirth` — date string (e.g. `"2000-01-01"`).
- `joinDate` — date string; used as membership start date if a plan is selected.
- `status` — member status, defaults to `ACTIVE` if omitted.
  - Allowed: `ACTIVE`, `SUSPENDED`, `EXPIRED`.

---

## 3. Adding Plan & Payment During Registration

If the frontend also wants to assign a membership plan and create a payment during registration, send these extra fields:

- `planId` — number or numeric string (the ID of an existing plan).
- `joinDate` — membership start date; if missing, backend uses the current date.
- `paymentMethod` — one of:
  - `CASH`
  - `ONLINE`
  - `BANK_TRANSFER`
- `paymentStatus` — one of:
  - `PAID`
  - `PENDING` (default if omitted)
  - `FAILED`

Example payload with plan & payment:

```json
{
  "fullName": "Jane Doe",
  "phone": "0712345679",
  "gender": "FEMALE",
  "email": "jane@example.com",
  "dateOfBirth": "1998-04-10",
  "joinDate": "2026-03-07",
  "planId": 3,
  "paymentMethod": "CASH",
  "paymentStatus": "PAID"
}
````

Backend behavior when `planId` is provided:

1. Creates the `member` record.
2. Finds the `plan` by `planId`.
3. Creates a `subscription` for that member:
    - `startDate`: `joinDate` or current date.
    - `endDate`: `startDate + plan.duration` days.
    - `status`: `ACTIVE`.
4. Creates a `payment` record:
    - `amount`: `plan.price`.
    - `method`: normalized from `paymentMethod`.
    - `status`: from `paymentStatus` (`PAID`, `PENDING`, `FAILED`).
    - `paidAt`: set to date if `status` is `PAID`, otherwise `null`.

The response includes the created member plus their subscriptions and payments.

---

## 4. Getting `planId` Values on the Frontend

To populate the plan dropdown and get valid `planId` values:

- **Endpoint**: `GET /api/membership-plan/getAllPlans`
- **Full URL**: `http://localhost:5000/api/membership-plan/getAllPlans`
- Requires the user to be logged in (reads `token` cookie).

Use the returned list (each item has an `id`) to fill a dropdown and send the selected `id` as `planId`.

---

## 5. Frontend Flow Summary

1. **Login**
    - Call `/api/auth/login` (existing auth flow) so backend sets the `token` cookie.

2. **Load New Member Page**
    - Optionally call `GET /api/membership-plan/getAllPlans` with cookies to list plans.

3. **Form fields**
    - Name → `fullName`.
    - Phone → `phone`.
    - Gender → `gender` (`MALE`/`FEMALE` or lowercase; backend uppercases).
    - Email (optional) → `email`.
    - Date of birth (optional) → `dateOfBirth`.
    - Join date (optional) → `joinDate`.
    - Plan (optional) → `planId`.
    - Payment method (optional) → `paymentMethod`.
    - Payment status (optional) → `paymentStatus`.

4. **Submit request**

Example using `fetch` from a React frontend:

```js
const res = await fetch("http://localhost:5000/api/gym-members/members", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // send cookies (JWT token)
    body: JSON.stringify({
        fullName,
        phone,
        gender,
        email,
        dateOfBirth,
        joinDate,
        planId,
        paymentMethod,
        paymentStatus,
    }),
});

if (!res.ok) {
    const error = await res.json();
    // Show validation/auth error
} else {
    const member = await res.json();
    // Show success / redirect / update UI
}
```

This is all you need on the frontend to integrate with the current member registration API.

---

## 6. Single Modal vs Separate Pages

From the backend point of view, **everything can be done in one request**, so:

- A **single modal form** can collect:
    - Basic member info (`fullName`, `phone`, `gender`, etc.).
    - Optional membership info (`planId`, `joinDate`).
    - Optional payment info (`paymentMethod`, `paymentStatus`).
    - Then submit **one POST** to `/api/gym-members/members`.

You **do not need** a separate page just for subscription or payment.

However, you might still choose separate steps/pages for UX reasons:

- If you want a simple "Quick add member" modal with only basic fields,
  and a more detailed "Manage membership" page later.
- If you want a wizard-like flow: Step 1 (Member info) → Step 2 (Plan) → Step 3 (Payment),
  but still submit all data together in one final POST.

Backend does not care if the data comes from one modal, a full page, or a multi-step wizard —
as long as the **final request body** matches the fields described above.

---

## 7. How Subscription Is Handled in the Backend

When you send `planId` in the member registration request, the backend automatically handles the subscription logic inside `createMemberService`:

1. **Create member first**

- A `member` row is created with the basic info you sent.

2. **Fetch the plan**

- Backend calls `prisma.plan.findUnique({ where: { id: Number(planId) } })`.
- If the plan does not exist, it throws `"Plan not found"` and the whole request fails (no member + subscription created).

3. **Determine subscription period**

- `startDate`:
    - If you sent `joinDate`, it uses that (converted to a `Date`).
    - Otherwise, it uses the current date/time (`new Date()`).
- `endDate`:
    - Starts from `startDate`.
    - Adds `plan.duration` days (e.g., 30-day plan → 30 days added).

4. **Create subscription row**

- Calls `prisma.subscription.create` with:
    - `memberId`: the newly created member's id.
    - `planId`: the provided plan id.
    - `startDate`: as computed above.
    - `endDate`: as computed above.
    - `status`: always set to `"ACTIVE"` at creation.

5. **Link payment to subscription**

- Immediately after creating the subscription, the backend creates a `payment` row with:
    - `subscriptionId`: id of the subscription created in step 4.
    - `amount`: `plan.price`.
    - `method`: normalized `paymentMethod` (maps variants like `BANK TRANSFER` / `ONLINE` → `ONLINE`, defaults to `CASH`).
    - `status`: normalized `paymentStatus` (`PAID`, `PENDING`, or `FAILED`; defaults to `PENDING`).
    - `paidAt`:
    - If status is `PAID`, set to `joinDate` (if provided) or the current time.
    - Otherwise, `null`.

6. **What the API returns**

- After all this, the service returns the member with related data:
    - `member`
    - `member.subscriptions[]`
    - Each subscription includes its `payments[]`.
- So the frontend can immediately see the active subscription and its payment status in the create response.

> Note: Right now, subscription creation only happens at registration time when `planId` is provided. Any future features like renewing/upgrading a plan would use separate endpoints and logic.

---

## 8. Detailed End-to-End Flow (Request → DB)

This is the full sequence from a frontend request to how data is stored.

### 8.1 Request comes in

1. Frontend sends `POST /api/gym-members/members` with JSON body.
2. Middlewares run in order:
    - `authMiddleware` → checks `token` cookie, decodes JWT, sets `req.user`.
    - `roleMiddleware("ADMIN", "STAFF")` → ensures `req.user.role` is allowed.
    - `validate(createMemberSchema)` → runs Zod validation on `req.body`.
3. If all succeed, `createMember` controller is called with `req.body` as `memberData`.

### 8.2 Normalization & business logic

Inside `createMemberService(memberData)`:

1. **Resolve name**
    - If `fullName` is missing but `name` is present, use `name` as full name.
    - If both are missing → throw error.

2. **Required checks**
    - Ensures `resolvedFullName`, `phone`, and `gender` are present.

3. **Normalize enums**
    - `gender` → `gender.toUpperCase()` (`male` → `MALE`).
    - `status` → uppercase (or default `ACTIVE`).
    - `paymentStatus` → uppercase (or default `PENDING`).
    - `paymentMethod`:
        - Defaults to `CASH`.
        - If `BANK TRANSFER` or `ONLINE` is sent, maps to `ONLINE`.

4. **Parse dates**
    - `dateOfBirth` (if present) → `new Date(dateOfBirth)`.
    - `joinDate` (if present) → `new Date(joinDate)` later used for subscription.

### 8.3 DB writes when no plan is provided

If **no `planId`** is sent:

1. **Insert into `Member` table**
    - Fields written (simplified):
        - `id`: auto-generated integer.
        - `fullName`: resolved full name.
        - `phone`: string.
        - `email`: string or `null`.
        - `gender`: `MALE` or `FEMALE`.
        - `dateOfBirth`: date or `null`.
        - `status`: `ACTIVE` (default) or value you sent.
    - No subscription or payment rows are created in this branch.

2. **Response**
    - Backend fetches the created member (with `subscriptions` relation, which will be empty) and returns it.

### 8.4 DB writes when `planId` is provided

If a valid `planId` is sent, these tables are involved:

1. **`Member` table**
    - Same insert as in 8.3.

2. **`Plan` table** (read only in this flow)
    - Query: find plan by `id = planId`.
    - Uses fields like:
        - `id`: integer.
        - `name`: plan name (for UI only, not changed here).
        - `duration`: number of days.
        - `price`: numeric price.

3. **`Subscription` table**
    - Inserted with something like:

        ```ts
        subscription = prisma.subscription.create({
            data: {
                memberId: member.id,
                planId: plan.id,
                startDate: start,
                endDate: end,
                status: "ACTIVE",
            },
        });
        ```

    - Conceptually, stored fields:
        - `id`: auto-generated subscription id.
        - `memberId`: FK → Member.id.
        - `planId`: FK → Plan.id.
        - `startDate`: Date.
        - `endDate`: Date.
        - `status`: enum (`ACTIVE`, `SUSPENDED`, `EXPIRED`, etc. as defined in schema).

4. **`Payment` table**
    - Right after subscription creation:

        ```ts
        prisma.payment.create({
            data: {
                subscriptionId: subscription.id,
                amount: plan.price,
                method: normalizedPaymentMethod, // CASH or ONLINE
                status: normalizedPaymentStatus, // PAID/PENDING/FAILED
                paidAt: normalizedPaymentStatus === "PAID" ? someDate : null,
            },
        });
        ```

    - Conceptually, stored fields:
        - `id`: auto-generated payment id.
        - `subscriptionId`: FK → Subscription.id.
        - `amount`: numeric.
        - `method`: enum (`CASH`, `ONLINE`).
        - `status`: enum (`PAID`, `PENDING`, `FAILED`).
        - `paidAt`: Date or `null`.

5. **Final response shape**
    - `createMemberService` finishes by doing:

        ```ts
        return prisma.member.findUnique({
            where: { id: member.id },
            include: {
                subscriptions: {
                    include: { payments: true },
                },
            },
        });
        ```

    - So the JSON sent back to the frontend looks roughly like:

        ```json
        {
            "id": 1,
            "fullName": "Jane Doe",
            "phone": "0712345679",
            "gender": "FEMALE",
            "status": "ACTIVE",
            "subscriptions": [
                {
                    "id": 10,
                    "memberId": 1,
                    "planId": 3,
                    "startDate": "2026-03-07T00:00:00.000Z",
                    "endDate": "2026-04-06T00:00:00.000Z",
                    "status": "ACTIVE",
                    "payments": [
                        {
                            "id": 100,
                            "subscriptionId": 10,
                            "amount": 5000,
                            "method": "CASH",
                            "status": "PAID",
                            "paidAt": "2026-03-07T00:00:00.000Z"
                        }
                    ]
                }
            ]
        }
        ```

This gives you the **full picture**: what the frontend sends, how the backend transforms it, which tables are written, and what JSON comes back.
