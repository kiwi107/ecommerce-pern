// src/pages/CreateProductForm.js
import React, { useState } from 'react';

export default function CreateProductForm({ onProductCreated }) {
    const [form, setForm] = useState({
        name: '',
        price: '',
        category: '',
        gender: '',
        description: '',
        available_colors: '',
        available_sizes: '',
        loyalty_points: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [variants, setVariants] = useState([
        { size: '', color: '', stock_number: '' }
    ]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setSelectedFiles([...e.target.files]);
    };

    const handleVariantChange = (index, e) => {
        const updatedVariants = [...variants];
        updatedVariants[index][e.target.name] = e.target.value;
        setVariants(updatedVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { size: '', color: '', stock_number: '' }]);
    };

    const removeVariant = (index) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        setVariants(updatedVariants);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(form).forEach(([k, v]) => formData.append(k, v));
        selectedFiles.forEach(file => formData.append('images', file));
        formData.append('variants', JSON.stringify(variants));

        await fetch('http://localhost:8000/admin/products', {
            method: 'POST',
            body: formData,
        });

        // Reset form
        setForm({
            name: '',
            price: '',
            category: '',
            gender: '',
            description: '',
            available_colors: '',
            available_sizes: '',
            loyalty_points: ''
        });
        setSelectedFiles([]);
        setVariants([{ size: '', color: '', stock_number: '' }]);
        onProductCreated();
    };

    return (
        <form onSubmit={handleSubmit} >
          

            <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control mb-2" placeholder="Name" required />
            <input type="number" name="price" value={form.price} onChange={handleChange} className="form-control mb-2" placeholder="Price" required />
            <input type="text" name="category" value={form.category} onChange={handleChange} className="form-control mb-2" placeholder="Category" />
            <select name="gender" value={form.gender} onChange={handleChange} className="form-select mb-2" required>
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>

            <textarea name="description" value={form.description} onChange={handleChange} className="form-control mb-2" placeholder="Description" rows="3" />
            <input type="text" name="available_colors" value={form.available_colors} onChange={handleChange} className="form-control mb-2" placeholder="Available Colors (comma-separated)" />
            <input type="text" name="available_sizes" value={form.available_sizes} onChange={handleChange} className="form-control mb-2" placeholder="Available Sizes (comma-separated)" />
            <input type="number" name="loyalty_points" value={form.loyalty_points} onChange={handleChange} className="form-control mb-2" placeholder="Loyalty Points" />

            <input type="file" multiple onChange={handleFileChange} className="form-control mb-2" />

            <h6>Variants</h6>
            {variants.map((variant, index) => (
                <div key={index} className="border rounded p-2 mb-2">
                    <input type="text" name="size" value={variant.size} onChange={(e) => handleVariantChange(index, e)} className="form-control mb-1" placeholder="Size" required />
                    <input type="text" name="color" value={variant.color} onChange={(e) => handleVariantChange(index, e)} className="form-control mb-1" placeholder="Color" required />
                    <input type="number" name="stock_number" value={variant.stock_number} onChange={(e) => handleVariantChange(index, e)} className="form-control mb-1" placeholder="Stock Number" required />
                    {variants.length > 1 && <button type="button" onClick={() => removeVariant(index)} className="btn btn-danger btn-sm">Remove Variant</button>}
                </div>
            ))}
            <button type="button" onClick={addVariant} className="btn btn-secondary btn-sm mb-3">Add Variant</button>

            <button className="btn btn-primary w-100">Create Product</button>
        </form>
    );
}
