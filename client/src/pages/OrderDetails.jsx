import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const statusSteps = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderDetails = () => {
    const { order_id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`http://localhost:8000/orders/${order_id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            setOrder(data.order|| null);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [order_id]);

    const renderStatusProgress = () => {
        if (!order?.order_status?.stage) return null;

        const currentStep = statusSteps.indexOf(order.order_status.stage);
        const progressPercent = ((currentStep + 1) / statusSteps.length) * 100;

        return (
            <div className="my-4">
                <div className="d-flex justify-content-between mb-2">
                    {statusSteps.map((step, index) => (
                        <small
                            key={index}
                            className={`text-${index <= currentStep ? 'primary' : 'muted'}`}
                            style={{
                                flex: 1,
                                textAlign:
                                    index === 0
                                        ? 'left'
                                        : index === statusSteps.length - 1
                                            ? 'right'
                                            : 'center'
                            }}
                        >
                            {step}
                        </small>
                    ))}
                </div>
                <div className="progress" style={{ height: '1.5rem' }}>
                    <div
                        className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                        role="progressbar"
                        style={{ width: `${progressPercent}%` }}
                        aria-valuenow={progressPercent}
                        aria-valuemin="0"
                        aria-valuemax="100"
                    >
                        {order.order_status.stage}
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status" />
            </div>
        );
    }

    return (
        <div className="container my-1">
            <h2>Order #{order?.order_id}</h2>
            <p><strong>Date:</strong> {new Date(order?.order_date).toLocaleDateString()}</p>

            <h4 className="mt-4">Current Status: {order.order_status.stage}</h4>
            <h5>{order.order_status.note}</h5>
            {renderStatusProgress()}

            <h4 className="mt-4">Items</h4>
            <table className="table table-bordered mt-2">
                <thead className="table-light">
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Color</th>
                        <th>Size</th>
                        <th>Qty</th>
                    </tr>
                </thead>
                <tbody>
                    {order.items.map((item, idx) => (
                        <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td>{item.name}</td>
                            <td>{item.color}</td>
                            <td>{item.size}</td>
                            <td>{item.quantity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h4 className="mt-4">Total Price: ${order.total_price}</h4>
            <p><strong>Payment Method:</strong> {order.payment_method}</p>
        </div>
    );
};

export default OrderDetails;
