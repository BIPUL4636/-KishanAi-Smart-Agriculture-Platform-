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
      <div className="card mb-lg">
        <div className="market-filters">
          {/* State Selector */}
          <div className="market-filter-item">
            <label className="label" htmlFor="market-state">State</label>
            <select
              id="market-state"
              className="input cursor-pointer"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Commodity Selector */}
          <div className="market-filter-item">
            <label className="label" htmlFor="market-commodity">Commodity</label>
            <select
              id="market-commodity"
              className="input cursor-pointer"
              value={selectedCommodity}
              onChange={(e) => setSelectedCommodity(e.target.value)}
            >
              <option value="">Select Commodity</option>
              {commodities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            className="btn-primary whitespace-nowrap"
            onClick={handleSearch}
            disabled={isLoading}
            id="market-search-btn"
          >
            {isLoading ? (
              <>
                <div className="spinner spinner-sm"></div>
                Fetching...
              </>
            ) : (
              '🔍 Fetch Prices'
            )}
          </button>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <p className="market-last-updated">
            📅 Last updated: {new Date(lastUpdated).toLocaleString('en-IN')}
          </p>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-center">
          <div className="spinner spinner-lg"></div>
          <p>Fetching market prices from mandis...</p>
        </div>
      )}

      {/* Price Table */}
      {!isLoading && prices.length > 0 && (
        <div className="fade-in">
          <div className="card">
            <div className="market-results-header">
              <h3>📋 {selectedCommodity} Prices in {selectedState}</h3>
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
            <div className="empty-state-icon">📊</div>
            <h3 className="empty-state-title">No market data loaded</h3>
            <p>Select a state and commodity above to view live mandi prices</p>
          </div>
        </div>
      )}
    </div>
  );
}
