import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import PageSEO from '../components/PageSEO';
import { useLocale } from '../context/LocaleContext';
import { pageBackdrops, pageHeaderThemes } from '../data/pageAssets';

export default function ContactPage() {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { copy, locale } = useLocale();
  const page = copy.pages.contact;

  useEffect(() => {
    function checkSession() {
      fetch('/api/session')
        .then((res) => res.json())
        .then((data) => {
          if (data.isAdmin) {
            setIsAdmin(true);
          }
        })
        .catch(() => {});
    }

    checkSession();
    window.addEventListener('adl-admin-session-granted', checkSession);
    return () => {
      window.removeEventListener('adl-admin-session-granted', checkSession);
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company'),
      subject: formData.get('subject'),
      message: formData.get('message'),
    };

    try {
      setIsSubmitting(true);
      setFeedback('');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Failed to submit contact request.');
      }

      setFeedback(json.message || page.form.success);
      form.reset();
    } catch (err) {
      setFeedback(err.message || 'An error occurred while sending your message.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageSEO
        title={page.title || 'Contact Us'}
        description={page.summary || 'Get in touch with AD Legal. Our legal and financial advisory team is ready to assist you. Contact us by phone, email, or message form.'}
        url="https://adlegal.vn/contact"
        locale={locale}
      />
      <PageHeader
        kicker={page.kicker}
        title={page.title}
        summary={page.summary}
        featured
        backdropImage={pageBackdrops.contact}
        {...pageHeaderThemes.contact}
        kickerColor="white"
        titleColor="white"
        summaryColor="white"
      >
        {isAdmin && (
          <div className="page-header-action" style={{ marginTop: '1rem' }}>
            <Link className="page-header-admin-link page-header-admin-link-edit" to="/admin/messages">
              Admin: Messages Inbox
            </Link>
          </div>
        )}
      </PageHeader>

      <section className="section section-light reveal">
        <div className="container">
          {isAdmin && (
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Link
                to="/admin/messages"
                className="page-header-admin-link page-header-admin-link-edit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.35rem',
                  borderRadius: '14px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                📬 Admin Messages Inbox
              </Link>
            </div>
          )}

          <div className="contact-grid">
            <div className="contact-stack">
              {page.details.map((item) => (
                <article className="contact-card" key={item.label}>
                  <span className="contact-label">{item.label}</span>
                  {item.href ? <a href={item.href}>{item.value}</a> : <p>{item.value}</p>}
                </article>
              ))}
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field-grid">
                <label className="field">
                  <span>{page.form.name}</span>
                  <input type="text" name="name" placeholder={page.form.namePlaceholder} required />
                </label>
                <label className="field">
                  <span>{page.form.email}</span>
                  <input type="email" name="email" placeholder={page.form.emailPlaceholder} required />
                </label>
              </div>

              <div className="field-grid">
                <label className="field">
                  <span>{page.form.phone}</span>
                  <input type="tel" name="phone" placeholder={page.form.phonePlaceholder} />
                </label>
                <label className="field">
                  <span>{page.form.company}</span>
                  <input type="text" name="company" placeholder={page.form.companyPlaceholder} />
                </label>
              </div>

              <label className="field">
                <span>{page.form.subject}</span>
                <input type="text" name="subject" placeholder={page.form.subjectPlaceholder} />
              </label>

              <label className="field">
                <span>{page.form.message}</span>
                <textarea name="message" rows="6" placeholder={page.form.messagePlaceholder} required />
              </label>

              <div className="form-footer">
                <button
                  className="page-header-admin-link page-header-admin-link-edit"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : page.form.send}
                </button>
                <p className="form-feedback" aria-live="polite">
                  {feedback}
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
