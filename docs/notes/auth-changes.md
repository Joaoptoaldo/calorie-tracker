# Single-flight + Stability (REGISTER → AUTO-LOGIN)

## Summary
This note documents the changes made to make the authentication pipeline **more stable** by preventing **double submit** and ensuring the REGISTER → auto-login flow runs as a **single-flight** (one execution per user interaction).

## Affected file
- `frontend/src/components/Auth.tsx`

## Implemented changes
### 1) Credentials snapshot (from the previous step)
- Credentials are captured at the beginning of `submit`:
  - `const credentials = { username: username.trim(), password }`

Purpose: avoid “stale state” during async requests.

### 2) Single-flight lock
- Added:
  - `const inFlightRef = useRef(false);`
- At the start of `submit`:
  - If `inFlightRef.current` is `true`, return immediately and **do not start another execution**.

This removes the dependency on only `loading`/re-render to control concurrency.

### 3) Flow remains “token comes exclusively from LOGIN”
- If `mode === 'login'`:
  - call `/login`, save `access_token` and `user_id`, then `window.location.reload()`.
- If `mode === 'register'`:
  - call `/register`
  - then call `/login` **using the same credentials snapshot**
  - save the token **only** from the `/login` response

## Concurrency guarantees
- **One execution at a time** for `handleSubmit` while the pipeline is running (single-flight).
- Prevents multiple concurrent requests from rapid clicking / pressing Enter.

## Operational success criteria
- Register no longer causes intermittent “missing token” errors.
- Double submit does not trigger multiple pipelines.
- The token continues to be obtained exclusively from the automatic login.

