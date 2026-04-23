import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Link } from 'react-router-dom';

function Cart() {
    const { cartItems, totalQuantity, updateQuantity, removeFromCart } = useCart();

    const calculateItemPrice = (item) => {
        const hasDiscount = item.discount_amount != null;
        return hasDiscount
            ? item.price * (1 - item.discount_amount / 100)
            : item.price;
    };

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + calculateItemPrice(item) * item.quantity,
        0
    );

    const handleRemove = (item) => {
        removeFromCart(item.product_id, item.color, item.size);
    };

    const handleQuantityChange = (item, value) => {
        const quantity = Math.max(1, Number(value));
        updateQuantity(item.product_id, item.color, item.size, quantity);
    };

    return (
        <div className="container">
            <h2 className="mb-4">Your Shopping Cart</h2>

            {cartItems.length === 0 ? (
                <h4>Your cart is empty</h4>
            ) : (
                <div className="row">
                    {cartItems.map((item, index) => {
                        const hasDiscount = item.discount_amount != null;
                        const discountedPrice = calculateItemPrice(item);

                        return (
                            <div className="col-12 mb-3" key={index}>
                                <div className="card shadow-sm rounded-4 h-100">
                                    <div className="row g-0 flex-column flex-md-row">
                                        <div className="col-12 col-md-2">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="img-fluid rounded-start w-100 h-100 object-fit-cover"
                                                style={{ minHeight: '150px', maxHeight: '200px', objectFit: 'cover' }}
                                            />
                                        </div>

                                        <div className="col-12 col-md-7">
                                            <div className="card-body">
                                                <h5 className="card-title">{item.name}</h5>
                                                <p className="mb-1"><strong>Color:</strong> {item.color}</p>
                                                <p className="mb-1"><strong>Size:</strong> {item.size}</p>
                                                <p className="mb-2">
                                                    Price:&nbsp;
                                                    {hasDiscount ? (
                                                        <>
                                                            <span className="text-decoration-line-through text-muted">${item.price}</span>
                                                            <span className="text-danger ms-2">
                                                                ${discountedPrice.toFixed(2)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <strong>${item.price}</strong>
                                                    )}
                                                    &nbsp;x {item.quantity}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-3 d-flex flex-column justify-content-between p-3">
                                            <div className="mb-2">
                                                <label className="form-label"><strong>Quantity:</strong></label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    style={{ maxWidth: '100px' }}
                                                    value={item.quantity}
                                                    onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                />
                                            </div>

                                            <button
                                                className="btn btn-sm btn-outline-danger align-self-start"
                                                onClick={() => handleRemove(item)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <div className="col-12 mt-4">
                        <div className="card p-4 shadow-sm rounded-4">
                            <h5 className="mb-2">Total Items: {totalQuantity}</h5>
                            <h4 className="text-success">Total Price: ${totalPrice.toFixed(2)}</h4>
                            <Link to="/checkout" className="btn btn-primary mt-3">Proceed to Checkout</Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
