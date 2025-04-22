import React from "react";

const ProductCard = ({ product }) => {
    return (
        <div className="mx-2">

            <div className="card" style={{ width: "250px" }}>
                <a href={`/product/${product.id}`} className="mt-auto text-decoration-none text-dark">
                    <img src={product.images[0]} className="card-img-top" alt={product.name} />
                    <div className="card-body d-flex flex-column">
                        <h5 className="card-title">{product.name}</h5>
                        <p className="card-text text-muted">${product.price}</p>
                    </div>
                </a>
            </div>
        </div>

    );
};


export default ProductCard;


