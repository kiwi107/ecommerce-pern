import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const statusOptions = ['Requested', 'Approved', 'Rejected', 'Processed'];

const AdminRefunds = () => {
    const [refunds, setRefunds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [feedback, setFeedback] = useState('');

    const colors = {
        light: '#d4f4dd',
        medium: '#7fc97f',
        dark: '#4c8c4a'
    };

    const notify = (msg, color = colors.dark) => {
        setFeedback({ msg, color });
        setTimeout(() => setFeedback(''), 2500);
    };

    const fetchRefunds = () => {
        setLoading(true);
        fetch('http://localhost:8000/admin/refunds', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch refunds');
                return res.json();
            })
            .then(data => {
                setRefunds(data.refunds || []);
            })
            .catch(err => {
                console.error('Error fetching refunds:', err);
                setRefunds([]);  // Optional: clear list on error
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    const handleStatusChange = (refundId, newStatus) => {
        setUpdatingId(refundId);
        fetch(`http://localhost:8000/admin/refunds/${refundId}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status: newStatus })
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to update status');
                return res.json();
            })
            .then(() => {
                notify('Status updated ✅');
                fetchRefunds();
            })
            .catch(err => {
                console.error('Error updating refund status:', err);
                notify('Error updating status ❌', '#e74c3c');
            })
            .finally(() => {
                setUpdatingId(null);
            });
    };

    const btn = (bg) => ({
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        color: 'white',
        backgroundColor: bg,
        fontSize: '14px'
    });


    useEffect(() => {
        fetchRefunds();
    }, []);
    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status" />
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 style={{ color: colors.dark }}>Refund Management</h2>

            {feedback && (
                <div style={{ backgroundColor: feedback.color, color: 'white', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    {feedback.msg}
                </div>
            )}

            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                    <h5 className="card-title mb-0">Refund Requests</h5>
                </div>
            </div>

            {refunds.length === 0 ? (
                <p>No refunds found.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered">
                        <thead style={{ backgroundColor: colors.light }}>
                            <tr>
                             
                                <th>Order ID</th>
                                <th>Product</th>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Quantity</th>
                                <th>Amount ($)</th>
                                <th>Reason</th>
                                <th>Status</th>
                                <th>Requested At</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {refunds.map((refund) => (
                                <tr key={refund.refund_id}>
                                 
                                    <td>{refund.order_id}</td>
                                    <td>{refund.product_name}</td>
                                    <td>{refund.color}</td>
                                    <td>{refund.size}</td>
                                    <td>{refund.refunded_quantity}</td>
                                    <td>{refund.refund_amount}</td>
                                    <td>{refund.reason}</td>
                                    <td>{refund.status}</td>
                                    <td>{new Date(refund.requested_at).toLocaleDateString()} {new Date(refund.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <select
                                            className="form-select"
                                            value={refund.status}
                                            disabled={updatingId === refund.refund_id}
                                            onChange={(e) => handleStatusChange(refund.refund_id, e.target.value)}
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
            )}
        </div>
    );
};

export default AdminRefunds;
