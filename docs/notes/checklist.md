# Checklist of Changes (REGISTER → AUTO-LOGIN)

## What was changed
- File: `frontend/src/components/Auth.tsx`
- File: `backend/app.py`

## Implemented changes
### frontend/src/components/Auth.tsx
- Credentials snapshot captured at the beginning of `handleSubmit`:
  - `const credentials = { username: username.trim(), password }`
- Single authentication flow:
  - If `mode === 'login'`: call `POST /api/login` using `credentials`
  - If `mode === 'register'`: call `POST /api/register` and then call `POST /api/login` using the **same** `credentials` snapshot
- Token persistence only after `/login`:
  - `localStorage.setItem('user_id', userId)`
  - `localStorage.setItem('access_token', accessToken)`
- Redirect/refresh after login:
  - `window.location.reload()`

### backend/app.py
- Username validation on registration:
  - Reject usernames containing spaces.
  - Example válido: `joaopedro`
  - Exemplo inválido: `joao pedro`
  - Returns **400** with message: `Username inválido. Remova espaços.`

