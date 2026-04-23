import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const genderMap = {
    Men: 'male',
    Women: 'female'
};

function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { totalQuantity } = useCart();

    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const pathParts = location.pathname.split('/').filter(Boolean);
    const activeGender = pathParts[1];
    const activeCategory = pathParts[2];

    const isActiveGender = (genderValue) => activeGender === genderValue;
    const isActiveCategory = (genderValue, categoryValue) =>
        activeGender === genderValue && activeCategory === categoryValue;

    useEffect(() => {
        const fetchAndFilterProducts = async () => {
            if (searchTerm.trim() === '') {
                setFilteredProducts([]);
                return;
            }

            if (products.length === 0) {
                try {
                    const res = await fetch('http://localhost:8000/products');
                    const { products: fetchedProducts } = await res.json();
                    setProducts(fetchedProducts);
                    filterProducts(fetchedProducts);
                } catch (err) {
                    console.error('Failed to fetch products:', err);
                }
            } else {
                filterProducts(products);
            }
        };

        const filterProducts = (productList) => {
            const lowerTerm = searchTerm.toLowerCase();
            const filtered = productList.filter((p) =>
                p.name.toLowerCase().includes(lowerTerm)
            );
            setFilteredProducts(filtered.slice(0, 5));
        };

        fetchAndFilterProducts();
    }, [searchTerm, products]);

    const handleSelectProduct = (productId) => {
        setSearchTerm('');
        setFilteredProducts([]);
        navigate(`/product/${productId}`);
    };

    return (
        <>
            <style>{`
                .navbar .nav-item.dropdown:hover .dropdown-menu {
                    display: block;
                }
                .navbar .dropdown-menu {
                    margin-top: 0;
                }
                .navbar .nav-link.active {
                    font-weight: bold;
                    color: #0d6efd !important;
                }
                .navbar .dropdown-item.active {
                    background-color: #0d6efd;
                    color: white !important;
                }
                .search-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    background: white;
                    border: 1px solid #ddd;
                    z-index: 1000;
                    max-height: 200px;
                    overflow-y: auto;
                }
                .search-suggestion-item {
                    display: flex;
                    align-items: center;
                    padding: 5px 10px;
                    cursor: pointer;
                }
                .search-suggestion-item img {
                    width: 40px;
                    height: 40px;
                    object-fit: cover;
                    margin-right: 10px;
                }
                .search-suggestion-item:hover {
                    background-color: #f8f9fa;
                }
            `}</style>

            <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top shadow-sm">
                <div className="container-fluid">
                    <Link className="navbar-brand d-flex align-items-center" to="/">
                        <img
                            src="/logo.png"
                            alt="Logo"
                            style={{ width: '50px', height: '50px', marginRight: '10px' }}
                        />
                        KiwiFits
                    </Link>

                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarNavDropdown"
                        aria-controls="navbarNavDropdown"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Collapsible Nav Links ONLY */}
                    <div className="collapse navbar-collapse" id="navbarNavDropdown">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link className={`nav-link ${location.pathname.startsWith('/products') ? 'active' : ''}`} to="/products">Products</Link>
                            </li>

                            {Object.entries(genderMap).map(([label, genderValue]) => (
                                <li className="nav-item dropdown" key={label}>
                                    <Link
                                        className={`nav-link dropdown-toggle ${isActiveGender(genderValue) ? 'active' : ''}`}
                                        to={`/products/${genderValue}`}
                                        role="button"
                                    >
                                        {label}
                                    </Link>
                                    <ul className="dropdown-menu">
                                        {['tops', 'bottoms', 'outerwear', 'shoes'].map((cat) => (
                                            <li key={cat}>
                                                <Link
                                                    className={`dropdown-item ${isActiveCategory(genderValue, cat) ? 'active' : ''}`}
                                                    to={`/products/${genderValue}/${cat}`}
                                                >
                                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Search + Profile + Cart — Always visible, never collapses */}
                    <div className="d-flex align-items-center ms-auto gap-3">
                        <form className="position-relative" role="search" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="form-control"
                                type="search"
                                placeholder="Search products"
                                aria-label="Search"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '200px' }}
                            />
                            {filteredProducts.length > 0 && (
                                <div className="search-suggestions shadow-sm rounded">
                                    {filteredProducts.map((product) => (
                                        <div
                                            key={product.product_id}
                                            className="search-suggestion-item"
                                            onClick={() => handleSelectProduct(product.product_id)}
                                        >
                                            <img src={product.images[0]} alt={product.name} />
                                            <span>{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </form>

                        <Link to="/profile" className="nav-link">
                            <i className="bi bi-person fs-5"></i>
                        </Link>

                        <Link to="/cart" className="nav-link position-relative">
                            <i className="bi bi-bag fs-5"></i>
                            {totalQuantity > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                                    style={{ fontSize: '0.7rem', marginTop: '15px' }}
                                >
                                    {totalQuantity}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>
        </>
    );
}

export default Navbar;
