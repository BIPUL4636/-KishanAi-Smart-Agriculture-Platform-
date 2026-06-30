import { useState, useEffect } from 'react';
import { recommendCrop, getCropHistory, suggestFertilizer } from '../services/api';
import CropForm from '../components/CropForm';
import FertilizerCard from '../components/FertilizerCard';
import toast from 'react-hot-toast';

// Crop Recommendation page — soil data form + AI prediction + fertilizer suggestions + history
export default function CropRecommendation() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fertilizerData, setFertilizerData] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  // Fetches crop recommendation history on mount and page change
  useEffect(() => {
    fetchHistory();
  }, [historyPage]);

  // Loads paginated history of past crop recommendations
  const fetchHistory = async () => {
    try {
      const res = await getCropHistory(historyPage, 5);
      setHistory(res.data.data.recommendations || []);
      setHistoryTotal(res.data.data.pagination?.pages || 1);
    } catch {
      // Silently fail — history is non-critical
    }
  };

  // Submits soil data for crop recommendation, then auto-triggers fertilizer suggestion
  const handleSubmit = async (values) => {
    setIsLoading(true);
    setResult(null);
    setFertilizerData(null);

    try {
      const res = await recommendCrop(values);
      const recommendation = res.data.data.recommendation;
      setResult(recommendation);
      toast.success(`Recommended: ${recommendation.result.cropName} 🌱`);

      // Auto-trigger fertilizer suggestion
      try {
        const fertRes = await suggestFertilizer({
          cropName: recommendation.result.cropName,
          N: values.N,
          P: values.P,
          K: values.K,
        });
        setFertilizerData(fertRes.data.data);
      } catch {
        // Fertilizer is optional — don't block the flow
      }

      // Refresh history
      fetchHistory();
    } catch (err) {
      const msg = err.response?.data?.message || 'Prediction failed — please try again';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Determines confidence bar color based on percentage
  const getConfidenceColor = (conf) => {
    if (conf >= 80) return 'var(--color-success)';
    if (conf >= 60) return 'var(--color-kisanBlue)';
    if (conf >= 40) return 'var(--color-accent)';
    return 'var(--color-danger)';
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1>🌱 Crop Recommendation</h1>
        <p>Enter your soil and climate data to get AI-powered crop suggestions</p>
      </div>

      {/* Soil Data Form */}
      <div className="card mb-lg">
        <h3 className="card-section-title">Soil & Climate Data</h3>
        <CropForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>

      {/* Result Card */}
      {result && (
        <div className="result-card fade-in mb-lg">
          <div className="result-card-header">
            <h3>🎯 Recommendation Result</h3>
            <span className="badge badge-success">AI Predicted</span>
          </div>
          <div className="result-card-body">
            {/* Crop Name */}
            <div className="result-name-row">
              <div className="result-icon-box" style={{ background: 'var(--color-kisanLight)' }}>
                🌾
              </div>
              <div>
                <h4 className="result-name-title">{result.result.cropName}</h4>
                <p className="result-name-subtitle">Recommended crop for your soil conditions</p>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="confidence-section">
              <div className="confidence-labels">
                <span className="confidence-label">Confidence</span>
                <span className="confidence-value" style={{ color: getConfidenceColor(result.result.confidence) }}>
                  {result.result.confidence}%
                </span>
              </div>
              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{
                    width: `${result.result.confidence}%`,
                    background: `linear-gradient(90deg, ${getConfidenceColor(result.result.confidence)}, ${getConfidenceColor(result.result.confidence)}dd)`,
                  }}
                />
              </div>
            </div>

            {/* Reasoning */}
            {result.result.reasoning && (
              <div className="info-box">
                <p>{result.result.reasoning}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fertilizer Suggestion (auto-triggered) */}
      {fertilizerData && <FertilizerCard data={fertilizerData} />}

      {/* Recommendation History */}
      <div className="card mt-xl">
        <h3 className="card-section-title">📋 Recommendation History</h3>
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No recommendations yet — fill the soil form above to get started</p>
          </div>
        ) : (
          <>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Crop</th>
                    <th>Confidence</th>
                    <th>N/P/K</th>
                    <th>pH</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rec) => (
                    <tr key={rec._id}>
                      <td className="td-bold">{rec.result?.cropName || 'N/A'}</td>
                      <td>
                        <span className="badge badge-success">{rec.result?.confidence || 0}%</span>
                      </td>
                      <td className="td-small">
                        {rec.inputs?.N}/{rec.inputs?.P}/{rec.inputs?.K}
                      </td>
                      <td>{rec.inputs?.pH || 'N/A'}</td>
                      <td className="td-muted">
                        {new Date(rec.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
