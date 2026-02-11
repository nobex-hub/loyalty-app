import { useState, useEffect } from 'react';
import { getStores, createStore, getStoreStats } from '../services/api';

export default function StoresPage() {
  const [stores, setStores] = useState([]);
  const [storeStats, setStoreStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', fiscalId: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storesData, statsData] = await Promise.all([
        getStores(),
        getStoreStats(),
      ]);
      setStores(storesData);
      setStoreStats(statsData);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await createStore(form);
      setSuccess('Store created!');
      setShowModal(false);
      setForm({ name: '', location: '', fiscalId: '' });
      loadData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const getStatsForStore = (storeId) => {
    return storeStats.find(s => s.id === storeId) || {};
  };

  if (loading) return <div className="loading">Loading stores...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Stores</h2>
        <p>Manage stores in the loyalty system</p>
      </div>

      {success && <div className="success-msg">{success}</div>}

      <div className="table-card">
        <div className="table-header">
          <h3>All Stores ({stores.length})</h3>
          <button className="btn btn-primary btn-small" onClick={() => setShowModal(true)}>
            + Add Store
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Fiscal ID</th>
              <th>Total Scans</th>
              <th>Points Generated</th>
              <th>Favorites</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((store) => {
              const stats = getStatsForStore(store.id);
              return (
                <tr key={store.id}>
                  <td><strong>{store.name}</strong></td>
                  <td>{store.location || '-'}</td>
                  <td><code className="code-inline">{store.fiscalId}</code></td>
                  <td>{stats.totalScans || 0}</td>
                  <td><strong className="points-highlight">{stats.totalPointsGenerated || 0}</strong> pts</td>
                  <td>{stats.favoriteCount || 0} ❤️</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Store</h3>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Store Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Maxi"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Belgrade"
                />
              </div>
              <div className="form-group">
                <label>Fiscal ID</label>
                <input
                  type="text"
                  value={form.fiscalId}
                  onChange={(e) => setForm({ ...form, fiscalId: e.target.value })}
                  placeholder="Unique fiscal identifier"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Store</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
