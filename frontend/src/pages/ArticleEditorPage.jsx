import { useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import InsightFilterWizard from '../components/InsightFilterWizard';
import WordRibbonEditor from '../components/WordRibbonEditor';
import { useLocale } from '../context/LocaleContext';
import { normalizeServiceSelections } from '../utils/serviceFilters';

const LANGUAGES = [
  { id: 'en', label: 'ENG' },
  { id: 'vi', label: 'VIE' },
  { id: 'cn', label: 'CHN' },
];

const editorModes = [
  { id: 'editor', label: 'Editor' },
  { id: 'preview', label: 'Preview' },
];

const editorConfigs = {
  news: {
    kicker: 'Admin',
    title: 'Add news',
    editTitle: 'Edit news',
    summary: 'Create a polished news update with rich text, links, lists, headings, and image support.',
    editSummary: 'Edit an existing news item and save the updated content back to MongoDB.',
    typeDefault: 'News',
    submitLabel: 'Publish news',
    updateLabel: 'Save news changes',
    endpoint: '/api/admin/news',
    updateEndpoint: (slug) => `/api/admin/news/${slug}`,
    imageEndpoint: '/api/admin/news/assets/image',
    successPrefix: 'News item published',
    updateSuccessPrefix: 'News item updated',
    backPath: '/news',
    viewPath: (slug) => `/news/${slug}`,
    listPath: '/news',
    detailEndpoint: (slug) => `/api/news/${slug}`,
  },
  insight: {
    kicker: 'Admin',
    title: 'Add insight',
    editTitle: 'Edit insight',
    summary: 'Create a professional article for the Insight page with rich formatting and a clean reading experience.',
    editSummary: 'Edit an existing insight article and save the updated content back to MongoDB.',
    typeDefault: 'Insight',
    submitLabel: 'Publish insight',
    updateLabel: 'Save insight changes',
    endpoint: '/api/admin/insights',
    updateEndpoint: (slug) => `/api/admin/insights/${slug}`,
    imageEndpoint: '/api/admin/insights/assets/image',
    successPrefix: 'Insight article published',
    updateSuccessPrefix: 'Insight article updated',
    backPath: '/insight',
    viewPath: (slug) => `/insight/${slug}`,
    listPath: '/insight',
    detailEndpoint: (slug) => `/api/insights/${slug}`,
  },
};

function Toolbar({ editor, onPickImage }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!editor) return undefined;

    function handleStateChange() {
      setTick((t) => t + 1);
    }

    editor.on('transaction', handleStateChange);
    editor.on('selectionUpdate', handleStateChange);
    editor.on('focus', handleStateChange);

    return () => {
      editor.off('transaction', handleStateChange);
      editor.off('selectionUpdate', handleStateChange);
      editor.off('focus', handleStateChange);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  function setLink() {
    const previousUrl = editor.getAttributes('link').href || '';
    const url = window.prompt('Paste a URL', previousUrl);

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  const tools = [
    { label: 'B', title: 'Bold', active: editor.isActive('bold'), action: () => editor.chain().focus().toggleBold().run() },
    { label: 'I', title: 'Italic', active: editor.isActive('italic'), action: () => editor.chain().focus().toggleItalic().run() },
    { label: 'H2', title: 'Heading 2', active: editor.isActive('heading', { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: 'List', title: 'Bullet list', active: editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
    { label: '1.', title: 'Numbered list', active: editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: 'Quote', title: 'Quote', active: editor.isActive('blockquote'), action: () => editor.chain().focus().toggleBlockquote().run() },
    { label: 'Link', title: 'Add or remove link', active: editor.isActive('link'), action: setLink },
    { label: 'Image', title: 'Upload image', active: false, action: onPickImage },
    { label: 'Undo', title: 'Undo', active: false, action: () => editor.chain().focus().undo().run() },
    { label: 'Redo', title: 'Redo', active: false, action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="editor-toolbar pro-editor-toolbar" role="toolbar" aria-label="Article editor toolbar">
      {tools.map((tool) => (
        <button
          key={tool.title}
          type="button"
          className={tool.active ? 'tool-button is-active' : 'tool-button'}
          onMouseDown={(e) => e.preventDefault()}
          onClick={tool.action}
          title={tool.title}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}

function emptyDraft() {
  return { title: '', excerpt: '', content: '', contentFileUrl: '', contentFileName: '' };
}

function createDraftsFromArticle(article) {
  return {
    en: {
      ...emptyDraft(),
      title: article?.translations?.en?.title || article?.title || '',
      excerpt: article?.translations?.en?.excerpt || article?.excerpt || '',
      content: article?.translations?.en?.content || article?.content || '',
      contentFileUrl: article?.translations?.en?.contentFileUrl || article?.contentFileUrl || '',
      contentFileName: article?.translations?.en?.contentFileName || article?.contentFileName || '',
    },
    vi: {
      ...emptyDraft(),
      title: article?.translations?.vi?.title || '',
      excerpt: article?.translations?.vi?.excerpt || '',
      content: article?.translations?.vi?.content || '',
      contentFileUrl: article?.translations?.vi?.contentFileUrl || '',
      contentFileName: article?.translations?.vi?.contentFileName || '',
    },
    cn: {
      ...emptyDraft(),
      title: article?.translations?.cn?.title || '',
      excerpt: article?.translations?.cn?.excerpt || '',
      content: article?.translations?.cn?.content || '',
      contentFileUrl: article?.translations?.cn?.contentFileUrl || '',
      contentFileName: article?.translations?.cn?.contentFileName || '',
    },
  };
}

function buildFileFieldName(language) {
  return `contentFile_${language}`;
}

export default function ArticleEditorPage({ kind, action = 'create' }) {
  const { locale, copy } = useLocale();
  const config = editorConfigs[kind];
  const fileInputRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState('editor');
  const [activeLanguage, setActiveLanguage] = useState(locale);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [existingArticle, setExistingArticle] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(action === 'edit');
  const [existingError, setExistingError] = useState('');
  const [drafts, setDrafts] = useState({ en: emptyDraft(), vi: emptyDraft(), cn: emptyDraft() });
  const [files, setFiles] = useState({ en: null, vi: null, cn: null });
  const [filePreviews, setFilePreviews] = useState({ en: '', vi: '', cn: '' });
  const [fileNames, setFileNames] = useState({ en: '', vi: '', cn: '' });
  const [filters, setFilters] = useState([]);
  const articleSlug = String(searchParams.get('slug') || '').trim();
  const isEditMode = action === 'edit';
  const isNews = kind === 'news';
  const isInsight = kind === 'insight';
  const serviceOptions = copy.data.services;
  const languageTabs = useMemo(() => LANGUAGES.map((tab) => ({ ...tab, isActive: tab.id === activeLanguage })), [activeLanguage]);
  const activeDraft = drafts[activeLanguage];

  const pageTitle = isEditMode ? config.editTitle : config.title;
  const pageSummary = isEditMode ? config.editSummary : config.summary;

  useEffect(() => {
    if (!isEditMode) {
      setExistingArticle(null);
      setExistingError('');
      setLoadingExisting(false);
      return undefined;
    }

    if (!articleSlug) {
      setExistingError('Missing article slug.');
      setLoadingExisting(false);
      return undefined;
    }

    const controller = new AbortController();

    async function loadArticle() {
      try {
        setLoadingExisting(true);
        setExistingError('');

        const response = await fetch(config.detailEndpoint(articleSlug), {
          signal: controller.signal,
          credentials: 'same-origin',
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.message || `Request failed with status ${response.status}`);
        }

        if (!controller.signal.aborted) {
          setExistingArticle(body);
        }
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError' && !controller.signal.aborted) {
          setExistingError(fetchError.message || 'Failed to load article.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingExisting(false);
        }
      }
    }

    loadArticle();

    return () => controller.abort();
  }, [articleSlug, config, isEditMode]);

  useEffect(() => {
    if (!existingArticle) {
      return;
    }

    setDrafts(createDraftsFromArticle(existingArticle));
    setFilters(normalizeServiceSelections(existingArticle.filters, serviceOptions));
    setActiveLanguage(locale);
  }, [existingArticle, locale, serviceOptions]);

  useEffect(() => {
    setCoverImage(null);
  }, [existingArticle?._id]);

  async function uploadImage(file) {
    const data = new FormData();
    data.append('image', file);

    const response = await fetch(config.imageEndpoint, {
      method: 'POST',
      credentials: 'same-origin',
      body: data,
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message || `Image upload failed with status ${response.status}`);
    }

    const url = String(body?.url || '').trim();

    if (!url) {
      throw new Error('Image upload did not return a URL.');
    }

    return url;
  }

  async function handleEditorImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setUploadingImage(true);
      setError('');

      const url = await uploadImage(file);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  async function handleCoverImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setCoverImage(null);
      return;
    }

    setCoverImage(file);
  }

  function updateActiveDraft(field, value) {
    setDrafts((current) => ({
      ...current,
      [activeLanguage]: {
        ...current[activeLanguage],
        [field]: value,
      },
    }));
  }

  async function handlePreviewFile(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setFiles((current) => ({ ...current, [activeLanguage]: null }));
      setFilePreviews((current) => ({ ...current, [activeLanguage]: '' }));
      setFileNames((current) => ({ ...current, [activeLanguage]: '' }));
      return;
    }

    try {
      setError('');
      setFiles((current) => ({ ...current, [activeLanguage]: file }));
      setFileNames((current) => ({ ...current, [activeLanguage]: file.name }));

      const data = new FormData();
      data.append('contentFile', file);

      const response = await fetch('/api/admin/news/preview', {
        method: 'POST',
        credentials: 'same-origin',
        body: data,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Preview failed with status ${response.status}`);
      }

      setFilePreviews((current) => ({ ...current, [activeLanguage]: String(body?.html || '') }));
      setDrafts((current) => ({
        ...current,
        [activeLanguage]: {
          ...current[activeLanguage],
          content: String(body?.html || ''),
        },
      }));
    } catch (previewError) {
      setFilePreviews((current) => ({ ...current, [activeLanguage]: '' }));
      setError(previewError.message || 'Failed to preview file.');
    } finally {
      event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    for (const lang of LANGUAGES.map((item) => item.id)) {
      data.set(`title_${lang}`, drafts[lang].title || '');
      data.set(`excerpt_${lang}`, drafts[lang].excerpt || '');
      data.set(`content_${lang}`, drafts[lang].content || '');

      if (isNews && files[lang]) {
        data.set(buildFileFieldName(lang), files[lang]);
      } else {
        data.delete(buildFileFieldName(lang));
      }
    }

    if (editor) {
      data.set(`content_${activeLanguage}`, drafts[activeLanguage].content || editor.getHTML() || '');
    }

    if (isInsight) {
      data.set('filters', JSON.stringify(normalizeServiceSelections(filters, serviceOptions)));
    } else {
      data.delete('filters');
    }

    if (coverImage) {
      data.set('image', coverImage);
    } else {
      data.delete('image');
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess(null);

      const targetEndpoint = isEditMode && articleSlug ? config.updateEndpoint(articleSlug) : config.endpoint;
      const response = await fetch(targetEndpoint, {
        method: isEditMode && articleSlug ? 'PUT' : 'POST',
        credentials: 'same-origin',
        body: data,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed with status ${response.status}`);
      }

      setSuccess({
        message: `${isEditMode ? config.updateSuccessPrefix : config.successPrefix}.`,
        path: config.viewPath(body.slug),
      });
      form.reset();
      setCoverImage(null);
      setFiles({ en: null, vi: null, cn: null });
      setFilePreviews({ en: '', vi: '', cn: '' });
      setFileNames({ en: '', vi: '', cn: '' });
      setDrafts({ en: emptyDraft(), vi: emptyDraft(), cn: emptyDraft() });
      setFilters([]);
      editor?.commands.setContent('');
    } catch (submitError) {
      setError(submitError.message || 'Failed to publish.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader kicker={config.kicker} title={pageTitle} summary={pageSummary}>
        <RouterLink className="page-header-back-link" to={config.backPath}>
          Back to public page
        </RouterLink>
      </PageHeader>

      <section className="section section-light reveal is-visible">
        <div className="container admin-editor-shell">
          {loadingExisting ? <LoadingState label={`Loading ${kind} for editing`} /> : null}
          {existingError ? <ErrorState title={`Unable to load ${kind}`} message={existingError} /> : null}

          {!loadingExisting && !existingError ? (
            <form className="contact-form admin-editor-form" onSubmit={handleSubmit}>
              <div className="admin-language-tabs" role="tablist" aria-label="Article languages">
                {languageTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={tab.isActive ? 'tab-button is-active' : 'tab-button'}
                    onClick={() => setActiveLanguage(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Title</span>
                  <input
                    type="text"
                    placeholder="Article title"
                    value={activeDraft.title}
                    onChange={(event) => updateActiveDraft('title', event.target.value)}
                    required
                  />
                </label>
                <label className="field">
                  <span>Slug (optional)</span>
                  <input
                    type="text"
                    name="slug"
                    placeholder="leave blank to auto-generate"
                    defaultValue={existingArticle?.slug || ''}
                  />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>Type</span>
                  <input type="text" name="type" defaultValue={existingArticle?.type || config.typeDefault} />
                </label>
                <label className="field">
                  <span>Published at</span>
                  <input
                    type="datetime-local"
                    name="publishedAt"
                    defaultValue={
                      existingArticle?.publishedAt
                        ? new Date(existingArticle.publishedAt).toISOString().slice(0, 16)
                        : ''
                    }
                  />
                </label>
              </div>

              <label className="field">
                <span>Excerpt</span>
                <textarea
                  rows="3"
                  placeholder="Short summary for listing pages. Leave blank to infer from content."
                  value={activeDraft.excerpt}
                  onChange={(event) => updateActiveDraft('excerpt', event.target.value)}
                />
              </label>

              {isInsight ? (
                <InsightFilterWizard
                  services={serviceOptions}
                  selectedValues={filters}
                  onChange={setFilters}
                />
              ) : null}

              {isNews ? (
                <label className="field">
                  <span>Import content file (optional, {activeLanguage.toUpperCase()})</span>
                  <input type="file" accept=".docx,.html,.htm,.txt,.md" onChange={handlePreviewFile} />
                  {fileNames[activeLanguage] ? <p className="state-copy">Selected: {fileNames[activeLanguage]}</p> : null}
                </label>
              ) : null}

              <div className="field">
                <span>Article Content ({activeLanguage.toUpperCase()})</span>
                <WordRibbonEditor
                  content={activeDraft.content}
                  onChange={(html) => updateActiveDraft('content', html)}
                  onUploadImage={async (file) => {
                    return await uploadImage(file);
                  }}
                />
              </div>

              {isNews && filePreviews[activeLanguage] ? (
                <article className="content-card">
                  <p className="content-label">File preview</p>
                  <div className="news-content" dangerouslySetInnerHTML={{ __html: filePreviews[activeLanguage] }} />
                </article>
              ) : null}

              <label className="field">
                <span>Cover image (optional)</span>
                <input type="file" name="image" accept="image/*" onChange={handleCoverImage} />
              </label>

              <div className="form-footer">
                <button className="button button-primary" type="submit" disabled={submitting}>
                  {submitting ? (isEditMode ? 'Saving...' : 'Publishing...') : isEditMode ? config.updateLabel : config.submitLabel}
                </button>
                <p className="form-feedback" aria-live="polite">
                  {error ? `Error: ${error}` : success?.message}
                  {success ? (
                    <>
                      {' '}
                      <RouterLink className="page-header-back-link" to={success.path}>
                        View it
                      </RouterLink>
                    </>
                  ) : null}
                </p>
              </div>
            </form>
          ) : null}
        </div>
      </section>
    </>
  );
}
