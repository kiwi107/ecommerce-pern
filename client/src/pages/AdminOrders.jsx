import React, { useEffect, useState } from 'react';

const API_URL = 'http://localhost:8000/admin';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const statusOptions = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'danger', message: 'Failed to fetch orders' });
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`);
            if (!res.ok) throw new Error('Failed to fetch details');
            const data = await res.json();
            setSelectedOrder({ orderId, ...data });
            setShowDetails(true);
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'danger', message: 'Failed to fetch order details' });
        }
    };

    const handleStatusUpdate = async (orderId, newStage) => {
        try {
            const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stage: newStage }),
            });
            if (!res.ok) throw new Error('Failed to update status');

            setFeedback({ type: 'success', message: `Order ${orderId} status updated to "${newStage}"` });
            fetchOrders();
        } catch (err) {
            console.error(err);
            setFeedback({ type: 'danger', message: 'Failed to update status' });
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="container my-4">
            <h2 className="mb-4 text-success">Order Management</h2>

            {feedback && (
                <div className={`alert alert-${feedback.type} rounded-pill shadow-sm`} role="alert">
                    {feedback.message}
                </div>
            )}

            <div className="table-responsive shadow-sm rounded-4 overflow-hidden">
                <table className="table table-bordered align-middle mb-0">
                    <thead className="table-success">
                        <tr>
                            <th>Order ID</th>
                            <th>Client ID</th>
                            <th>Order Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{order.client_id}</td>
                                <td>{new Date(order.order_date).toLocaleString()}</td>
                                <td>
                                    <span className="badge bg-success-subtle text-success">{order.stage}</span>
                                </td>
                                <td className="d-flex gap-2 flex-wrap align-items-center">
                                    <button
                                        className="btn btn-outline-success btn-sm rounded-pill"
                                        onClick={() => fetchOrderDetails(order.order_id)}
                                    >
                                        View Details
                                    </button>

                                    <select
                                        className="form-select form-select-sm rounded-pill w-auto shadow-sm"
                                        value={order.stage}
                                        onChange={(e) => handleStatusUpdate(order.order_id, e.target.value)}
                                    >
                                        {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Order Details Modal */}
            {showDetails && selectedOrder && (
                <div className="modal show fade d-block" tabIndex="-1" role="dialog">
                    <div className="modal-dialog modal-lg" role="document">
                        <div className="modal-content rounded-4 shadow border-0">
                            <div className="modal-header bg-success text-white rounded-top-4">
                                <h5 className="modal-title">
                                    📝 Order Details (ID: {selectedOrder.orderId})
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowDetails(false)}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="mb-3">
                                    <strong>Payment Method:</strong> {selectedOrder.order_details.payment_method}
                                </div>
                                <div className="mb-4">
                                    <strong>Total Price:</strong> ${selectedOrder.order_details.total_price}
                                </div>

                                <h5 className="mb-3 text-success">🛍️ Items</h5>
                                <div className="table-responsive rounded shadow-sm">
                                    <table className="table table-bordered align-middle mb-0">
                                        <thead className="table-success">
                                            <tr>
                                                <th>Product Name</th>
                                                <th>Variant</th>
                                                <th>Quantity</th>
                                                <th>Price</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.order_items.map((item) => (
                                                <tr key={item.variant_id}>
                                                    <td>{item.name}</td>
                                                    <td>{item.color} / {item.size}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>${item.price}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="modal-footer rounded-bottom-4 bg-light">
                                <button
                                    type="button"
                                    className="btn btn-secondary rounded-pill"
                                    onClick={() => setShowDetails(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDetails && <div className="modal-backdrop fade show"></div>}
        </div>
    );
}
