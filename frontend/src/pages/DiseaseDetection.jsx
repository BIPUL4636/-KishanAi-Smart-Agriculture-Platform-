import { useState, useEffect } from 'react';
import { detectDisease, getDiseaseHistory } from '../services/api';
import LeafUpload from '../components/LeafUpload';
import toast from 'react-hot-toast';

// Disease Detection page — leaf image upload + AI diagnosis + history
export default function DiseaseDetection() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Loads detection history on mount and page change
  useEffect(() => {
    fetchHistory();
  }, [historyPage]);

  // Fetches paginated disease detection history
  const fetchHistory = async () => {
    try {
      const res = await getDiseaseHistory(historyPage, 5);
      setHistory(res.data.data.detections || []);
      setHistoryTotal(res.data.data.pagination?.pages || 1);
    } catch {
      // Silently fail
    }
  };

  // Uploads leaf image for disease detection
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await detectDisease(formData);
      setResult(res.data.data);
      const diseaseName = res.data.data?.detection?.result?.diseaseName || res.data.data?.result?.diseaseName || 'Analysis Complete';
      toast.success(`Detection: ${diseaseName}`);
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Disease detection failed — please try again';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Gets severity badge color
  const getSeverityColor = (isHealthy, confidence) => {
    if (isHealthy) return { bg: 'rgba(34, 197, 94, 0.1)', color: 'var(--color-success)', text: 'Healthy ✅' };
    if (confidence >= 80) return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)', text: 'High Confidence' };
    if (confidence >= 60) return { bg: 'rgba(244, 160, 25, 0.1)', color: 'var(--color-accent)', text: 'Moderate' };
    return { bg: 'rgba(107, 114, 128, 0.1)', color: 'var(--color-textMuted)', text: 'Low Confidence' };
  };

  const detection = result?.detection || result;
  const detResult = detection?.result;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🔬 Disease Detection</h1>
        <p>Upload a leaf photo to detect plant diseases and get treatment advice</p>
      </div>

      {/* Upload Area */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1.25rem' }}>
          Upload Leaf Image
        </h3>
        <LeafUpload onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Result Card */}
      {detResult && (
        <div className="result-card fade-in" style={{ marginBottom: '1.5rem' }}>
          <div className="result-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600 }}>
              🎯 Detection Result
            </h3>
            {(() => {
              const severity = getSeverityColor(detResult.isHealthy, detResult.confidence);
              return (
                <span className="badge" style={{ background: severity.bg, color: severity.color }}>
                  {severity.text}
                </span>
              );
            })()}
          </div>
          <div className="result-card-body">
            {/* Disease Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '3.5rem', height: '3.5rem', borderRadius: '0.75rem',
                background: detResult.isHealthy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem',
              }}>
                {detResult.isHealthy ? '✅' : '🦠'}
              </div>
              <div>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700 }}>
                  {detResult.diseaseName || 'Unknown'}
                </h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--color-textMuted)' }}>
                  {detResult.isHealthy ? 'Your plant looks healthy!' : 'Disease detected in the leaf'}
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>Confidence</span>
                <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{detResult.confidence || 0}%</span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${detResult.confidence || 0}%`,
                    background: detResult.isHealthy
                      ? 'linear-gradient(90deg, var(--color-success), #4ade80)'
                      : 'linear-gradient(90deg, var(--color-danger), #f87171)',
                  }}
                />
              </div>
            </div>

            {/* Symptoms */}
            {detResult.symptoms && !detResult.isHealthy && (
              <div style={{ marginBottom: '1rem' }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem' }}>📋 Symptoms</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-textMuted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {detResult.symptoms}
                </p>
              </div>
            )}

            {/* Treatment */}
            {detResult.treatment && !detResult.isHealthy && (
              <div style={{
                padding: '1rem', background: 'rgba(34, 197, 94, 0.05)',
                borderRadius: '0.625rem', borderLeft: '3px solid var(--color-success)',
              }}>
                <h5 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-success)' }}>
                  💊 Treatment
                </h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-textMuted)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {detResult.treatment}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detection History */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '1rem' }}>
          📋 Detection History
        </h3>
        {history.length === 0 ? (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <p>No detections yet — upload a leaf photo above to get started</p>
          </div>
        ) : (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Disease</th>
                    <th>Status</th>
                    <th>Confidence</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((det) => (
                    <tr key={det._id}>
                      <td style={{ fontWeight: 600 }}>{det.result?.diseaseName || 'N/A'}</td>
                      <td>
                        {det.result?.isHealthy ? (
                          <span className="badge badge-success">Healthy</span>
                        ) : (
                          <span className="badge badge-danger">Diseased</span>
                        )}
                      </td>
                      <td>{det.result?.confidence || 0}%</td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--color-textMuted)' }}>
                        {new Date(det.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {historyTotal > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: '0.82rem', color: 'var(--color-textMuted)', display: 'flex', alignItems: 'center' }}>
                  Page {historyPage} of {historyTotal}
                </span>
                <button
                  className="btn-secondary"
                  onClick={() => setHistoryPage((p) => Math.min(historyTotal, p + 1))}
                  disabled={historyPage >= historyTotal}
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
