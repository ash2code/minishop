import React, { useState } from 'react';
import './AddProduct.css';

function AddProduct({ onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    });
    setFormData({ name: '', price: '', stock: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="add-product-form">
      <h3>Add New Product</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="stock"
          placeholder="Stock Quantity"
          min="0"
          value={formData.stock}
          onChange={handleChange}
          required
        />
        <button type="submit">Add Product</button>
      </form>
    </div>
  );
}

export default AddProduct;
