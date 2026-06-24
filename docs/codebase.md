
## File Descriptions & Design Choices

To fulfill the requirements of this project, specific logic was implemented across both environments. Below is a detailed breakdown of the core files developed:

### Backend
* **`backend/app.py`**: Serves as the main entry point for the Flask server. It initializes the app, configures CORS, and defines the REST API endpoints (`/api/register`, `/api/login`, `/api/logs`, and `/api/summary`). It handles incoming JSON payloads, performs user authentication, and bridges data communication with the database layers.
* **`backend/models.py`**: Contains the SQLAlchemy database models. It defines the `User` schema (storing hashed credentials) and the `Log` schema (storing text descriptions, types like food/workout, and calorie counts). It also implements helper methods like `to_dict()` for seamless JSON serialization and password verification methods using Werkzeug.

### Frontend
* **`frontend/src/App.tsx`**: The core layout controller and authentication gate. It manages the global state of the currently logged-in user and determines whether to render the authentication forms or the protected dashboard view.
* **`frontend/src/components/Dashboard.tsx`**: The primary user interface hub. It triggers parallel asynchronous fetch requests to backend endpoints when mounted, calculated metrics, and orchestrates data rendering via Recharts components.
* **`frontend/src/components/LogForm.tsx`**: A dynamic form component handling controlled inputs for logging daily food entries or workout routines. It features front-end input validation before firing POST requests to the API.

### Design Choices
* **Decoupled Architecture:** Instead of using Flask's native Jinja template engine, a decoupled React/Flask architecture was chosen to deliver a fluid, native desktop-like Single Page Application (SPA) user experience with instant UI updates without whole-page reloads.
---