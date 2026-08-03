import { useState } from 'react';
import PageHeader from '../components/PageHeader';
import MediaPlaceholder from '../components/MediaPlaceholder';
import { useLocale } from '../context/LocaleContext';

export default function ContactPage() {
  const [message, setMessage] = useState('');
  const { copy } = useLocale();
  const page = copy.pages.contact;

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(page.form.success);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader kicker={page.kicker} title={page.title} summary={page.summary} featured/>

      <section className="section section-light reveal">
        <div className="container contact-grid">
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
                <span>{page.form.company}</span>
                <input type="text" name="company" placeholder={page.form.companyPlaceholder} />
              </label>
              <label className="field">
                <span>{page.form.subject}</span>
                <input type="text" name="subject" placeholder={page.form.subjectPlaceholder} />
              </label>
            </div>

            <label className="field">
              <span>{page.form.message}</span>
              <textarea name="message" rows="6" placeholder={page.form.messagePlaceholder} required />
            </label>

            <div className="form-footer">
              <button className="page-header-admin-link page-header-admin-link-edit" type="submit">
                {page.form.send}
              </button>
              <p className="form-feedback" aria-live="polite">
                {message}
              </p>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
