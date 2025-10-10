import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/auth.css';

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'ATHLETE',
  dateOfBirth: '',
  heightCm: '',
  weightKg: '',
  bio: ''
};

const extractMessages = (error) => {
  const detailSource = Array.isArray(error?.details)
    ? error.details
    : Array.isArray(error?.payload?.details)
      ? error.payload.details
      : [];

  if (detailSource.length === 0) {
    return [error?.message || 'Registration failed.'];
  }

  return detailSource.map((item) =>
    typeof item === 'string' ? item : item.message || error?.message || 'Registration failed.'
  );
};

const RegisterPage = () => {
  const { register } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState([]);
  const [hint, setHint] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors([]);
    setHint(null);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        role: form.role
      };

      if (form.role === 'ATHLETE') {
        payload.athleteProfile = {
          dateOfBirth: form.dateOfBirth || undefined,
          heightCm: form.heightCm ? Number(form.heightCm) : undefined,
          weightKg: form.weightKg ? Number(form.weightKg) : undefined,
          bio: form.bio || undefined
        };
      }

      await register(payload);
    } catch (err) {
      setErrors(extractMessages(err));
      if (err?.hint) {
        setHint(err.hint);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Create an Account</h1>
      <p className="auth-subtitle">Join the EnduranceHub workspace to collaborate with your support team.</p>

      {errors.length > 0 && (
        <div className="auth-error">
          <strong>We couldn&apos;t submit the form:</strong>
          <ul>
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
          {hint && <p className="auth-error__hint">{hint}</p>}
        </div>
      )}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="firstName">First name</label>
          <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="lastName">Last name</label>
          <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="role">Role in the platform</label>
          <select id="role" name="role" value={form.role} onChange={handleChange}>
            <option value="ATHLETE">Athlete</option>
            <option value="SPECIALIST">Specialist</option>
            <option value="ADMIN">Administrator</option>
          </select>
        </div>

        {form.role === 'ATHLETE' && (
          <div className="auth-field">
            <label>Athlete profile (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <input
                name="dateOfBirth"
                type="date"
                value={form.dateOfBirth}
                onChange={handleChange}
                placeholder="Date of birth"
              />
              <input
                name="heightCm"
                type="number"
                value={form.heightCm}
                onChange={handleChange}
                placeholder="Height (cm)"
              />
              <input
                name="weightKg"
                type="number"
                value={form.weightKg}
                onChange={handleChange}
                placeholder="Weight (kg)"
              />
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Short biography"
                rows={3}
                style={{ gridColumn: '1 / span 2' }}
              />
            </div>
          </div>
        )}

        <div className="auth-actions">
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create account'}
          </button>
          <div className="auth-secondary-action">
            Already registered? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
