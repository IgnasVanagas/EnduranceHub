import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/auth.css';

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage('');

    try {
      await login(form);
    } catch (err) {
      setErrorMessage(err?.message || 'Unable to sign in. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">Sign in</h1>
      <p className="auth-subtitle">Access your training, nutrition, and communication hub.</p>

      {errorMessage && <div className="auth-error">{errorMessage}</div>}

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="auth-field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>
        <div className="auth-actions">
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="auth-secondary-action">
            Need an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
