# ADL Backend

Express API for the ADL site. It stores people and news in MongoDB, accepts admin uploads, serves files from `uploads/`, and can also serve a built frontend from `backend/public/` in production.

## Requirements

- Node.js 20 or newer
- npm
- MongoDB running locally, or Docker if you want to use the included compose file

## Setup

From the repository root:

```powershell
npm install
```

If PowerShell blocks `npm` with an execution-policy error, use `npm.cmd` for any `npm` command in this README:

```powershell
npm.cmd install
```

Create the backend environment file:

```powershell
Copy-Item backend\.env.example backend\.env
```

Edit `backend\.env`:

```env
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/adl
ADMIN_KEY=change_this_to_a_private_admin_key
ADMIN_SESSION_SECRET=replace_with_a_long_random_secret
```

Admin writes are protected by a signed admin session cookie. The frontend grants that session by calling `POST /api/grant-admin` after the hidden key sequence is entered.

`ADMIN_SESSION_SECRET` signs the admin session cookie. If it is omitted, `ADMIN_KEY` is used as the signing secret.

`ADMIN_KEY` is an optional direct API fallback. When it is configured, API clients can access protected routes by sending `x-admin-key: <ADMIN_KEY>`. Without an admin session or a matching `x-admin-key`, protected routes return `403`.

## Start MongoDB

Use Docker from the repository root:

```powershell
npm run db:up
```

This starts MongoDB on `mongodb://127.0.0.1:27017/adl`.

Useful database commands:

```powershell
npm run db:logs
npm run db:down
```

If you already have MongoDB running somewhere else, update `MONGODB_URI` in `backend\.env` instead.

## Run The Backend

Development mode with auto-restart:

```powershell
npm run dev --workspace backend
```

Equivalent root shortcut:

```powershell
npm run dev:backend
```

Production-style start:

```powershell
npm run start --workspace backend
```

For example, if PowerShell blocks `npm`, run the same backend commands with `npm.cmd`:

```powershell
npm.cmd run dev --workspace backend
npm.cmd run start --workspace backend
```

The API listens at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

## Seed People

With MongoDB running:

```powershell
npm run seed --workspace backend
```

Equivalent root shortcut:

```powershell
npm run seed
```

This replaces the people collection with the sample records in `backend/scripts/seedPeople.js`.

## API Routes

Public routes:

- `GET /api/health`
- `GET /api/session`
- `GET /api/news`
- `GET /api/news/:slug`
- `GET /api/people`
- `GET /api/people/:id`
- `POST /api/grant-admin`
- `POST /api/logout`

Protected routes:

- `GET /api/admin/session`
- `POST /api/people`
- `PUT /api/people/:id`
- `DELETE /api/people/:id`
- `POST /api/admin/news`
- `POST /api/admin/news/preview`
- `POST /api/admin/news/assets/image`
- `POST /api/admin/people/assets/avatar`
- `POST /api/admin/people/assets/cover`

Protected requests must include the admin session cookie created by `POST /api/grant-admin`, or a valid `x-admin-key` header when `ADMIN_KEY` is configured.

Clearing browser site/session data removes the admin session cookie. `POST /api/logout` also clears it, so a Google logout flow can revoke admin access by calling that endpoint when it clears the user's session.

## Frontend Integration

During local development, run the frontend Vite server on port `5173`. The frontend proxies `/api` and `/uploads` to this backend on port `4000`.

For a single-service production build, build the frontend and copy `frontend/dist/` into `backend/public/`. The included root `Dockerfile` already does this.
