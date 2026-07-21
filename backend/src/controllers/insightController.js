import Insight from '../models/Insight.js';

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
    const existing = await Insight.findOne({ slug: candidate, ...filter }).select('_id').lean();

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

function uploadedFileUrl(file) {
  if (!file?.filename) {
    return '';
  }

  return `/uploads/news/${file.filename}`;
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ');
}

export async function listInsights(_req, res, next) {
  try {
    const items = await Insight.find()
      .select('title slug type excerpt publishedAt imageUrl createdAt updatedAt')
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    res.json(items);
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

    const item = await Insight.findOne({ slug }).lean();

    if (!item) {
      return res.status(404).json({ message: 'Insight not found.' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
}

export async function uploadInsightImage(req, res) {
  const uploadedImage = getSingleUploadedFile(req.files, 'image');

  if (!uploadedImage) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  return res.status(201).json({ url: uploadedFileUrl(uploadedImage) });
}

export async function createInsight(req, res, next) {
  try {
    const { title, slug, type, excerpt, content, publishedAt } = req.body || {};
    const uploadedImage = getSingleUploadedFile(req.files, 'image');

    const resolvedTitle = String(title || '').trim();
    const resolvedContent = String(content || '').trim();

    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!resolvedContent) {
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

    const uniqueSlug = await ensureUniqueSlug(slug || resolvedTitle);

    if (!uniqueSlug) {
      return res.status(400).json({ message: 'Slug could not be generated.' });
    }

    const excerptSource = String(excerpt || '').trim();
    const inferredExcerpt = stripHtml(resolvedContent)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    const insight = await Insight.create({
      title: resolvedTitle,
      slug: uniqueSlug,
      type: type ? String(type).trim() : undefined,
      excerpt: excerptSource || inferredExcerpt || 'Insight article',
      content: resolvedContent,
      imageUrl: uploadedImage ? uploadedFileUrl(uploadedImage) : undefined,
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

    const { title, slug, type, excerpt, content, publishedAt } = req.body || {};
    const uploadedImage = getSingleUploadedFile(req.files, 'image');

    const resolvedTitle = String(title || existing.title || '').trim();
    const resolvedContent = String(content || existing.content || '').trim();

    if (!resolvedTitle) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!resolvedContent) {
      return res.status(400).json({ message: 'Content is required.' });
    }

    const desiredSlugInput = String(slug || '').trim();
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

    const resolvedExcerptSource = excerpt !== undefined ? String(excerpt).trim() : String(existing.excerpt || '').trim();
    const inferredExcerpt = stripHtml(resolvedContent)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);

    const updatedInsight = await Insight.findOneAndUpdate(
      { _id: existing._id },
      {
        title: resolvedTitle,
        slug: uniqueSlug,
        type: type !== undefined ? String(type).trim() : existing.type,
        excerpt: resolvedExcerptSource || inferredExcerpt || 'Insight article',
        content: resolvedContent,
        imageUrl: uploadedImage ? uploadedFileUrl(uploadedImage) : existing.imageUrl,
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
