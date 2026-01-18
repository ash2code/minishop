import React from 'react';
import './Cart.css';

function Cart({ cart, products }) {
  if (!cart) {
    return (
      <div className="cart">
        <h2>🛍️ Your Cart</h2>
        <p className="loading">Loading cart...</p>
      </div>
    );
  }

  const cartItems = Object.entries(cart.items || {});

  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.name : `Product #${productId}`;
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.price : 0;
  };

  return (
    <div className="cart">
      <h2>🛍️ Your Cart</h2>

      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty</p>
          <p className="empty-cart-hint">Start adding some products!</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map(([productId, item]) => (
              <div key={productId} className="cart-item">
                <div className="cart-item-details">
                  <h4>{getProductName(productId)}</h4>
                  <p className="cart-item-price">
                    ${getProductPrice(productId).toFixed(2)} × {item.quantity}
                  </p>
                </div>
                <div className="cart-item-total">
                  ${(getProductPrice(productId) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="cart-total">
            <h3>Total</h3>
            <h3 className="total-amount">${cart.total.toFixed(2)}</h3>
          </div>

          <button className="checkout-btn">
            Proceed to Checkout
          </button>
        </>
      )}
    </div>
  );
}

export default Cart;
