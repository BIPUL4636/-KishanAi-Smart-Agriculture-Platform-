import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import WeatherWidget from '../components/WeatherWidget';

// Dashboard feature cards configuration
const features = [
  {
    to: '/crop',
    emoji: '🌱',
    title: 'Crop Recommendation',
    desc: 'Get AI-powered crop suggestions based on your soil and climate data.',
    color: '#D6F1FC',
  },
  {
    to: '/disease',
    emoji: '🔬',
    title: 'Disease Detection',
    desc: 'Upload a leaf photo to detect diseases and get treatment advice.',
    color: '#fef3c7',
  },
  {
    to: '/weather',
    emoji: '🌤️',
    title: 'Weather Forecast',
    desc: 'Check current weather and 5-day forecasts for your area.',
    color: '#dbeafe',
  },
  {
    to: '/market',
    emoji: '📊',
    title: 'Market Prices',
    desc: 'View live mandi prices for commodities in your state.',
    color: '#dcfce7',
  },
];

// Returns a greeting based on the current hour
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Dashboard — main landing page after login with feature cards and weather widget
export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="page-container fade-in">
      {/* Welcome Header */}
      <div className="page-header">
        <h1>
          {getGreeting()}, {user?.name?.split(' ')[0] || 'Kisan'}! 👋
        </h1>
        <p>Welcome to your smart farming dashboard — what would you like to do today?</p>
      </div>

      {/* Feature Cards Grid */}
      <div className="feature-grid" style={{ marginBottom: '2rem' }}>
        {features.map((f, i) => (
          <Link
            key={f.to}
            to={f.to}
            className={`feature-card fade-in stagger-${i + 1}`}
            id={`dashboard-card-${f.to.replace('/', '')}`}
          >
            <div className="feature-card-icon" style={{ background: f.color }}>
              {f.emoji}
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.4rem' }}>
              {f.title}
            </h3>
            <p style={{ color: 'var(--color-textMuted)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              {f.desc}
            </p>
            <div style={{
              marginTop: '1rem', fontSize: '0.82rem', fontWeight: 600,
              color: 'var(--color-kisanBlue)', display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}>
              Open
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Weather Widget + Quick Tips */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        {/* Weather */}
        <div className="card fade-in stagger-5">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌤️ Weather Overview
          </h3>
          <WeatherWidget compact />
        </div>

        {/* Farming Tips */}
        <div className="card fade-in stagger-6">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            💡 Quick Tips
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { icon: '🌱', text: 'Use Crop AI to find the best crop for your soil conditions.' },
              { icon: '📷', text: 'Take clear leaf photos in daylight for accurate disease detection.' },
              { icon: '📊', text: 'Check mandi prices before selling to get the best rate.' },
              { icon: '🤖', text: 'Ask AgriBot any farming question — click the chat bubble!' },
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1rem', flexShrink: 0 }}>{tip.icon}</span>
                <p style={{ color: 'var(--color-textMuted)', fontSize: '0.84rem', lineHeight: 1.5 }}>{tip.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive override for the grid above */}
      <style>{`
        @media (max-width: 768px) {
          .page-container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
