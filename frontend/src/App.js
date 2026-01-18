import React, { useState, useEffect } from 'react';
import './App.css';
import ProductList from './components/ProductList';
import Cart from './components/Cart';
import AddProduct from './components/AddProduct';

const PRODUCTS_API = '/api/products/';
const CART_API = '/api/carts/';
const USER_ID = 'customer1'; // In a real app, this would come from authentication

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Fetch products
  useEffect(() => {
    fetchProducts();
    initializeCart();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const initializeCart = async () => {
    try {
      // Try to get existing cart
      let response = await fetch(`${CART_API}${USER_ID}`);
      if (response.status === 404) {
        // Create cart if it doesn't exist
        response = await fetch(`${CART_API}${USER_ID}`, { method: 'POST' });
      }
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error initializing cart:', error);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await fetch(`${CART_API}${USER_ID}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, quantity })
      });
      const data = await response.json();
      setCart(data);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  const addProduct = async (product) => {
    try {
      const response = await fetch(PRODUCTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (response.ok) {
        fetchProducts();
        setShowAddProduct(false);
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🛒 Mini Shop</h1>
        <button
          className="add-product-btn"
          onClick={() => setShowAddProduct(!showAddProduct)}
        >
          {showAddProduct ? 'Close' : '+ Add Product (Admin)'}
        </button>
      </header>

      {showAddProduct && <AddProduct onAdd={addProduct} />}

      <div className="main-content">
        <ProductList products={products} onAddToCart={addToCart} />
        <Cart cart={cart} products={products} />
      </div>
    </div>
  );
}

export default App;
