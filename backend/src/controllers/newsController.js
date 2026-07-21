import News from '../models/News.js';
import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
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

export async function listNews(_req, res, next) {
  try {
    const items = await News.find()
      .select('title slug type excerpt publishedAt imageUrl createdAt updatedAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.json(items);
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

    const item = await News.findOne({ slug }).lean();

    if (!item) {
      return res.status(404).json({ message: 'News item not found.' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function uploadNewsImage(req, res) {
  const uploadedImage = getSingleUploadedFile(req.files, 'image');

  if (!uploadedImage) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const url = uploadedNewsFileUrl(uploadedImage);
  return res.status(201).json({ url });
}

export async function previewNewsContentFile(req, res, next) {
  try {
    const uploadedContentFile = getSingleUploadedFile(req.files, 'contentFile');

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
    const { title, slug, type, excerpt, content, publishedAt } = req.body || {};

    const uploadedImage = getSingleUploadedFile(req.files, 'image');
    const uploadedContentFile = getSingleUploadedFile(req.files, 'contentFile');

    const contentText = content ? String(content).trim() : '';
    const hasContentFile = Boolean(uploadedContentFile);

    let resolvedTitle = title ? String(title).trim() : '';
    let resolvedContent = contentText;

    if (!resolvedContent && !hasContentFile) {
      return res.status(400).json({ message: 'Provide either content text or a content file.' });
    }

    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    let fileContentToCleanupPath = '';

    if (!resolvedContent && uploadedContentFile) {
      const original = String(uploadedContentFile.originalname || '').toLowerCase();
      const ext = path.extname(original);
      const isSupported =
        ext === '.docx' ||
        uploadedContentFile.mimetype?.startsWith('text/') ||
        ['.txt', '.md', '.markdown', '.html', '.htm'].includes(ext);

      if (!isSupported) {
        return res.status(400).json({
          message: 'Unsupported content file type. Use docx, html, md, or txt.',
        });
      }

      fileContentToCleanupPath = uploadedContentFile.path;
      resolvedContent = await extractHtmlFromUploadedContentFile(uploadedContentFile);
    }

    const stripHtml = (value) => String(value || '').replace(/<[^>]*>/g, ' ');
    const excerptSource = excerpt ? String(excerpt).trim() : '';
    const inferredExcerpt = stripHtml(resolvedContent)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    const resolvedExcerpt = excerptSource || inferredExcerpt || 'News update';

    let resolvedPublishedAt;

    if (publishedAt !== undefined && publishedAt !== null && String(publishedAt).trim() !== '') {
      const date = new Date(publishedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: 'publishedAt must be a valid date.' });
      }

      resolvedPublishedAt = date;
    }

    const desiredSlug = slugify(slug || resolvedTitle);
    const uniqueSlug = await ensureUniqueSlug(desiredSlug);

    if (!uniqueSlug) {
      return res.status(400).json({ message: 'Slug could not be generated.' });
    }

    const imageUrl = uploadedImage ? uploadedNewsFileUrl(uploadedImage) : undefined;
    const contentFileUrl = undefined;
    const contentFileName = undefined;

    const news = await News.create({
      title: resolvedTitle,
      slug: uniqueSlug,
      type: type ? String(type).trim() : undefined,
      excerpt: resolvedExcerpt,
      content: String(resolvedContent || '').trim(),
      imageUrl,
      contentFileUrl,
      contentFileName,
      ...(resolvedPublishedAt ? { publishedAt: resolvedPublishedAt } : {}),
    });

    if (fileContentToCleanupPath) {
      fs.unlink(fileContentToCleanupPath).catch(() => undefined);
    }

    res.status(201).json(news);
  } catch (error) {
    // Handle unique index errors just in case two requests race.
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

    const { title, slug, type, excerpt, content, publishedAt } = req.body || {};
    const uploadedImage = getSingleUploadedFile(req.files, 'image');
    const uploadedContentFile = getSingleUploadedFile(req.files, 'contentFile');

    const resolvedTitle = String(title || existing.title || '').trim();

    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const desiredSlugInput = String(slug || '').trim();
    const desiredSlug = desiredSlugInput ? desiredSlugInput : existing.slug;
    const uniqueSlug = slugify(desiredSlug) === existing.slug
      ? existing.slug
      : await ensureUniqueSlug(desiredSlug, existing._id);

    if (!uniqueSlug) {
      return res.status(400).json({ message: 'Slug could not be generated.' });
    }

    let resolvedContent = String(content || '').trim();
    let contentFileToCleanupPath = '';

    if (!resolvedContent && uploadedContentFile) {
      const original = String(uploadedContentFile.originalname || '').toLowerCase();
      const ext = path.extname(original);
      const isSupported =
        ext === '.docx' ||
        uploadedContentFile.mimetype?.startsWith('text/') ||
        ['.txt', '.md', '.markdown', '.html', '.htm'].includes(ext);

      if (!isSupported) {
        return res.status(400).json({
          message: 'Unsupported content file type. Use docx, html, md, or txt.',
        });
      }

      contentFileToCleanupPath = uploadedContentFile.path;
      resolvedContent = await extractHtmlFromUploadedContentFile(uploadedContentFile);
    }

    if (!resolvedContent && !existing.contentFileUrl) {
      return res.status(400).json({ message: 'Provide content text or keep an attached content file.' });
    }

    let resolvedPublishedAt = existing.publishedAt;

    if (publishedAt !== undefined && publishedAt !== null && String(publishedAt).trim() !== '') {
      const date = new Date(publishedAt);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({ message: 'publishedAt must be a valid date.' });
      }

      resolvedPublishedAt = date;
    }

    const updatedNews = await News.findOneAndUpdate(
      { _id: existing._id },
      {
        title: resolvedTitle,
        slug: uniqueSlug,
        type: type !== undefined ? String(type).trim() : existing.type,
        excerpt: excerpt !== undefined && String(excerpt).trim() ? String(excerpt).trim() : existing.excerpt,
        content: resolvedContent || existing.content || '',
        imageUrl: uploadedImage ? uploadedNewsFileUrl(uploadedImage) : existing.imageUrl,
        contentFileUrl: existing.contentFileUrl,
        contentFileName: existing.contentFileName,
        publishedAt: resolvedPublishedAt,
      },
      { new: true, runValidators: true }
    ).lean();

    if (contentFileToCleanupPath) {
      fs.unlink(contentFileToCleanupPath).catch(() => undefined);
    }

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
