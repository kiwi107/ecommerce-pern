import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cartItems, totalQuantity, clearCart } = useCart();

    const [paymentMethod, setPaymentMethod] = useState('');
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [promoMessage, setPromoMessage] = useState('');
    const [promoError, setPromoError] = useState('');

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressIndex, setSelectedAddressIndex] = useState(null);
    const [addressForm, setAddressForm] = useState({
        street: '',
        apartment_no: '',
        floor: '',
        city: '',
        country: '',
    });

    const [selectedArea, setSelectedArea] = useState('');
    const [shippingFee, setShippingFee] = useState(0);

    const TAX_RATE = 0.10;

    // Predefined Cairo areas and shipping fees
    const cairoAreas = [
        { name: 'Nasr City', fee: 30 },
        { name: 'Heliopolis', fee: 40 },
        { name: 'Maadi', fee: 50 },
        { name: 'Zamalek', fee: 45 },
        { name: 'New Cairo', fee: 60 },
    ];

    const calculateItemPrice = (item) => {
        const hasDiscount = item.discount_amount != null;
        return hasDiscount ? item.price * (1 - item.discount_amount / 100) : item.price;
    };

    const subtotal = cartItems.reduce(
        (sum, item) => sum + item.quantity * calculateItemPrice(item),
        0
    );

    const discountAmount = subtotal * (discount / 100);
    const taxedAmount = subtotal - discountAmount;
    const taxes = taxedAmount * TAX_RATE;
    const total = taxedAmount + taxes + shippingFee;

    const handleApplyPromo = () => {
        fetch('http://localhost:8000/promotions/coupan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: promoCode }),
        })
            .then(async (response) => {
                const data = await response.json();
                if (response.ok) {
                    setDiscount(data.discount_amount);
                    setAppliedCoupon({ code: promoCode, discount_amount: data.discount_amount });
                    setPromoError('');
                    setPromoMessage('Promo code applied!');
                } else {
                    setPromoError(data.message);
                    setPromoMessage('');
                    setDiscount(0);
                    setAppliedCoupon(null);
                }
            })
            .catch(() => {
                setPromoError('Failed to validate coupon');
                setPromoMessage('');
            });
    };

    const handlePaymentChange = (e) => setPaymentMethod(e.target.value);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddressForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveAddress = () => {
        fetch('http://localhost:8000/users/address', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(addressForm),
        })
            .then(res => res.json())
            .then(() => {
                setAddresses(prev => [...prev, addressForm]);
                setAddressForm({ street: '', apartment_no: '', floor: '', city: '', country: '' });
            })
            .catch(console.error);
    };

    const fetchAddresses = () => {
        fetch('http://localhost:8000/users/address', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => setAddresses(data.addresses || []))
            .catch(console.error);
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleAreaChange = (e) => {
        const areaName = e.target.value;
        setSelectedArea(areaName);
        const area = cairoAreas.find(a => a.name === areaName);
        setShippingFee(area ? area.fee : 0);
    };

    const handlePlaceOrder = async () => {
        if (!paymentMethod) return alert('Please select a payment method.');
        if (selectedAddressIndex === null) return alert('Please select a shipping address.');
        if (!selectedArea) return alert('Please select a delivery area.');

        const selectedAddress = addresses[selectedAddressIndex];

        const orderPayload = {
            payment_method: paymentMethod,
            address: selectedAddress,
            items: cartItems.map(item => ({
                variant_id: item.variant_id,
                quantity: item.quantity,
            })),
            total_price: total.toFixed(2),
            shipping_area: selectedArea,
            shipping_fee: shippingFee,
            coupon: appliedCoupon,  // can be null if not applied
        };

        try {
            const response = await fetch('http://localhost:8000/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(orderPayload),
            });

            const data = await response.json();

            if (response.ok && data.order_id) {
                clearCart();
                navigate(`/order/${data.order_id}`);
            } else {
                alert(data.message || 'Failed to place order. Please try again.');
            }

        } catch (error) {
            console.error('Order placement error:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    return (
        <div className="container my-5">
            <h2 className="mb-4">Checkout</h2>

            {/* Cart Items */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5>Items in your cart ({totalQuantity})</h5>
                </div>
                <ul className="list-group list-group-flush">
                    {cartItems.length === 0 ? (
                        <li className="list-group-item">Your cart is empty.</li>
                    ) : (
                        cartItems.map((item, index) => {
                            const discountedPrice = calculateItemPrice(item);
                            return (
                                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 className="my-0">{item.name}</h6>
                                        <small className="text-muted">Color: {item.color}, Size: {item.size}</small>
                                    </div>
                                    <div className="text-end">
                                        {item.discount_amount ? (
                                            <>
                                                <div>
                                                    <small className="text-decoration-line-through text-muted">${item.price}</small>
                                                    <span className="text-danger ms-2">${discountedPrice.toFixed(2)}</span>
                                                </div>
                                                <small className="text-muted">{item.quantity} ×</small>
                                            </>
                                        ) : (
                                            <span className="text-muted">{item.quantity} × ${item.price}</span>
                                        )}
                                    </div>
                                </li>
                            );
                        })
                    )}
                </ul>
            </div>

            {/* Shipping Address */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Choose Shipping Address</h5>
                    {addresses.length > 0 ? (
                        addresses.map((addr, index) => (
                            <label
                                key={index}
                                htmlFor={`addr-${index}`}
                                className={`border rounded p-3 mb-3 d-block ${selectedAddressIndex === index ? 'border-primary' : ''}`}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="row">
                                    <div className="col-1">
                                        <input
                                            className="form-check-input mt-1"
                                            type="radio"
                                            name="addressSelect"
                                            id={`addr-${index}`}
                                            value={index}
                                            checked={selectedAddressIndex === index}
                                            onChange={() => setSelectedAddressIndex(index)}
                                        />
                                    </div>
                                    <div className="col-10">
                                        <p><strong>{addr.street}</strong>, Apt {addr.apartment_no}, Floor {addr.floor}</p>
                                        <p>{addr.city}, {addr.country}</p>
                                    </div>
                                </div>
                            </label>
                        ))
                    ) : (
                        <p className="text-muted">No address added.</p>
                    )}

                    <button className="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addressModal">
                        Add New Address
                    </button>
                </div>
            </div>

            {/* Delivery Area */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Select Delivery Area (Cairo)</h5>
                    <select className="form-select" value={selectedArea} onChange={handleAreaChange}>
                        <option value="">Select an area</option>
                        {cairoAreas.map(area => (
                            <option key={area.name} value={area.name}>
                                {area.name} — ${area.fee} shipping
                            </option>
                        ))}
                    </select>
                    {selectedArea && <small className="text-success mt-2 d-block">Shipping fee applied: ${shippingFee}</small>}
                </div>
            </div>

            {/* Payment Method */}
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Payment Method</h5>
                    {['Cash', 'Credit Card', 'Debit Card'].map((method) => (
                        <div className="form-check" key={method}>
                            <input
                                className="form-check-input"
                                type="radio"
                                name="paymentMethod"
                                id={method}
                                value={method}
                                onChange={handlePaymentChange}
                            />
                            <label className="form-check-label" htmlFor={method}>{method}</label>
                        </div>
                    ))}
                </div>
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
                        <button className="btn btn-primary" onClick={handleApplyPromo}>Apply</button>
                    </div>
                    {promoMessage && <small className="text-success mt-2 d-block">{promoMessage}</small>}
                    {promoError && <small className="text-danger mt-2 d-block">{promoError}</small>}
                    {discount > 0 && <small className="text-success mt-2 d-block">Promo applied: {discount}% off</small>}
                </div>
            </div>

            {/* Order Summary */}
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">Order Summary</h5>
                    <ul className="list-unstyled">
                        <li className="mb-2"><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</li>
                        {discount > 0 && <li className="mb-2 text-success"><strong>Promo Discount ({discount}%):</strong> -${discountAmount.toFixed(2)}</li>}
                        <li className="mb-2"><strong>Tax (10%):</strong> ${taxes.toFixed(2)}</li>
                        {selectedArea && <li className="mb-2"><strong>Shipping ({selectedArea}):</strong> ${shippingFee.toFixed(2)}</li>}
                        <li className="mb-3"><strong>Total:</strong> ${total.toFixed(2)}</li>
                    </ul>
                    <button className="btn btn-success w-100" onClick={handlePlaceOrder}>Place Order</button>
                </div>
            </div>

            {/* Address Modal */}
            <div className="modal fade" id="addressModal" tabIndex="-1" aria-labelledby="addressModalLabel" aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addressModalLabel">Enter Shipping Address</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            <form>
                                {['street', 'apartment_no', 'floor', 'city', 'country'].map(field => (
                                    <div className="mb-3" key={field}>
                                        <label className="form-label">{field.replace('_', ' ').toUpperCase()}</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name={field}
                                            value={addressForm[field]}
                                            onChange={handleAddressChange}
                                        />
                                    </div>
                                ))}
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveAddress} data-bs-dismiss="modal">Save Address</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default CheckoutPage;
