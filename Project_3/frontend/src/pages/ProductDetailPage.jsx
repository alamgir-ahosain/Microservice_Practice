import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.get(`/api/products/${id}`)
      .then(res => setProduct(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!product) return <p>Loading...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{product.name}</h2>

      <img
        src={product.imageUrl}
        alt={product.name}
        style={{ width: 300 }}
      />

      <p>{product.description}</p>

      <h3>${product.price}</h3>

      <p>Category: {product.category}</p>
      <p>Stock: {product.stockQuantity}</p>
    </div>
  );
}