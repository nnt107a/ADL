import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { uploadsRoot } from './middleware/newsAssetsUpload.js';
import Insight from './models/Insight.js';
import News from './models/News.js';

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Dynamic sitemap.xml — includes static pages and all published slugs from MongoDB
app.get('/sitemap.xml', async (_req, res) => {
  const SITE = 'https://adlegal.vn';
  const today = new Date().toISOString().split('T')[0];

  const staticUrls = [
    { loc: `${SITE}/`, priority: '1.0' },
    { loc: `${SITE}/about`, priority: '0.8' },
    { loc: `${SITE}/people`, priority: '0.7' },
    { loc: `${SITE}/capabilities`, priority: '0.8' },
    { loc: `${SITE}/insight`, priority: '0.9' },
    { loc: `${SITE}/news`, priority: '0.9' },
    { loc: `${SITE}/contact`, priority: '0.6' },
  ];

  let insightSlugs = [];
  let newsSlugs = [];

  try {
    insightSlugs = await Insight.find({}, { slug: 1, publishedAt: 1, _id: 0 }).lean();
  } catch (_err) {
    // DB may not be connected during static builds — fail gracefully
  }

  try {
    newsSlugs = await News.find({}, { slug: 1, publishedAt: 1, _id: 0 }).lean();
  } catch (_err) {
    // DB may not be connected during static builds — fail gracefully
  }

  const urlEntries = [
    ...staticUrls.map(
      ({ loc, priority }) =>
        `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
    ),
    ...insightSlugs.map(
      ({ slug, publishedAt }) =>
        `  <url>\n    <loc>${SITE}/insight/${slug}</loc>\n    <lastmod>${publishedAt ? new Date(publishedAt).toISOString().split('T')[0] : today}</lastmod>\n    <priority>0.8</priority>\n  </url>`
    ),
    ...newsSlugs.map(
      ({ slug, publishedAt }) =>
        `  <url>\n    <loc>${SITE}/news/${slug}</loc>\n    <lastmod>${publishedAt ? new Date(publishedAt).toISOString().split('T')[0] : today}</lastmod>\n    <priority>0.8</priority>\n  </url>`
    ),
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlEntries,
    '</urlset>',
  ].join('\n');

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.send(xml);
});

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
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path === '/sitemap.xml' ||
      req.path === '/robots.txt'
    ) {
      return next();
    }

    return res.sendFile(frontendIndexFile);
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
