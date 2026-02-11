import { useState, useEffect } from 'react';
import { getStores, getFavorites, addFavorite, removeFavorite } from '../services/api';

export default function StoresPage({ onNotify }) {
  const [stores, setStores] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storesData, favoritesData] = await Promise.all([
        getStores(),
        getFavorites(),
      ]);
      setStores(storesData);
      setFavorites(favoritesData);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (storeId) => {
    return favorites.some(f => f.id === storeId);
  };

  const toggleFavorite = async (store) => {
    try {
      if (isFavorite(store.id)) {
        await removeFavorite(store.id);
        setFavorites(prev => prev.filter(f => f.id !== store.id));
        onNotify(`${store.name} removed from favorites`);
      } else {
        await addFavorite(store.id);
        setFavorites(prev => [...prev, store]);
        onNotify(`${store.name} added to favorites!`);
      }
    } catch (err) {
      onNotify('Failed to update favorites', 'error');
    }
  };

  const displayStores = activeTab === 'favorites'
    ? stores.filter(s => isFavorite(s.id))
    : stores;

  if (loading) return <div className="loading">Loading stores...</div>;

  return (
    <div className="page-content">
      <h3 className="section-title">Stores</h3>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Stores
        </button>
        <button
          className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites ({favorites.length})
        </button>
      </div>

      {displayStores.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏪</div>
          <p>{activeTab === 'favorites' ? 'No favorite stores yet. Tap the heart to add!' : 'No stores found.'}</p>
        </div>
      ) : (
        <div className="store-list">
          {displayStores.map((store) => (
            <div key={store.id} className="store-item">
              <div className="store-info">
                <h3>{store.name}</h3>
                <p>{store.location || 'Location not set'}</p>
              </div>
              <button className="fav-btn" onClick={() => toggleFavorite(store)}>
                {isFavorite(store.id) ? '❤️' : '🤍'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
