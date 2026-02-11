import { useState, useEffect } from 'react';
import { getStoreStats, getProductStats, getUserStats, getUnknownProductStats } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

export default function AnalyticsPage() {
  const { isDark } = useTheme();
  const chartGrid = isDark ? '#1E0A5C' : '#E8F0E3';
  const chartColor1 = isDark ? '#1C82AD' : '#73BBA3';
  const chartColor2 = isDark ? '#21E6C1' : '#88D66C';
  const chartColor3 = isDark ? '#5BA8CE' : '#B4E380';
  const textColor = isDark ? '#D4E1F0' : '#1A2E1A';
  const tooltipProps = {
    contentStyle: { background: isDark ? '#13005A' : '#fff', border: `1px solid ${isDark ? '#00337C' : '#E8F0E3'}`, borderRadius: 10, color: textColor },
    labelStyle: { color: textColor },
    itemStyle: { color: textColor },
    wrapperStyle: { outline: 'none' },
    cursor: { fill: isDark ? 'rgba(28, 130, 173, 0.1)' : 'rgba(115, 187, 163, 0.1)' },
  };
  const [storeStats, setStoreStats] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [userStats, setUserStats] = useState([]);
  const [unknownStats, setUnknownStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [stores, products, users, unknown] = await Promise.all([
        getStoreStats(),
        getProductStats(),
        getUserStats(),
        getUnknownProductStats(),
      ]);
      setStoreStats(stores);
      setProductStats(products);
      setUserStats(users);
      setUnknownStats(unknown);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  // Prepare review status data for pie chart
  const reviewStatusData = unknownStats ? [
    { name: 'Pending', value: unknownStats.pending, color: isDark ? '#FFD93D' : '#F6FB7A' },
    { name: 'Approved', value: unknownStats.approved, color: isDark ? '#21E6C1' : '#88D66C' },
    { name: 'Rejected', value: unknownStats.rejected, color: isDark ? '#FF6B6B' : '#EF4444' },
  ].filter(d => d.value > 0) : [];

  // Prepare store comparison data
  const storeComparisonData = storeStats.slice(0, 8).map(s => ({
    name: s.name,
    scans: s.totalScans,
    points: s.totalPointsGenerated,
    favorites: s.favoriteCount,
  }));

  // Prepare user activity data
  const userActivityData = userStats.slice(0, 10).map(u => ({
    name: u.name.split(' ')[0],
    scans: u.totalScans,
    points: u.pointsBalance,
    earned: u.totalPointsEarned,
  }));

  return (
    <div>
      <div className="page-header">
        <h2>Analytics & Reports</h2>
        <p>Detailed insights into your loyalty system</p>
      </div>

      {/* Overview stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-value">{storeStats.length}</div>
          <div className="stat-label">Active Stores</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-value">{productStats.length}</div>
          <div className="stat-label">Tracked Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❓</div>
          <div className="stat-value">{unknownStats?.total || 0}</div>
          <div className="stat-label">Total Review Requests</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{unknownStats?.pending || 0}</div>
          <div className="stat-label">Awaiting Review</div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Store Performance Comparison</h3>
          {storeComparisonData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={storeComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: textColor }} />
                <YAxis fontSize={12} tick={{ fill: textColor }} />
                <Tooltip {...tooltipProps} />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="scans" name="Scans" fill={chartColor1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="points" name="Points" fill={chartColor2} radius={[4, 4, 0, 0]} />
                <Bar dataKey="favorites" name="Favorites" fill={chartColor3} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No store data yet</p></div>
          )}
        </div>

        <div className="chart-card">
          <h3>Review Request Status</h3>
          {reviewStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reviewStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  label={({ x, y, name, value, textAnchor }) => (
                    <text x={x} y={y} textAnchor={textAnchor} fill={textColor} fontSize={12}>
                      {`${name}: ${value}`}
                    </text>
                  )}
                >
                  {reviewStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip {...tooltipProps} />
                <Legend wrapperStyle={{ color: textColor }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No review data yet</p></div>
          )}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Most Scanned Products</h3>
          {productStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={productStats.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis type="number" fontSize={12} tick={{ fill: textColor }} />
                <YAxis dataKey="name" type="category" fontSize={11} width={100} tick={{ fill: textColor }} />
                <Tooltip {...tooltipProps} />
                <Bar dataKey="scanCount" name="Scans" fill={chartColor2} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No product scan data yet</p></div>
          )}
        </div>

        <div className="chart-card">
          <h3>User Activity Overview</h3>
          {userActivityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userActivityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartGrid} />
                <XAxis dataKey="name" fontSize={12} tick={{ fill: textColor }} />
                <YAxis fontSize={12} tick={{ fill: textColor }} />
                <Tooltip {...tooltipProps} />
                <Legend wrapperStyle={{ color: textColor }} />
                <Bar dataKey="scans" name="Scans" fill={chartColor1} radius={[4, 4, 0, 0]} />
                <Bar dataKey="earned" name="Points Earned" fill={chartColor2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state"><p>No user activity data yet</p></div>
          )}
        </div>
      </div>

      {/* Recent unknown products */}
      {unknownStats?.recent?.length > 0 && (
        <div className="table-card">
          <div className="table-header">
            <h3>Recent Unknown Product Submissions</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Identifier</th>
                <th>Submitted By</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {unknownStats.recent.map((review) => (
                <tr key={review.id}>
                  <td><strong>{review.productName}</strong></td>
                  <td><code className="code-inline">{review.productIdentifier}</code></td>
                  <td>{review.submittedBy?.name || 'Unknown'}</td>
                  <td>
                    <span className={`badge ${review.status === 'PENDING' ? 'badge-warning' : review.status === 'APPROVED' ? 'badge-success' : 'badge-danger'}`}>
                      {review.status}
                    </span>
                  </td>
                  <td>{new Date(review.createdAt).toLocaleDateString('sr-Latn-RS')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
