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
              <td className="td-bold">
                {row.market || row.mandi || 'N/A'}
              </td>
              <td>{row.commodity || 'N/A'}</td>
              <td>
                <span className="price-success">
                  ₹{row.minPrice || row.min_price || 0}
                </span>
              </td>
              <td>
                <span className="price-modal">
                  ₹{row.modalPrice || row.modal_price || 0}
                </span>
              </td>
              <td>
                <span className="price-danger">
                  ₹{row.maxPrice || row.max_price || 0}
                </span>
              </td>
              <td className="td-muted">
                {row.unit || 'Quintal'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
