import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import Loader from '../components/Loader.jsx';
import '../styles/profile.css';

const emptyProfile = {
  id: null,
  dateOfBirth: '',
  heightCm: '',
  weightKg: '',
  restingHeartRate: '',
  bio: ''
};

const AthleteProfilePage = () => {
  const { user, authFetch } = useAuth();
  const [athletes, setAthletes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadAthletes = async () => {
      setLoading(true);
      try {
        const response = await authFetch('/athletes');
        if (!isMounted) return;
        const list = response?.athletes || [];
        setAthletes(list);
        if (list.length > 0) {
          const current =
            user.role === 'ATHLETE'
              ? list.find((item) => item.userId === user.id) || list[0]
              : list[0];
          setSelectedId(current?.id ?? null);
          setForm({
            id: current?.id ?? null,
            dateOfBirth: current?.dateOfBirth || '',
            heightCm: current?.heightCm ?? '',
            weightKg: current?.weightKg ?? '',
            restingHeartRate: current?.restingHeartRate ?? '',
            bio: current?.bio || ''
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to load athlete profiles.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAthletes();
    return () => {
      isMounted = false;
    };
  }, [authFetch, user.id, user.role]);

  const currentAthlete = useMemo(
    () => athletes.find((athlete) => athlete.id === selectedId) || null,
    [athletes, selectedId]
  );

  useEffect(() => {
    if (currentAthlete) {
      setForm({
        id: currentAthlete.id,
        dateOfBirth: currentAthlete.dateOfBirth || '',
        heightCm: currentAthlete.heightCm ?? '',
        weightKg: currentAthlete.weightKg ?? '',
        restingHeartRate: currentAthlete.restingHeartRate ?? '',
        bio: currentAthlete.bio || ''
      });
    }
  }, [currentAthlete?.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!form.id) return;
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const payload = {
        dateOfBirth: form.dateOfBirth || null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        restingHeartRate: form.restingHeartRate ? Number(form.restingHeartRate) : null,
        bio: form.bio || null
      };
      const response = await authFetch(`/athletes/${form.id}`, {
        method: 'PUT',
        body: payload
      });
      setMessage('Profile updated successfully.');
      setAthletes((prev) =>
        prev.map((athlete) => (athlete.id === form.id ? response.athlete : athlete))
      );
    } catch (err) {
      setError(err.message || 'We could not save the profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loader message="Loading profile..." />;
  }

  if (!currentAthlete) {
    return <div className="profile-empty">Athlete profile not found.</div>;
  }

  return (
    <div className="profile">
      {user.role !== 'ATHLETE' && (
        <div className="profile__selector">
          <label htmlFor="athleteSelect">Select an athlete</label>
          <select
            id="athleteSelect"
            value={selectedId || ''}
            onChange={(event) => setSelectedId(Number(event.target.value))}
          >
            {athletes.map((athlete) => (
              <option key={athlete.id} value={athlete.id}>
                {athlete.user?.firstName} {athlete.user?.lastName}
              </option>
            ))}
          </select>
        </div>
      )}

      <form className="profile__form" onSubmit={handleSave}>
        <h3>Athlete profile</h3>
        {message && <div className="profile__message profile__message--success">{message}</div>}
        {error && <div className="profile__message profile__message--error">{error}</div>}

        <div className="profile__grid">
          <div className="profile__field">
            <label>First name</label>
            <input value={currentAthlete.user?.firstName || ''} disabled />
          </div>
          <div className="profile__field">
            <label>Last name</label>
            <input value={currentAthlete.user?.lastName || ''} disabled />
          </div>
          <div className="profile__field">
            <label>Email</label>
            <input value={currentAthlete.user?.email || ''} disabled />
          </div>
          <div className="profile__field">
            <label>Date of birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth || ''} onChange={handleChange} />
          </div>
          <div className="profile__field">
            <label>Height (cm)</label>
            <input name="heightCm" type="number" value={form.heightCm || ''} onChange={handleChange} />
          </div>
          <div className="profile__field">
            <label>Weight (kg)</label>
            <input name="weightKg" type="number" value={form.weightKg || ''} onChange={handleChange} />
          </div>
          <div className="profile__field">
            <label>Resting heart rate</label>
            <input
              name="restingHeartRate"
              type="number"
              value={form.restingHeartRate || ''}
              onChange={handleChange}
            />
          </div>
          <div className="profile__field profile__field--full">
            <label>About the athlete</label>
            <textarea name="bio" rows={4} value={form.bio || ''} onChange={handleChange} />
          </div>
        </div>
        <div className="profile__actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AthleteProfilePage;
