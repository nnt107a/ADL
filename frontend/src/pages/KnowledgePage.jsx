import PageHeader from '../components/PageHeader';
import { Link } from 'react-router-dom';

const articles = [
  {
    type: 'Insight',
    date: '20 Mar 2026',
    title: 'Three questions to ask before your next partnership.',
    text: 'A simple checklist for aligning commercial expectations, accountability, and exit options.',
  },
  {
    type: 'Update',
    date: '18 Mar 2026',
    title: 'How to prepare for a review without slowing the business down.',
    text: 'Keep the process focused by organizing information, ownership, and response timing early.',
  },
  {
    type: 'Guide',
    date: '12 Mar 2026',
    title: 'Turning policy updates into practical action for your team.',
    text: 'The best update is one that people can understand, follow, and apply in their work.',
  },
];

export default function KnowledgePage() {
  return (
    <>
      <PageHeader
        kicker="Insight"
        title="Short reads with practical takeaways."
        summary="Use this area for insights, announcements, and updates that help clients stay ahead of change."
      />

      <section className="section section-alt reveal">
        <div className="container cards-grid insights-grid">
          {articles.map((article) => (
            <article className="insight-card" key={article.title}>
              <div className="insight-meta">
                <span>{article.type}</span>
                <time>{article.date}</time>
              </div>
              <h3>{article.title}</h3>
              <p>{article.text}</p>
              <Link to="/contact">Read more</Link>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
