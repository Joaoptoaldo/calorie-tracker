
## Endpoints (API)

The backend exposes the following REST API endpoints (all paths are prefixed with `/api`):

* **GET /api/health**
  * **Description:** Simple application health check to verify server status.
  * **Response:** Status message confirming the backend is operational.

* **POST /api/register**
  * **Description:** Registers a new user in the system.

  * **JSON Body:** `{ "username": string, "password": string }`
  * **Response:** `{ "user_id": number }`

* **POST /api/login**
  * **Description:** Authenticates an existing user.
  * **JSON Body:** `{ "username": string, "password": string }`
  * **Response:** `{ "user_id": number }`

* **POST /api/log**
  * **Description:** Creates a new caloric or workout entry for the authenticated user.
  * **Required Header:** `X-User-Id: <number>`
  * **JSON Body:** `{ "description": string, "category": "food" | "workout", "calories": number, "date"?: "YYYY-MM-DD" }`
  * **Response:** Returns the newly created log object.

* **GET /api/logs**
  * **Description:** Retrieves a list of logs associated with the authenticated user.
  * **Required Header:** `X-User-Id: <number>`
  * **Optional Query Parameters:**
    * `?category=food|workout` (Filters logs by type)
    * `?date=YYYY-MM-DD` (Filters logs by a specific day)
  * **Response:** Array of log objects.

* **GET /api/summary**
  * **Description:** Calculates the daily caloric aggregation for the active user.
  * **Required Header:** `X-User-Id: <number>`
  * **Response:** `{ "food_calories": number, "workout_calories": number, "net_balance": number }`

* **DELETE /api/logs/<id>**
  * **Description:** Removes a specific log entry by its unique identifier.
  * **Required Header:** `X-User-Id: <number>`
  * **Response:** Confirmation status of the deletion.

---