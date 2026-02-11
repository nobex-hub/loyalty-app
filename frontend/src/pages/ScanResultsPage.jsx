import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { submitReview } from '../services/api';

export default function ScanResultsPage({ onNotify }) {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const [reviewedItems, setReviewedItems] = useState(new Set());

  if (!result) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-icon">📷</div>
          <p>No scan results. Go scan a receipt first!</p>
          <button className="btn btn-primary btn-center" onClick={() => navigate('/scan')}>
            Go to Scanner
          </button>
        </div>
      </div>
    );
  }

  const handleRequestReview = async (item) => {
    try {
      await submitReview(item.name, item.name);
      setReviewedItems(prev => new Set([...prev, item.name]));
      onNotify('Review request submitted!', 'success');
    } catch (err) {
      if (err.message.includes('already pending')) {
        onNotify('This product is already pending review', 'info');
      } else {
        onNotify('Failed to submit review', 'error');
      }
    }
  };

  return (
    <div className="results-page">
      <div className="results-summary">
        <div className="earned-label">Points Earned</div>
        <div className="earned-points">+{result.totalPointsEarned}</div>
        <div className="earned-label">{result.store?.name || 'Store'}</div>
      </div>

      {result.matchedProducts?.length > 0 && (
        <>
          <h3 className="section-title">Matched Products ✅</h3>
          <div className="product-list">
            {result.matchedProducts.map((item, i) => (
              <div key={i} className="product-item matched">
                <div>
                  <div className="product-name">{item.productName || item.name}</div>
                  <div className="product-meta">Qty: {item.quantity || 1}</div>
                </div>
                <div className="product-points">+{item.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </>
      )}

      {result.unmatchedProducts?.length > 0 && (
        <>
          <h3 className="section-title section-title-gap">Unknown Products ❓</h3>
          <div className="product-list">
            {result.unmatchedProducts.map((item, i) => (
              <div key={i} className="product-item unmatched">
                <div>
                  <div className="product-name">{item.name}</div>
                  <div className="product-meta">Not in database yet</div>
                </div>
                {reviewedItems.has(item.name) ? (
                  <span className="review-submitted">Submitted</span>
                ) : (
                  <button className="review-btn" onClick={() => handleRequestReview(item)}>
                    Request Review
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <button
        className="btn btn-primary btn-back-home"
        onClick={() => navigate('/')}
      >
        Back to Home
      </button>
    </div>
  );
}
