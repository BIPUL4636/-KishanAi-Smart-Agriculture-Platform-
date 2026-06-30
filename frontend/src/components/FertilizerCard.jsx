// Displays fertilizer recommendation results from the API
export default function FertilizerCard({ data }) {
  if (!data) return null;

  return (
    <div className="result-card fade-in mt-lg">
      <div className="result-card-header">
        <h3>🧪 Fertilizer Recommendation</h3>
      </div>
      <div className="result-card-body">
        {/* Fertilizer Name */}
        {data.fertilizerName && (
          <div className="mb-md">
            <span className="badge fertilizer-name-badge">
              {data.fertilizerName}
            </span>
          </div>
        )}

        {/* Details Grid */}
        <div className="fertilizer-details-grid">
          {data.dosage && (
            <div className="fertilizer-detail-box">
              <div className="fertilizer-detail-label">Dosage</div>
              <div className="fertilizer-detail-value">{data.dosage}</div>
            </div>
          )}
          {data.applicationTime && (
            <div className="fertilizer-detail-box">
              <div className="fertilizer-detail-label">Best Time</div>
              <div className="fertilizer-detail-value">{data.applicationTime}</div>
            </div>
          )}
          {data.npkRatio && (
            <div className="fertilizer-detail-box">
              <div className="fertilizer-detail-label">NPK Ratio</div>
              <div className="fertilizer-detail-value">{data.npkRatio}</div>
            </div>
          )}
        </div>

        {/* Description / AI Explanation */}
        {data.description && (
          <div className="mb-md">
            <p className="fertilizer-desc">{data.description}</p>
          </div>
        )}

        {/* Precautions */}
        {data.precautions && (
          <div className="fertilizer-precautions">
            <p className="fertilizer-precautions-title">⚠️ Precautions</p>
            <p className="fertilizer-precautions-text">{data.precautions}</p>
          </div>
        )}
      </div>
    </div>
  );
}
