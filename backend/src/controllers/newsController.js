import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import News from '../models/News.js';
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
    const existing = await News.findOne({ slug: candidate, ...filter }).select('_id').lean();

    if (!existing) {
      return candidate;
    }

    candidate = `${normalizedBase}-${suffix}`;
    suffix += 1;
  }
}

function getSingleUploadedFile(files, fieldName) {
  const value = files?.[fieldName];
  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }
  return null;
}

function getUploadedLocalizedFiles(files) {
  return {
    en: getSingleUploadedFile(files, 'contentFile_en') || getSingleUploadedFile(files, 'contentFile'),
    vi: getSingleUploadedFile(files, 'contentFile_vi'),
  };
}

function uploadedNewsFileUrl(file) {
  if (!file?.filename) {
    return '';
  }

  return `/uploads/news/${file.filename}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function textToHtmlParagraphs(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) {
    return '';
  }

  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br/>')}</p>`);

  return paragraphs.join('');
}

async function extractHtmlFromUploadedContentFile(uploadedFile) {
  const original = String(uploadedFile?.originalname || '').toLowerCase();
  const ext = path.extname(original);

  if (ext === '.docx') {
    const result = await mammoth.convertToHtml({ path: uploadedFile.path });
    return String(result?.value || '');
  }

  const isHtml = ['.html', '.htm'].includes(ext);
  const fileText = await fs.readFile(uploadedFile.path, 'utf8');

  if (isHtml) {
    return String(fileText || '');
  }

  return textToHtmlParagraphs(fileText);
}

async function resolveLocalizedContentForNews(req, res, existing = null) {
  const files = req.files || {};
  const translations = buildTranslations(req.body || {}, existing || {});
  const localizedFiles = getUploadedLocalizedFiles(files);
  const fileFieldNames = {
    en: localizedFiles.en ? 'contentFile_en' : '',
    vi: localizedFiles.vi ? 'contentFile_vi' : '',
  };

  for (const locale of ['en', 'vi']) {
    const uploadedFile = localizedFiles[locale];

    if (uploadedFile) {
      translations[locale].content = await extractHtmlFromUploadedContentFile(uploadedFile);
      translations[locale].contentFileUrl = uploadedNewsFileUrl(uploadedFile);
      translations[locale].contentFileName = uploadedFile.originalname || '';
      continue;
    }

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
    contentFileUrl: primary.contentFileUrl || '',
    contentFileName: primary.contentFileName || '',
    fileFieldNames,
  };
}

function buildNewsDocumentBase(body, localized) {
  const resolvedTitle = localized.title || cleanText(body.title || '');
  const resolvedExcerpt =
    localized.excerpt ||
    cleanText(body.excerpt || '') ||
    cleanText(localized.content || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180) ||
    'News update';

  return {
    title: resolvedTitle,
    type: cleanText(body.type || ''),
    excerpt: resolvedExcerpt,
    content: cleanText(localized.content || ''),
    contentFileUrl: localized.contentFileUrl || undefined,
    contentFileName: localized.contentFileName || undefined,
    translations: localized.translations,
  };
}

function cleanString(value) {
  return cleanText(value);
}

export async function listNews(req, res, next) {
  try {
    const locale = getArticleLocaleFromRequest(req);
    const items = await News.find()
      .select('title slug type excerpt publishedAt imageUrl createdAt updatedAt contentFileUrl contentFileName translations')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.json(items.map((item) => resolveArticleForLocale(item, locale)));
  } catch (error) {
    next(error);
  }
}

export async function getNewsBySlug(req, res, next) {
  try {
    const slug = String(req.params?.slug || '')
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required.' });
    }

    const item = await News.findOne({ slug })
      .select('title slug type excerpt content imageUrl contentFileUrl contentFileName publishedAt createdAt updatedAt translations')
      .lean();

    if (!item) {
      return res.status(404).json({ message: 'News item not found.' });
    }

    res.json(resolveArticleForLocale(item, getArticleLocaleFromRequest(req)));
  } catch (error) {
    next(error);
  }
}

export async function uploadNewsImage(req, res) {
  const uploadedImage = getSingleUploadedFile(req.files, 'image');

  if (!uploadedImage) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const url = await uploadToCloudinaryOrLocal(uploadedImage, { folder: 'news' });
  return res.status(201).json({ url });
}

export async function previewNewsContentFile(req, res, next) {
  try {
    const uploadedContentFile =
      getSingleUploadedFile(req.files, 'contentFile') ||
      getSingleUploadedFile(req.files, 'contentFile_en') ||
      getSingleUploadedFile(req.files, 'contentFile_vi');

    if (!uploadedContentFile) {
      return res.status(400).json({ message: 'Content file is required.' });
    }

    const html = await extractHtmlFromUploadedContentFile(uploadedContentFile);
    fs.unlink(uploadedContentFile.path).catch(() => undefined);

    return res.json({ html });
  } catch (error) {
    next(error);
  }
}

export async function createNews(req, res, next) {
  try {
    const { title, slug, type, excerpt, publishedAt } = req.body || {};
    const localized = await resolveLocalizedContentForNews(req, res);

    if (!localized.title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!localized.content && !localized.translations.vi.content) {
      return res.status(400).json({ message: 'Provide content for at least one language.' });
    }

    let resolvedPublishedAt;

    if (publishedAt !== undefined && publishedAt !== null && String(publishedAt).trim() !== '') {
      const date = new Date(publishedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: 'publishedAt must be a valid date.' });
      }

      resolvedPublishedAt = date;
    }

    const desiredSlug = slugify(slug || localized.title);
    const uniqueSlug = await ensureUniqueSlug(desiredSlug);

    if (!uniqueSlug) {
      return res.status(400).json({ message: 'Slug could not be generated.' });
    }

    const imageFile = getSingleUploadedFile(req.files, 'image');
    const imageUrl = imageFile ? await uploadToCloudinaryOrLocal(imageFile, { folder: 'news' }) : undefined;

    const base = buildNewsDocumentBase({ title, type, excerpt }, localized);
    const news = await News.create({
      title: base.title,
      slug: uniqueSlug,
      type: base.type || undefined,
      excerpt: base.excerpt,
      content: base.content,
      imageUrl,
      contentFileUrl: base.contentFileUrl,
      contentFileName: base.contentFileName,
      translations: base.translations,
      ...(resolvedPublishedAt ? { publishedAt: resolvedPublishedAt } : {}),
    });

    return res.status(201).json(news);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.slug) {
      return res.status(409).json({ message: 'A news item with that slug already exists.' });
    }

    next(error);
  }
}

export async function updateNewsBySlug(req, res, next) {
  try {
    const currentSlug = String(req.params?.slug || '')
      .trim()
      .toLowerCase();

    if (!currentSlug) {
      return res.status(400).json({ message: 'Slug is required.' });
    }

    const existing = await News.findOne({ slug: currentSlug });

    if (!existing) {
      return res.status(404).json({ message: 'News item not found.' });
    }

    const { title, slug, type, excerpt, publishedAt } = req.body || {};
    const localized = await resolveLocalizedContentForNews(req, res, existing);

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

    const imageFile = getSingleUploadedFile(req.files, 'image');
    const imageUrl = imageFile ? await uploadToCloudinaryOrLocal(imageFile, { folder: 'news' }) : existing.imageUrl;

    const base = buildNewsDocumentBase({ title: resolvedTitle, type, excerpt }, localized);

    const updatedNews = await News.findOneAndUpdate(
      { _id: existing._id },
      {
        title: base.title,
        slug: uniqueSlug,
        type: type !== undefined ? cleanString(type) : existing.type,
        excerpt: base.excerpt,
        content: base.content || existing.content || '',
        imageUrl,
        contentFileUrl: base.contentFileUrl || existing.contentFileUrl,
        contentFileName: base.contentFileName || existing.contentFileName,
        translations: base.translations,
        publishedAt: resolvedPublishedAt,
      },
      { new: true, runValidators: true }
    ).lean();

    return res.json(updatedNews);
  } catch (error) {
    if (error?.code === 11000 && error?.keyPattern?.slug) {
      return res.status(409).json({ message: 'A news item with that slug already exists.' });
    }

    return next(error);
  }
}

export async function deleteNewsBySlug(req, res, next) {
  try {
    const slug = String(req.params?.slug || '')
      .trim()
      .toLowerCase();

    if (!slug) {
      return res.status(400).json({ message: 'Slug is required.' });
    }

    const deleted = await News.findOneAndDelete({ slug }).lean();

    if (!deleted) {
      return res.status(404).json({ message: 'News item not found.' });
    }

    return res.json({ message: 'News item deleted successfully.' });
  } catch (error) {
    return next(error);
  }
}
