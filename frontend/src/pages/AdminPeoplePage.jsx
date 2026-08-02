import { useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import PageHeader from '../components/PageHeader';
import { useLocale } from '../context/LocaleContext';

function coerceBoolean(value) {
  return value === true || value === 'true' || value === 'on' || value === '1';
}

export default function AdminPeoplePage() {
  const { copy } = useLocale();
  const page = copy.admin.unlock;
  const fileAvatarRef = useRef(null);
  const fileCoverRef = useRef(null);

  const expertiseOptions = useMemo(
    () => ['Strategy', 'Transactions', 'Leadership', 'Commercial', 'Negotiation', 'Operations', 'Compliance', 'Controls', 'Policy', 'Delivery', 'Support', 'Governance', 'Risk'],
    []
  );

  const [adminKey, setAdminKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedExpertise, setSelectedExpertise] = useState([]);
  const [customExpertise, setCustomExpertise] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [experienceHtml, setExperienceHtml] = useState('');

  const experienceEditor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        'aria-label': 'Experience editor',
      },
    },
    onUpdate({ editor }) {
      setExperienceHtml(editor.getHTML());
    },
  });

  function getExperiencePayload() {
    const text = experienceEditor?.getText() || '';
    if (!String(text).trim()) {
      return '';
    }

    return experienceEditor?.getHTML() || experienceHtml || '';
  }

  function ExperienceToolbar() {
    if (!experienceEditor) {
      return null;
    }

    return (
      <div className="editor-toolbar" role="toolbar" aria-label="Experience editor toolbar">
        <button type="button" className={experienceEditor.isActive('bold') ? 'tool-button is-active' : 'tool-button'} onClick={() => experienceEditor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button type="button" className={experienceEditor.isActive('italic') ? 'tool-button is-active' : 'tool-button'} onClick={() => experienceEditor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button type="button" className={experienceEditor.isActive('bulletList') ? 'tool-button is-active' : 'tool-button'} onClick={() => experienceEditor.chain().focus().toggleBulletList().run()}>
          Bullets
        </button>
        <button type="button" className={experienceEditor.isActive('orderedList') ? 'tool-button is-active' : 'tool-button'} onClick={() => experienceEditor.chain().focus().toggleOrderedList().run()}>
          Numbered
        </button>
      </div>
    );
  }

  function buildExpertiseArray() {
    const fromCustom = String(customExpertise || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const merged = [...selectedExpertise, ...fromCustom].map((item) => String(item).trim()).filter(Boolean);
    return Array.from(new Set(merged));
  }

  async function uploadImage(file, kind) {
    const data = new FormData();
    data.append('image', file);

    const response = await fetch(`/api/admin/people/assets/${kind}`, {
      method: 'POST',
      headers: {
        ...(adminKey ? { 'x-admin-key': adminKey } : {}),
      },
      body: data,
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(body?.message || `Upload failed with status ${response.status}`);
    }

    const url = String(body?.url || '').trim();
    if (!url) {
      throw new Error('Upload did not return a URL.');
    }

    return url;
  }

  async function handleAvatarFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError('');
      setSuccess('');
      const url = await uploadImage(file, 'avatar');
      setAvatarUrl(url);
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload avatar.');
    } finally {
      setUploadingAvatar(false);
      if (event.target) event.target.value = '';
    }
  }

  async function handleCoverFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      setError('');
      setSuccess('');
      const url = await uploadImage(file, 'cover');
      setCoverUrl(url);
    } catch (uploadError) {
      setError(uploadError.message || 'Failed to upload cover image.');
    } finally {
      setUploadingCover(false);
      if (event.target) event.target.value = '';
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const data = new FormData(form);
    const expertise = buildExpertiseArray();
    const experience = getExperiencePayload();

    const payload = {
      name: String(data.get('name') || '').trim(),
      role: String(data.get('role') || '').trim(),
      bio: String(data.get('bio') || '').trim(),
      experience: String(experience || '').trim(),
      expertise: expertise.length > 0 ? expertise : undefined,
      email: String(data.get('email') || '').trim(),
      avatar: avatarUrl || String(data.get('avatar') || '').trim(),
      coverImage: coverUrl || undefined,
      order: data.get('order') ? Number(data.get('order')) : undefined,
      featured: coerceBoolean(data.get('featured')),
    };

    if (!payload.experience) delete payload.experience;
    if (!payload.coverImage) delete payload.coverImage;
    if (!payload.email) delete payload.email;
    if (!payload.avatar) delete payload.avatar;
    if (!Number.isFinite(payload.order)) delete payload.order;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const response = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed with status ${response.status}`);
      }

      setSuccess(page.createPersonSuccess);
      form.reset();
      setSelectedExpertise([]);
      setCustomExpertise('');
      setAvatarUrl('');
      setCoverUrl('');
      setExperienceHtml('');
      if (experienceEditor) {
        experienceEditor.commands.setContent('');
      }
    } catch (submitError) {
      setError(submitError.message || page.createPersonError);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader kicker="Admin" title={page.addPeople} summary={page.peopleSummary} />

      <section className="section section-light reveal">
        <div className="container">
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
                  onChange={(event) => setAdminKey(event.target.value)}
                />
              </label>
              <div className="field" />
            </div>

            <div className="profile-uploader">
              <button className="cover-uploader" type="button" onClick={() => fileCoverRef.current?.click()} disabled={uploadingCover}>
                {coverUrl ? <img src={coverUrl} alt="Cover preview" loading="lazy" /> : <span>{uploadingCover ? 'Uploading cover...' : 'Click to upload cover image'}</span>}
              </button>

              <button className="avatar-uploader" type="button" onClick={() => fileAvatarRef.current?.click()} disabled={uploadingAvatar} aria-label="Upload profile photo">
                <div className="avatar avatar-lg" aria-hidden="true">
                  {avatarUrl ? <img src={avatarUrl} alt="" loading="lazy" /> : <span>+</span>}
                </div>
                <span className="avatar-uploader-label">{uploadingAvatar ? 'Uploading photo...' : 'Click to upload profile photo'}</span>
              </button>

              <input ref={fileCoverRef} type="file" accept="image/*" onChange={handleCoverFile} style={{ display: 'none' }} />
              <input ref={fileAvatarRef} type="file" accept="image/*" onChange={handleAvatarFile} style={{ display: 'none' }} />
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input type="text" name="name" placeholder="Full name" required />
              </label>
              <label className="field">
                <span>Role</span>
                <input type="text" name="role" placeholder="Role / title" required />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Email (optional)</span>
                <input type="email" name="email" placeholder="name@example.com" />
              </label>
              <label className="field">
                <span>Avatar fallback (optional)</span>
                <input type="text" name="avatar" placeholder="Initials or https://.../photo.jpg" />
              </label>
            </div>

            <div className="field-grid">
              <div className="field">
                <span>Expertise (optional)</span>
                <div className="expertise-picks" role="group" aria-label="Expertise">
                  {expertiseOptions.map((item) => (
                    <label key={item} className="expertise-pick">
                      <input
                        type="checkbox"
                        checked={selectedExpertise.includes(item)}
                        onChange={(event) => {
                          setSelectedExpertise((current) => {
                            if (event.target.checked) {
                              return current.includes(item) ? current : [...current, item];
                            }
                            return current.filter((value) => value !== item);
                          });
                        }}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <label className="field">
                <span>Order (optional)</span>
                <input type="number" name="order" placeholder="0" min="0" step="1" />
              </label>
            </div>

            <label className="field">
              <span>Custom expertise (optional)</span>
              <input type="text" placeholder="Comma-separated tags" value={customExpertise} onChange={(event) => setCustomExpertise(event.target.value)} />
            </label>

            <label className="field">
              <span>Bio</span>
              <textarea name="bio" rows="4" placeholder="Short biography" required />
            </label>

            <label className="field">
              <span>Experience (optional)</span>
              <ExperienceToolbar />
              <div className="rich-editor">
                <EditorContent editor={experienceEditor} />
              </div>
            </label>

            <label className="field field-inline">
              <input type="checkbox" name="featured" />
              <span>Featured</span>
            </label>

            <div className="form-footer">
              <button className="button button-primary" type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : page.createPerson}
              </button>
              <p className="form-feedback" aria-live="polite">
                {error ? error : success}
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
