import { useState, useEffect } from 'react';
import { getHistory } from '../services/api';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading history...</div>;

  return (
    <div className="page-content">
      <h3 className="section-title">Purchase History</h3>

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No purchase history yet. Start scanning receipts!</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const items = item.items || {};
            const matchedCount = items.matched?.length || 0;
            const unmatchedCount = items.unmatched?.length || 0;

            return (
              <div key={item.id} className="history-card">
                <div className="history-card-header">
                  <div className="history-info">
                    <h3>{item.store?.name || 'Store'}</h3>
                    <p>{new Date(item.scannedAt).toLocaleDateString('sr-Latn-RS', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</p>
                  </div>
                  <div className="history-points">+{item.totalPoints}</div>
                </div>

                <div className="history-card-meta">
                  <span className="meta-matched">✅ {matchedCount} matched</span>
                  {unmatchedCount > 0 && <span className="meta-unknown">❓ {unmatchedCount} unknown</span>}
                </div>

                {items.matched?.length > 0 && (
                  <div className="history-card-products">
                    {items.matched.map((product, i) => (
                      <div key={i} className="history-product-row">
                        <span className="history-product-name">{product.productName || product.name}</span>
                        <span className="history-product-points">+{product.totalPoints}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
