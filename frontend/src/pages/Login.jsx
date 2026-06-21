import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';
import toast from 'react-hot-toast';

// Login page — split-panel layout with hero branding + login form
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validates form fields before submission
  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handles form submission — calls login API and redirects on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await loginUser(formData);
      const { token, ...userData } = res.data.data;
      login(userData, token);
      toast.success('Welcome back, Kisan! 🌾');
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed — please try again';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Hero Panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="text-6xl mb-6">🌾</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>
            <span style={{ background: 'linear-gradient(135deg, #41C0F2, #7dd3fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              KishanAi
            </span>
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.7, maxWidth: '320px', margin: '0 auto', lineHeight: 1.6 }}>
            Smart Agriculture Platform for Indian Farmers — powered by AI
          </p>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '2rem', justifyContent: 'center' }}>
            {['🌱 Crop AI', '🔬 Disease Detection', '🌤️ Weather'].map((item) => (
              <span key={item} style={{ fontSize: '0.85rem', opacity: 0.5 }}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-container fade-in">
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Welcome back 👋
            </h2>
            <p className="text-textMuted">
              Log in to access your smart farming dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="label" htmlFor="login-email">Email address</label>
              <input
                id="login-email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className={`input ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                autoComplete="current-password"
              />
              {errors.password && <p className="form-error">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner" style={{ width: '1.1rem', height: '1.1rem', borderWidth: '2px' }}></div>
                  Logging in...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          {/* Register Link */}
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--color-textMuted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--color-kisanBlue)', fontWeight: 600, textDecoration: 'none' }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
