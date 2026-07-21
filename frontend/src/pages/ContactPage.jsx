import { useState } from 'react';
import PageHeader from '../components/PageHeader';

const contactDetails = [
  {
    label: 'General enquiries',
    value: 'counsel@adlegal.vn',
    href: 'mailto:counsel@adlegal.vn',
  },
  {
    label: 'Phone',
    value: '+84 878 447 664',
    href: 'tel:+84878447664',
  },
  {
    label: 'Office',
    value: '428/4 Hoang Ngan St, Phu Dinh Ward, Ho Chi Minh City, Vietnam',
  },
  {
    label: 'Working hours',
    value: 'Monday to Friday • 9am to 6pm',
  },
];

export default function ContactPage() {
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setMessage('Thanks — this is a front-end demo. Connect the form to your preferred backend when ready.');
    event.currentTarget.reset();
  }

  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Let’s talk about your next project."
        summary="Share a short note and we’ll respond with the right next step. Replace the placeholder contact details with your official information when you’re ready."
      />

      <section className="section section-light reveal">
        <div className="container contact-grid">
          <div className="contact-stack">
            {contactDetails.map((item) => (
              <article className="contact-card" key={item.label}>
                <span className="contact-label">{item.label}</span>
                {item.href ? <a href={item.href}> {item.value}</a> : <p>{item.value}</p>}
              </article>
            ))}
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>Name</span>
                <input type="text" name="name" placeholder="Your name" required />
              </label>
              <label className="field">
                <span>Email</span>
                <input type="email" name="email" placeholder="you@example.com" required />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Company</span>
                <input type="text" name="company" placeholder="Your company" />
              </label>
              <label className="field">
                <span>Subject</span>
                <input type="text" name="subject" placeholder="How can we help?" />
              </label>
            </div>

            <label className="field">
              <span>Message</span>
              <textarea name="message" rows="6" placeholder="Tell us a little about what you need." required />
            </label>

            <div className="form-footer">
              <button className="page-header-admin-link page-header-admin-link-edit" type="submit">
                Send message
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
