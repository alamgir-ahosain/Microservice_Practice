import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
    return (
        <div style={{
            border: '1px solid #ddd',
            padding: 12,
            borderRadius: 8
        }}>
            <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: 150, objectFit: 'cover' }}
            />

            <h3>{product.name}</h3>
            <p>${product.price}</p>

            <Link to={`/products/${product.id}`}>
                View Details
            </Link>
        </div>
    );
}