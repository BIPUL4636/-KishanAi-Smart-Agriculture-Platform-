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

  // Weather emoji helper
  const getWeatherEmoji = (icon) => {
    if (!icon) return '🌤️';
    const map = {
      '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️', '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️', '13d': '🌨️', '13n': '🌨️', '50d': '🌫️', '50n': '🌫️',
    };
    return map[icon] || '🌤️';
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🌤️ Weather Forecast</h1>
        <p>Check current weather and farming advisories for your area</p>
      </div>

      {/* City Search */}
      <div className="card mb-lg">
        <form onSubmit={handleSearch} className="weather-search-form">
          <div className="weather-search-input-wrapper">
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
              <div className="spinner spinner-sm"></div>
            ) : (
              '🔍 Search'
            )}
          </button>
          <button
            type="button"
            className="btn-secondary whitespace-nowrap"
            onClick={() => { setShowDefault(true); setSearchedWeather(null); setCity(''); }}
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
          <div className="card mb-lg">
            <div className="weather-main">
              <span className="weather-emoji-lg">
                {getWeatherEmoji(searchedWeather.current?.icon)}
              </span>
              <div>
                <div className="weather-temp">
                  {Math.round(searchedWeather.current?.temp || searchedWeather.current?.temperature || 0)}°C
                </div>
                <div className="weather-desc">
                  {searchedWeather.current?.description || 'N/A'}
                </div>
                <div className="weather-location">
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
                <div key={d.label} className="weather-detail-item">
                  <div className="weather-detail-icon">{d.icon}</div>
                  <div className="weather-detail-value">{d.value}</div>
                  <div className="weather-detail-label">{d.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Forecast */}
          {searchedWeather.forecast?.length > 0 && (
            <div className="card mb-lg">
              <h3 className="card-section-title-flex">📅 5-Day Forecast</h3>
              <div className="weather-forecast">
                {searchedWeather.forecast.slice(0, 5).map((day, i) => (
                  <div key={i} className="forecast-day">
                    <div className="forecast-day-label">
                      {day.day || new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}
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

          {/* Farming Tips */}
          <div className="card advisory-card">
            <h3 className="card-section-title-flex">🌾 Farming Advisory</h3>
            <div className="advisory-tips">
              {getFarmingTips(searchedWeather).map((tip, i) => (
                <p key={i} className="advisory-tip">{tip}</p>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
