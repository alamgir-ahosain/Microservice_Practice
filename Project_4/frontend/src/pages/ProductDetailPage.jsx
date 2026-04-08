import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/Toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    getProduct(id)
      .then(r => setProduct(r.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!user) { navigate('/login'); return; }
    for (let i = 0; i < qty; i++) addToCart(product);
    toast(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    if (!user) { navigate('/login'); return; }
    for (let i = 0; i < qty; i++) addToCart(product);
    navigate('/cart');
  };

  if (loading) return (
    <div className="page loader-page">
      <div className="spinner" />
    </div>
  );

  if (!product) return null;

  const outOfStock = product.stockQuantity === 0;

  return (
    <div className="page detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-layout">
        <div className="detail-image-wrap">
          <img
            src={product.imageUrl || `https://picsum.photos/seed/${product.id}/600/500`}
            alt={product.name}
            className="detail-image"
            onError={e => { e.target.src = `https://picsum.photos/seed/${product.name}/600/500`; }}
          />
          <div className="detail-category-badge">{product.category}</div>
        </div>

        <div className="detail-info">
          <h1 className="detail-title">{product.name}</h1>
          <p className="detail-desc">{product.description}</p>

          <div className="detail-price-row">
            <span className="detail-price">${Number(product.price).toFixed(2)}</span>
            <span className={`stock-indicator ${outOfStock ? 'out' : product.stockQuantity < 10 ? 'low' : 'good'}`}>
              {outOfStock ? '✕ Out of Stock' : `✓ ${product.stockQuantity} in stock`}
            </span>
          </div>

          {!user && (
            <div className="login-prompt">
              <span className="lock-icon">🔒</span>
              <div>
                <strong>Sign in to order</strong>
                <p>Create an account or sign in to add items to your cart and place orders.</p>
              </div>
              <button className="btn-primary" onClick={() => navigate('/login')}>Sign In</button>
            </div>
          )}

          {user && !outOfStock && (
            <div className="detail-actions">
              <div className="qty-control">
                <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stockQuantity, q + 1))}>+</button>
              </div>
              <button className="btn-cart-lg" onClick={handleAddToCart}>Add to Cart</button>
              <button className="btn-primary-lg" onClick={handleBuyNow}>Buy Now →</button>
            </div>
          )}

          {user && outOfStock && (
            <div className="out-of-stock-msg">This product is currently unavailable.</div>
          )}
        </div>
      </div>
    </div>
  );
}
