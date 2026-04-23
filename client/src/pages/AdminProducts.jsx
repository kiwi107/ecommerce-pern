// src/pages/AdminProducts.js
import React, { useEffect, useState } from 'react';
import CreateProductForm from '../components/CreateProductForm';
import EditProductForm from '../components/EditProductForm';
import TopProductsReport from '../components/TopProductsModal';
import ProductTable from '../components/ProductsTable';

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [editingProductId, setEditingProductId] = useState(null);
    const [showReportModal, setShowReportModal] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    const colors = {  light: '#d4f4dd',
        medium: '#7fc97f',
        dark: '#4c8c4a'};

    const btn = (bg) => ({
        backgroundColor: bg, color: 'white', padding: '4px 12px',
        border: 'none', borderRadius: '6px', cursor: 'pointer'
    });

    const fetchProducts = async () => {
        const res = await fetch('http://localhost:8000/admin/products');
        const data = await res.json();
        setProducts(data.products);
    };

    const handleDelete = async (id) => {
        await fetch(`${process.env.REACT_APP_API_URL}/admin/products/${id}`, 
            { method: 'DELETE', 
            credentials: 'include'
            });
        fetchProducts();
    };

    useEffect(() => { fetchProducts(); }, []);
    

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-success">Product Management</h2>

            <TopProductsReport showReportModal={showReportModal} setShowReportModal={setShowReportModal} btn={btn} colors={colors} />

            <div className="card mb-4 shadow-sm border-0" style={{ borderRadius: '12px' }}>
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="card-title mb-0">Create New Product</h5>
                        <button style={btn(colors.medium)} onClick={() => setShowCreateForm(!showCreateForm)}>
                            {showCreateForm ? '➖ Hide Form' : '➕ Show Form'}
                        </button>
                    </div>

                    {showCreateForm && (
                        <div className="mt-3">
                            <CreateProductForm onProductCreated={() => { fetchProducts(); setShowCreateForm(false); }} />
                        </div>
                    )}
                </div>
            </div>

            <ProductTable products={products} onEdit={setEditingProductId} onDelete={handleDelete} colors={colors} />

            {editingProductId && (
                <EditProductForm
                    productId={editingProductId}
                    onClose={() => { setEditingProductId(null); fetchProducts(); }}
                />
            )}
        </div>
    );
}
