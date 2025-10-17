import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '../hooks/useAuth.js';
import Loader from '../components/Loader.jsx';
import '../styles/plans.css';

const defaultForm = {
  athleteId: '',
  specialistId: '',
  title: '',
  description: '',
  caloriesPerDay: '',
  carbohydrates: '',
  protein: '',
  fat: '',
  startDate: '',
  endDate: ''
};

const NutritionPlansPage = () => {
  const { user, authFetch } = useAuth();
  const [plans, setPlans] = useState([]);
  const [athletes, setAthletes] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canManage = user.role === 'SPECIALIST' || user.role === 'ADMIN';
  const isEditing = editingId !== null;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [plansResponse, athletesResponse] = await Promise.all([
          authFetch('/nutrition-plans'),
          authFetch('/athletes')
        ]);
        if (!isMounted) return;
        setPlans(plansResponse?.nutritionPlans || []);
        setAthletes(athletesResponse?.athletes || []);
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load nutrition plans.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [authFetch]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleEdit = (plan) => {
    setError(null);
    setForm({
      athleteId: plan.athleteId ? String(plan.athleteId) : '',
      specialistId: plan.specialistId ? String(plan.specialistId) : '',
      title: plan.title || '',
      description: plan.description || '',
      caloriesPerDay: plan.caloriesPerDay ? String(plan.caloriesPerDay) : '',
      carbohydrates: plan.macronutrientRatio?.carbohydrates ? String(plan.macronutrientRatio.carbohydrates) : '',
      protein: plan.macronutrientRatio?.protein ? String(plan.macronutrientRatio.protein) : '',
      fat: plan.macronutrientRatio?.fat ? String(plan.macronutrientRatio.fat) : '',
      startDate: plan.startDate ? plan.startDate.slice(0, 10) : '',
      endDate: plan.endDate ? plan.endDate.slice(0, 10) : ''
    });
    setEditingId(plan.id);
  };

  const buildNumber = (value) => {
    if (value === '' || value === null || value === undefined) {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.athleteId || !form.title || !form.startDate || !form.endDate) {
      setError('Please complete the required fields.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        athleteId: Number(form.athleteId),
        title: form.title,
        description: form.description,
        caloriesPerDay: buildNumber(form.caloriesPerDay),
        macronutrientRatio: {
          carbohydrates: buildNumber(form.carbohydrates),
          protein: buildNumber(form.protein),
          fat: buildNumber(form.fat)
        },
        startDate: form.startDate,
        endDate: form.endDate
      };

      if (user.role === 'ADMIN' && form.specialistId) {
        payload.specialistId = Number(form.specialistId);
      }

      if (isEditing) {
        const response = await authFetch(`/nutrition-plans/${editingId}`, {
          method: 'PUT',
          body: payload
        });
        setPlans((prev) =>
          prev.map((plan) => (plan.id === editingId ? response.nutritionPlan : plan))
        );
      } else {
        const response = await authFetch('/nutrition-plans', {
          method: 'POST',
          body: payload
        });
        setPlans((prev) => [response.nutritionPlan, ...prev]);
      }

      resetForm();
    } catch (err) {
      setError(err.message || 'Unable to save the nutrition plan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Delete this nutrition plan?')) return;
    try {
      await authFetch(`/nutrition-plans/${planId}`, { method: 'DELETE' });
      setPlans((prev) => prev.filter((plan) => plan.id !== planId));
      if (editingId === planId) {
        resetForm();
      }
    } catch (err) {
      setError(err.message || 'Unable to delete the plan.');
    }
  };

  if (loading) {
    return <Loader message="Loading nutrition plans..." />;
  }

  return (
    <div className="plans-page">
      <header className="plans-page__header">
        <h2 className="plans-page__title">Nutrition plans</h2>
        <p className="plans-page__subtitle">Align daily nutrition targets with the athlete's goals.</p>
      </header>

      {error && <div className="plans-alert">{error}</div>}

      <div className="plans-page__grid">
        {canManage && (
          <section className="plans-page__card">
            <h3>{isEditing ? 'Edit plan' : 'New plan'}</h3>
            <form className="plans-form" onSubmit={handleSubmit}>
              <div className="plans-form__field">
                <label htmlFor="athleteId">Athlete</label>
                <select
                  name="athleteId"
                  id="athleteId"
                  value={form.athleteId}
                  onChange={handleChange}
                  required
                  disabled={isEditing}
                >
                  <option value="">Select an athlete</option>
                  {athletes.map((athlete) => (
                    <option key={athlete.id} value={athlete.id}>
                      {athlete.user?.firstName} {athlete.user?.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {user.role === 'ADMIN' && (
                <div className="plans-form__field">
                  <label htmlFor="specialistId">Assigned dietitian (user ID)</label>
                  <input
                    name="specialistId"
                    id="specialistId"
                    type="number"
                    value={form.specialistId}
                    onChange={handleChange}
                    placeholder="Specialist user ID"
                  />
                </div>
              )}

              <div className="plans-form__field">
                <label htmlFor="title">Title</label>
                <input name="title" id="title" value={form.title} onChange={handleChange} required />
              </div>

              <div className="plans-form__field plans-form__field--full">
                <label htmlFor="description">Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="plans-form__field">
                <label htmlFor="caloriesPerDay">Calories (kcal/day)</label>
                <input
                  name="caloriesPerDay"
                  id="caloriesPerDay"
                  type="number"
                  value={form.caloriesPerDay}
                  onChange={handleChange}
                />
              </div>

              <div className="plans-form__field">
                <label htmlFor="carbohydrates">Carbohydrates (%)</label>
                <input
                  name="carbohydrates"
                  id="carbohydrates"
                  type="number"
                  value={form.carbohydrates}
                  onChange={handleChange}
                />
              </div>

              <div className="plans-form__field">
                <label htmlFor="protein">Protein (%)</label>
                <input name="protein" id="protein" type="number" value={form.protein} onChange={handleChange} />
              </div>

              <div className="plans-form__field">
                <label htmlFor="fat">Fat (%)</label>
                <input name="fat" id="fat" type="number" value={form.fat} onChange={handleChange} />
              </div>

              <div className="plans-form__field">
                <label htmlFor="startDate">Start date</label>
                <input
                  name="startDate"
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="plans-form__field">
                <label htmlFor="endDate">End date</label>
                <input
                  name="endDate"
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="plans-form__actions">
                <button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Update plan' : 'Save plan'}
                </button>
                {isEditing && (
                  <button type="button" className="plans-form__secondary" onClick={resetForm} disabled={saving}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        )}

        <section className="plans-page__card">
          <h3>All plans</h3>
          {plans.length === 0 ? (
            <p>No nutrition plans have been created yet.</p>
          ) : (
            <table className="plans-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Athlete</th>
                  <th>Calories</th>
                  <th>Period</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td>{plan.title}</td>
                    <td>
                      {plan.athlete?.user?.firstName} {plan.athlete?.user?.lastName}
                    </td>
                    <td>{plan.caloriesPerDay || 'Not set'}</td>
                    <td>
                      {plan.startDate ? format(parseISO(plan.startDate), 'yyyy-MM-dd') : 'Not set'} -{' '}
                      {plan.endDate ? format(parseISO(plan.endDate), 'yyyy-MM-dd') : 'Not set'}
                    </td>
                    {canManage && (
                      <td className="plans-table__actions">
                        <button type="button" onClick={() => handleEdit(plan)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(plan.id)}>
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
};

export default NutritionPlansPage;
