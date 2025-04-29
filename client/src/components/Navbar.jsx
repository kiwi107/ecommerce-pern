import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Navbar() {
    const { totalQuantity } = useCart();

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary sticky-top">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img
                        src="../logo.png"
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

                <div className="collapse navbar-collapse" id="navbarNavDropdown">
                    {/* Left Nav Links */}
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">Home</Link>
                        </li>

                        {['Men', 'Women', 'Kids'].map((category) => (
                            <li className="nav-item dropdown" key={category}>
                                <Link
                                    className="nav-link dropdown-toggle"
                                    to="/"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    {category}
                                </Link>
                                <ul className="dropdown-menu">
                                    <li><Link className="dropdown-item" to="/">Tops</Link></li>
                                    <li><Link className="dropdown-item" to="/">Bottoms</Link></li>
                                    <li><Link className="dropdown-item" to="/">Outerwear</Link></li>
                                    <li><Link className="dropdown-item" to="/">Shoes</Link></li>
                                </ul>
                            </li>
                        ))}
                    </ul>

                    {/* Right Icons */}
                    <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
                        <li className="nav-item">
                        <Link to="/profile" className="nav-link">
                            <i className="bi bi-person"></i>
                        </Link>
                        </li>
                        <li className="nav-item">
                            <i className="bi bi-suit-heart nav-link fs-5"></i>
                        </li>
                        <Link className="nav-link" to="/cart">
                        <li className="nav-item position-relative">
                            <i className="bi bi-bag nav-link fs-5"></i>
                            {totalQuantity > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success"
                                    style={{ fontSize: '0.7rem',  marginTop: '15px' }}
                                >
                                    {totalQuantity}
                                </span>
                            )}
                        </li>
                        </Link>
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
