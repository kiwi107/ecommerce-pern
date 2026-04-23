// src/pages/AdminInventory.js
import React, { useEffect, useState } from 'react';

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [expandedProduct, setExpandedProduct] = useState(null);
    const [loadingAction, setLoadingAction] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [editedStocks, setEditedStocks] = useState({});  // Track edited stock per variant

    const colors = {
        light: '#d4f4dd',
        medium: '#7fc97f',
        dark: '#4c8c4a',
        hover: '#a5e0a1',
        danger: '#e74c3c'
    };

    const notify = (msg, color = colors.dark) => {
        setFeedback({ msg, color });
        setTimeout(() => setFeedback(''), 2500);
    };

    const fetchProducts = async () => {
        const res = await fetch('http://localhost:8000/admin/inventory');
        const data = await res.json();
        setProducts(data);
        setEditedStocks({});  // Reset edits after fetching
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const toggleExpand = (productId) => {
        setExpandedProduct(expandedProduct === productId ? null : productId);
    };

    const handleStockChange = (variantId, value) => {
        setEditedStocks(prev => ({
            ...prev,
            [variantId]: value
        }));
    };

    const updateStock = async (variantId, currentStock) => {
        const newStock = editedStocks[variantId];
        if (newStock === undefined || newStock === currentStock) {
            notify('No changes to update', colors.danger);
            return;
        }
        if (newStock < 0) {
            notify('Stock cannot be negative', colors.danger);
            return;
        }

        setLoadingAction(true);
        await fetch(`http://localhost:8000/admin/product-variant/${variantId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock_number: newStock })
        });
        notify('Stock updated ✏️');
        fetchProducts();
        setLoadingAction(false);
    };

    const btn = (bg) => ({
        border: 'none',
        borderRadius: '6px',
        padding: '6px 12px',
        color: 'white',
        backgroundColor: bg,
        fontSize: '14px'
    });

    const lowStockThreshold = 5;  // Alert threshold

    return (
        <div className="container mt-4">
            <h2 style={{ color: colors.dark }}>Inventory Management</h2>

            {feedback && (
                <div style={{ backgroundColor: feedback.color, color: 'white', padding: '8px 12px', borderRadius: '6px', marginBottom: '12px' }}>
                    {feedback.msg}
                </div>
            )}

            {products.map(product => (
                <div key={product.product_id} className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0">{product.name} — ${product.price}</h5>
                            <button style={btn(colors.medium)} onClick={() => toggleExpand(product.product_id)}>
                                {expandedProduct === product.product_id ? '➖ Hide Variants' : '➕ Show Variants'}
                            </button>
                        </div>
                        <p className="mt-2 mb-1"><strong>Category:</strong> {product.category} | <strong>Gender:</strong> {product.gender}</p>

                        {expandedProduct === product.product_id && (
                            <table className="table table-sm table-bordered mt-3">
                                <thead style={{ backgroundColor: colors.light }}>
                                    <tr>
                                        <th>Color</th>
                                        <th>Size</th>
                                        <th>Stock</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {product.variants.map(v => (
                                        <tr key={v.variant_id} style={v.stock_number <= lowStockThreshold ? { backgroundColor: '#fdecea' } : {}}>
                                            <td>{v.color}</td>
                                            <td>{v.size}</td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm"
                                                    style={{ width: '80px' }}
                                                    defaultValue={v.stock_number}
                                                    onChange={e => handleStockChange(v.variant_id, parseInt(e.target.value))}
                                                    disabled={loadingAction}
                                                />
                                                {v.stock_number <= lowStockThreshold && <span style={{ color: colors.danger, marginLeft: '6px' }}>⚠️ Low Stock</span>}
                                            </td>
                                            <td>
                                                <button
                                                    style={btn(colors.dark)}
                                                    disabled={loadingAction}
                                                    onClick={() => updateStock(v.variant_id, v.stock_number)}
                                                >Update</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminInventory;
