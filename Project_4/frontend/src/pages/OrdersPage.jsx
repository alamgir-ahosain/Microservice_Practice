import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  PENDING: '#f59e0b',
  CONFIRMED: '#10b981',
  SHIPPED: '#3b82f6',
  DELIVERED: '#8b5cf6',
  CANCELLED: '#ef4444',
};

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    getMyOrders(user.userId)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="page loader-page"><div className="spinner" /></div>
  );

  return (
    <div className="page orders-page">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <div className="empty-state large">
          <span className="empty-icon">◫</span>
          <h2>No orders yet</h2>
          <p>Your completed orders will appear here</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => setExpanded(expanded === order.id ? null : order.id)}>
                <div className="order-meta">
                  <span className="order-id">#{order.id?.slice(-8).toUpperCase()}</span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="order-right">
                  <span
                    className="order-status"
                    style={{ background: STATUS_COLORS[order.status] + '22', color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}44` }}
                  >
                    {order.status}
                  </span>
                  <span className="order-total">${Number(order.totalAmount).toFixed(2)}</span>
                  <span className="expand-icon">{expanded === order.id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === order.id && (
                <div className="order-details">
                  <p className="order-address">📦 {order.shippingAddress}</p>
                  <div className="order-items">
                    {order.items?.map((item, i) => (
                      <div key={i} className="order-item-row">
                        <span className="oi-name">{item.productName}</span>
                        <span className="oi-qty">× {item.quantity}</span>
                        <span className="oi-price">${Number(item.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-item-row total-row">
                    <span>Total</span>
                    <span />
                    <span>${Number(order.totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
