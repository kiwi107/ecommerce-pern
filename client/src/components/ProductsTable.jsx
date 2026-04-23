import React from 'react';

const ProductTable = ({ products, onEdit, onDelete, colors }) => {
    return (
        <div className="card shadow-sm border-0" style={{ borderRadius: '12px' }}>
            <div className="card-body">
                <h5 className="card-title mb-3">Products List</h5>
                <table className="table table-bordered">
                    <thead style={{ backgroundColor: colors.light }}>
                        <tr><th>Name</th><th>Price</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {products.map(prod => (
                            <tr key={prod.product_id}>
                                <td>{prod.name}</td>
                                <td>${prod.price}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-warning btn-sm" onClick={() => onEdit(prod.product_id)}><i class="bi bi-pencil fs-5 me-1"></i> Edit</button>
                                        <button className="btn btn-danger btn-sm" onClick={() => onDelete(prod.product_id)}><i class="bi bi-trash fs-5 me-1"></i> Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductTable;
