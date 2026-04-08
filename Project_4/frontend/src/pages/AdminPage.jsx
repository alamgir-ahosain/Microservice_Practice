import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, deleteProduct, updateProduct } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';

const EMPTY = { name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' };

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') { navigate('/'); return; }
    loadProducts();
  }, [user]);

  const loadProducts = () => {
    getProducts()
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, price: Number(form.price), stockQuantity: Number(form.stockQuantity) };
    try {
      if (editingId) {
        await updateProduct(editingId, payload);
        toast('Product updated!');
      } else {
        await createProduct(payload, user.userId);
        toast('Product created!');
      }
      setShowForm(false);
      setForm(EMPTY);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      toast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, category: p.category, imageUrl: p.imageUrl || '' });
    setEditingId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast(`"${name}" deleted`);
      loadProducts();
    } catch {
      toast('Failed to delete', 'error');
    }
  };

  const cancelForm = () => { setShowForm(false); setForm(EMPTY); setEditingId(null); };

  if (loading) return <div className="page loader-page"><div className="spinner" /></div>;

  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <h1 className="page-title">Admin Panel</h1>
          <p className="admin-subtitle">{products.length} products in catalog</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY); }}>
          {showForm ? '✕ Cancel' : '+ New Product'}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h3>{editingId ? 'Edit Product' : 'Create New Product'}</h3>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Product Name *</label>
                <input className="field-input" placeholder="e.g. Premium Headphones" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="field-group">
                <label className="field-label">Category *</label>
                <input className="field-input" placeholder="e.g. Electronics" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required />
              </div>
              <div className="field-group">
                <label className="field-label">Price ($) *</label>
                <input className="field-input" type="number" step="0.01" min="0" placeholder="0.00" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
              </div>
              <div className="field-group">
                <label className="field-label">Stock Quantity *</label>
                <input className="field-input" type="number" min="0" placeholder="0" value={form.stockQuantity} onChange={e => setForm(f => ({ ...f, stockQuantity: e.target.value }))} required />
              </div>
              <div className="field-group full-width">
                <label className="field-label">Description *</label>
                <textarea className="field-input" rows={3} placeholder="Product description…" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
              </div>
              <div className="field-group full-width">
                <label className="field-label">Image URL</label>
                <input className="field-input" placeholder="https://…" value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary-lg" disabled={saving}>{saving ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}</button>
              <button type="button" className="btn-ghost" onClick={cancelForm}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="table-product">
                    <img src={p.imageUrl || `https://picsum.photos/seed/${p.id}/40/40`} alt="" className="table-thumb" onError={e => { e.target.src = `https://picsum.photos/40/40`; }} />
                    <div>
                      <div className="table-name">{p.name}</div>
                      <div className="table-desc">{p.description?.slice(0, 50)}…</div>
                    </div>
                  </div>
                </td>
                <td><span className="pill small">{p.category}</span></td>
                <td className="table-price">${Number(p.price).toFixed(2)}</td>
                <td>
                  <span className={`stock-indicator ${p.stockQuantity === 0 ? 'out' : p.stockQuantity < 10 ? 'low' : 'good'}`}>
                    {p.stockQuantity}
                  </span>
                </td>
                <td>
                  <span className={`status-dot ${p.active ? 'active' : 'inactive'}`}>
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <button className="action-btn edit" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="action-btn delete" onClick={() => handleDelete(p.id, p.name)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
