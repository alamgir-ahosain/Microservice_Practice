// src/pages/AdminProductsPage.jsx
// Only accessible with ADMIN role (ProtectedRoute adminOnly)
import { useState, useEffect } from 'react'
import { productApi } from '../api/productApi'
import toast from 'react-hot-toast'

const emptyForm = { name: '', description: '', price: '', stockQuantity: '', category: '', imageUrl: '' }

export default function AdminProductsPage() {
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [form, setForm]           = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving]       = useState(false)

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll()
      setProducts(res.data)
    } catch {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      price:         parseFloat(form.price),
      stockQuantity: parseInt(form.stockQuantity, 10),
    }
    try {
      if (editingId) {
        await productApi.update(editingId, payload)
        toast.success('Product updated')
      } else {
        await productApi.create(payload)
        toast.success('Product created')
      }
      setForm(emptyForm)
      setEditingId(null)
      fetchProducts()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '',
      price: p.price, stockQuantity: p.stockQuantity,
      category: p.category || '', imageUrl: p.imageUrl || '',
    })
    setEditingId(p.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return
    try {
      await productApi.delete(id)
      toast.success('Product removed')
      fetchProducts()
    } catch {
      toast.error('Delete failed')
    }
  }

  const handleCancel = () => { setForm(emptyForm); setEditingId(null) }

  return (
    <div>
      <h2 style={s.heading}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>

      {/* Form */}
      <div style={s.formCard}>
        <form onSubmit={handleSubmit} style={s.form}>
          {[
            { name: 'name',          label: 'Product Name',    type: 'text',   required: true,  placeholder: 'e.g. Wireless Headphones' },
            { name: 'description',   label: 'Description',     type: 'text',   required: false, placeholder: 'Short description' },
            { name: 'price',         label: 'Price ($)',        type: 'number', required: true,  placeholder: '0.00', step: '0.01', min: '0.01' },
            { name: 'stockQuantity', label: 'Stock Quantity',  type: 'number', required: true,  placeholder: '0', min: '0' },
            { name: 'category',      label: 'Category',        type: 'text',   required: false, placeholder: 'e.g. Electronics' },
            { name: 'imageUrl',      label: 'Image URL',       type: 'url',    required: false, placeholder: 'https://...' },
          ].map(f => (
            <div key={f.name} style={s.field}>
              <label htmlFor={`prod-${f.name}`} style={s.label}>{f.label}</label>
              <input
                id={`prod-${f.name}`}
                name={f.name}
                type={f.type}
                placeholder={f.placeholder}
                required={f.required}
                step={f.step}
                min={f.min}
                value={form[f.name]}
                onChange={handleChange}
                style={s.input}
                autoComplete="off"
              />
            </div>
          ))}

          <div style={s.btns}>
            <button type="submit" disabled={saving}
              style={{ ...s.btn, opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving…' : editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} style={s.cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Product list */}
      <h2 style={{ ...s.heading, marginTop: 32 }}>All Products ({products.length})</h2>
      {loading ? (
        <p style={{ color: '#888' }}>Loading…</p>
      ) : products.length === 0 ? (
        <p style={{ color: '#999' }}>No products yet. Add one above.</p>
      ) : (
        <div style={s.table}>
          <div style={s.tableHeader}>
            <span>Name</span><span>Category</span>
            <span>Price</span><span>Stock</span><span>Actions</span>
          </div>
          {products.map(p => (
            <div key={p.id} style={s.tableRow}>
              <span style={s.productName}>{p.name}</span>
              <span style={s.tag}>{p.category || '—'}</span>
              <span style={s.price}>${Number(p.price).toFixed(2)}</span>
              <span style={{ color: p.stockQuantity < 5 ? '#e53935' : '#388e3c', fontWeight: 600 }}>
                {p.stockQuantity}
              </span>
              <div style={s.actions}>
                <button onClick={() => handleEdit(p)} style={s.editBtn}>Edit</button>
                <button onClick={() => handleDelete(p.id, p.name)} style={s.deleteBtn}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s = {
  heading:     { fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 16px' },
  formCard:    { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', marginBottom: 8 },
  form:        { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  field:       { display: 'flex', flexDirection: 'column', gap: 5 },
  label:       { fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 },
  input:       { padding: '10px 12px', borderRadius: 7, border: '1.5px solid #D0D7E3', fontSize: 14, outline: 'none', color: '#222' },
  btns:        { gridColumn: '1 / -1', display: 'flex', gap: 12, marginTop: 4 },
  btn:         { padding: '11px 28px', borderRadius: 8, border: 'none', background: '#1565C0', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  cancelBtn:   { padding: '11px 20px', borderRadius: 8, border: '1.5px solid #ccc', background: '#fff', color: '#555', fontSize: 14, cursor: 'pointer' },
  table:       { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' },
  tableHeader: { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1.2fr', padding: '12px 20px', background: '#1565C0', color: '#fff', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow:    { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.7fr 1.2fr', padding: '14px 20px', borderBottom: '1px solid #f0f0f0', alignItems: 'center', fontSize: 14 },
  productName: { fontWeight: 600, color: '#1a1a2e' },
  tag:         { fontSize: 12, background: '#E3F0FF', color: '#1565C0', padding: '3px 10px', borderRadius: 20, fontWeight: 600, width: 'fit-content' },
  price:       { fontWeight: 700, color: '#0D47A1' },
  actions:     { display: 'flex', gap: 8 },
  editBtn:     { padding: '6px 14px', borderRadius: 6, border: 'none', background: '#E3F0FF', color: '#1565C0', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
  deleteBtn:   { padding: '6px 14px', borderRadius: 6, border: 'none', background: '#FFEBEE', color: '#c62828', fontWeight: 600, fontSize: 12, cursor: 'pointer' },
}
