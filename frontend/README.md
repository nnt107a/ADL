# ADL Frontend

Vite + React frontend for the ADL site. It renders public pages and reads people, news, and insights from the backend API. Admin publishing routes are hidden behind the session unlock flow.

## Requirements

- Node.js 20 or newer
- npm
- The backend service running on `http://localhost:4000`

## Setup

From the repository root:

```powershell
npm install
```

If PowerShell blocks `npm` with an execution-policy error, use `npm.cmd` for any `npm` command in this README:

```powershell
npm.cmd install
```

There is no frontend `.env` file required for local development. The Vite dev server proxies these paths to the backend:

- `/api` -> `http://localhost:4000`
- `/uploads` -> `http://localhost:4000`

The proxy is configured in `frontend/vite.config.js`.

## Run The Frontend

Start the backend first:

```powershell
npm run dev:backend
```

In a second terminal, start the frontend:

```powershell
npm run dev --workspace frontend
```

Equivalent root shortcut:

```powershell
npm run dev:frontend
```

Open:

```text
http://localhost:5173
```

To run both frontend and backend together from the repository root:

```powershell
npm run dev
```

## Admin Access

The frontend includes a hidden session unlock listener. While focused on the website, press `L` five times within 10 seconds. The app silently calls:

```text
POST /api/grant-admin
```

The backend responds by setting an HTTP-only signed admin session cookie. There is no alert, prompt, or redirect.

After that session is active, admins can open the publishing and management routes:

```text
http://localhost:5173/news/add
http://localhost:5173/news/edit
http://localhost:5173/insight/add
http://localhost:5173/insight/edit
```

Those routes let admins create and edit news and insight articles in MongoDB. Delete actions are available directly from the article detail pages for admins.

Admin functionality is also available through the API. For example:

```text
GET /api/admin/session
POST /api/people
PUT /api/people/:id
DELETE /api/people/:id
POST /api/admin/news
POST /api/admin/news/preview
POST /api/admin/news/assets/image
POST /api/admin/insights
POST /api/admin/insights/assets/image
POST /api/admin/people/assets/avatar
POST /api/admin/people/assets/cover
```

Clearing browser site/session data removes the admin cookie and disables admin access. A Google logout flow can also call `POST /api/logout` when it clears the user's session.

## Build

Create a production build:

```powershell
npm run build --workspace frontend
```

The output is written to:

```text
frontend/dist
```

Preview the production build locally:

```powershell
npm run preview --workspace frontend
```

If PowerShell blocks `npm`, run:

```powershell
npm.cmd run build --workspace frontend
npm.cmd run preview --workspace frontend
```

By default, Vite preview prints the local URL in the terminal.

## Routes

Public routes:

- `/`
- `/about`
- `/news`
- `/news/add` admin only
- `/news/edit` admin only
- `/news/:slug`
- `/people`
- `/people/:id`
- `/services`
- `/insight`
- `/insight/add` admin only
- `/insight/edit` admin only
- `/insight/:slug`
- `/careers`
- `/contact`
- `/mission`
- `/vision`

Redirects:

- `/capabilities` -> `/services`
- `/knowledge` -> `/insight`
