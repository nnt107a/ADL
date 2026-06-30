# ADL website

This project is now split into a React frontend and an Express + MongoDB backend.

## General Context

This web project consists of two main components: the frontend, which is built with React, and the backend, which uses Node.js, Express, and MongoDB for data management. The frontend handles user interface and routing, while the backend provides API endpoints for accessing and managing data, including people and news items.

## Key Features
- **Frontend**: React application with pages for Home, About Us, Capabilities, People, Knowledge, Careers, and Contact.
- **Backend**: Express API supporting CRUD operations on people and news items, with MongoDB as the database.

## Running Locally

To set up and run the project locally, follow these steps:
1. Install dependencies at the repository root with `npm install`.
2. Start MongoDB with `npm run db:up`.
3. Seed the database with `npm run seed`.
4. Start both backend and frontend together with `npm run dev`.
5. Stop MongoDB later with `npm run db:down`.

## Authentication

The backend uses a two-layer authentication system for protecting admin endpoints and sensitive data mutations:

### API Key Authentication
- All admin routes require the `x-admin-key` header with a valid API key
- Header: `x-admin-key`
- Configured via: `ADMIN_KEY` environment variable

### IP-Based Access Control
- Admin endpoints and write operations (POST/PUT/DELETE) are additionally protected by IP whitelist validation
- Configure allowed IPs via: `ADMIN_ALLOWED_IPS` environment variable
- Format: Comma-separated list of IP addresses (e.g., `192.168.1.100,10.0.0.1,127.0.0.1`)
- If not configured, IP validation is skipped (backward compatible)

**Quick Setup**:
```bash
# .env file (local development)
ADMIN_KEY=your_secret_key
ADMIN_ALLOWED_IPS=127.0.0.1,::1
```

**For Detailed Configuration**:
- See [plans/Authentication.md](plans/Authentication.md) for comprehensive documentation
- Includes environment setup, deployment instructions, testing, and troubleshooting

## Deploying

For deployment, refer to the Koyeb deployment guide in [DEPLOY_KOYEB.md](DEPLOY_KOYEB.md).
## Notes

- The frontend uses React Router for page navigation.
- The backend uses Express Router for API routes.
- The old single-page files have been replaced by the new split structure.

Move this file to the AI folder.

## Worklog

Use this section to document development sessions and track key progress points.

### How to Save a Worklog

When requested to save a worklog for a development session, create a new entry following the template below. Include all key points, changes made, issues encountered, and any decisions or next steps.

### Worklog Template

```markdown
### [Date] - [Session Title]

**Duration**: [Start time - End time]

**Objective**: [What was the goal of this session?]

**Key Points**:
- [Point 1]
- [Point 2]
- [Point 3]

**Changes Made**:
- [Change 1] - [File/Area affected]
- [Change 2] - [File/Area affected]

**Issues Encountered**:
- [Issue 1] - [Resolution or status]
- [Issue 2] - [Resolution or status]

**Decisions Made**:
- [Decision 1]
- [Decision 2]

**Next Steps**:
- [ ] [Task 1]
- [ ] [Task 2]

**Notes**: [Any additional observations or context]
```

---

### Session Logs

Detailed session worklogs are stored in the [worklogs/](worklogs/) folder. Each worklog file is named with the session date and time (e.g., `2026-06-18-1500.md`) and contains:
- Session objective and duration
- Key points and accomplishments
- All files created or modified
- Issues encountered and decisions made
- Next steps and action items

When working on a session, check the [worklogs/](worklogs/) folder to see past sessions and use it as a reference for ongoing work.

