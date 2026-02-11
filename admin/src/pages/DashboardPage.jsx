import { useState, useEffect } from 'react';
import { getDashboardStats, getStoreStats, getProductStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const LIGHT_COLORS = ['#73BBA3', '#88D66C', '#B4E380', '#F6FB7A', '#A3D9C8'];
const DARK_COLORS = ['#1C82AD', '#21E6C1', '#5BA8CE', '#00337C', '#2A98C6'];

export default function DashboardPage() {
  const { isDark } = useTheme();
  const COLORS = isDark ? DARK_COLORS : LIGHT_COLORS;
  const chartGrid = isDark ? '#1E0A5C' : '#E8F0E3';
  const chartPrimary = isDark ? '#1C82AD' : '#73BBA3';
  const textColor = isDark ? '#D4E1F0' : '#1A2E1A';
  const tooltipProps = {
    contentStyle: { background: isDark ? '#13005A' : '#fff', border: `1px solid ${isDark ? '#00337C' : '#E8F0E3'}`, borderRadius: 10, color: textColor },
    labelStyle: { color: textColor },
    itemStyle: { color: textColor },
    wrapperStyle: { outline: 'none' },
    cursor: { fill: isDark ? 'rgba(28, 130, 173, 0.1)' : 'rgba(115, 187, 163, 0.1)' },
  };
  const [stats, setStats] = useState(null);
  const [storeStats, setStoreStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [dashData, storesData, productsData] = await Promise.all([
        getDashboardStats(),
        getStoreStats(),
        getProductStats(),
      ]);
      setStats(dashData);
      setStoreStats(storesData.slice(0, 5));
      setProductStats(productsData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your loyalty system</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats?.totalUsers || 0}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{stats?.totalTransactions || 0}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{stats?.totalProducts || 0}</div>
          <div className="stat-label">Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-value">{stats?.pendingReviews || 0}</div>
          <div className="stat-label">Pending Reviews</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{stats?.totalPointsIssued || 0}</div>
          <div className="stat-label">Total Points Issued</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Top Stores by Scans</h3>
          {storeStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeStats}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: textColor }} />
                <YAxis fontSize={12} tick={{ fill: textColor }} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="totalScans" fill={chartPrimary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No store data yet</p></div>
          )}
        </div>

        <div className="chart-card">
          <h3>Top Products by Scans</h3>
          {productStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productStats}
                  dataKey="scanCount"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ x, y, name, scanCount, textAnchor }) => (
                    <text x={x} y={y} textAnchor={textAnchor} fill={textColor} fontSize={12}>
                      {`${name}: ${scanCount}`}
                    </text>
                  )}
                >
                  {productStats.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No product data yet</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
