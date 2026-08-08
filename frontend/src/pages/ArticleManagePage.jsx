import { useEffect, useMemo, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { useLocale } from '../context/LocaleContext';

const LANGUAGES = [
  { id: 'en', label: 'ENG' },
  { id: 'vi', label: 'VIE' },
  { id: 'cn', label: 'CHN' },
];

const articleConfigs = {
  news: {
    label: 'News',
    kindLabel: 'news item',
    listEndpoint: '/api/news',
    detailEndpoint: (slug) => `/api/news/${slug}`,
    updateEndpoint: (slug) => `/api/admin/news/${slug}`,
    deleteEndpoint: (slug) => `/api/admin/news/${slug}`,
    publicListPath: '/news',
    publicDetailPath: (slug) => `/news/${slug}`,
    addPath: '/news/add',
    defaultType: 'News',
    summary: {
      edit: 'Pick a news item, update both language versions, then save the changes back to MongoDB.',
      delete: 'Pick a news item, review it, then remove it from the site.',
    },
    submitLabel: 'Save changes',
    deleteLabel: 'Delete news',
    successLabel: 'News item updated successfully.',
    deletedLabel: 'News item deleted successfully.',
  },
  insight: {
    label: 'Insight',
    kindLabel: 'insight article',
    listEndpoint: '/api/insights',
    detailEndpoint: (slug) => `/api/insights/${slug}`,
    updateEndpoint: (slug) => `/api/admin/insights/${slug}`,
    deleteEndpoint: (slug) => `/api/admin/insights/${slug}`,
    publicListPath: '/insight',
    publicDetailPath: (slug) => `/insight/${slug}`,
    addPath: '/insight/add',
    defaultType: 'Insight',
    summary: {
      edit: 'Pick an insight article, update both language versions, then save the changes back to MongoDB.',
      delete: 'Pick an insight article, review it, then remove it from the site.',
    },
    submitLabel: 'Save changes',
    deleteLabel: 'Delete insight',
    successLabel: 'Insight article updated successfully.',
    deletedLabel: 'Insight article deleted successfully.',
  },
};

function formatPublishedAt(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatDateTimeLocal(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function emptyDraft() {
  return { title: '', excerpt: '', content: '', contentFileUrl: '', contentFileName: '' };
}

function createDraftsFromItem(item) {
  const fallback = {
    en: {
      ...emptyDraft(),
      title: item?.translations?.en?.title || item?.title || '',
      excerpt: item?.translations?.en?.excerpt || item?.excerpt || '',
      content: item?.translations?.en?.content || item?.content || '',
      contentFileUrl: item?.translations?.en?.contentFileUrl || item?.contentFileUrl || '',
      contentFileName: item?.translations?.en?.contentFileName || item?.contentFileName || '',
    },
    vi: {
      ...emptyDraft(),
      title: item?.translations?.vi?.title || '',
      excerpt: item?.translations?.vi?.excerpt || '',
      content: item?.translations?.vi?.content || '',
      contentFileUrl: item?.translations?.vi?.contentFileUrl || '',
      contentFileName: item?.translations?.vi?.contentFileName || '',
    },
    cn: {
      ...emptyDraft(),
      title: item?.translations?.cn?.title || '',
      excerpt: item?.translations?.cn?.excerpt || '',
      content: item?.translations?.cn?.content || '',
      contentFileUrl: item?.translations?.cn?.contentFileUrl || '',
      contentFileName: item?.translations?.cn?.contentFileName || '',
    },
  };

  return fallback;
}

export default function ArticleManagePage({ kind, action }) {
  const config = articleConfigs[kind];
  const { locale } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState('');
  const [selectedSlug, setSelectedSlug] = useState(searchParams.get('slug') || '');
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [fileInputKey, setFileInputKey] = useState(0);
  const [activeLanguage, setActiveLanguage] = useState(locale);
  const [drafts, setDrafts] = useState({ en: emptyDraft(), vi: emptyDraft(), cn: emptyDraft() });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          autolink: true,
          openOnClick: false,
          protocols: ['http', 'https', 'mailto'],
        },
      }),
      Image.configure({ inline: false }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        protocols: ['http', 'https', 'mailto'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        'aria-label': `${config.label} content editor`,
      },
    },
    onUpdate({ editor: tiptapEditor }) {
      setDrafts((current) => ({
        ...current,
        [activeLanguage]: {
          ...current[activeLanguage],
          content: tiptapEditor.getHTML(),
        },
      }));
    },
  });

  const pageTitle = action === 'delete' ? `Delete ${config.label.toLowerCase()}` : `Edit ${config.label.toLowerCase()}`;
  const pageSummary = config.summary[action];

  const activeDraft = drafts[activeLanguage];

  const languageTabs = useMemo(
    () =>
      LANGUAGES.map((tab) => ({
        ...tab,
        isActive: tab.id === activeLanguage,
      })),
    [activeLanguage]
  );

  useEffect(() => {
    let ignore = false;

    async function loadItems() {
      try {
        setItemsLoading(true);
        setItemsError('');

        const response = await fetch(`${config.listEndpoint}?lang=${locale}`, { credentials: 'same-origin' });
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.message || `Request failed with status ${response.status}`);
        }

        if (!ignore) {
          setItems(Array.isArray(body) ? body : []);
        }
      } catch (error) {
        if (!ignore) {
          setItemsError(error.message || `Unable to load ${config.label.toLowerCase()} items.`);
        }
      } finally {
        if (!ignore) {
          setItemsLoading(false);
        }
      }
    }

    loadItems();

    return () => {
      ignore = true;
    };
  }, [config.label, config.listEndpoint, locale]);

  useEffect(() => {
    if (!itemsLoading && !selectedSlug && items.length > 0) {
      setSelectedSlug(items[0].slug);
    }
  }, [items, itemsLoading, selectedSlug]);

  useEffect(() => {
    if (selectedSlug) {
      setSearchParams({ slug: selectedSlug }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [selectedSlug, setSearchParams]);

  useEffect(() => {
    if (!selectedSlug) {
      setSelectedItem(null);
      setDetailError('');
      return undefined;
    }

    const controller = new AbortController();

    async function loadDetail() {
      try {
        setDetailLoading(true);
        setDetailError('');

        const response = await fetch(config.detailEndpoint(selectedSlug), {
          signal: controller.signal,
          credentials: 'same-origin',
        });

        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.message || `Request failed with status ${response.status}`);
        }

        if (!controller.signal.aborted) {
          setSelectedItem(body);
        }
      } catch (error) {
        if (error.name !== 'AbortError' && !controller.signal.aborted) {
          setDetailError(error.message || `Unable to load the selected ${config.kindLabel}.`);
        }
      } finally {
        if (!controller.signal.aborted) {
          setDetailLoading(false);
        }
      }
    }

    loadDetail();

    return () => controller.abort();
  }, [config, selectedSlug]);

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    setDrafts(createDraftsFromItem(selectedItem));
    setActiveLanguage(locale);
  }, [selectedItem, locale]);

  useEffect(() => {
    if (!editor) {
      return undefined;
    }

    editor.commands.setContent(activeDraft.content || '');
    return undefined;
  }, [editor, activeLanguage, activeDraft.content]);

  useEffect(() => {
    setCoverImage(null);
    setFileInputKey((current) => current + 1);
  }, [selectedItem?._id]);

  async function refreshItems() {
    const response = await fetch(`${config.listEndpoint}?lang=${locale}`, { credentials: 'same-origin' });
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message || `Request failed with status ${response.status}`);
    }

    setItems(Array.isArray(body) ? body : []);
    return Array.isArray(body) ? body : [];
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

  async function handlePickImage(event) {
    const file = event.target.files?.[0];

    if (!file) {
      setCoverImage(null);
      return;
    }

    setCoverImage(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedItem) {
      setFeedback(`Select a ${config.kindLabel} first.`);
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    for (const lang of LANGUAGES.map((item) => item.id)) {
      data.set(`title_${lang}`, drafts[lang].title || '');
      data.set(`excerpt_${lang}`, drafts[lang].excerpt || '');
      data.set(`content_${lang}`, drafts[lang].content || '');
    }

    if (coverImage) {
      data.set('image', coverImage);
    } else {
      data.delete('image');
    }

    try {
      setSubmitting(true);
      setFeedback('');
      setDetailError('');

      const response = await fetch(config.updateEndpoint(selectedItem.slug), {
        method: 'PUT',
        credentials: 'same-origin',
        body: data,
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed with status ${response.status}`);
      }

      const updated = body || selectedItem;
      setSelectedSlug(updated.slug);
      setSelectedItem(updated);
      setFeedback(config.successLabel);
      await refreshItems();
    } catch (error) {
      setFeedback(error.message || 'Failed to save changes.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!selectedItem) {
      setFeedback(`Select a ${config.kindLabel} first.`);
      return;
    }

    const confirmed = window.confirm(`Delete "${selectedItem.title}"? This cannot be undone.`);

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);
      setFeedback('');
      setDetailError('');

      const response = await fetch(config.deleteEndpoint(selectedItem.slug), {
        method: 'DELETE',
        credentials: 'same-origin',
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed with status ${response.status}`);
      }

      const remaining = items.filter((item) => item.slug !== selectedItem.slug);
      setItems(remaining);
      setFeedback(config.deletedLabel);

      if (remaining.length > 0) {
        setSelectedSlug(remaining[0].slug);
      } else {
        setSelectedSlug('');
        setSelectedItem(null);
      }
    } catch (error) {
      setFeedback(error.message || 'Failed to delete item.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader kicker="Admin" title={pageTitle} summary={pageSummary}>
        <div className="page-header-action">
          <RouterLink className="page-header-back-link" to={config.publicListPath}>
            Back to public page
          </RouterLink>
          <RouterLink className="page-header-admin-link page-header-admin-link-edit" to={config.addPath}>
            Add new {config.label.toLowerCase()}
          </RouterLink>
        </div>
      </PageHeader>

      <section className="section section-light reveal">
        <div className="container admin-editor-shell">
          {itemsLoading ? <LoadingState label={`Loading ${config.label.toLowerCase()} items`} /> : null}
          {itemsError ? <ErrorState title={`Unable to load ${config.label.toLowerCase()} items`} message={itemsError} /> : null}

          {!itemsLoading && !itemsError ? (
            items.length > 0 ? (
              <div className="cards-grid admin-editor-layout">
                <aside className="value-stack">
                  {items.map((item) => (
                    <button
                      key={item._id}
                      type="button"
                      className={item.slug === selectedSlug ? 'content-card' : 'content-card'}
                      onClick={() => setSelectedSlug(item.slug)}
                      style={{
                        textAlign: 'left',
                        width: '100%',
                        cursor: 'pointer',
                        borderColor: item.slug === selectedSlug ? 'rgba(255, 189, 89, 0.7)' : undefined,
                        boxShadow: item.slug === selectedSlug ? '0 18px 40px rgba(255, 189, 89, 0.12)' : undefined,
                      }}
                    >
                      <p className="content-label">{item.type || config.label}</p>
                      <h3>{item.title}</h3>
                      {item.publishedAt ? <p className="state-copy">Published {formatPublishedAt(item.publishedAt)}</p> : null}
                      <p>{item.excerpt}</p>
                    </button>
                  ))}
                </aside>

                <div className="value-stack">
                  {detailLoading ? <LoadingState label={`Loading selected ${config.kindLabel}`} /> : null}
                  {detailError ? <ErrorState title={`Unable to load the selected ${config.kindLabel}`} message={detailError} /> : null}

                  {selectedItem ? (
                    action === 'edit' ? (
                      <form className="contact-form admin-editor-form" onSubmit={handleSubmit} key={selectedItem._id}>
                        <div className="admin-language-tabs" role="tablist" aria-label="Article languages">
                          {languageTabs.map((tab) => (
                            <button
                              key={tab.id}
                              type="button"
                              className={tab.isActive ? 'tab-button is-active' : 'tab-button'}
                              onClick={() => {
                                setActiveLanguage(tab.id);
                                editor?.commands.setContent(drafts[tab.id].content || '');
                              }}
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
                              value={activeDraft.title}
                              onChange={(event) => updateActiveDraft('title', event.target.value)}
                              required
                            />
                          </label>
                          <label className="field">
                            <span>Slug</span>
                            <input
                              type="text"
                              name="slug"
                              defaultValue={selectedItem.slug || ''}
                              placeholder="Keep blank to preserve the current slug"
                            />
                          </label>
                        </div>

                        <div className="field-grid">
                          <label className="field">
                            <span>Type</span>
                            <input type="text" name="type" defaultValue={selectedItem.type || config.defaultType} />
                          </label>
                          <label className="field">
                            <span>Published at</span>
                            <input type="datetime-local" name="publishedAt" defaultValue={formatDateTimeLocal(selectedItem.publishedAt)} />
                          </label>
                        </div>

                        <label className="field">
                          <span>Excerpt</span>
                          <textarea
                            value={activeDraft.excerpt}
                            onChange={(event) => updateActiveDraft('excerpt', event.target.value)}
                            rows="3"
                            placeholder="Short summary for listing pages."
                          />
                        </label>

                        <label className="field">
                          <span>Cover image replacement</span>
                          <input key={fileInputKey} type="file" name="image" accept="image/*" onChange={handlePickImage} />
                        </label>

                        {selectedItem.imageUrl ? (
                          <article className="content-card">
                            <p className="content-label">Current cover</p>
                            <img src={selectedItem.imageUrl} alt="" />
                          </article>
                        ) : null}

                        <label className="field">
                          <span>Content</span>
                          <div className="rich-editor pro-rich-editor">
                            <EditorContent editor={editor} />
                          </div>
                        </label>

                        <div className="form-footer">
                          <button className="button button-primary" type="submit" disabled={submitting}>
                            {submitting ? 'Saving...' : config.submitLabel}
                          </button>
                          <p className="form-feedback" aria-live="polite">
                            {feedback}
                          </p>
                        </div>
                      </form>
                    ) : (
                      <article className="contact-form admin-editor-form">
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

                        <div className="content-card" style={{ marginBottom: 0 }}>
                          <p className="content-label">{selectedItem.type || config.label}</p>
                          <h3>{drafts[activeLanguage].title || selectedItem.title}</h3>
                          <p className="state-copy">{selectedItem.publishedAt ? `Published ${formatPublishedAt(selectedItem.publishedAt)}` : 'No published date'}</p>
                          <p>{drafts[activeLanguage].excerpt || selectedItem.excerpt}</p>
                          {selectedItem.imageUrl ? <img src={selectedItem.imageUrl} alt="" /> : null}
                          <p className="state-copy">
                            This will delete the selected {config.kindLabel} from the site and the database.
                          </p>
                        </div>

                        <div className="form-footer">
                          <button className="button button-primary" type="button" disabled={submitting} onClick={handleDelete}>
                            {submitting ? 'Deleting...' : config.deleteLabel}
                          </button>
                          <p className="form-feedback" aria-live="polite">
                            {feedback}
                          </p>
                        </div>
                      </article>
                    )
                  ) : (
                    <div className="state-panel">
                      <p className="state-label">No {config.kindLabel}s selected</p>
                      <p className="state-copy">Pick an item from the list to continue.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="state-panel">
                <p className="state-label">No {config.kindLabel}s yet</p>
                <p className="state-copy">Create one first, then come back here to manage it.</p>
              </div>
            )
          ) : null}
        </div>
      </section>
    </>
  );
}
