import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { useParams, useNavigate } from 'react-router-dom';

const genderLabelMap = {
  male: 'Men',
  female: 'Women',
};

const categories = ['tops', 'bottoms', 'outerwear', 'shoes'];

const ProductsPage = () => {
  const {
    gender: genderParam,
    category: categoryParam,
    onlyCategory,
  } = useParams();

  const gender = genderParam || null;
  const category = onlyCategory || categoryParam || null;

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [sortOption, setSortOption] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('http://localhost:8000/products');
      const { products } = await res.json();
      setProducts(products);
    })();
  }, []);

  useEffect(() => {
    let out = products;

    if (gender) {
      out = out.filter(p => p.gender.toLowerCase() === gender);
    }

    if (category) {
      out = out.filter(p => p.category.toLowerCase() === category);
    }

    if (sortOption === 'priceLowToHigh') {
      out = [...out].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'priceHighToLow') {
      out = [...out].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'nameAZ') {
      out = [...out].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'nameZA') {
      out = [...out].sort((a, b) => b.name.localeCompare(a.name));
    }

    setFilteredProducts(out);
  }, [products, gender, category, sortOption]);

  const handleGenderChange = selectedGender => {
    if (selectedGender) {
      navigate(`/products/${selectedGender}`);
    } else {
      navigate('/products');
    }
  };

  const handleCategoryChange = selectedCategory => {
    if (gender) {
      const base = `/products/${gender}`;
      navigate(selectedCategory ? `${base}/${selectedCategory}` : base);
    } else {
      navigate(
        selectedCategory
          ? `/products/category/${selectedCategory}`
          : `/products`
      );
    }
  };

  const clearAllFilters = () => {
    navigate('/products');
    setSortOption('');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-outline-secondary"
          onClick={() => setShowFilters(f => !f)}
        >
          {showFilters ? 'Hide Filters' : 'Filter'}
        </button>

        <select
          value={sortOption}
          onChange={e => setSortOption(e.target.value)}
          className="form-select w-auto"
        >
          <option value="">Sort By...</option>
          <option value="priceLowToHigh">Price: Low to High</option>
          <option value="priceHighToLow">Price: High to Low</option>
          <option value="nameAZ">Name: A to Z</option>
          <option value="nameZA">Name: Z to A</option>
        </select>
      </div>

      {showFilters && (
        <div className="card mb-3">
          <div className="card-body">
            <h5>Filter Options</h5>

            {/* Gender */}
            <div className="mb-3">
              <strong>Gender</strong>
              <div>
                <label className="form-check form-check-inline">
                  <input
                    type="radio"
                    name="gender"
                    className="form-check-input"
                    checked={!gender}
                    onChange={() => handleGenderChange(null)}
                  />
                  <span className="form-check-label">All</span>
                </label>
                {Object.entries(genderLabelMap).map(([key, label]) => (
                  <label className="form-check form-check-inline" key={key}>
                    <input
                      type="radio"
                      name="gender"
                      className="form-check-input"
                      checked={gender === key}
                      onChange={() => handleGenderChange(key)}
                    />
                    <span className="form-check-label">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="mb-3">
              <strong>Category</strong>
              <div>
                <label className="form-check form-check-inline">
                  <input
                    type="radio"
                    name="category"
                    className="form-check-input"
                    checked={!category}
                    onChange={() => handleCategoryChange(null)}
                  />
                  <span className="form-check-label">All</span>
                </label>
                {categories.map(cat => (
                  <label className="form-check form-check-inline" key={cat}>
                    <input
                      type="radio"
                      name="category"
                      className="form-check-input"
                      checked={category === cat}
                      onChange={() => handleCategoryChange(cat)}
                    />
                    <span className="form-check-label">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={clearAllFilters}
              className="btn btn-sm btn-outline-danger"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="row justify-content-center">
        {filteredProducts.length > 0 ? (
          filteredProducts.map(p => (
            <div
              key={p.product_id}
              className="col-10 col-sm-6 col-md-4 col-lg-3 mb-4 d-flex align-items-stretch"
            >
              <ProductCard product={p} />
            </div>
          ))
        ) : (
          <p>No products found for the selected filters.</p>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
