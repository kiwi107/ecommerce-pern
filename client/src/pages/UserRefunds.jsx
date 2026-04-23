import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserRefunds = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/user/refunds', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                setRefunds(data.refunds || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching user refunds:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status" />
            </div>
        );
    }

    return (
        <div className="container my-4">
            <h2 className="mb-4">My Refund Requests</h2>
            {refunds.length === 0 ? (
                <p>You have no refund requests.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead className="table-light">
                            <tr>
                                <th>Refund ID</th>
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Quantity</th>
                                <th>Amount ($)</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Requested At</th>
                                <th>Processed At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((refund) => (
                                <tr key={refund.refund_id}>
                                    <td>{refund.refund_id}</td>
                                    <td>{refund.order_id}</td>
                                    <td>{refund.product_name}</td>
                                    <td>{refund.color}</td>
                                    <td>{refund.size}</td>
                                    <td>{refund.refunded_quantity}</td>
                                    <td>{refund.refund_amount.toFixed(2)}</td>
                                    <td>{refund.reason}</td>
                                    <td>{refund.status}</td>
                                    <td>{new Date(refund.requested_at).toLocaleString()}</td>
                                    <td>{refund.processed_at ? new Date(refund.processed_at).toLocaleString() : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserRefunds;
