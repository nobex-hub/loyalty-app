import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import BottomNav from './components/BottomNav';
import ThemeToggle from './components/ThemeToggle';
import Notification from './components/Notification';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import ScanResultsPage from './pages/ScanResultsPage';
import HistoryPage from './pages/HistoryPage';
import StoresPage from './pages/StoresPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import { getBalance, getUnreadCount } from './services/api';
import { registerServiceWorker } from './utils/pushNotifications';
import './styles/global.css';
import './App.css';

let notifIdCounter = 0;

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [headerPoints, setHeaderPoints] = useState(user?.pointsBalance || 0);
  const [headerTier, setHeaderTier] = useState(user?.tier || 'BRONZE');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshPoints = useCallback(async () => {
    try {
      const data = await getBalance();
      setHeaderPoints(data.pointsBalance);
      setHeaderTier(data.tier);
    } catch (err) {}
  }, []);

  const refreshUnread = useCallback(async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch (err) {}
  }, []);

  useEffect(() => {
    if (user) {
      refreshPoints();
      refreshUnread();
      registerServiceWorker();
      const pointsInterval = setInterval(refreshPoints, 10000);
      const unreadInterval = setInterval(refreshUnread, 15000);
      return () => {
        clearInterval(pointsInterval);
        clearInterval(unreadInterval);
      };
    }
  }, [user, refreshPoints, refreshUnread]);

  const handleLogin = (userData) => {
    setUser(userData);
    setHeaderPoints(userData.pointsBalance);
    setHeaderTier(userData.tier || 'BRONZE');
  };

  const handleLogout = () => {
    setUser(null);
    setHeaderPoints(0);
    setHeaderTier('BRONZE');
    setUnreadCount(0);
  };

  const notify = useCallback((message, type = 'success') => {
    const id = ++notifIdCounter;
    setNotifications(prev => [...prev, { id, message, type }]);
    refreshPoints();
  }, [refreshPoints]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  if (!user) {
    return (
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
            <Route path="/register" element={<RegisterPage onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Notification notifications={notifications} onDismiss={dismissNotification} />
        <div className="app-layout">
          <div className="top-header">
            <h2>Loyalty Rewards</h2>
            <div className="header-actions">
              <div className="points-badge">
                <span className={`tier-indicator tier-${headerTier.toLowerCase()}`}>{tierEmoji(headerTier)}</span>
                {' '}{headerPoints} pts
              </div>
              <ThemeToggle className="compact" />
            </div>
          </div>
          <Routes>
            <Route path="/" element={<HomePage user={user} />} />
            <Route path="/scan" element={<ScanPage onNotify={notify} />} />
            <Route path="/scan/results" element={<ScanResultsPage onNotify={notify} />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/stores" element={<StoresPage onNotify={notify} />} />
            <Route path="/profile" element={<ProfilePage user={user} onLogout={handleLogout} onNotify={notify} />} />
            <Route path="/notifications" element={<NotificationsPage onUnreadChange={refreshUnread} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <BottomNav unreadCount={unreadCount} />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function tierEmoji(tier) {
  switch (tier) {
    case 'PLATINUM': return '\uD83D\uDC8E';
    case 'GOLD': return '\uD83E\uDD47';
    case 'SILVER': return '\uD83E\uDD48';
    default: return '\u2B50';
  }
}
