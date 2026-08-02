import { useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';

function TabBar({ value, onChange, labels }) {
  const tabs = useMemo(
    () => [
      { id: 'editor', label: labels.editor },
      { id: 'file', label: labels.file },
    ],
    [labels]
  );

  return (
    <div className="tabs" role="tablist" aria-label="News input mode">
      {tabs.map((tab) => (
        <button key={tab.id} className={tab.id === value ? 'tab-button is-active' : 'tab-button'} type="button" role="tab" aria-selected={tab.id === value} onClick={() => onChange(tab.id)}>
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function Toolbar({ editor }) {
  if (!editor) return null;

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Editor toolbar">
      <button type="button" className={editor.isActive('bold') ? 'tool-button is-active' : 'tool-button'} onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
      <button type="button" className={editor.isActive('italic') ? 'tool-button is-active' : 'tool-button'} onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
      <button type="button" className={editor.isActive('bulletList') ? 'tool-button is-active' : 'tool-button'} onClick={() => editor.chain().focus().toggleBulletList().run()}>Bullets</button>
      <button type="button" className={editor.isActive('orderedList') ? 'tool-button is-active' : 'tool-button'} onClick={() => editor.chain().focus().toggleOrderedList().run()}>Numbered</button>
      <button type="button" className={editor.isActive('heading', { level: 2 }) ? 'tool-button is-active' : 'tool-button'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Heading</button>
    </div>
  );
}

export default function AdminNewsPage() {
  const { copy } = useLocale();
  const page = copy.admin.unlock;
  const [mode, setMode] = useState('editor');
  const [adminKey, setAdminKey] = useState('');
  const adminKeyRef = useRef('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filePreviewHtml, setFilePreviewHtml] = useState('');
  const [filePreviewLoading, setFilePreviewLoading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false })],
    content: '',
    editorProps: {
      handlePaste(view, event) {
        const clipboard = event.clipboardData;
        const files = Array.from(clipboard?.files || []).filter((file) => file.type?.startsWith('image/'));
        const items = Array.from(clipboard?.items || []);
        const imageItems = items.filter((item) => item.kind === 'file' && item.type?.startsWith('image/'));

        if (files.length === 0 && imageItems.length === 0) return false;

        event.preventDefault();

        (async () => {
          try {
            setError('');
            setSuccess('');

            for (const item of imageItems) {
              const file = item.getAsFile();
              if (!file) continue;

              const data = new FormData();
              data.append('image', file);

              const response = await fetch('/api/admin/news/assets/image', {
                method: 'POST',
                headers: {
                  ...(adminKeyRef.current ? { 'x-admin-key': adminKeyRef.current } : {}),
                },
                body: data,
              });

              const body = await response.json().catch(() => null);
              if (!response.ok) throw new Error(body?.message || `Image upload failed with status ${response.status}`);

              const url = String(body?.url || '');
              if (!url) throw new Error('Image upload did not return a URL.');

              editor.chain().focus().setImage({ src: url }).run();
            }

            for (const file of files) {
              const data = new FormData();
              data.append('image', file);

              const response = await fetch('/api/admin/news/assets/image', {
                method: 'POST',
                headers: {
                  ...(adminKeyRef.current ? { 'x-admin-key': adminKeyRef.current } : {}),
                },
                body: data,
              });

              const body = await response.json().catch(() => null);
              if (!response.ok) throw new Error(body?.message || `Image upload failed with status ${response.status}`);

              const url = String(body?.url || '');
              if (!url) throw new Error('Image upload did not return a URL.');

              editor.chain().focus().setImage({ src: url }).run();
            }
          } catch (pasteError) {
            setError(pasteError.message || 'Failed to paste image.');
          }
        })();

        return true;
      },
    },
  });

  const isEditor = mode === 'editor';
  const isFile = mode === 'file';

  async function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      setFilePreviewHtml('');
      return;
    }

    try {
      setFilePreviewLoading(true);
      setError('');
      setSuccess('');

      const data = new FormData();
      data.append('contentFile', file);

      const response = await fetch('/api/admin/news/preview', {
        method: 'POST',
        headers: {
          ...(adminKey ? { 'x-admin-key': adminKey } : {}),
        },
        body: data,
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || `Preview failed with status ${response.status}`);

      setFilePreviewHtml(String(body?.html || ''));
    } catch (previewError) {
      setFilePreviewHtml('');
      setError(previewError.message || 'Failed to preview file.');
    } finally {
      setFilePreviewLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (isEditor) {
        data.set('content', editor?.getHTML() || '');
        data.delete('contentFile');
      }

      if (isFile) {
        data.delete('content');
      }

      data.delete('adminKey');

      const response = await fetch('/api/admin/news', {
        method: 'POST',
        headers: {
          ...(adminKey ? { 'x-admin-key': adminKey } : {}),
        },
        body: data,
      });

      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || `Request failed with status ${response.status}`);

      setSuccess(page.createNewsSuccess);
      form.reset();
      setFilePreviewHtml('');
      if (editor) editor.commands.setContent('');
    } catch (submitError) {
      setError(submitError.message || page.createNewsError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader kicker="Admin" title={page.newsTitle} summary={page.newsSummary} />

      <section className="section section-light reveal">
        <div className="container">
          <TabBar value={mode} labels={{ editor: page.editor, file: 'Từ tệp' }} onChange={(nextMode) => { setMode(nextMode); setError(''); setSuccess(''); }} />

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>{page.adminKey}</span>
                <input
                  type="password"
                  name="adminKey"
                  placeholder="x-admin-key"
                  autoComplete="off"
                  value={adminKey}
                  onChange={(event) => {
                    setAdminKey(event.target.value);
                    adminKeyRef.current = event.target.value;
                  }}
                />
              </label>
              <label className="field">
                <span>{page.type}</span>
                <input type="text" name="type" placeholder="News" />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>{page.publishedAt}</span>
                <input type="datetime-local" name="publishedAt" />
              </label>
            </div>

            {isEditor ? (
              <>
                <div className="field-grid">
                  <label className="field">
                    <span>{page.title}</span>
                    <input type="text" name="title" placeholder="Title" required />
                  </label>
                  <label className="field">
                    <span>{page.slug}</span>
                    <input type="text" name="slug" placeholder="leave blank to auto-generate" />
                  </label>
                </div>

                <label className="field">
                  <span>{page.content}</span>
                  <Toolbar editor={editor} />
                  <div className="rich-editor">
                    <EditorContent editor={editor} />
                  </div>
                  <p className="state-copy">{page.tip}</p>
                </label>
              </>
            ) : null}

            {isFile ? (
              <>
                <div className="field-grid">
                  <label className="field">
                    <span>{page.title}</span>
                    <input type="text" name="title" placeholder="Title" required />
                  </label>
                  <label className="field">
                    <span>{page.slug}</span>
                    <input type="text" name="slug" placeholder="leave blank to auto-generate" />
                  </label>
                </div>

                <label className="field">
                  <span>{page.chooseFile}</span>
                  <input type="file" name="contentFile" required onChange={handleFileChange} accept=".docx,.html,.htm,.txt,.md" />
                  <p className="state-copy">{page.supportedFiles}</p>
                </label>

                {filePreviewLoading ? (
                  <div className="state-panel">
                    <p className="state-label">Preview</p>
                    <p className="state-copy">Generating preview...</p>
                  </div>
                ) : null}

                {!filePreviewLoading && filePreviewHtml ? (
                  <article className="content-card">
                    <p className="content-label">Preview</p>
                    <div className="news-content" dangerouslySetInnerHTML={{ __html: filePreviewHtml }} />
                  </article>
                ) : null}
              </>
            ) : null}

            <div className="form-footer">
              <button className="button button-primary" type="submit" disabled={submitting}>
                {submitting ? 'Uploading...' : page.publishNews}
              </button>
              <p className="form-feedback" aria-live="polite">
                {error ? `Error: ${error}` : success}
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
