## Endpoints (API)

The backend exposes the following REST API endpoints (all paths are prefixed with `/api`).

> **Authentication (JWT)**
>
> All protected endpoints require a valid JWT via:
>
> `Authorization: Bearer <access_token>`
>
> If the token is missing or invalid, the API returns **401**.

* **GET /api/health**
  * **Description:** Simple application health check to verify server status.
  * **Response:** `{ "status": "healthy", "message": "API running!" }`

* **POST /api/register**
  * **Description:** Registers a new user in the system.
  * **JSON Body:** `{ "username": string, "password": string }`
  * **Response:** `{ "user_id": number }`

* **POST /api/login**
  * **Description:** Authenticates an existing user and returns a JWT.
  * **JSON Body:** `{ "username": string, "password": string }`
  * **Response:** `{ "user_id": number, "access_token": string }`

* **POST /api/log**
  * **Description:** Creates a new caloric or workout entry for the authenticated user.
  * **Required Header:** `Authorization: Bearer <access_token>`
  * **JSON Body:** `{ "description": string, "category": "food" | "workout", "calories": number, "date"?: "YYYY-MM-DD" }`
  * **Response:** Returns the newly created log object.

* **GET /api/logs**
  * **Description:** Retrieves a list of logs associated with the authenticated user.
  * **Required Header:** `Authorization: Bearer <access_token>`
  * **Optional Query Parameters:**
    * `?category=food|workout` (filters logs by type)
    * `?date=YYYY-MM-DD` (filters logs by a specific day)
  * **Response:** Array of log objects.

* **GET /api/summary**
  * **Description:** Calculates the daily caloric aggregation for the authenticated user.
  * **Required Header:** `Authorization: Bearer <access_token>`
  * **Response:** `{ "food_calories": number, "workout_calories": number, "net_balance": number }`

* **DELETE /api/logs/<id>**
  * **Description:** Removes a specific log entry by its unique identifier.
  * **Required Header:** `Authorization: Bearer <access_token>`
  * **Authorization rules:**
    * **401** — token missing or invalid
    * **404** — log not found
    * **403** — trying to delete a log that does not belong to the authenticated user
  * **Successful Response:** `{ "message": "Deleted" }`

---