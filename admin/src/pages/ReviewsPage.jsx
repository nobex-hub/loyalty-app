import { useState, useEffect } from 'react';
import { getReviewQueue, getAllReviews, approveReview, rejectReview } from '../services/api';

export default function ReviewsPage() {
  const [queue, setQueue] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [pointsInputs, setPointsInputs] = useState({});
  const [notesInputs, setNotesInputs] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [queueData, allData] = await Promise.all([
        getReviewQueue(),
        getAllReviews(),
      ]);
      setQueue(queueData);
      setAllReviews(allData);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const points = parseInt(pointsInputs[id]) || 0;
    const notes = notesInputs[id] || '';

    try {
      await approveReview(id, points, notes);
      setSuccess('Product approved and added to database!');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
  };

  const handleReject = async (id) => {
    const notes = notesInputs[id] || '';

    try {
      await rejectReview(id, notes);
      setSuccess('Product rejected.');
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
  };

  if (loading) return <div className="loading">Loading reviews...</div>;

  const pendingCount = queue.length;
  const processedReviews = allReviews.filter(r => r.status !== 'PENDING');

  return (
    <div>
      <div className="page-header">
        <h2>Review Queue</h2>
        <p>Approve or reject unknown products submitted by users</p>
      </div>

      {success && <div className="success-msg">{success}</div>}

      <div className="review-tabs">
        <button
          className={`review-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingCount})
        </button>
        <button
          className={`review-tab ${activeTab === 'processed' ? 'active' : ''}`}
          onClick={() => setActiveTab('processed')}
        >
          Processed ({processedReviews.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          {queue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <p>No pending reviews! All caught up.</p>
            </div>
          ) : (
            queue.map((review) => (
              <div key={review.id} className="review-card">
                <h4>{review.productName}</h4>
                <div className="review-meta">
                  Identifier: <strong>{review.productIdentifier}</strong> &bull;
                  Submitted by: {review.submittedBy?.name || 'Unknown'} &bull;
                  {new Date(review.createdAt).toLocaleDateString('sr-Latn-RS')}
                </div>

                <div className="review-form">
                  <div className="form-group">
                    <label>Points Value</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5"
                      value={pointsInputs[review.id] || ''}
                      onChange={(e) => setPointsInputs({ ...pointsInputs, [review.id]: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <input
                      type="text"
                      placeholder="Admin notes..."
                      value={notesInputs[review.id] || ''}
                      onChange={(e) => setNotesInputs({ ...notesInputs, [review.id]: e.target.value })}
                    />
                  </div>
                  <div className="btn-group">
                    <button className="btn btn-success btn-small" onClick={() => handleApprove(review.id)}>
                      ✅ Approve
                    </button>
                    <button className="btn btn-danger btn-small" onClick={() => handleReject(review.id)}>
                      ❌ Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {activeTab === 'processed' && (
        <>
          {processedReviews.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No processed reviews yet.</p>
            </div>
          ) : (
            processedReviews.map((review) => (
              <div key={review.id} className={`review-card ${review.status.toLowerCase()}`}>
                <h4>{review.productName}</h4>
                <div className="review-meta">
                  Identifier: <strong>{review.productIdentifier}</strong> &bull;
                  Status: <span className={`badge ${review.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                    {review.status}
                  </span>
                  {review.pointsValue && <> &bull; Points: <strong>{review.pointsValue}</strong></>}
                  {review.adminNotes && <> &bull; Notes: {review.adminNotes}</>}
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
