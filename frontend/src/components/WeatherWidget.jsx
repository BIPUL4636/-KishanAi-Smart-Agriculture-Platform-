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
      <div className="weather-loading">
        <div className="spinner spinner-md"></div>
        <span>Fetching weather...</span>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="empty-state">
        <p>🌤️ {error || 'Weather data unavailable'}</p>
      </div>
    );
  }

  const current = weather.current || weather;
  const forecast = weather.forecast || [];

  // Compact version for dashboard
  if (compact) {
    return (
      <div>
        <div className="weather-compact-main">
          <span className="weather-compact-emoji">
            {getWeatherEmoji(current.icon)}
          </span>
          <div>
            <div className="weather-compact-temp">
              {Math.round(current.temp || current.temperature || 0)}°C
            </div>
            <div className="weather-compact-desc">
              {current.description || current.condition || 'N/A'} • {current.city || current.name || 'Unknown'}
            </div>
          </div>
        </div>
        <div className="weather-compact-details">
          <div className="weather-compact-detail">
            💧 {current.humidity || 0}%
          </div>
          <div className="weather-compact-detail">
            💨 {current.windSpeed || current.wind_speed || 0} m/s
          </div>
          <div className="weather-compact-detail">
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
      <div className="card mb-lg">
        <div className="weather-main">
          <span className="weather-emoji-lg">{getWeatherEmoji(current.icon)}</span>
          <div>
            <div className="weather-temp">
              {Math.round(current.temp || current.temperature || 0)}°C
            </div>
            <div className="weather-desc">
              {current.description || current.condition || 'N/A'}
            </div>
            <div className="weather-location">
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
            <div key={d.label} className="weather-detail-item">
              <div className="weather-detail-icon">{d.icon}</div>
              <div className="weather-detail-value">{d.value}</div>
              <div className="weather-detail-label">{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5-Day Forecast */}
      {forecast.length > 0 && (
        <div className="card">
          <h3 className="card-section-title-flex">
            📅 5-Day Forecast
          </h3>
          <div className="weather-forecast">
            {forecast.slice(0, 5).map((day, i) => (
              <div key={i} className="forecast-day">
                <div className="forecast-day-label">
                  {day.day || new Date(day.date || day.dt * 1000).toLocaleDateString('en', { weekday: 'short' })}
                </div>
                <div className="forecast-day-emoji">
                  {getWeatherEmoji(day.icon)}
                </div>
                <div className="forecast-day-high">
                  {Math.round(day.tempMax || day.temp_max || day.temp || 0)}°
                </div>
                <div className="forecast-day-low">
                  {Math.round(day.tempMin || day.temp_min || 0)}°
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Farming Advisory */}
      {weather.advisory && (
        <div className="card mt-lg advisory-card">
          <h3 className="card-section-title-flex">
            🌾 Farming Advisory
          </h3>
          <p className="advisory-tip">
            {weather.advisory}
          </p>
        </div>
      )}
    </div>
  );
}
