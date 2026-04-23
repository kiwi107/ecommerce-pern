import React, { useEffect, useState } from 'react';

const CouponUsageModal = ({ show, onClose, couponId }) => {
    const [usages, setUsages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchUsage = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`http://localhost:8000/promotions/coupon/${couponId}/usage`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch coupon usage');
            const data = await res.json();
            setUsages(data);
        } catch (err) {
            console.error(err);
            setError('Failed to load coupon usage data.');
        }
        setLoading(false);
    };

    useEffect(() => {
        if (show) {
            fetchUsage();
        } else {
            setUsages([]);
            setError('');
        }
    }, [show, couponId]);

    if (!show) return null;

    return (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Coupon Usage Report</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
            
                     
                        <p className="text-muted">Total Usages: {usages.length}</p>
                        {loading && (
                            <div className="text-center my-4">
                                <div className="spinner-border text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="alert alert-danger">{error}</div>
                        )}

                        {!loading && !error && usages.length === 0 && (
                            <div className="alert alert-info">No usage records found for this coupon.</div>
                        )}

                        {!loading && usages.length > 0 && (
                            <div className="table-responsive">
                                <table className="table table-sm table-bordered table-hover">
                                    <thead className="table-success">
                                        <tr>
                                            <th>User ID</th>
                                            <th>Order ID</th>
                                            <th>Used At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usages.map(u => (
                                            <tr key={u.id}>
                                                <td>{u.user_id}</td>
                                                <td>{u.order_id}</td>
                                                <td>{new Date(u.used_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponUsageModal;
