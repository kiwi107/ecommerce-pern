import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
    const hasDiscount = product.discount_amount != null;
    const discountedPrice = hasDiscount
        ? product.price * (1 - product.discount_amount / 100)
        : product.price;

    return (
        <div className="mx-2">
            <div className="card" style={{ width: "250px" }}>
                <Link to={`/product/${product.product_id}`} className="mt-auto text-decoration-none text-dark">
                    <img src={product.images[0]} className="card-img-top" alt={product.name} />
                    <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.name}</h5>

                        {hasDiscount ? (
                            <>
                                <p className="card-text mb-1">
                                    <span className="text-muted text-decoration-line-through me-2">
                                        ${product.price}
                                    </span>
                                    <span className="fw-bold text-danger">
                                        ${discountedPrice}
                                    </span>
                                </p>
                                <small className="text-success">{product.discount_amount}% OFF</small>
                            </>
                        ) : (
                            <p className="card-text">${product.price}</p>
                        )}

                    </div>
                </Link>
            </div>
        </div>
    );
};

export default ProductCard;
