import React, { useEffect, useState } from 'react';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    getProducts()
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="page">
      <div className="hero">
        <div className="hero-content">
          <p className="hero-sub">Premium Collection</p>
          <h1 className="hero-title">Discover<br /><span className="hero-accent">Extraordinary</span><br />Products</h1>
          <p className="hero-desc">Curated selection of the finest items, delivered to your door.</p>
        </div>
        <div className="hero-bg">
          <div className="hero-orb orb1" />
          <div className="hero-orb orb2" />
          <div className="hero-orb orb3" />
        </div>
      </div>

      <div className="products-section">
        <div className="filters-bar">
          <div className="search-wrap">
            <span className="search-icon">◎</span>
            <input
              className="search-input"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="category-pills">
            {categories.map(c => (
              <button
                key={c}
                className={`pill ${category === c ? 'active' : ''}`}
                onClick={() => setCategory(c)}
              >{c}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loader-wrap">
            <div className="spinner" />
            <p>Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">◈</span>
            <p>No products found</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
