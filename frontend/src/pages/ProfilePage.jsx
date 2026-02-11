import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getHistory } from '../services/api';
import { subscribeToPush, unsubscribeFromPush, isSubscribed, getPermissionStatus } from '../utils/pushNotifications';

const TIER_CONFIG = {
  BRONZE: { emoji: '\u2B50', label: 'Bronze', color: '#CD7F32' },
  SILVER: { emoji: '\uD83E\uDD48', label: 'Silver', color: '#C0C0C0' },
  GOLD: { emoji: '\uD83E\uDD47', label: 'Gold', color: '#FFD700' },
  PLATINUM: { emoji: '\uD83D\uDC8E', label: 'Platinum', color: '#E5E4E2' },
};

export default function ProfilePage({ user, onLogout, onNotify }) {
  const [profile, setProfile] = useState(user);
  const [totalScans, setTotalScans] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfile();
    checkPushStatus();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileData, historyData] = await Promise.all([
        getProfile(),
        getHistory(),
      ]);
      setProfile(profileData);
      setTotalScans(historyData.length);
      setTotalEarned(historyData.reduce((sum, t) => sum + t.totalPoints, 0));
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkPushStatus = async () => {
    const subscribed = await isSubscribed();
    setPushEnabled(subscribed);
  };

  const handleTogglePush = async () => {
    setPushLoading(true);
    try {
      if (pushEnabled) {
        await unsubscribeFromPush();
        setPushEnabled(false);
        onNotify?.('Push notifications disabled', 'info');
      } else {
        await subscribeToPush();
        setPushEnabled(true);
        onNotify?.('Push notifications enabled!', 'success');
      }
    } catch (err) {
      onNotify?.(err.message || 'Failed to toggle push notifications', 'error');
    } finally {
      setPushLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  const tierInfo = TIER_CONFIG[profile?.tier] || TIER_CONFIG.BRONZE;
  const tierProgress = profile?.tierProgress;
  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  const pushPermission = getPermissionStatus();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">
          {profile?.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h2>{profile?.name}</h2>
        <p>{profile?.email}</p>
        <div className="profile-tier-badge" style={{ borderColor: tierInfo.color }}>
          <span className="tier-emoji">{tierInfo.emoji}</span>
          <span className="tier-label">{tierInfo.label} Member</span>
        </div>
      </div>

      {tierProgress && (
        <div className="tier-progress-card">
          <div className="tier-progress-header">
            <span>{tierInfo.emoji} {tierInfo.label}</span>
            {tierProgress.nextTier && (
              <span>{TIER_CONFIG[tierProgress.nextTier]?.emoji} {tierProgress.nextTierLabel}</span>
            )}
          </div>
          <div className="tier-progress-bar">
            <div
              className="tier-progress-fill"
              style={{ width: `${tierProgress.progress}%`, backgroundColor: tierInfo.color }}
            />
          </div>
          <div className="tier-progress-info">
            {tierProgress.nextTier
              ? `${tierProgress.pointsNeeded} points to ${tierProgress.nextTierLabel}`
              : 'Maximum tier reached!'}
          </div>
          <div className="tier-multiplier-info">
            Points multiplier: {tierProgress.multiplier}x
          </div>
        </div>
      )}

      <div className="profile-stats">
        <div className="stat-box">
          <div className="stat-value">{profile?.pointsBalance || 0}</div>
          <div className="stat-label">Current Points</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalScans}</div>
          <div className="stat-label">Receipts Scanned</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{totalEarned}</div>
          <div className="stat-label">Total Earned</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">
            {profile?.createdAt
              ? new Date(profile.createdAt).toLocaleDateString('sv-SE')
              : '-'}
          </div>
          <div className="stat-label">Member Since</div>
        </div>
      </div>

      {pushSupported && (
        <div className="push-settings">
          <div className="push-header">
            <h4>Push Notifications</h4>
            <p className="push-desc">Get notified about points, tier upgrades, and more</p>
          </div>
          {pushPermission === 'denied' ? (
            <p className="push-denied">Notifications are blocked. Please enable them in your browser settings.</p>
          ) : (
            <button
              className={`btn ${pushEnabled ? 'btn-secondary' : 'btn-primary'}`}
              onClick={handleTogglePush}
              disabled={pushLoading}
            >
              {pushLoading ? 'Processing...' : pushEnabled ? 'Disable Notifications' : 'Enable Notifications'}
            </button>
          )}
        </div>
      )}

      <button className="btn btn-danger" onClick={handleLogout}>
        Sign Out
      </button>
    </div>
  );
}
