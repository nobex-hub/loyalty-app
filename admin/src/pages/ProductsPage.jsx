import { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../services/api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', identifier: '', pointsValue: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setForm({ name: '', identifier: '', pointsValue: '' });
    setEditingProduct(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name,
      identifier: product.identifier,
      pointsValue: product.pointsValue.toString(),
    });
    setEditingProduct(product);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: form.name,
          identifier: form.identifier,
          pointsValue: parseInt(form.pointsValue),
        });
        setSuccess('Product updated!');
      } else {
        await createProduct({
          name: form.name,
          identifier: form.identifier,
          pointsValue: parseInt(form.pointsValue),
        });
        setSuccess('Product created!');
      }
      setShowModal(false);
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await deleteProduct(id);
      setSuccess('Product deleted!');
      loadProducts();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div>
      <div className="page-header">
        <h2>Products</h2>
        <p>Manage products and their point values</p>
      </div>

      {success && <div className="success-msg">{success}</div>}

      <div className="table-card">
        <div className="table-header">
          <h3>All Products ({products.length})</h3>
          <button className="btn btn-primary btn-small" onClick={openCreate}>
            + Add Product
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Identifier</th>
              <th>Points</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td><strong>{product.name}</strong></td>
                <td><code className="code-inline">{product.identifier}</code></td>
                <td><strong className="points-highlight">{product.pointsValue}</strong> pts</td>
                <td>
                  <span className={`badge ${product.status === 'KNOWN' ? 'badge-success' : product.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <div className="btn-group">
                    <button className="btn btn-secondary btn-small" onClick={() => openEdit(product)}>Edit</button>
                    <button className="btn btn-danger btn-small" onClick={() => handleDelete(product.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Mleko 1L"
                  required
                />
              </div>
              <div className="form-group">
                <label>Identifier (from receipt)</label>
                <input
                  type="text"
                  value={form.identifier}
                  onChange={(e) => setForm({ ...form, identifier: e.target.value })}
                  placeholder="e.g. MLEKO-1L"
                  required
                />
              </div>
              <div className="form-group">
                <label>Points Value</label>
                <input
                  type="number"
                  value={form.pointsValue}
                  onChange={(e) => setForm({ ...form, pointsValue: e.target.value })}
                  placeholder="e.g. 5"
                  min="0"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
