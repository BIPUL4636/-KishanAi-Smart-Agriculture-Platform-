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
      <div className="card mb-lg">
        <h3 className="card-section-title">Upload Leaf Image</h3>
        <LeafUpload onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Result Card */}
      {detResult && (
        <div className="result-card fade-in mb-lg">
          <div className="result-card-header">
            <h3>🎯 Detection Result</h3>
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
            <div className="result-name-row">
              <div
                className="result-icon-box"
                style={{
                  background: detResult.isHealthy ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                }}
              >
                {detResult.isHealthy ? '✅' : '🦠'}
              </div>
              <div>
                <h4 className="result-name-title">
                  {detResult.diseaseName || 'Unknown'}
                </h4>
                <p className="result-name-subtitle">
                  {detResult.isHealthy ? 'Your plant looks healthy!' : 'Disease detected in the leaf'}
                </p>
              </div>
            </div>

            {/* Confidence */}
            <div className="confidence-section">
              <div className="confidence-labels">
                <span className="confidence-label">Confidence</span>
                <span className="confidence-value">{detResult.confidence || 0}%</span>
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
              <div className="symptoms-box">
                <h5>📋 Symptoms</h5>
                <p>{detResult.symptoms}</p>
              </div>
            )}

            {/* Treatment */}
            {detResult.treatment && !detResult.isHealthy && (
              <div className="treatment-box">
                <h5>💊 Treatment</h5>
                <p>{detResult.treatment}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detection History */}
      <div className="card mt-xl">
        <h3 className="card-section-title">📋 Detection History</h3>
        {history.length === 0 ? (
          <div className="empty-state">
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
                      <td className="td-bold">{det.result?.diseaseName || 'N/A'}</td>
                      <td>
                        {det.result?.isHealthy ? (
                          <span className="badge badge-success">Healthy</span>
                        ) : (
                          <span className="badge badge-danger">Diseased</span>
                        )}
                      </td>
                      <td>{det.result?.confidence || 0}%</td>
                      <td className="td-muted">
                        {new Date(det.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {historyTotal > 1 && (
              <div className="pagination">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                >
                  ← Prev
                </button>
                <span className="pagination-info">
                  Page {historyPage} of {historyTotal}
                </span>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => setHistoryPage((p) => Math.min(historyTotal, p + 1))}
                  disabled={historyPage >= historyTotal}
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
