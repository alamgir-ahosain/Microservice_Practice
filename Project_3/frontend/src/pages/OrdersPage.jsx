// src/pages/OrdersPage.jsx
// Shows logged-in user's order history
import { useState, useEffect } from 'react'
import { orderApi } from '../api/orderApi'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  PENDING:   { bg: '#FFF8E1', text: '#F57F17' },
  CONFIRMED: { bg: '#E8F5E9', text: '#2E7D32' },
  SHIPPED:   { bg: '#E3F0FF', text: '#1565C0' },
  DELIVERED: { bg: '#E8F5E9', text: '#1B5E20' },
  CANCELLED: { bg: '#FFEBEE', text: '#B71C1C' },
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    orderApi.myOrders()
      .then(res => setOrders(res.data))
      .catch(() => toast.error('Could not load orders'))
      .finally(() => setLoading(false))
  }, [])

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return
    try {
      await orderApi.cancel(orderId)
      toast.success('Order cancelled')
      const res = await orderApi.myOrders()
      setOrders(res.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not cancel order')
    }
  }

  if (loading) return <div style={s.center}>Loading orders…</div>

  if (orders.length === 0) return (
    <div style={s.empty}>
      <h2 style={s.emptyTitle}>No orders yet</h2>
      <p>Start shopping to see your orders here.</p>
    </div>
  )

  return (
    <div>
      <h2 style={s.heading}>My Orders ({orders.length})</h2>
      <div style={s.list}>
        {orders.map(order => {
          const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING
          return (
            <div key={order.id} style={s.card}>
              {/* Order header */}
              <div style={s.cardHeader}
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div style={s.orderInfo}>
                  <span style={s.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                  <span style={{ ...s.statusBadge, background: sc.bg, color: sc.text }}>
                    {order.status}
                  </span>
                </div>
                <div style={s.orderMeta}>
                  <span style={s.amount}>${Number(order.totalAmount).toFixed(2)}</span>
                  <span style={s.date}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : '—'}
                  </span>
                  <span style={s.toggle}>{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Order details */}
              {expanded === order.id && (
                <div style={s.cardBody}>
                  <p style={s.address}>
                    <strong>Ship to:</strong> {order.shippingAddress}
                  </p>
                  <div style={s.items}>
                    {(order.items || []).map((item, idx) => (
                      <div key={idx} style={s.item}>
                        <span style={s.itemName}>{item.productName}</span>
                        <span style={s.itemQty}>×{item.quantity}</span>
                        <span style={s.itemPrice}>
                          ${Number(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {order.status === 'PENDING' || order.status === 'CONFIRMED' ? (
                    <button
                      onClick={() => handleCancel(order.id)}
                      style={s.cancelBtn}
                    >
                      Cancel Order
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  heading:     { fontSize: 22, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px' },
  center:      { textAlign: 'center', padding: 60, color: '#888' },
  empty:       { textAlign: 'center', padding: '60px 20px', color: '#888' },
  emptyTitle:  { color: '#1a1a2e', margin: '0 0 8px' },
  list:        { display: 'flex', flexDirection: 'column', gap: 12 },
  card:        { background: '#fff', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', overflow: 'hidden' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' },
  orderInfo:   { display: 'flex', alignItems: 'center', gap: 12 },
  orderId:     { fontWeight: 700, fontSize: 14, color: '#1a1a2e', fontFamily: 'monospace' },
  statusBadge: { fontSize: 12, fontWeight: 700, padding: '3px 12px', borderRadius: 20 },
  orderMeta:   { display: 'flex', alignItems: 'center', gap: 16 },
  amount:      { fontWeight: 700, fontSize: 16, color: '#0D47A1' },
  date:        { fontSize: 12, color: '#999' },
  toggle:      { fontSize: 11, color: '#bbb' },
  cardBody:    { padding: '0 20px 20px', borderTop: '1px solid #f5f5f5' },
  address:     { fontSize: 13, color: '#666', margin: '14px 0 10px' },
  items:       { display: 'flex', flexDirection: 'column', gap: 8 },
  item:        { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#F8F9FA', borderRadius: 8, fontSize: 13 },
  itemName:    { flex: 1, fontWeight: 600, color: '#333' },
  itemQty:     { color: '#999' },
  itemPrice:   { fontWeight: 700, color: '#0D47A1' },
  cancelBtn:   { marginTop: 14, padding: '9px 20px', borderRadius: 7, border: 'none', background: '#FFEBEE', color: '#c62828', fontWeight: 600, fontSize: 13, cursor: 'pointer' },
}
