import { useState } from 'react';
import { getWeatherByCity } from '../services/api';
import WeatherWidget from '../components/WeatherWidget';
import toast from 'react-hot-toast';

// Weather page — city search with full weather display and farming advisory
export default function Weather() {
  const [city, setCity] = useState('');
  const [searchedWeather, setSearchedWeather] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDefault, setShowDefault] = useState(true);

  // Fetches weather for a specific city
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setIsSearching(true);
    try {
      const res = await getWeatherByCity(city.trim());
      setSearchedWeather(res.data.data);
      setShowDefault(false);
      toast.success(`Weather loaded for ${city} 🌤️`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not fetch weather for this city';
      toast.error(msg);
    } finally {
      setIsSearching(false);
    }
  };

  // Generates farming tips based on weather conditions
  const getFarmingTips = (weather) => {
    if (!weather) return [];
    const current = weather.current || weather;
    const tips = [];

    const temp = current.temp || current.temperature || 0;
    const humidity = current.humidity || 0;

    if (temp > 40) tips.push('🥵 Extreme heat — irrigate crops early morning or late evening to minimize evaporation.');
    else if (temp > 35) tips.push('☀️ High temperature — ensure adequate water supply and consider mulching.');
    else if (temp < 10) tips.push('🥶 Cold conditions — protect seedlings from frost with covering material.');

    if (humidity > 80) tips.push('🍄 High humidity — watch for fungal diseases. Apply preventive fungicide if needed.');
    else if (humidity < 30) tips.push('💧 Low humidity — increase irrigation frequency to prevent wilting.');

    const desc = (current.description || '').toLowerCase();
    if (desc.includes('rain')) tips.push('🌧️ Rain expected — postpone fertilizer application to avoid wash-off.');
    if (desc.includes('clear') || desc.includes('sunny')) tips.push('🌞 Clear weather — good day for harvesting or drying crops.');

    if (tips.length === 0) tips.push('🌾 Normal weather conditions — continue regular farming activities.');
    return tips;
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🌤️ Weather Forecast</h1>
        <p>Check current weather and farming advisories for your area</p>
      </div>

      {/* City Search */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="label" htmlFor="weather-city">Search by city</label>
            <input
              id="weather-city"
              type="text"
              className="input"
              placeholder="e.g. Jaipur, Mumbai, Delhi..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={isSearching} id="weather-search-btn">
            {isSearching ? (
              <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
            ) : (
              '🔍 Search'
            )}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setShowDefault(true); setSearchedWeather(null); setCity(''); }}
            style={{ whiteSpace: 'nowrap' }}
          >
            📍 My Location
          </button>
        </form>
      </div>

      {/* Weather Display */}
      {showDefault ? (
        <WeatherWidget compact={false} />
      ) : searchedWeather ? (
        <div className="fade-in">
          {/* Render weather data manually */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="weather-main">
              <span style={{ fontSize: '4rem' }}>
                {searchedWeather.current?.icon ? '🌤️' : '☁️'}
              </span>
              <div>
                <div className="weather-temp">
                  {Math.round(searchedWeather.current?.temp || searchedWeather.current?.temperature || 0)}°C
                </div>
                <div style={{ color: 'var(--color-textMuted)', fontSize: '0.95rem', marginTop: '0.3rem', textTransform: 'capitalize' }}>
                  {searchedWeather.current?.description || 'N/A'}
                </div>
                <div style={{ color: 'var(--color-textMuted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
                  📍 {searchedWeather.current?.city || searchedWeather.current?.name || city}
                </div>
              </div>
            </div>

            <div className="weather-detail-grid">
              {[
                { label: 'Feels Like', value: `${Math.round(searchedWeather.current?.feelsLike || searchedWeather.current?.feels_like || 0)}°C`, icon: '🌡️' },
                { label: 'Humidity', value: `${searchedWeather.current?.humidity || 0}%`, icon: '💧' },
                { label: 'Wind', value: `${searchedWeather.current?.windSpeed || searchedWeather.current?.wind_speed || 0} m/s`, icon: '💨' },
                { label: 'Pressure', value: `${searchedWeather.current?.pressure || 0} hPa`, icon: '📊' },
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

          {/* Forecast */}
          {searchedWeather.forecast?.length > 0 && (
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                📅 5-Day Forecast
              </h3>
              <div className="weather-forecast">
                {searchedWeather.forecast.slice(0, 5).map((day, i) => (
                  <div key={i} className="forecast-day">
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-textMuted)', marginBottom: '0.3rem' }}>
                      {day.day || new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🌤️</div>
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

          {/* Farming Tips */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-accent)' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🌾 Farming Advisory
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {getFarmingTips(searchedWeather).map((tip, i) => (
                <p key={i} style={{ fontSize: '0.88rem', color: 'var(--color-textMuted)', lineHeight: 1.6 }}>
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
