import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth.js';
import Loader from '../components/Loader.jsx';
import '../styles/messages.css';

const defaultForm = {
  recipientId: '',
  subject: '',
  body: ''
};

const MessagesPage = () => {
  const { user, authFetch } = useAuth();
  const [box, setBox] = useState('inbox');
  const [messages, setMessages] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const canSend = user.role !== 'GUEST';

  useEffect(() => {
    let isMounted = true;
    const fetchRecipients = async () => {
      try {
        const [athletesRes, trainingRes, nutritionRes] = await Promise.all([
          authFetch('/athletes'),
          authFetch('/training-plans'),
          authFetch('/nutrition-plans')
        ]);

        if (!isMounted) return;

        const allUsers = new Map();

        athletesRes?.athletes?.forEach((athlete) => {
          if (athlete.user) {
            allUsers.set(athlete.user.id, {
              id: athlete.user.id,
              name: `${athlete.user.firstName} ${athlete.user.lastName}`,
              role: athlete.user.role
            });
          }
        });

        trainingRes?.trainingPlans?.forEach((plan) => {
          if (plan.specialist) {
            allUsers.set(plan.specialist.id, {
              id: plan.specialist.id,
              name: `${plan.specialist.firstName} ${plan.specialist.lastName}`,
              role: plan.specialist.role || 'SPECIALIST'
            });
          }
        });

        nutritionRes?.nutritionPlans?.forEach((plan) => {
          if (plan.specialist) {
            allUsers.set(plan.specialist.id, {
              id: plan.specialist.id,
              name: `${plan.specialist.firstName} ${plan.specialist.lastName}`,
              role: plan.specialist.role || 'SPECIALIST'
            });
          }
        });

        setRecipients(Array.from(allUsers.values()).filter((person) => person.id !== user.id));
      } catch (err) {
        console.warn('Failed to load message recipients', err);
      }
    };

    fetchRecipients();
    return () => {
      isMounted = false;
    };
  }, [authFetch, user.id]);

  useEffect(() => {
    let isMounted = true;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authFetch(`/messages?box=${box}`);
        if (!isMounted) return;
        setMessages(response?.messages || []);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load messages.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [authFetch, box]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.recipientId || !form.subject || !form.body) {
      setError('Please complete all message fields.');
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await authFetch('/messages', {
        method: 'POST',
        body: {
          recipientId: Number(form.recipientId),
          subject: form.subject,
          body: form.body
        }
      });

      if (box === 'outbox') {
        setMessages((prev) => [response.message, ...prev]);
      }
      setForm(defaultForm);
    } catch (err) {
      setError(err.message || 'Unable to send the message.');
    } finally {
      setSending(false);
    }
  };

  const formattedMessages = useMemo(
    () =>
      messages.map((message) => ({
        ...message,
        createdAt: message.createdAt ? format(parseISO(message.createdAt), 'yyyy-MM-dd HH:mm') : ''
      })),
    [messages]
  );

  if (loading) {
    return <Loader message="Loading messages..." />;
  }

  return (
    <div className="messages">
      <section className="messages__card">
        <div className="messages__tabs">
          {['inbox', 'outbox'].map((key) => (
            <button
              key={key}
              type="button"
              className={key === box ? 'messages__tab messages__tab--active' : 'messages__tab'}
              onClick={() => setBox(key)}
            >
              {key === 'inbox' ? 'Inbox' : 'Sent'}
            </button>
          ))}
        </div>

        {error && <div className="plans-alert">{error}</div>}

        {formattedMessages.length === 0 ? (
          <p className="messages__empty">No messages in this folder.</p>
        ) : (
          <ul className="messages__list">
            {formattedMessages.map((message) => (
              <li key={message.id} className="messages__item">
                <div className="messages__meta">
                  <span>
                    {box === 'inbox'
                      ? `From: ${message.sender?.firstName || ''} ${message.sender?.lastName || ''}`
                      : `To: ${message.recipient?.firstName || ''} ${message.recipient?.lastName || ''}`}
                  </span>
                  <span>{message.createdAt}</span>
                </div>
                <strong>{message.subject}</strong>
                <p>{message.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {canSend && (
        <section className="messages__card">
          <h3>Compose a message</h3>
          <form className="messages__form" onSubmit={handleSubmit}>
            <div className="messages__field">
              <label htmlFor="recipientId">Recipient</label>
              <select
                id="recipientId"
                name="recipientId"
                value={form.recipientId}
                onChange={handleChange}
                required
              >
                <option value="">Select a recipient</option>
                {recipients.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="messages__field">
              <label htmlFor="subject">Subject</label>
              <input id="subject" name="subject" value={form.subject} onChange={handleChange} required />
            </div>

            <div className="messages__field messages__field--full">
              <label htmlFor="body">Message</label>
              <textarea
                id="body"
                name="body"
                rows={5}
                value={form.body}
                onChange={handleChange}
                required
              />
            </div>

            <div className="messages__actions">
              <button type="submit" disabled={sending}>
                {sending ? 'Sending...' : 'Send message'}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
};

export default MessagesPage;
