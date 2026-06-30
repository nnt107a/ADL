# Multi-stage build: build React frontend, then run Express backend.

FROM node:20-bookworm-slim AS build
WORKDIR /app

# Install dependencies (workspaces) first for better caching.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci

# Copy full source and build the frontend.
COPY . .
RUN npm run build --workspace frontend

# Copy the build output into the backend's public folder.
RUN rm -rf backend/public && mkdir -p backend/public && cp -r frontend/dist/* backend/public/


FROM node:20-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Install only backend production dependencies.
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
RUN npm ci --omit=dev --workspace backend

# Copy backend source, plus the built frontend assets.
COPY backend ./backend
COPY --from=build /app/backend/public ./backend/public

# Koyeb sets $PORT; the server already binds to it.
EXPOSE 4000

CMD ["npm", "run", "start", "--workspace", "backend"]
