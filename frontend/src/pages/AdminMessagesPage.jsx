import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchMessages();
  }, [filter]);

  async function fetchMessages() {
    try {
      setLoading(true);
      setError('');
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/admin/messages${query}`);

      if (!response.ok) {
        throw new Error('Failed to load messages from server.');
      }

      const json = await response.json();
      const list = json.data || [];
      setMessages(list);

      if (list.length > 0) {
        if (!selectedId || !list.some((m) => String(m._id) === String(selectedId))) {
          loadMessageDetail(list[0]._id);
        } else {
          loadMessageDetail(selectedId);
        }
      } else {
        setSelectedId(null);
        setSelectedMessage(null);
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching messages.');
    } finally {
      setLoading(false);
    }
  }

  async function loadMessageDetail(id) {
    try {
      setSelectedId(id);
      setFeedback('');
      const response = await fetch(`/api/admin/messages/${id}`);
      if (!response.ok) return;

      const json = await response.json();
      setSelectedMessage(json.data);

      setMessages((current) =>
        current.map((m) =>
          String(m._id) === String(id) ? { ...m, status: m.status === 'unread' ? 'read' : m.status } : m
        )
      );
    } catch (err) {
      console.error('Failed to load message detail:', err);
    }
  }

  async function handleSendReply(event) {
    event.preventDefault();
    if (!replyText.trim() || !selectedId) return;

    try {
      setSendingReply(true);
      setFeedback('');

      const response = await fetch(`/api/admin/messages/${selectedId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ replyText }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || 'Failed to send reply.');
      }

      setSelectedMessage(json.data);
      setReplyText('');
      setFeedback('Reply sent to user Gmail and recorded in conversation thread.');

      setMessages((current) =>
        current.map((m) => (String(m._id) === String(selectedId) ? { ...m, status: 'replied' } : m))
      );
    } catch (err) {
      setFeedback(err.message || 'Error sending reply.');
    } finally {
      setSendingReply(false);
    }
  }

  async function handleDeleteMessage(id) {
    if (!window.confirm('Are you sure you want to delete this conversation thread?')) return;

    try {
      setDeletingId(id);
      const response = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete message thread.');
      }

      const updated = messages.filter((m) => String(m._id) !== String(id));
      setMessages(updated);

      if (updated.length > 0) {
        loadMessageDetail(updated[0]._id);
      } else {
        setSelectedId(null);
        setSelectedMessage(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to delete message thread.');
    } finally {
      setDeletingId(null);
    }
  }

  // Build unified items array for chatbox view
  const conversationItems = selectedMessage
    ? selectedMessage.items && selectedMessage.items.length > 0
      ? selectedMessage.items
      : [
          ...(selectedMessage.message
            ? [{ sender: 'user', text: selectedMessage.message, createdAt: selectedMessage.createdAt }]
            : []),
          ...(selectedMessage.replies || []).map((r) => ({
            sender: 'admin',
            text: r.text,
            createdAt: r.createdAt,
          })),
        ]
    : [];

  return (
    <>
      <PageHeader
        kicker="ADMIN"
        title="User Messages Inbox"
        summary="Review inquiries grouped into unified email conversation threads, track unread items, and send replies directly to user Gmail."
      >
        <div className="page-header-action">
          <Link className="page-header-back-link" to="/contact">
            ← Back to Contact Page
          </Link>
        </div>
      </PageHeader>

      <section className="section section-light reveal is-visible">
        <div className="container">
          <div className="filter-panel" style={{ marginBottom: '1.5rem' }}>
            <div className="filter-chip-grid">
              <button
                type="button"
                className={`filter-chip ${filter === 'all' ? 'is-active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Conversations ({messages.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'unread' ? 'is-active' : ''}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'replied' ? 'is-active' : ''}`}
                onClick={() => setFilter('replied')}
              >
                Replied
              </button>
            </div>
          </div>

          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} />
          ) : messages.length === 0 ? (
            <div className="content-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
              <h3>No messages in inbox</h3>
              <p>User contact inquiries submitted through the website will appear here.</p>
            </div>
          ) : (
            <div className="admin-editor-layout" style={{ gap: '1.5rem' }}>
              {/* Message List Sidebar */}
              <div style={{ display: 'grid', gap: '0.75rem', alignContent: 'start' }}>
                {messages.map((item) => (
                  <button
                    type="button"
                    key={item._id}
                    onClick={() => loadMessageDetail(item._id)}
                    style={{
                      textAlign: 'left',
                      padding: '1.1rem',
                      borderRadius: '16px',
                      border: String(item._id) === String(selectedId) ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: String(item._id) === String(selectedId) ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.7)',
                      boxShadow: String(item._id) === String(selectedId) ? '0 10px 24px rgba(12, 40, 57, 0.08)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--navy)' }}>{item.name}</span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '999px',
                          background: item.status === 'unread' ? 'rgba(255, 189, 89, 0.3)' : item.status === 'replied' ? 'rgba(2, 107, 154, 0.15)' : 'rgba(12, 40, 57, 0.08)',
                          color: item.status === 'unread' ? 'var(--navy)' : item.status === 'replied' ? 'var(--accent-strong)' : 'var(--muted)',
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.email}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#8898a6', marginTop: '0.35rem' }}>
                      {item.items ? `${item.items.length} message(s)` : '1 message'} • {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>

              {/* Selected Message Thread & Chatbox Area */}
              {selectedMessage && (
                <article className="content-card" style={{ display: 'grid', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--navy)' }}>
                        {selectedMessage.subject || 'Contact Conversation Thread'}
                      </h2>
                      <div style={{ marginTop: '0.4rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
                        From: <strong>{selectedMessage.name}</strong> (&lt;<a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>&gt;)
                        {selectedMessage.phone && <span> • Phone: <strong><a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a></strong></span>}
                        {selectedMessage.company && <span> • Company: <strong>{selectedMessage.company}</strong></span>}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="page-header-admin-link page-header-admin-link-delete"
                      disabled={deletingId === selectedMessage._id}
                      onClick={() => handleDeleteMessage(selectedMessage._id)}
                    >
                      {deletingId === selectedMessage._id ? 'Deleting...' : 'Delete Thread'}
                    </button>
                  </div>

                  {/* Conversation Chatbox History */}
                  <div>
                    <h4 style={{ margin: '0 0 0.75rem', textTransform: 'uppercase', fontSize: '0.78rem', letterSpacing: '0.12em', color: 'var(--accent)' }}>
                      Conversation Thread ({conversationItems.length})
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {conversationItems.map((item, idx) => {
                        const isUser = item.sender === 'user';
                        return (
                          <div
                            key={item._id || idx}
                            style={{
                              alignSelf: isUser ? 'flex-start' : 'flex-end',
                              maxWidth: '88%',
                              width: '100%',
                              padding: '1.15rem 1.35rem',
                              borderRadius: isUser ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                              background: isUser ? 'rgba(12, 40, 57, 0.05)' : 'rgba(255, 189, 89, 0.15)',
                              border: isUser ? '1px solid rgba(12, 40, 57, 0.12)' : '1px solid rgba(255, 189, 89, 0.4)',
                              boxShadow: '0 4px 14px rgba(12, 40, 57, 0.04)',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.76rem', fontWeight: 800 }}>
                              <span style={{ color: isUser ? 'var(--navy)' : 'var(--accent-strong)', textTransform: 'uppercase' }}>
                                {isUser ? `User (${selectedMessage.name})` : 'AD Legal Admin (Sent via Gmail)'}
                              </span>
                              <span style={{ color: 'var(--muted)' }}>
                                {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            {item.subject && isUser && (
                              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.35rem' }}>
                                Subject: {item.subject}
                              </div>
                            )}

                            <div style={{ fontSize: '0.96rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                              {item.text}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Admin Reply Form */}
                  <form onSubmit={handleSendReply} style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                    <label className="field">
                      <span>Send Gmail Response to {selectedMessage.email}</span>
                      <textarea
                        rows="4"
                        placeholder="Type your response to send to user's Gmail address..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        required
                      />
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button
                        type="submit"
                        className="button button-primary"
                        disabled={sendingReply}
                      >
                        {sendingReply ? 'Dispatching Email...' : 'Send Reply via Email'}
                      </button>
                      {feedback && <span style={{ fontSize: '0.9rem', color: 'var(--accent-strong)', fontWeight: 700 }}>{feedback}</span>}
                    </div>
                  </form>
                </article>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
