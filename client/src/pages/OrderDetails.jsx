import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const statusSteps = ["Processing", "Shipped", "Out for Delivery", "Delivered"];

const OrderDetails = () => {
    const { order_id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [refundItems, setRefundItems] = useState([]);
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetch(`http://localhost:8000/orders/${order_id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
            setOrder(data.order || null);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, [order_id]);

    const handleOpenRefundModal = () => {
        const itemsWithRefundQty = order.items.map(item => ({
            ...item,
            refundQuantity: 0
        }));
        setRefundItems(itemsWithRefundQty);
        setShowRefundModal(true);
    };

    const handleRefundQuantityChange = (index, value) => {
        const updatedItems = [...refundItems];
        updatedItems[index].refundQuantity = Math.max(0, Math.min(updatedItems[index].quantity, parseInt(value) || 0));
        setRefundItems(updatedItems);
    };

    const handleSubmitRefund = () => {
        const refundData = refundItems
            .filter(item => item.refundQuantity > 0)
            .map(item => ({
                variant_id: item.variant_id,
                refund_quantity: item.refundQuantity,
                reason: reason
            }));

        if (refundData.length === 0) {
            alert('Please select at least one item and quantity to refund.');
            return;
        }

        fetch(`http://localhost:8000/orders/${order_id}/refunds`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ refunds: refundData })
        })
        .then(res => res.json())
        .then(data => {
            alert(data.message || 'Refund request submitted.');
            setShowRefundModal(false);
        })
        .catch(err => {
            console.error(err);
            alert('Failed to submit refund request.');
        });
    };

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
            
            {order.order_status.stage === 'Delivered' && (
                <button className="btn btn-warning mt-3" onClick={handleOpenRefundModal}>
                    Request Refund
                </button>
            )}

            {showRefundModal && (
                <div className="modal d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Request Refund</h5>
                                <button type="button" className="btn-close" onClick={() => setShowRefundModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <table className="table table-bordered">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Color</th>
                                            <th>Size</th>
                                            <th>Ordered Qty</th>
                                            <th>Refund Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {refundItems.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.name}</td>
                                                <td>{item.color}</td>
                                                <td>{item.size}</td>
                                                <td>{item.quantity}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={item.quantity}
                                                        value={item.refundQuantity}
                                                        onChange={(e) => handleRefundQuantityChange(idx, e.target.value)}
                                                        className="form-control"
                                                    />
                                                </td>
                                            </tr>
                                        ))}

                                        <tr>
                                            <td colSpan="4">Refund Reason</td>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={reason}
                                                    onChange={(e) => setReason(e.target.value)}
                                                    className="form-control"
                                                placeholder="Enter reason for refund"
                                                />
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowRefundModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSubmitRefund}>Submit Refund</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
