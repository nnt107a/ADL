import { readFileSync } from 'fs';
import Insight from '../models/Insight.js';
import { uploadToCloudinaryOrLocal } from '../services/cloudinaryService.js';
import {
  buildTranslations,
  cleanText,
  getArticleLocaleFromRequest,
  resolveArticleForLocale,
} from '../utils/articleLocalization.js';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function ensureUniqueSlug(baseSlug, excludeId = null) {
  const normalizedBase = slugify(baseSlug);

  if (!normalizedBase) {
    return '';
  }

  let candidate = normalizedBase;
  let suffix = 2;
  const filter = excludeId ? { _id: { $ne: excludeId } } : {};

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const existing = await Insight.findOne({ slug: candidate, ...filter }).select('_id').lean();

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ');
}

function cleanString(value) {
  return cleanText(value);
}

function normalizeFilterValue(value) {
  return cleanText(value).replace(/\s+/g, ' ');
}

function buildServiceLookup() {
  const lookup = new Map();
  const possibleUrls = [
    new URL('../data/services.json', import.meta.url),
    new URL('../../../frontend/src/data/services.json', import.meta.url)
  ];

  let rawData = null;
  for (const url of possibleUrls) {
    try {
      rawData = readFileSync(url, 'utf8');
      if (rawData) {
        break;
      }
    } catch {
      // Continue searching next path
    }
  }

  if (!rawData) {
    console.warn('[insightController] Warning: services.json not found for service lookup.');
    return lookup;
  }

  try {
    const serviceCatalog = JSON.parse(rawData);
    for (const service of serviceCatalog || []) {
      const id = cleanText(service?.id || '');
      const title = cleanText(service?.title || '');

      if (!id) {
        continue;
      }

      lookup.set(normalizeFilterValue(id).toLowerCase(), id);

      if (title) {
        lookup.set(normalizeFilterValue(title).toLowerCase(), id);
      }
    }
  } catch (err) {
    console.error('[insightController] Error parsing services.json:', err);
  }

  return lookup;
}

const SERVICE_LOOKUP = buildServiceLookup();

function parseInsightFilters(value, fallback = []) {
  const fallbackList = Array.isArray(fallback) ? fallback : [];

  if (value === undefined || value === null || value === '') {
    return fallbackList;
  }

  let rawValues = value;

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        rawValues = parsed;
      } else {
        rawValues = trimmed.split(',');
      }
    } catch {
      rawValues = trimmed.split(',');
    }
  }

  if (!Array.isArray(rawValues)) {
    return fallbackList;
  }

  const deduped = new Map();

  for (const entry of rawValues) {
    const normalized = normalizeFilterValue(entry);

    if (!normalized) {
      continue;
    }

    const key = SERVICE_LOOKUP.get(normalized.toLowerCase()) || '';

    if (!key) {
      continue;
    }

    if (!deduped.has(key)) {
      deduped.set(key, key);
    }
  }

  return Array.from(deduped.values());
}

function buildInsightDocumentBase(body, localized, filters) {
  const resolvedTitle = localized.title || cleanText(body.title || '');
  const resolvedExcerpt =
    localized.excerpt ||
    cleanText(body.excerpt || '') ||
    stripHtml(localized.content || '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180) ||
    'Insight article';

  return {
    title: resolvedTitle,
    type: cleanText(body.type || ''),
    excerpt: resolvedExcerpt,
    filters: parseInsightFilters(filters),
    content: cleanText(localized.content || ''),
    translations: localized.translations,
  };
}

async function resolveLocalizedContentForInsight(req, existing = null) {
  const translations = buildTranslations(req.body || {}, existing || {});

  for (const locale of ['en', 'vi']) {
    const bodyContentKey = locale === 'vi' ? 'content_vi' : 'content_en';
    const rawContent = cleanText(req.body?.[bodyContentKey] ?? req.body?.content ?? existing?.translations?.[locale]?.content ?? existing?.content);
    if (rawContent) {
      translations[locale].content = rawContent;
    }
  }

  const primary =
    translations.en.title || translations.en.excerpt || translations.en.content
      ? translations.en
      : translations.vi;

  return {
    translations,
    title: primary.title || '',
    excerpt: primary.excerpt || '',
    content: primary.content || '',
  };
}

export async function listInsights(req, res, next) {
  try {
    const locale = getArticleLocaleFromRequest(req);
    const items = await Insight.find()
      .select('title slug type excerpt filters publishedAt imageUrl createdAt updatedAt translations.en.title translations.en.excerpt translations.vi.title translations.vi.excerpt translations.cn.title translations.cn.excerpt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.json(items.map((item) => resolveArticleForLocale(item, locale)));
  } catch (error) {
    next(error);
  }
}

export async function getInsightBySlug(req, res, next) {
  try {
    const slug = String(req.params?.slug || '')
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required.' });
    }

    const item = await Insight.findOne({ slug })
      .select('title slug type excerpt filters content imageUrl publishedAt createdAt updatedAt translations')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'Insight not found.' });
    }

    res.json(resolveArticleForLocale(item, getArticleLocaleFromRequest(req)));
  } catch (error) {
    next(error);
  }
}

export async function uploadInsightImage(req, res) {
  const uploadedImage = req.files?.image?.[0];

  if (!uploadedImage) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const url = await uploadToCloudinaryOrLocal(uploadedImage, { folder: 'news' });
  return res.status(201).json({ url });
}

export async function createInsight(req, res, next) {
  try {
    const { title, slug, type, excerpt, content, publishedAt, filters } = req.body || {};
    const localized = await resolveLocalizedContentForInsight(req);

    if (!localized.title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!localized.content && !cleanText(content)) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    let resolvedPublishedAt;

    if (publishedAt !== undefined && publishedAt !== null && String(publishedAt).trim() !== '') {
      const date = new Date(publishedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: 'publishedAt must be a valid date.' });
      }

      resolvedPublishedAt = date;
    }

    const uniqueSlug = await ensureUniqueSlug(slug || localized.title);

    if (!uniqueSlug) {
      return res.status(400).json({ message: 'Slug could not be generated.' });
    }

    const imageUrl = req.files?.image?.[0]
      ? await uploadToCloudinaryOrLocal(req.files.image[0], { folder: 'news' })
      : undefined;

    const base = buildInsightDocumentBase({ title, type, excerpt, content }, localized, filters);

    const insight = await Insight.create({
      title: base.title,
      slug: uniqueSlug,
      type: base.type || undefined,
      excerpt: base.excerpt,
      filters: base.filters,
      content: base.content,
      imageUrl,
      translations: base.translations,
      ...(resolvedPublishedAt ? { publishedAt: resolvedPublishedAt } : {}),
    });

    return res.status(201).json(insight);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.slug) {
      return res.status(409).json({ message: 'An insight with that slug already exists.' });
    }

    return next(error);
  }
}

export async function updateInsightBySlug(req, res, next) {
  try {
    const currentSlug = String(req.params?.slug || '')
      .trim()
      .toLowerCase();

    if (!currentSlug) {
      return res.status(400).json({ message: 'Slug is required.' });
    }

    const existing = await Insight.findOne({ slug: currentSlug });

    if (!existing) {
      return res.status(404).json({ message: 'Insight not found.' });
    }

    const { title, slug, type, excerpt, content, publishedAt, filters } = req.body || {};
    const localized = await resolveLocalizedContentForInsight(req, existing);

    const resolvedTitle = localized.title || cleanString(title) || existing.title;

    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const desiredSlugInput = cleanString(slug);
    const desiredSlug = desiredSlugInput ? desiredSlugInput : existing.slug;
    const uniqueSlug = slugify(desiredSlug) === existing.slug
      ? existing.slug
      : await ensureUniqueSlug(desiredSlug, existing._id);

    if (!uniqueSlug) {
      return res.status(400).json({ message: 'Slug could not be generated.' });
    }

    let resolvedPublishedAt = existing.publishedAt;

    if (publishedAt !== undefined && publishedAt !== null && String(publishedAt).trim() !== '') {
      const date = new Date(publishedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: 'publishedAt must be a valid date.' });
      }

      resolvedPublishedAt = date;
    }

    const imageUrl = req.files?.image?.[0]
      ? await uploadToCloudinaryOrLocal(req.files.image[0], { folder: 'news' })
      : existing.imageUrl;

    const base = buildInsightDocumentBase({ title: resolvedTitle, type, excerpt, content }, localized, filters ?? existing.filters);

    const updatedInsight = await Insight.findOneAndUpdate(
      { _id: existing._id },
      {
        title: base.title,
        slug: uniqueSlug,
        type: type !== undefined ? cleanString(type) : existing.type,
        excerpt: base.excerpt,
        filters: base.filters,
        content: base.content || existing.content || '',
        imageUrl,
        translations: base.translations,
        publishedAt: resolvedPublishedAt,
      },
      { new: true, runValidators: true }
    ).lean();

    return res.json(updatedInsight);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.slug) {
      return res.status(409).json({ message: 'An insight with that slug already exists.' });
    }

    return next(error);
  }
}

export async function deleteInsightBySlug(req, res, next) {
  try {
    const slug = String(req.params?.slug || '')
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required.' });
    }

    const deleted = await Insight.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return res.status(404).json({ message: 'Insight not found.' });
    }

    return res.json({ message: 'Insight deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}
