import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Custom tooltip for the price chart
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'white', padding: '0.75rem 1rem', borderRadius: '0.5rem',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb',
      fontSize: '0.82rem',
    }}>
      <p style={{ fontWeight: 600, marginBottom: '0.35rem' }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, marginBottom: '0.15rem' }}>
          {entry.name}: ₹{entry.value}
        </p>
      ))}
    </div>
  );
};

// Bar chart comparing min/modal/max prices across mandis using Recharts
export default function PriceChart({ data }) {
  if (!data || data.length === 0) return null;

  // Prepare chart data — use mandi name as key
  const chartData = data.slice(0, 8).map((row) => ({
    name: (row.market || row.mandi || 'N/A').length > 15
      ? (row.market || row.mandi || 'N/A').slice(0, 15) + '…'
      : (row.market || row.mandi || 'N/A'),
    'Min Price': Number(row.minPrice || row.min_price || 0),
    'Modal Price': Number(row.modalPrice || row.modal_price || 0),
    'Max Price': Number(row.maxPrice || row.max_price || 0),
  }));

  return (
    <div className="card fade-in" style={{ marginTop: '1.5rem' }}>
      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        📈 Price Comparison Chart
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#6B7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            tickLine={false}
            tickFormatter={(v) => `₹${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '0.78rem', paddingTop: '0.5rem' }}
          />
          <Bar dataKey="Min Price" fill="#22C55E" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Modal Price" fill="#41C0F2" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Max Price" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
