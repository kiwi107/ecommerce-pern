import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';


const CheckoutPage = () => {
  const { cartItems, totalQuantity } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const TAX_RATE = 0.10; // 10% tax

  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const taxes = subtotal * TAX_RATE;
  const total = subtotal + taxes - discount;

  const handleApplyPromo = () => {
    if (promoCode.trim().toLowerCase() === 'save10') {
      setDiscount(10);
    } else {
      setDiscount(0);
      alert('Invalid promo code');
    }
  };

  const handlePaymentChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const handlePlaceOrder = () => {
    if (!paymentMethod) {
      alert('Please select a payment method.');
      return;
    }
    alert(`Order placed successfully! Payment Method: ${paymentMethod}`);
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">Checkout</h2>

      {/* Cart Items */}
      <div className="card mb-4">
        <div className="card-header">
          <h5>Order Summary</h5>
        </div>
        <ul className="list-group list-group-flush">
          {cartItems.length === 0 ? (
            <li className="list-group-item">Your cart is empty.</li>
          ) : (
            cartItems.map((item, index) => (
              <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="my-0">{item.name}</h6>
                  <small className="text-muted">
                    Color: {item.color}, Size: {item.size}
                  </small>
                </div>
                <span className="text-muted">
                  {item.quantity} × ${item.price}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Promo Code */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Promo Code</h5>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Enter promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <button className="btn btn-primary" onClick={handleApplyPromo}>
              Apply
            </button>
          </div>
          {discount > 0 && <small className="text-success mt-2 d-block">Promo applied: -${discount}</small>}
        </div>
      </div>

      {/* Payment Options */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Payment Method</h5>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="cash"
              value="Cash"
              onChange={handlePaymentChange}
            />
            <label className="form-check-label" htmlFor="cash">
              Cash
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="credit"
              value="Credit Card"
              onChange={handlePaymentChange}
            />
            <label className="form-check-label" htmlFor="credit">
              Credit Card
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="paymentMethod"
              id="debit"
              value="Debit Card"
              onChange={handlePaymentChange}
            />
            <label className="form-check-label" htmlFor="debit">
              Debit Card
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Order Summary</h5>
          <ul className="list-unstyled">
            <li className="mb-2">
              <strong>Subtotal:</strong> ${subtotal.toFixed(2)}
            </li>
            <li className="mb-2">
              <strong>Tax (10%):</strong> ${taxes.toFixed(2)}
            </li>
            {discount > 0 && (
              <li className="mb-2 text-success">
                <strong>Discount:</strong> -${discount.toFixed(2)}
              </li>
            )}
            <li className="mb-3">
              <strong>Total:</strong> ${total.toFixed(2)}
            </li>
          </ul>
          <button className="btn btn-success w-100" onClick={handlePlaceOrder}>
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
