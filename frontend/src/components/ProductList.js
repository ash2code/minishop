import React from 'react';
import './ProductList.css';

function ProductList({ products, onAddToCart }) {
  if (products.length === 0) {
    return (
      <div className="product-list">
        <h2>Our Products</h2>
        <p className="empty-message">No products available. Add some products to get started!</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      <h2>Our Products</h2>
      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-icon">📦</div>
            <h3>{product.name}</h3>
            <p className="price">${product.price.toFixed(2)}</p>
            <p className="stock">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock: {product.stock}</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </p>
            <button
              className="add-to-cart-btn"
              onClick={() => onAddToCart(product.id)}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;
