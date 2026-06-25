**JWT Auth & Authorization Test Plan**

### Scope

- JWT authentication (login + token issuance)
- Protected routes requiring Bearer token
- Authorization based on ownership (logs)
- Frontend token handling and request integration

### Preconditions

- Backend running on port 5000
- Frontend running on port 5173
- JWT secret configured
- At least two users created (User A and User B)

---

### 1. Login (JWT issuance)

- POST `/api/login`
- Expect: `user_id` + `access_token`
- Status: **200 OK**
- Token must be valid JWT

---

### 2. Unauthorized access

- Call protected endpoints without token:

  - `/api/summary`
  - `/api/logs`
  - `POST /api/log`
  - `DELETE /api/logs/<id>`
- Expect: **401 Unauthorized**

---

### 3. Authorized access

- Use valid User A token
- Call `/api/summary` and `/api/logs`
- Expect: **200 OK**
- Data must be scoped to User A only

---

### 4. Create log

- POST `/api/log` with User A token
- Body: description, category, calories, optional date
- Expect: **201 Created**
- Log belongs to User A

---

### 5. Authorization (DELETE forbidden)

- User B tries deleting User A’s log
- Expect: **403 Forbidden**
- Ownership enforcement validated

---

### 6. Owner deletion

- User A deletes own log
- Expect: **200 OK or 204 No Content**
- Log removed from listing

---

### 7. Frontend integration

- Login/Register via UI
- Token stored and reused automatically
- Requests include:

  - `Authorization: Bearer <token>`
- Users only see their own logs
- Logout clears session state

---

### Key validation points

- JWT correctly issued and validated
- Missing token → 401
- Wrong user action → 403
- Data isolation between users enforced
- Frontend correctly persists and sends token
