import { useState, useEffect } from 'react';
import { getMarketPrices, getMarketStates } from '../services/api';
import MarketTable from '../components/MarketTable';
import PriceChart from '../components/PriceChart';
import toast from 'react-hot-toast';

// Default commodities shown in the dropdown
const DEFAULT_COMMODITIES = [
  'Wheat', 'Rice', 'Tomato', 'Onion', 'Potato', 'Maize', 'Cotton', 'Soybean',
];

// Market Prices page — state/commodity filter + price table + bar chart
export default function MarketPrices() {
  const [states, setStates] = useState([]);
  const [commodities, setCommodities] = useState(DEFAULT_COMMODITIES);
  const [selectedState, setSelectedState] = useState('');
  const [selectedCommodity, setSelectedCommodity] = useState('');
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetches available states and commodities from the API
  useEffect(() => {
    const loadStates = async () => {
      try {
        const res = await getMarketStates();
        const data = res.data.data;
        if (data?.states?.length > 0) setStates(data.states);
        if (data?.commodities?.length > 0) setCommodities(data.commodities);
      } catch {
        // Use defaults if API fails
        setStates([
          'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
          'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
          'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
          'Uttarakhand', 'West Bengal',
        ]);
      }
    };
    loadStates();
  }, []);

  // Fetches mandi prices for the selected state and commodity
  const handleSearch = async () => {
    if (!selectedState || !selectedCommodity) {
      toast.error('Please select both a state and a commodity');
      return;
    }

    setIsLoading(true);
    setPrices([]);
    try {
      const res = await getMarketPrices(selectedState, selectedCommodity);
      const data = res.data.data;
      const priceList = data?.prices || data?.records || data || [];
      setPrices(Array.isArray(priceList) ? priceList : []);
      setLastUpdated(data?.lastUpdated || new Date().toISOString());

      if (priceList.length === 0) {
        toast('No price data found for this combination', { icon: 'ℹ️' });
      } else {
        toast.success(`Found ${priceList.length} market records`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to fetch market prices';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>📊 Market Prices</h1>
        <p>View live mandi commodity prices from across India</p>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {/* State Selector */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="label" htmlFor="market-state">State</label>
            <select
              id="market-state"
              className="input"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Commodity Selector */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label className="label" htmlFor="market-commodity">Commodity</label>
            <select
              id="market-commodity"
              className="input"
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">Select Commodity</option>
              {commodities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={isLoading}
            id="market-search-btn"
            style={{ whiteSpace: 'nowrap' }}
          >
            {isLoading ? (
              <>
                <div className="spinner" style={{ width: '1rem', height: '1rem', borderWidth: '2px' }}></div>
                Fetching...
              </>
            ) : (
              '🔍 Fetch Prices'
            )}
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p style={{ fontSize: '0.75rem', color: 'var(--color-textMuted)', marginTop: '0.75rem' }}>
            📅 Last updated: {new Date(lastUpdated).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="spinner" style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--color-textMuted)' }}>Fetching market prices from mandis...</p>
        </div>
      )}

      {/* Price Table */}
      {!isLoading && prices.length > 0 && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: '0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600 }}>
                📋 {selectedCommodity} Prices in {selectedState}
              </h3>
              <span className="badge badge-accent">
                {prices.length} {prices.length === 1 ? 'market' : 'markets'}
              </span>
            </div>
            <MarketTable data={prices} />
          </div>

          {/* Price Chart */}
          <PriceChart data={prices} />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && prices.length === 0 && !lastUpdated && (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              No market data loaded
            </h3>
            <p>Select a state and commodity above to view live mandi prices</p>
          </div>
        </div>
      )}
    </div>
  );
}
