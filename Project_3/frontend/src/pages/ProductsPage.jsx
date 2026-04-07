// src/pages/ProductsPage.jsx
// Public product browse — any logged-in user can view and add to cart
import { useState, useEffect } from 'react'
import { productApi } from '../api/productApi'
import { orderApi } from '../api/orderApi'
import toast from 'react-hot-toast'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [cart, setCart]         = useState([])   // { productId, name, price, quantity }

  useEffect(() => {
    productApi.getAll()
      .then(res => setProducts(res.data))
      .catch(() => toast.error('Could not load products'))
      .finally(() => setLoading(false))
  }, [])

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id)
      if (existing) {
        return prev.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
        )
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.productId !== productId))
  }

  const placeOrder = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return }
    const address = window.prompt('Enter your shipping address:')
    if (!address) return
    try {
      const payload = {
        shippingAddress: address,
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity }))
      }
      await orderApi.placeOrder(payload)
      toast.success('Order placed successfully!')
      setCart([])
      // Refresh products to show updated stock
      const res = await productApi.getAll()
      setProducts(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order')
    }
  }

  const totalAmount = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  if (loading) return <div style={s.center}>Loading products…</div>

  return (
    <div style={s.page}>
      {/* Cart sidebar */}
      {cart.length > 0 && (
        <div style={s.cart}>
          <h3 style={s.cartTitle}>Cart ({cart.length})</h3>
          {cart.map(item => (
            <div key={item.productId} style={s.cartItem}>
              <span style={s.cartName}>{item.name}</span>
              <span style={s.cartQty}>×{item.quantity}</span>
              <span style={s.cartPrice}>${(item.price * item.quantity).toFixed(2)}</span>
              <button onClick={() => removeFromCart(item.productId)} style={s.removeBtn}>×</button>
            </div>
          ))}
          <div style={s.cartTotal}>Total: ${totalAmount.toFixed(2)}</div>
          <button onClick={placeOrder} style={s.orderBtn}>Place Order</button>
        </div>
      )}

      {/* Product grid */}
      <div style={s.content}>
        <h2 style={s.heading}>Products</h2>
        {products.length === 0 ? (
          <p style={s.empty}>No products available yet.</p>
        ) : (
          <div style={s.grid}>
            {products.map(product => (
              <div key={product.id} style={s.card}>
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} style={s.img}
                    onError={e => { e.target.style.display = 'none' }} />
                )}
                <div style={s.cardBody}>
                  <span style={s.category}>{product.category}</span>
                  <h3 style={s.productName}>{product.name}</h3>
                  <p style={s.description}>{product.description}</p>
                  <div style={s.cardFooter}>
                    <span style={s.price}>${Number(product.price).toFixed(2)}</span>
                    <span style={s.stock}>Stock: {product.stockQuantity}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stockQuantity === 0}
                    style={{ ...s.addBtn, opacity: product.stockQuantity === 0 ? 0.5 : 1 }}
                  >
                    {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page:        { display: 'flex', gap: 24, padding: '24px 0', alignItems: 'flex-start' },
  center:      { textAlign: 'center', padding: 60, color: '#888' },
  empty:       { color: '#999', textAlign: 'center', padding: 40 },
  content:     { flex: 1 },
  heading:     { margin: '0 0 20px', fontSize: 22, fontWeight: 700, color: '#1a1a2e' },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 },
  card:        { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' },
  img:         { width: '100%', height: 160, objectFit: 'cover' },
  cardBody:    { padding: 16, display: 'flex', flexDirection: 'column', gap: 6, flex: 1 },
  category:    { fontSize: 11, fontWeight: 700, color: '#1565C0', textTransform: 'uppercase', letterSpacing: 1 },
  productName: { margin: 0, fontSize: 15, fontWeight: 600, color: '#1a1a2e' },
  description: { margin: 0, fontSize: 12, color: '#777', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  cardFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  price:       { fontSize: 18, fontWeight: 700, color: '#0D47A1' },
  stock:       { fontSize: 12, color: '#999' },
  addBtn:      { marginTop: 8, padding: '9px', borderRadius: 8, border: 'none', background: '#1565C0', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  // Cart
  cart:        { width: 280, background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: 80 },
  cartTitle:   { margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' },
  cartItem:    { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: 13 },
  cartName:    { flex: 1, color: '#333', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cartQty:     { color: '#888' },
  cartPrice:   { color: '#0D47A1', fontWeight: 600 },
  removeBtn:   { background: 'none', border: 'none', color: '#e53935', cursor: 'pointer', fontSize: 16, padding: '0 4px', lineHeight: 1 },
  cartTotal:   { marginTop: 12, fontWeight: 700, fontSize: 15, color: '#1a1a2e', textAlign: 'right' },
  orderBtn:    { marginTop: 12, width: '100%', padding: '11px', borderRadius: 8, border: 'none', background: '#2E7D32', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
}
