import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/api';
import toast from 'react-hot-toast';

// List of Indian states for the dropdown
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir',
];

// Register page — creates a new farmer account
export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Updates form state on input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error on change
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  // Validates all form fields before submission
  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Name is required';
    if (!formData.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email format';
    if (!formData.password) errs.password = 'Password is required';
    else if (formData.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!formData.state) errs.state = 'Please select your state';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handles registration — sends data to API and logs user in on success
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const { confirmPassword, ...payload } = formData;
      const res = await registerUser(payload);
      const { token, ...userData } = res.data.data;
      register(userData, token);
      toast.success('Welcome to KishanAi! 🌾');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed — please try again';
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
          <div className="auth-hero-emoji">🌾</div>
          <h1 className="auth-hero-title">
            <span className="gradient-text">KishanAi</span>
          </h1>
          <p className="auth-hero-desc">
            Join thousands of Indian farmers using AI to grow smarter, healthier crops
          </p>
          <div className="auth-hero-checklist">
            {[
              '✅ Free crop recommendations',
              '✅ Disease detection from leaf photos',
              '✅ Live mandi market prices',
              '✅ AI-powered farming assistant',
            ].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-form-container fade-in">
          <div className="auth-form-heading">
            <h2>Create your account 🌱</h2>
            <p>Start your smart farming journey today</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="form-group">
              <label className="label" htmlFor="reg-name">Full name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className={`input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Ramesh Kumar"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name && <p className="form-error">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="label" htmlFor="reg-email">Email address</label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className={`input ${errors.email ? 'input-error' : ''}`}
                placeholder="farmer@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* Password Row */}
            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  name="password"
                  type="password"
                  className={`input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>
              <div className="form-group">
                <label className="label" htmlFor="reg-confirm">Confirm password</label>
                <input
                  id="reg-confirm"
                  name="confirmPassword"
                  type="password"
                  className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* State */}
            <div className="form-group">
              <label className="label" htmlFor="reg-state">Your state</label>
              <select
                id="reg-state"
                name="state"
                className={`input cursor-pointer ${errors.state ? 'input-error' : ''}`}
                value={formData.state}
                onChange={handleChange}
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {errors.state && <p className="form-error">{errors.state}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary btn-full mt-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="spinner spinner-btn"></div>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="auth-link-row">
            Already have an account?{' '}
            <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
