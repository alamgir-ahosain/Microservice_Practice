import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { placeOrder } from '../api';
import { useToast } from '../components/Toast';

export default function CartPage() {
  const { items, removeFromCart, updateQty, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [address, setAddress] = useState('');
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast('Please enter a shipping address', 'error'); return; }
    setPlacing(true);
    try {
      await placeOrder(
        {
          shippingAddress: address,
          items: items.map(i => ({ productId: i.id, quantity: i.qty })),
        },
        user.userId,
        user.email
      );
      clearCart();
      toast('Order placed successfully! 🎉');
      navigate('/orders');
    } catch (e) {
      toast(e.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) return (
    <div className="page empty-cart-page">
      <div className="empty-state large">
        <span className="empty-icon">◧</span>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started</p>
        <button className="btn-primary" onClick={() => navigate('/')}>Browse Products</button>
      </div>
    </div>
  );

  return (
    <div className="page cart-page">
      <h1 className="page-title">Your Cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <img
                src={item.imageUrl || `https://picsum.photos/seed/${item.id}/80/80`}
                alt={item.name}
                className="cart-item-img"
                onError={e => { e.target.src = `https://picsum.photos/seed/${item.name}/80/80`; }}
              />
              <div className="cart-item-info">
                <h4>{item.name}</h4>
                <p className="cart-item-cat">{item.category}</p>
              </div>
              <div className="qty-control small">
                <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                <span>{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
              </div>
              <span className="cart-item-price">${(item.price * item.qty).toFixed(2)}</span>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-rows">
            {items.map(i => (
              <div key={i.id} className="summary-row">
                <span>{i.name} × {i.qty}</span>
                <span>${(i.price * i.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>

          <div className="address-section">
            <label className="field-label">Shipping Address</label>
            <textarea
              className="address-input"
              placeholder="Enter your full shipping address…"
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
            />
          </div>

          <button
            className="btn-primary-lg full"
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? 'Placing Order…' : 'Place Order →'}
          </button>
          <button className="btn-ghost full" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
