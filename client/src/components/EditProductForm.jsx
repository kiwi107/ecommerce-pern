// src/pages/EditProductForm.js
import React, { useEffect, useState } from 'react';

export default function EditProductForm({ productId, onClose }) {
  const [base, setBase] = useState(null);
  const [details, setDetails] = useState(null);
  const [variants, setVariants] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [loadingDetails, setLoadingDetails] = useState(false);

  // Fetch only base info first



  
  useEffect(() => {
    const fetchBase = async () => {
      const res = await fetch(`http://localhost:8000/admin/products/${productId}/base`);
      const baseData = await res.json();
      setBase(baseData);
    };

    setDetails(null);
  
    fetchBase();
  }, [productId]);



  // Lazy load details + variants
  const loadDetailsAndVariants = async () => {
    setLoadingDetails(true);

    try{
    const res2 = await fetch(`http://localhost:8000/admin/products/${productId}/details`);
    const res3 = await fetch(`http://localhost:8000/admin/products/${productId}/variants`);
    
 

    const detailsData =  await res2.json();
    const variantsData = await res3.json();

    console.log('Details:', detailsData);
    console.log('Variants:', variantsData);
  
 
    // Ensure arrays are not null
    detailsData.available_colors = detailsData.available_colors || [];
    detailsData.available_sizes = detailsData.available_sizes || [];

    setDetails(detailsData);
    setVariants(variantsData);
    setLoadingDetails(false);
    }

    catch (error) {
      console.error('Error fetching product details or variants:', error);
      setLoadingDetails(false);
    }
  };

  const handleBaseChange = (e) => {
    setBase({ ...base, [e.target.name]: e.target.value });
  };

  const handleDetailsChange = (e) => {
    const { name, value } = e.target;
    if (name === 'available_colors' || name === 'available_sizes') {
      setDetails({ ...details, [name]: value.split(',').map(v => v.trim()) });
    } else {
      setDetails({ ...details, [name]: value });
    }
  };

  const handleVariantChange = (index, e) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [e.target.name]: e.target.value };
    setVariants(updated);
  };

  const handleFileChange = (e) => {
    setSelectedFiles([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.entries(base).forEach(([k, v]) => formData.append(k, v));

    if (details) {
      Object.entries(details).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          formData.append(k, v.join(','));
        } else {
          formData.append(k, v);
        }
      });
    }

    if (variants.length > 0) {
      formData.append('variants', JSON.stringify(variants));
    }

    selectedFiles.forEach(file => formData.append('images', file));

    await fetch(`http://localhost:8000/admin/products/${productId}`, {
      method: 'PUT',
      body: formData,
    });
    onClose();
  };

  if (!base) return <div>Loading base product info...</div>;

  return (
    <div className="border p-3 rounded mt-3">
      <h5>Edit Product ID {productId}</h5>

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={base.name} onChange={handleBaseChange} className="form-control mb-2" placeholder="Name" />
        <input type="number" name="price" value={base.price} onChange={handleBaseChange} className="form-control mb-2" placeholder="Price" />
        <input type="text" name="category" value={base.category} onChange={handleBaseChange} className="form-control mb-2" placeholder="Category" />
        <select name="gender" value={base.gender} onChange={handleBaseChange} className="form-select mb-2">
          <option value="">Select Gender</option><option value="male">Male</option><option value="female">Female</option>
        </select>

        {!details ? (
          <button type="button" className="btn btn-secondary mb-3" onClick={loadDetailsAndVariants} disabled={loadingDetails}>
            {loadingDetails ? 'Loading...' : 'Load Full Product Details'}
          </button>
        ) : (
          <>
            <textarea name="description" value={details.description} onChange={handleDetailsChange} className="form-control mb-2" placeholder="Description" />
            <input type="text" name="available_colors" value={details.available_colors.join(',')} onChange={handleDetailsChange} className="form-control mb-2" placeholder="Colors (comma)" />
            <input type="text" name="available_sizes" value={details.available_sizes.join(',')} onChange={handleDetailsChange} className="form-control mb-2" placeholder="Sizes (comma)" />
            <input type="number" name="loyalty_points" value={details.loyalty_points} onChange={handleDetailsChange} className="form-control mb-2" placeholder="Loyalty Points" />

            <h6>Variants</h6>
            {variants.map((v, i) => (
              <div className="row g-2 mb-2" key={i}>
                <div className="col"><input type="text" name="size" value={v.size} onChange={(e) => handleVariantChange(i, e)} className="form-control" placeholder="Size" /></div>
                <div className="col"><input type="text" name="color" value={v.color} onChange={(e) => handleVariantChange(i, e)} className="form-control" placeholder="Color" /></div>
                <div className="col"><input type="number" name="stock_number" value={v.stock_number} onChange={(e) => handleVariantChange(i, e)} className="form-control" placeholder="Stock" /></div>
              </div>
            ))}
          </>
        )}

        <input type="file" multiple onChange={handleFileChange} className="form-control mb-2" />
        <button className="btn btn-primary">Update Product</button>
        <button type="button" className="btn btn-secondary ms-2" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
