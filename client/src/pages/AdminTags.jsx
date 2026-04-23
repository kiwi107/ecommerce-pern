// AdminTags.jsx
import React, { useEffect, useState } from 'react';

const AdminTags = () => {
    const [tags, setTags] = useState([]);
    const [products, setProducts] = useState([]);
    const [tagProducts, setTagProducts] = useState({});
    const [expandedTag, setExpandedTag] = useState(null);

    const [newTagName, setNewTagName] = useState('');
    const [selectedProduct, setSelectedProduct] = useState({});
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

    const btn = (bg) => ({
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        color: 'white',
        backgroundColor: bg,
        fontSize: '14px'
    });

    const fetchTags = async () => {
        const res = await fetch('http://localhost:8000/admin/tags');
        const data = await res.json();
        setTags(data);
        data.forEach(tag => fetchTagProducts(tag.tag_id));
    };

    const fetchProducts = async () => {
        const res = await fetch('http://localhost:8000/products');
        const data = await res.json();
        setProducts(data.products);
    };

    const fetchTagProducts = async (tagId) => {
        const res = await fetch(`http://localhost:8000/admin/tag/${tagId}/products`);
        const data = await res.json();
        setTagProducts(prev => ({ ...prev, [tagId]: data }));
    };

    useEffect(() => {
        fetchTags();
        fetchProducts();
    }, []);

    const createTag = async () => {
        if (!newTagName.trim()) return notify('Tag name required', '#e74c3c');
        setLoadingAction(true);
        await fetch('http://localhost:8000/admin/tag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newTagName })
        });
        setNewTagName('');
        notify('Tag created ✅');
        fetchTags();
        setLoadingAction(false);
    };

    const deleteTag = async (tagId) => {
        if (!window.confirm('Delete this tag?')) return;
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/tag/${tagId}`, { method: 'DELETE' });
        notify('Tag deleted 🗑️', '#e74c3c');
        fetchTags();
        setLoadingAction(false);
    };

    const insertProductToTag = async (tagId) => {
        const { product_id } = selectedProduct[tagId] || {};
        if (!product_id) {
            notify('Select a product', '#e74c3c');
            return;
        }
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/tag/${tagId}/product`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id })
        });
        setSelectedProduct(prev => ({ ...prev, [tagId]: {} }));
        fetchTagProducts(tagId);
        notify('Product inserted ✅');
        setLoadingAction(false);
    };

    const removeProductFromTag = async (tagId, productId) => {
        if (!window.confirm('Remove this product from tag?')) return;
        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/tag/${tagId}/product/${productId}`, { method: 'DELETE' });
        fetchTagProducts(tagId);
        notify('Product removed 🗑️', '#e74c3c');
        setLoadingAction(false);
    };

    return (
        <div className="container mt-4">
            <h2 style={{ color: colors.dark }}>Product Tags</h2>

            {feedback && (
                <div style={{ backgroundColor: feedback.color, color: 'white', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    {feedback.msg}
                </div>
            )}

            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                    <h5 className="card-title mb-2">Create New Tag</h5>
                    <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Tag name"
                        value={newTagName}
                        onChange={e => setNewTagName(e.target.value)}
                        disabled={loadingAction}
                    />
                    <button style={btn(colors.dark)} disabled={loadingAction} onClick={createTag}>➕ Create Tag</button>
                </div>
            </div>

            {tags.map(tag => (
                <div key={tag.tag_id} className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="card-title">{tag.tag_name}</h5>
                            <div className="d-flex gap-2">
                                <button style={btn(colors.medium)} onClick={() => setExpandedTag(expandedTag === tag.tag_id ? null : tag.tag_id)}>
                                    {expandedTag === tag.tag_id ? '➖ Collapse' : '➕ Expand'}
                                </button>
                                <button style={btn('#e74c3c')} disabled={loadingAction} onClick={() => deleteTag(tag.tag_id)}>🗑️ Delete Tag</button>
                            </div>
                        </div>

                        {expandedTag === tag.tag_id && (
                            <>
                                <h6 className="mt-3" style={{ color: colors.dark }}>Products in this Tag</h6>
                                <table className="table table-sm table-bordered mt-2">
                                    <thead style={{ backgroundColor: colors.light }}>
                                        <tr>
                                            <th>Image</th>
                                            <th>Product Name</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(tagProducts[tag.tag_id] || []).map(p => (
                                            <tr key={p.product_id}>
                                                <td><img src={p.images[0]} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} /></td>
                                                <td>{p.name}</td>
                                                <td>
                                                    <button style={btn('#e74c3c')} disabled={loadingAction} onClick={() => removeProductFromTag(tag.tag_id, p.product_id)}>🗑️ Remove</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="d-flex align-items-center gap-2 mt-3">
                                    <select className="form-select form-select-sm" style={{ width: '250px' }}
                                        value={selectedProduct[tag.tag_id]?.product_id || ''}
                                        onChange={e => setSelectedProduct(prev => ({ ...prev, [tag.tag_id]: { product_id: e.target.value } }))}>
                                        <option value="">Select Product</option>
                                        {products.map(p => (
                                            <option key={p.product_id} value={p.product_id}>{p.name}</option>
                                        ))}
                                    </select>
                                    <button style={btn(colors.medium)} disabled={loadingAction} onClick={() => insertProductToTag(tag.tag_id)}>➕ Insert Product</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminTags;
