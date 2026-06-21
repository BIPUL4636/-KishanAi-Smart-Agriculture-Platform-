// Displays fertilizer recommendation results from the API
export default function FertilizerCard({ data }) {
  if (!data) return null;

  return (
    <div className="result-card fade-in" style={{ marginTop: '1.5rem' }}>
      <div className="result-card-header">
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🧪 Fertilizer Recommendation
        </h3>
      </div>
      <div className="result-card-body">
        {/* Fertilizer Name */}
        {data.fertilizerName && (
          <div style={{ marginBottom: '1rem' }}>
            <span className="badge" style={{ background: 'rgba(244, 160, 25, 0.1)', color: 'var(--color-accent)', fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
              {data.fertilizerName}
            </span>
          </div>
        )}

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
          {data.dosage && (
            <div style={{ padding: '0.75rem', background: 'var(--color-bgMain)', borderRadius: '0.625rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-textMuted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Dosage
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{data.dosage}</div>
            </div>
          )}
          {data.applicationTime && (
            <div style={{ padding: '0.75rem', background: 'var(--color-bgMain)', borderRadius: '0.625rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-textMuted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Best Time
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{data.applicationTime}</div>
            </div>
          )}
          {data.npkRatio && (
            <div style={{ padding: '0.75rem', background: 'var(--color-bgMain)', borderRadius: '0.625rem' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--color-textMuted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                NPK Ratio
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{data.npkRatio}</div>
            </div>
          )}
        </div>

        {/* Description / AI Explanation */}
        {data.description && (
          <div style={{ marginBottom: '1rem' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--color-textMuted)', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
              {data.description}
            </p>
          </div>
        )}

        {/* Precautions */}
        {data.precautions && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 160, 25, 0.06)', borderRadius: '0.625rem', borderLeft: '3px solid var(--color-accent)' }}>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--color-accent)' }}>
              ⚠️ Precautions
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--color-textMuted)', lineHeight: 1.5 }}>
              {data.precautions}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
