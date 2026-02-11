import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBalance, getHistory } from '../services/api';

const TIER_CONFIG = {
  BRONZE: { emoji: '\u2B50', label: 'Bronze', multiplier: '1x' },
  SILVER: { emoji: '\uD83E\uDD48', label: 'Silver', multiplier: '1.25x' },
  GOLD: { emoji: '\uD83E\uDD47', label: 'Gold', multiplier: '1.5x' },
  PLATINUM: { emoji: '\uD83D\uDC8E', label: 'Platinum', multiplier: '2x' },
};

export default function HomePage({ user }) {
  const [balance, setBalance] = useState(user?.pointsBalance || 0);
  const [tier, setTier] = useState(user?.tier || 'BRONZE');
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [balanceData, historyData] = await Promise.all([
        getBalance(),
        getHistory(),
      ]);
      setBalance(balanceData.pointsBalance);
      setTier(balanceData.tier || 'BRONZE');
      setRecentHistory(historyData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const tierInfo = TIER_CONFIG[tier] || TIER_CONFIG.BRONZE;

  return (
    <div className="page-content">
      <div className="points-card">
        <div>
          <div className="points-label">Your Balance</div>
          <div>
            <span className="points-value">{balance}</span>
            <span className="points-unit"> pts</span>
          </div>
          <div className="tier-badge-inline">
            <span>{tierInfo.emoji}</span>
            <span className="tier-name">{tierInfo.label}</span>
            <span className="tier-multiplier">{tierInfo.multiplier} points</span>
          </div>
        </div>
        <div className="points-icon">{tierInfo.emoji}</div>
      </div>

      <button className="scan-button" onClick={() => navigate('/scan')}>
        {'\uD83D\uDCF7'} Scan Receipt
      </button>

      <h3 className="section-title">Recent Activity</h3>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : recentHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{'\uD83D\uDCCB'}</div>
          <p>No transactions yet. Scan your first receipt!</p>
        </div>
      ) : (
        <div className="history-list">
          {recentHistory.map((item) => (
            <div key={item.id} className="history-item">
              <div className="history-info">
                <h3>{item.store?.name || 'Store'}</h3>
                <p>{new Date(item.scannedAt).toLocaleDateString('sr-Latn-RS', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}</p>
              </div>
              <div className="history-points">+{item.totalPoints}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
