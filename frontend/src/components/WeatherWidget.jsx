import { useState, useEffect } from 'react';
import { getWeatherByCity, getWeatherByCoords } from '../services/api';

// Weather emoji mapping based on OpenWeatherMap icon codes
const getWeatherEmoji = (icon) => {
  if (!icon) return '🌤️';
  const map = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️', '03d': '☁️', '03n': '☁️',
    '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️', '50d': '🌫️', '50n': '🌫️',
  };
  return map[icon] || '🌤️';
};

// Compact weather widget for dashboard, or full weather display for Weather page
export default function WeatherWidget({ compact = false }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Auto-fetches weather by GPS on mount, falls back to Delhi
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError('');

        // Try browser geolocation first
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const res = await getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
                setWeather(res.data.data);
              } catch {
                // Fallback to a default city
                const res = await getWeatherByCity('Delhi');
                setWeather(res.data.data);
              }
              setLoading(false);
            },
            async () => {
              // Geolocation denied — fall back to default
              try {
                const res = await getWeatherByCity('Delhi');
                setWeather(res.data.data);
              } catch {
                setError('Could not fetch weather');
              }
              setLoading(false);
            },
            { timeout: 5000 }
          );
        } else {
          const res = await getWeatherByCity('Delhi');
          setWeather(res.data.data);
          setLoading(false);
        }
      } catch {
        setError('Weather unavailable');
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: compact ? '1.5rem' : '3rem' }}>
        <div className="spinner" style={{ width: '1.5rem', height: '1.5rem' }}></div>
        <span style={{ marginLeft: '0.75rem', color: 'var(--color-textMuted)', fontSize: '0.85rem' }}>
          Fetching weather...
        </span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="empty-state" style={{ padding: compact ? '1rem' : '2rem' }}>
        <p style={{ fontSize: '0.85rem' }}>🌤️ {error || 'Weather data unavailable'}</p>
      </div>
    );
  }

  const current = weather.current || weather;
  const forecast = weather.forecast || [];

  // Compact version for dashboard
  if (compact) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2.5rem' }}>
            {getWeatherEmoji(current.icon)}
          </span>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {Math.round(current.temp || current.temperature || 0)}°C
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-textMuted)', marginTop: '0.2rem' }}>
              {current.description || current.condition || 'N/A'} • {current.city || current.name || 'Unknown'}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-textMuted)' }}>
            💧 {current.humidity || 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-textMuted)' }}>
            💨 {current.windSpeed || current.wind_speed || 0} m/s
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--color-textMuted)' }}>
            🌡️ Feels {Math.round(current.feelsLike || current.feels_like || 0)}°C
          </div>
        </div>
      </div>
    );
  }

  // Full weather display for Weather page
  return (
    <div>
      {/* Current Weather */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="weather-main">
          <span style={{ fontSize: '4rem' }}>{getWeatherEmoji(current.icon)}</span>
          <div>
            <div className="weather-temp">
              {Math.round(current.temp || current.temperature || 0)}°C
            </div>
            <div style={{ color: 'var(--color-textMuted)', fontSize: '0.95rem', marginTop: '0.3rem', textTransform: 'capitalize' }}>
              {current.description || current.condition || 'N/A'}
            </div>
            <div style={{ color: 'var(--color-textMuted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
              📍 {current.city || current.name || 'Unknown'}
            </div>
          </div>
        </div>

        {/* Weather details grid */}
        <div className="weather-detail-grid">
          {[
            { label: 'Feels Like', value: `${Math.round(current.feelsLike || current.feels_like || 0)}°C`, icon: '🌡️' },
            { label: 'Humidity', value: `${current.humidity || 0}%`, icon: '💧' },
            { label: 'Wind Speed', value: `${current.windSpeed || current.wind_speed || 0} m/s`, icon: '💨' },
            { label: 'Pressure', value: `${current.pressure || 0} hPa`, icon: '📊' },
          ].map((d) => (
            <div key={d.label} style={{
              padding: '0.75rem', borderRadius: '0.75rem',
              background: 'var(--color-bgMain)', textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{d.icon}</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.15rem' }}>{d.value}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-textMuted)' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
            📅 5-Day Forecast
          </h3>
          <div className="weather-forecast">
            {forecast.slice(0, 5).map((day, i) => (
              <div key={i} className="forecast-day">
                <div style={{ fontSize: '0.75rem', color: 'var(--color-textMuted)', marginBottom: '0.3rem' }}>
                  {day.day || new Date(day.date || day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
                  {getWeatherEmoji(day.icon)}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {Math.round(day.tempMax || day.temp_max || day.temp || 0)}°
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-textMuted)' }}>
                  {Math.round(day.tempMin || day.temp_min || 0)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farming Advisory */}
      {weather.advisory && (
        <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--color-accent)' }}>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌾 Farming Advisory
          </h3>
          <p style={{ color: 'var(--color-textMuted)', fontSize: '0.88rem', lineHeight: 1.6 }}>
            {weather.advisory}
          </p>
        </div>
      )}
    </div>
  );
}
