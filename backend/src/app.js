import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { uploadsRoot } from './middleware/newsAssetsUpload.js';

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '..');
const frontendDistDir = path.join(backendRoot, 'public');
const frontendIndexFile = path.join(frontendDistDir, 'index.html');
const hasFrontendBuild = fs.existsSync(frontendIndexFile);

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());

// Static file hosting for uploaded news and people assets with 30-day caching.
app.use(
  '/uploads',
  express.static(uploadsRoot, {
    maxAge: '30d',
    etag: true,
    lastModified: true,
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    },
  })
);

// Serve the built frontend (if present). This keeps the app deployable as a
// single service where the frontend calls relative `/api/*` routes.
if (hasFrontendBuild) {
  app.use(
    express.static(frontendDistDir, {
      maxAge: '1y',
      immutable: true,
    })
  );
}

app.get('/', (_req, res) => {
  res.json({
    name: 'ADL API',
    status: 'ok',
    message: 'API is running',
  });
});

app.use('/api', apiRoutes);

// React Router fallback: serve index.html for non-API routes.
if (hasFrontendBuild) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }

    return res.sendFile(frontendIndexFile);
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
