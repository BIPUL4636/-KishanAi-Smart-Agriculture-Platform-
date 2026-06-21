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
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🌾</span>
          <span style={{
            fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '1.15rem',
            background: 'linear-gradient(135deg, #41C0F2, #7dd3fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            KishanAi
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/login" className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Log In
          </Link>
          <Link to="/register" className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <section className="hero-section">
        <div className="hero-content" style={{ textAlign: 'center', paddingTop: '5rem' }}>
          <div className="slide-up">
            <span className="badge badge-accent" style={{ marginBottom: '1.5rem', fontSize: '0.8rem', padding: '0.4rem 1rem' }}>
              🚀 AI-Powered Smart Farming
            </span>
            <h1 style={{
              fontFamily: 'var(--font-heading)', fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: '1.5rem', marginTop: '1rem',
            }}>
              Grow Smarter with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #41C0F2, #7dd3fc)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                KishanAi
              </span>
            </h1>
            <p style={{
              color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: 1.7,
            }}>
              India's smart agriculture platform — crop recommendations, disease detection,
              weather forecasts, and live mandi prices — all powered by AI.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
                🌱 Start Free
              </Link>
              <a href="#features" className="btn-secondary" style={{
                padding: '0.85rem 2rem', fontSize: '1rem',
                borderColor: 'rgba(255,255,255,0.25)', color: 'white',
              }}>
                Explore Features
              </a>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem',
            flexWrap: 'wrap',
          }}>
            {[
              { value: '22+', label: 'Crop Types' },
              { value: '38', label: 'Disease Classes' },
              { value: '28', label: 'Indian States' },
            ].map((stat) => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#41C0F2', fontFamily: 'var(--font-heading)' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features Section ---- */}
      <section id="features" className="features-section">
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            Everything a farmer needs
          </h2>
          <p style={{ color: 'var(--color-textMuted)', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto' }}>
            Six powerful AI features designed specifically for Indian agriculture
          </p>
        </div>
        <div className="feature-grid" style={{ maxWidth: '1100px', margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={f.title} className={`feature-card fade-in stagger-${i + 1}`}>
              <div className="feature-card-icon" style={{ background: 'var(--color-kisanLight)' }}>
                {f.emoji}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                {f.title}
              </h3>
              <p style={{ color: 'var(--color-textMuted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- How It Works ---- */}
      <section className="how-it-works">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            How it works
          </h2>
          <p style={{ color: 'var(--color-textMuted)', fontSize: '1.05rem' }}>
            Get started in 4 simple steps
          </p>
        </div>
        <div className="how-it-works-grid">
          {steps.map((s) => (
            <div key={s.num} className="fade-in">
              <div style={{
                fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-heading)',
                background: 'linear-gradient(135deg, #41C0F2, #1A9ED4)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '0.75rem',
              }}>
                {s.num}
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                {s.title}
              </h3>
              <p style={{ color: 'var(--color-textMuted)', fontSize: '0.88rem' }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- CTA Section ---- */}
      <section className="cta-section">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
          Ready to farm smarter?
        </h2>
        <p style={{ opacity: 0.6, fontSize: '1.05rem', marginBottom: '2rem', maxWidth: '450px', margin: '0 auto 2rem' }}>
          Join KishanAi for free and start getting AI-powered insights for your fields today.
        </p>
        <Link to="/register" className="btn-primary" style={{ padding: '0.9rem 2.5rem', fontSize: '1.05rem' }}>
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
