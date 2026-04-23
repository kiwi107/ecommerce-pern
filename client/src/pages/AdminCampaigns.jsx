import React, { useEffect, useState } from 'react';
import CampaignReportModal from '../components/CampaignReportModal';

const AdminCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [campaignName, setCampaignName] = useState('');
    const [products, setProducts] = useState([]);
    const [showReportModal, setShowReportModal] = useState(null);

    const [campaignDiscounts, setCampaignDiscounts] = useState({});
    const [newDiscount, setNewDiscount] = useState({ product_id: '', discount_amount: '' });

    const [editingDiscount, setEditingDiscount] = useState(null);
    const [editForm, setEditForm] = useState({});

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);

    const [feedback, setFeedback] = useState('');

    const colors = {
        light: '#d4f4dd',
        medium: '#7fc97f',
        dark: '#4c8c4a',
        hover: '#a5e0a1',
    };

    const notify = (msg, color = colors.dark) => {
        setFeedback({ msg, color });
        setTimeout(() => setFeedback(''), 2500);
    };

    const fetchCampaigns = async () => {
        const res = await fetch('http://localhost:8000/admin/campaign');
        const data = await res.json();
        setCampaigns(data);
        data.forEach(c => fetchDiscounts(c.campaign_id));
    };

    const fetchProducts = async () => {
        const res = await fetch('http://localhost:8000/products');
        const data = await res.json();
        setProducts(data.products);
    };

    const fetchDiscounts = async (campaignId) => {
        const res = await fetch(`http://localhost:8000/admin/campaign/${campaignId}/discounts`);
        const data = await res.json();
        setCampaignDiscounts(prev => ({ ...prev, [campaignId]: data }));
    };

    useEffect(() => {
        fetchCampaigns();
        fetchProducts();
    }, []);

    const createCampaign = async () => {
        if (!campaignName.trim()) return notify('Campaign name required', '#e74c3c');
        setLoadingAction(true);
        await fetch('http://localhost:8000/admin/campaign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: campaignName })
        });
        setCampaignName('');
        setShowCreateForm(false);
        notify('Campaign created ✅');
        fetchCampaigns();
        setLoadingAction(false);
    };

    const deleteCampaign = async (id) => {
        if (!window.confirm('Delete this campaign?')) return;
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/campaign/${id}`, { method: 'DELETE' });
        notify('Campaign deleted 🗑️', '#e74c3c');
        fetchCampaigns();
        setLoadingAction(false);
    };

    const createDiscount = async (campaignId) => {
        if (!newDiscount.product_id || !newDiscount.discount_amount) {
            notify('Select product and enter discount', '#e74c3c');
            return;
        }
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/campaign/${campaignId}/discounts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newDiscount)
        });
        setNewDiscount({ product_id: '', discount_amount: '' });
        fetchDiscounts(campaignId);
        notify('Discount added ✅');
        setLoadingAction(false);
    };

    const deleteDiscount = async (campaignId, discountId) => {
        if (!window.confirm('Delete this discount?')) return;
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/campaign/discounts/${discountId}`, { method: 'DELETE' });
        fetchDiscounts(campaignId);
        notify('Discount deleted 🗑️', '#e74c3c');
        setLoadingAction(false);
    };

    const startEdit = (discount) => {
        setEditingDiscount(discount);
        setEditForm({ product_id: discount.product_id, discount_amount: discount.discount_amount });
    };

    const cancelEdit = () => {
        setEditingDiscount(null);
        setEditForm({});
    };

    const saveEdit = async (campaignId, discountId) => {
        if (!editForm.product_id || !editForm.discount_amount) return notify('Fill both fields', '#e74c3c');
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/campaign/discounts/${discountId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editForm)
        });
        cancelEdit();
        fetchDiscounts(campaignId);
        notify('Discount updated ✏️');
        setLoadingAction(false);
    };

    const btn = (bg) => ({ border: 'none', borderRadius: '6px', padding: '6px 12px', color: 'white', backgroundColor: bg, fontSize: '14px' });

    return (
        <div className="container mt-4">
            <h2 style={{ color: colors.dark }}>Promotional Campaigns</h2>

            {feedback && (
                <div style={{ backgroundColor: feedback.color, color: 'white', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    {feedback.msg}
                </div>
            )}


            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Create New Campaign</h5>
                        <button style={btn(colors.medium)} onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? '➖ Hide Form' : '➕ Show Form'}
                        </button>
                    </div>

                 
                </div>
            </div>


            {showCreateForm && (
                <div className="mb-4 p-3 rounded" style={{ backgroundColor: colors.light, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                    <label className="form-label fw-bold">New Campaign Name</label>
                    <input
                        type="text"
                        className="form-control mb-2"
                        value={campaignName}
                        onChange={e => setCampaignName(e.target.value)}
                        disabled={loadingAction}
                    />
                    <button style={btn(colors.dark)} disabled={loadingAction} onClick={createCampaign}>✅ Create Campaign</button>
                </div>
            )}

            {campaigns.map(c => (
                <div key={c.campaign_id} className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                    <div className="card-body">
                        <h5 className="card-title">{c.name}</h5>

                        <div className="d-flex gap-2 mb-3">
                            <button style={btn(colors.dark)} onClick={() => setShowReportModal(c.campaign_id)}>📈 View Report</button>
                            <button style={btn('#e74c3c')} disabled={loadingAction} onClick={() => deleteCampaign(c.campaign_id)}>🗑️ Delete Campaign</button>
                        </div>

                        <CampaignReportModal show={showReportModal === c.campaign_id} onClose={() => setShowReportModal(null)} campaignId={c.campaign_id} />

                        <h6 style={{ color: colors.dark }}>Discounts</h6>
                        <table className="table table-sm table-bordered mt-2">
                            <thead style={{ backgroundColor: colors.light }}>
                                <tr>
                                    <th>Product</th>
                                    <th>Discount (%)</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(campaignDiscounts[c.campaign_id] || []).map(d => (
                                    <tr key={d.discount_id}>
                                        {editingDiscount?.discount_id === d.discount_id ? (
                                            <>
                                                <td>
                                                    <select className="form-select form-select-sm" value={editForm.product_id} onChange={e => setEditForm({ ...editForm, product_id: e.target.value })}>
                                                        <option value="">Select Product</option>
                                                        {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                                                    </select>
                                                </td>
                                                <td>
                                                    <input type="number" className="form-control form-control-sm" value={editForm.discount_amount} onChange={e => setEditForm({ ...editForm, discount_amount: e.target.value })} />
                                                </td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button style={btn(colors.medium)} onClick={() => saveEdit(c.campaign_id, d.discount_id)}>💾 Save</button>
                                                        <button style={btn('#95a5a6')} onClick={cancelEdit}>❌ Cancel</button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>{d.product_name}</td>
                                                <td>{d.discount_amount}%</td>
                                                <td>
                                                    <div className="d-flex gap-1">
                                                        <button style={btn('#f39c12')} onClick={() => startEdit(d)}>✏️ Edit</button>
                                                        <button style={btn('#e74c3c')} onClick={() => deleteDiscount(c.campaign_id, d.discount_id)}>🗑️ Delete</button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="d-flex align-items-end gap-2 mt-3">
                            <select className="form-select form-select-sm" style={{ width: '200px' }} value={newDiscount.product_id} onChange={e => setNewDiscount({ ...newDiscount, product_id: e.target.value })}>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.product_id} value={p.product_id}>{p.name}</option>)}
                            </select>
                            <input type="number" className="form-control form-control-sm" placeholder="Discount %" value={newDiscount.discount_amount} onChange={e => setNewDiscount({ ...newDiscount, discount_amount: e.target.value })} style={{ width: '120px' }} />
                            <button style={btn(colors.medium)} disabled={loadingAction} onClick={() => createDiscount(c.campaign_id)}>➕ Add Discount</button>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminCampaigns;