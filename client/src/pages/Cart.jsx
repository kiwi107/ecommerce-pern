import React from 'react';
import { useCart } from '../contexts/CartContext';

function Cart() {
    const { cartItems, totalQuantity, updateQuantity, removeFromCart } = useCart();

    const totalPrice = cartItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
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
                <div className="row ">
                    {cartItems.map((item, index) => (
                        <div className="col-md-12" key={index}>
                            <div className="card shadow-sm rounded-4" style={{ height: '150px' }}>
                                <div className="row">
                                    <div className="col-2">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="img-fluid rounded-start"
                                            style={{ height: "150px", objectFit: "cover" }}
                                        />
                                    </div>
                                    <div className="col-8">
                                        <div className="card-body position-relative">
                                            <h5 className="card-title">{item.name}</h5>
                                            <p className="mb-1"><strong>Color:</strong> {item.color}</p>
                                            <p className="mb-1"><strong>Size:</strong> {item.size}</p>
                                            <p className="mb-3">
                                                Price: <strong>${Number(item.price).toFixed(2)} x {item.quantity}</strong>
                                            </p>

                                        </div>
                                    </div>
                                    <div className="col-2" >
                                        <div className="d-flex align-items-center gap-2 mt-3">
                                            <p className="mb-0"><strong>Quantity:</strong></p>
                                            <input
                                                type="number"
                                                className="form-control"
                                                style={{ width: '80px' }}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                            />
                                        </div>

                                        <div className='position-absolute' style={{ bottom: '30px', right: '30px' }}>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemove(item)}
                                            >
                                                Remove
                                            </button>
                                        </div>


                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="col-12 mt-4">
                        <div className="card p-4 shadow-sm rounded-4">
                            <h5 className="mb-2">Total Items: {totalQuantity}</h5>
                            <h4 className="text-success">Total Price: ${totalPrice.toFixed(2)}</h4>
                            <button className="btn btn-primary mt-3">Proceed to Checkout</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cart;
