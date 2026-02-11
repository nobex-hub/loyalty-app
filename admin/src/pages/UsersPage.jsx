import { useState, useEffect } from 'react';
import { getUserStats } from '../services/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUserStats();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Users</h2>
        <p>User activity and engagement overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-value">{users.reduce((sum, u) => sum + u.totalScans, 0)}</div>
          <div className="stat-label">Total Scans</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">{users.reduce((sum, u) => sum + u.pointsBalance, 0)}</div>
          <div className="stat-label">Total Points in Circulation</div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header">
          <h3>All Users</h3>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Points Balance</th>
              <th>Total Scans</th>
              <th>Points Earned</th>
              <th>Last Activity</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td><strong className="points-highlight">{user.pointsBalance}</strong> pts</td>
                <td>{user.totalScans}</td>
                <td>{user.totalPointsEarned} pts</td>
                <td>{new Date(user.lastActivity).toLocaleDateString('sr-Latn-RS', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}</td>
                <td>{new Date(user.joinedAt).toLocaleDateString('sr-Latn-RS', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
