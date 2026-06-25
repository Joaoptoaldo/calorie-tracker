## Environment Variables & Configuration

The application automatically switches between local development and production environments based on environment variables:

### Backend (.env)
* `DATABASE_URL`: if present, the backend connects to the remote PostgreSQL database. If absent, it automatically falls back to the local SQLite database at `instance/diary.db`.
* `JWT_SECRET`: secret key used to sign and validate JWT access tokens.
* `JWT_ALGORITHM`: JWT signing algorithm (defaults to `HS256`).
* `JWT_EXP_MINUTES`: token expiration time in minutes (defaults to `30`).

### Frontend (Environment Variables)
* `VITE_API_URL`: points to `http://localhost:5000/api` during local development and to the live API URL in production.


---

## How to Run Locally with Docker

Ensure you have **Docker** and **Docker Compose** installed, then run the following command in the project root directory:

```bash
docker-compose up --build
```
---