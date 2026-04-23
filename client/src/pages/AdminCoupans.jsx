import React, { useEffect, useState } from 'react';
import CouponUsageModal from '../components/CoupanUsageModal';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);  // State to toggle edit form
    const [selectedCoupon, setSelectedCoupon] = useState(null);  // Store the coupon to be edited
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_amount: 0,
        description: '',
        start_date: '',
        end_date: '',
        per_user_limit: 1,
        is_active: true
    });
    const [showUsageModal, setShowUsageModal] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
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

    const fetchCoupons = async () => {
        const res = await fetch('http://localhost:8000/promotions/coupons');
        const data = await res.json();
        setCoupons(data.coupons);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const createCoupon = async () => {
        const { code, discount_amount, description, start_date, end_date } = newCoupon;
        if (!code || !start_date || !end_date) {
            notify('Code and dates are required', '#e74c3c');
            return;
        }
        setLoadingAction(true);
        await fetch('http://localhost:8000/promotions/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCoupon)
        });
        setNewCoupon({ code: '', description: '', start_date: '', end_date: '', per_user_limit: 1, is_active: true, discount_amount: 0 });
        setShowCreateForm(false);
        notify('Coupon created ✅');
        fetchCoupons();
        setLoadingAction(false);
    };

    const updateCoupon = async () => {
        const { code, discount_amount, description, start_date, end_date, per_user_limit, is_active } = newCoupon;
        if (!code || !start_date || !end_date) {
            notify('Code and dates are required', '#e74c3c');
            return;
        }
        setLoadingAction(true);
        await fetch(`http://localhost:8000/promotions/coupons/${selectedCoupon.coupon_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, discount_amount, description, start_date, end_date, per_user_limit, is_active })
        });
        setShowEditForm(false);
        setSelectedCoupon(null);
        notify('Coupon updated ✅');
        fetchCoupons();
        setLoadingAction(false);
    };

    const deleteCoupon = async (id) => {
        if (!window.confirm('Delete this coupon?')) return;
        setLoadingAction(true);
        await fetch(`http://localhost:8000/promotions/coupons/${id}`, { method: 'DELETE' });
        notify('Coupon deleted 🗑️', '#e74c3c');
        fetchCoupons();
        setLoadingAction(false);
    };

    const btn = (bg) => ({ border: 'none', borderRadius: '6px', padding: '6px 12px', color: 'white', backgroundColor: bg, fontSize: '14px' });

    const handleEditClick = (coupon) => {
        setSelectedCoupon(coupon);
        setNewCoupon({
            code: coupon.code,
            discount_amount: coupon.discount_amount,
            description: coupon.description,
            start_date: coupon.start_date,
            end_date: coupon.end_date,
            per_user_limit: coupon.per_user_limit,
            is_active: coupon.is_active
        });
        setShowEditForm(true);
    };

    return (
        <div className="container mt-4">
            <h2 style={{ color: colors.dark }}>Coupon Management</h2>

            {feedback && (
                <div style={{ backgroundColor: feedback.color, color: 'white', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    {feedback.msg}
                </div>
            )}

            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Create New Coupon</h5>
                        <button style={btn(colors.medium)} onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? '➖ Hide Form' : '➕ Show Form'}
                        </button>
                    </div>
                </div>
            </div>

            {showCreateForm && (
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.light, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <label className="form-label fw-bold">Coupon Code</label>
                    <input type="text" className="form-control mb-2" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} disabled={loadingAction} />

                    <label className="form-label fw-bold">Discount Percentage</label>
                    <input type="number" className="form-control mb-2" value={newCoupon.discount_amount} onChange={e => setNewCoupon({ ...newCoupon, discount_amount: e.target.value })} disabled={loadingAction} />

                    <label className="form-label fw-bold">Description</label>
                    <input type="text" className="form-control mb-2" value={newCoupon.description} onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })} disabled={loadingAction} />

                    <div className="d-flex gap-2">
                        <div>
                            <label className="form-label fw-bold">Start Date</label>
                            <input type="date" className="form-control mb-2" value={newCoupon.start_date} onChange={e => setNewCoupon({ ...newCoupon, start_date: e.target.value })} disabled={loadingAction} />
                        </div>
                        <div>
                            <label className="form-label fw-bold">End Date</label>
                            <input type="date" className="form-control mb-2" value={newCoupon.end_date} onChange={e => setNewCoupon({ ...newCoupon, end_date: e.target.value })} disabled={loadingAction} />
                        </div>
                        <div>
                            <label className="form-label fw-bold">Per User Limit</label>
                            <input type="number" className="form-control mb-2" value={newCoupon.per_user_limit} onChange={e => setNewCoupon({ ...newCoupon, per_user_limit: e.target.value })} disabled={loadingAction} />
                        </div>
                    </div>

                    <button style={btn(colors.dark)} disabled={loadingAction} onClick={createCoupon}>✅ Create Coupon</button>
                </div>
            )}

            {showEditForm && (
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.light, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <label className="form-label fw-bold">Coupon Code</label>
                    <input type="text" className="form-control mb-2" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} disabled={loadingAction} />

                    <label className="form-label fw-bold">Discount Percentage</label>
                    <input type="number" className="form-control mb-2" value={newCoupon.discount_amount} onChange={e => setNewCoupon({ ...newCoupon, discount_amount: e.target.value })} disabled={loadingAction} />

                    <label className="form-label fw-bold">Description</label>
                    <input type="text" className="form-control mb-2" value={newCoupon.description} onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })} disabled={loadingAction} />

                    <div className="d-flex gap-2">
                        <div>
                            <label className="form-label fw-bold">Start Date</label>
                            <input type="date" className="form-control mb-2" value={newCoupon.start_date} onChange={e => setNewCoupon({ ...newCoupon, start_date: e.target.value })} disabled={loadingAction} />
                        </div>
                        <div>
                            <label className="form-label fw-bold">End Date</label>
                            <input type="date" className="form-control mb-2" value={newCoupon.end_date} onChange={e => setNewCoupon({ ...newCoupon, end_date: e.target.value })} disabled={loadingAction} />
                        </div>
                        <div>
                            <label className="form-label fw-bold">Per User Limit</label>
                            <input type="number" className="form-control mb-2" value={newCoupon.per_user_limit} onChange={e => setNewCoupon({ ...newCoupon, per_user_limit: e.target.value })} disabled={loadingAction} />
                        </div>
                    </div>

                    <button style={btn(colors.dark)} disabled={loadingAction} onClick={updateCoupon}>✅ Update Coupon</button>
                </div>
            )}

            <table className="table table-bordered">
                <thead style={{ backgroundColor: colors.light }}>
                    <tr>
                        <th>Code</th>
                        <th>Description</th>
                        <th>Validity</th>
                        <th>Limit</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {coupons.map(c => (
                        <tr key={c.coupon_id}>
                            <td>{c.code}</td>
                            <td>{c.description}</td>
                            <td>{new Date(c.start_date).toLocaleDateString()} to {new Date(c.end_date).toLocaleDateString()}</td>

                            <td>{c.per_user_limit}</td>
                            <td>{c.is_active ? 'Active' : 'Inactive'}</td>
                            <td>
                                <div className="d-flex gap-1">
                                    <button style={btn(colors.dark)} onClick={() => setShowUsageModal(c.coupon_id)}>📊 Usage Info</button>
                                    <button style={btn('#e74c3c')} onClick={() => deleteCoupon(c.coupon_id)}>🗑️ Delete</button>
                                    <button style={btn(colors.medium)} onClick={() => handleEditClick(c)}>✏️ Edit</button>
                                </div>
                                <CouponUsageModal show={showUsageModal === c.coupon_id} onClose={() => setShowUsageModal(null)} couponId={c.coupon_id} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminCoupons;
