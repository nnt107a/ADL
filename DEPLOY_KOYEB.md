# Deploy to Koyeb (ADL monorepo)

This repo is a **single React + Express + MongoDB** app.
The frontend currently calls the API using **relative URLs** like `/api/news`, so the simplest deployment is to run **one service** where Express serves the built React app and also handles `/api/*`.

## 0) What you need

- A MongoDB connection string (recommended: **MongoDB Atlas**)
- A Koyeb account + your repo pushed to GitHub

## 1) Prepare MongoDB (recommended: Atlas)

1. Create a cluster on MongoDB Atlas.
2. Add a database user and allow network access.
3. Copy the connection string and set it as:

- `MONGODB_URI=mongodb+srv://.../adl?retryWrites=true&w=majority`

> Koyeb doesn’t automatically provide MongoDB. You can run Mongo in Koyeb as a separate container, but for “deploy it now” Atlas is usually faster.

## 2) Deploy as ONE Koyeb Web Service (recommended)

This repo includes a root Dockerfile that:
- builds the React app (`frontend`) into `backend/public`
- runs the Express API (`backend`) and serves both the SPA and `/api/*`

### Create the service

1. In Koyeb Dashboard: **Create App** → **Web Service**.
2. Choose **GitHub** as the source and select this repository.
3. Build method: **Dockerfile** (Koyeb should detect the `Dockerfile` at repo root).
4. **Exposed port**: set to `4000`.
   - If Koyeb asks for a port, use `4000`.
   - Your server reads `process.env.PORT`, and Koyeb will set it to the exposed port.

### Set environment variables

In the service “Environment variables” section:

- `MONGODB_URI` = your Atlas connection string
- `CLIENT_ORIGIN` = your Koyeb public URL (example: `https://<your-app>.koyeb.app`)
- `ADMIN_KEY` (optional) = a secret string to protect admin routes
- `ADMIN_ALLOWED_IPS` (optional) = comma-separated list of IP addresses allowed to access admin routes and perform mutations

Notes:
- If you do **not** set `ADMIN_KEY`, admin routes are not blocked.
- If you do **not** set `ADMIN_ALLOWED_IPS`, IP-based access control is disabled (only API key auth applies).
- With the one-service approach, `CLIENT_ORIGIN` is mostly for CORS; setting it to your Koyeb URL is a safe default.

### IP-Based Authentication (Koyeb)

Koyeb automatically adds the `X-Forwarded-For` header with the real client IP. The system extracts this header to validate IPs against the `ADMIN_ALLOWED_IPS` whitelist.

**Example**:
```bash
ADMIN_ALLOWED_IPS=203.0.113.10,203.0.113.20
```

Test your IP is working:
```bash
curl https://<your-app>.koyeb.app/api/admin/news \
  -H "x-admin-key: your_key"
```

- If your IP is in `ADMIN_ALLOWED_IPS`: Returns 200 with admin data
- If your IP is NOT in `ADMIN_ALLOWED_IPS`: Returns 403 Forbidden

For comprehensive authentication setup, see [plans/Authentication.md](plans/Authentication.md).

### Health check

If you configure a health check in Koyeb, use:

- Path: `/api/health`

### Deploy

Click **Deploy**. Once it’s live:

- App URL: `https://<your-app>.koyeb.app/`
- API health: `https://<your-app>.koyeb.app/api/health`

## 3) Uploads persistence (optional but recommended)

This backend stores uploaded images/files on disk under:

- `/app/backend/uploads`

On Koyeb, the filesystem can be **ephemeral** (files can disappear on redeploy/restart).
If you need uploads to persist:

1. Create a **Persistent Storage** volume in Koyeb.
2. Mount it to:

- `/app/backend/uploads`

> If you don’t mount storage, uploads may work temporarily but won’t be durable.

## 4) Alternative: deploy frontend and backend as separate services (requires code changes)

Right now the frontend uses `/api/...` relative URLs, which only work when the frontend and API share the same origin.
If you want separate services, you’ll need to change the frontend to use an absolute API base like `https://<api-service>.koyeb.app` (typically via `VITE_*` env + code updates).

If you want this split setup, tell me and I’ll wire the frontend to read `VITE_API_BASE_URL` and update all fetches accordingly.

## 5) Quick local Docker check (optional)

From repo root:

- Build: `docker build -t adl .`
- Run: `docker run -p 4000:4000 -e PORT=4000 -e MONGODB_URI="<your-uri>" adl`

Then open `http://localhost:4000`.
