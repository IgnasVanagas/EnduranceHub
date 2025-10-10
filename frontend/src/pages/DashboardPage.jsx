import { useEffect, useMemo, useState } from 'react';
import { format, isAfter, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth.js';
import Loader from '../components/Loader.jsx';
import StatCard from '../components/StatCard.jsx';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user, authFetch } = useAuth();
  const [data, setData] = useState({
    trainingPlans: [],
    nutritionPlans: [],
    athletes: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const requests = [
          authFetch('/training-plans'),
          authFetch('/nutrition-plans'),
          authFetch('/messages'),
          authFetch('/athletes')
        ];

        const [training, nutrition, messages, athletes] = await Promise.allSettled(requests);

        if (!isMounted) return;

        const extract = (result, key) =>
          result.status === 'fulfilled' ? result.value?.[key] || [] : [];

        setData({
          trainingPlans: extract(training, 'trainingPlans'),
          nutritionPlans: extract(nutrition, 'nutritionPlans'),
          messages: extract(messages, 'messages'),
          athletes: extract(athletes, 'athletes')
        });
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load dashboard data.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const upcomingTraining = useMemo(
    () =>
      data.trainingPlans
        .filter((plan) => {
          try {
            return !plan.startDate || isAfter(parseISO(plan.endDate || plan.startDate), new Date());
          } catch (error) {
            return false;
          }
        })
        .slice(0, 3),
    [data.trainingPlans]
  );

  const recentMessages = useMemo(() => data.messages.slice(0, 3), [data.messages]);

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      <section className="dashboard__stats">
        <StatCard
          title="Training plans"
          value={data.trainingPlans.length}
          description="Active and scheduled programmes"
          accent="blue"
        />
        <StatCard
          title="Nutrition plans"
          value={data.nutritionPlans.length}
          description="Diet guidance in progress"
          accent="green"
        />
        {user.role !== 'ATHLETE' && (
          <StatCard
            title="Athletes"
            value={data.athletes.length}
            description="Active athlete profiles"
            accent="orange"
          />
        )}
      </section>

      <section className="dashboard__grid">
        <article className="dashboard__panel">
          <h3>Upcoming sessions</h3>
          {upcomingTraining.length === 0 ? (
            <p className="dashboard__empty">No training sessions are scheduled.</p>
          ) : (
            <ul className="dashboard__list">
              {upcomingTraining.map((plan) => (
                <li key={plan.id} className="dashboard__list-item">
                  <div>
                    <strong>{plan.title}</strong>
                    <p>{plan.description}</p>
                  </div>
                  <span>{plan.startDate ? format(parseISO(plan.startDate), 'yyyy-MM-dd') : 'Not set'}</span>
                </li>
              ))}
            </ul>
          )}
        </article>

        <article className="dashboard__panel">
          <h3>Recent messages</h3>
          {recentMessages.length === 0 ? (
            <p className="dashboard__empty">No messages yet.</p>
          ) : (
            <ul className="dashboard__list">
              {recentMessages.map((message) => (
                <li key={message.id} className="dashboard__list-item">
                  <div>
                    <strong>{message.subject}</strong>
                    <p>
                      {message.body.substring(0, 90)}
                      {message.body.length > 90 ? '...' : ''}
                    </p>
                  </div>
                  <span>{message.createdAt ? format(parseISO(message.createdAt), 'yyyy-MM-dd') : ''}</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>
    </div>
  );
};

export default DashboardPage;
