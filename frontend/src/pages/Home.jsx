import { Link } from 'react-router-dom';

// Feature data for the landing page grid
const features = [
  { emoji: '🌱', title: 'Crop Recommendation', desc: 'AI-powered crop suggestions based on your soil NPK, pH, temperature, humidity, and rainfall data.' },
  { emoji: '🔬', title: 'Disease Detection', desc: 'Upload a leaf photo and our MobileNetV2 model identifies diseases with treatment advice.' },
  { emoji: '🌤️', title: 'Weather Forecast', desc: 'Real-time weather updates and 5-day forecasts with farming-specific advisories.' },
  { emoji: '📊', title: 'Mandi Market Prices', desc: 'Live commodity prices from Indian mandis — filter by state and crop for daily rates.' },
  { emoji: '🧪', title: 'Fertilizer Guide', desc: 'Smart fertilizer recommendations based on crop type and NPK soil deficiencies.' },
  { emoji: '🤖', title: 'AgriBot Assistant', desc: 'AI chat assistant that answers farming questions in simple English and Hindi.' },
];

// Steps for "How it works" section
const steps = [
  { num: '01', title: 'Sign Up', desc: 'Create your free account in 30 seconds' },
  { num: '02', title: 'Enter Data', desc: 'Provide soil details or upload leaf photos' },
  { num: '03', title: 'Get Insights', desc: 'Receive AI-powered recommendations instantly' },
  { num: '04', title: 'Grow Better', desc: 'Apply insights to improve your crop yield' },
];

// Public landing page — shown to unauthenticated visitors
export default function Home() {
  return (
    <div>
      {/* ---- Fixed Navigation ---- */}
      <nav className="landing-nav" aria-label="Landing page navigation">
        <div className="landing-nav-brand">
          <span className="landing-nav-brand-emoji">🌾</span>
          <span className="landing-nav-brand-text">KishanAi</span>
        </div>
        <div className="landing-nav-actions">
          <Link to="/login" className="btn-secondary">
            Log In
          </Link>
          <Link to="/register" className="btn-primary">
            Get Started
          </Link>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="slide-up">
            <span className="badge badge-accent hero-badge">
              🚀 AI-Powered Smart Farming
            </span>
            <h1 className="hero-title">
              Grow Smarter with{' '}
              <span className="hero-title-accent">KishanAi</span>
            </h1>
            <p className="hero-desc">
              India's smart agriculture platform — crop recommendations, disease detection,
              weather forecasts, and live mandi prices — all powered by AI.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-primary">
                🌱 Start Free
              </Link>
              <a href="#features" className="btn-secondary">
                Explore Features
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div className="hero-stats">
            {[
              { value: '22+', label: 'Crop Types' },
              { value: '38', label: 'Disease Classes' },
              { value: '28', label: 'Indian States' },
            ].map((stat) => (
              <div key={stat.label} className="hero-stat">
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features Section ---- */}
      <section id="features" className="features-section">
        <div className="section-heading">
          <h2>Everything a farmer needs</h2>
          <p>Six powerful AI features designed specifically for Indian agriculture</p>
        </div>
        <div className="feature-grid">
          {features.map((f, i) => (
            <div key={f.title} className={`feature-card fade-in stagger-${i + 1}`}>
              <div className="feature-card-icon" style={{ background: 'var(--color-kisanLight)' }}>
                {f.emoji}
              </div>
              <h3 className="feature-card-title">{f.title}</h3>
              <p className="feature-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="how-it-works">
        <div className="section-heading">
          <h2>How it works</h2>
          <p>Get started in 4 simple steps</p>
        </div>
        <div className="how-it-works-grid">
          {steps.map((s) => (
            <div key={s.num} className="fade-in">
              <div className="step-number">{s.num}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="cta-section">
        <h2>Ready to farm smarter?</h2>
        <p>Join KishanAi for free and start getting AI-powered insights for your fields today.</p>
        <Link to="/register" className="btn-primary">
          🌾 Create Free Account
        </Link>
      </section>

      {/* ---- Footer ---- */}
      <footer className="landing-footer">
        <p>Built by Bipul Kumar — KishanAi © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
