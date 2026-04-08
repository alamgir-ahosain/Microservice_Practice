import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!user) { navigate('/login'); return; }
    addToCart(product);
  };

  const handleClick = () => navigate(`/products/${product.id}`);

  const stockStatus = product.stockQuantity === 0
    ? 'out' : product.stockQuantity < 10 ? 'low' : 'good';

  return (
    <div className="product-card" onClick={handleClick}>
      <div className="card-image-wrap">
        <img
          src={product.imageUrl || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          className="card-image"
          onError={e => { e.target.src = `https://picsum.photos/seed/${product.name}/400/300`; }}
        />
        <div className="card-category">{product.category}</div>
        {stockStatus === 'out' && <div className="stock-badge out">Sold Out</div>}
        {stockStatus === 'low' && <div className="stock-badge low">Low Stock</div>}
      </div>

      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
        <p className="card-desc">{product.description}</p>
        <div className="card-footer">
          <span className="card-price">${Number(product.price).toFixed(2)}</span>
          <button
            className={`btn-cart ${stockStatus === 'out' ? 'disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={stockStatus === 'out'}
          >
            {!user ? '🔒 Sign In' : stockStatus === 'out' ? 'Sold Out' : '+ Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
