// Sortable table displaying mandi market prices
export default function MarketTable({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <p>📊 No market data available — try selecting a different state or commodity.</p>
      </div>
    );
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table" id="market-table">
        <thead>
          <tr>
            <th>Market / Mandi</th>
            <th>Commodity</th>
            <th>Min Price</th>
            <th>Modal Price</th>
            <th>Max Price</th>
            <th>Unit</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
              <td style={{ fontWeight: 500 }}>
                {row.market || row.mandi || 'N/A'}
              </td>
              <td>{row.commodity || 'N/A'}</td>
              <td>
                <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
                  ₹{row.minPrice || row.min_price || 0}
                </span>
              </td>
              <td>
                <span style={{
                  fontWeight: 700, color: 'var(--color-kisanDark)',
                  background: 'var(--color-kisanLight)', padding: '0.2rem 0.6rem',
                  borderRadius: 'var(--radius-full)', fontSize: '0.82rem',
                }}>
                  ₹{row.modalPrice || row.modal_price || 0}
                </span>
              </td>
              <td>
                <span style={{ color: 'var(--color-danger)', fontWeight: 600 }}>
                  ₹{row.maxPrice || row.max_price || 0}
                </span>
              </td>
              <td style={{ color: 'var(--color-textMuted)', fontSize: '0.82rem' }}>
                {row.unit || 'Quintal'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
