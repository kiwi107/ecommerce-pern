import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function TagProducts({ tag_id }) {
    const [products, setProducts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(4); // Default to 4 for lg/xlg

    const getProductsForTag = async (tag_id) => {
        try {
            const response = await fetch(`http://localhost:8000/products/products-for-tag/${tag_id}`);
            const data = await response.json();
            setProducts(data.products || []);
            setCurrentIndex(0);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        getProductsForTag(tag_id);
    }, [tag_id]);

    const handleResize = () => {
        const width = window.innerWidth;
        if (width >= 1200) setItemsPerPage(4); // XLarge screens
        else if (width >= 992) setItemsPerPage(3); // Large screens
        else if (width >= 768) setItemsPerPage(2); // Medium screens
        else setItemsPerPage(1); // Small screens
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handlePrev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));
    const handleNext = () => setCurrentIndex((prev) => Math.min(prev + 1, products.length - itemsPerPage));

    return (
        <div className="row my-2 d-flex justify-content-between" >
            <div className="col-2 col-md-1 d-flex align-items-center justify-content-center" style={{padding:0}}>
                <button
                    onClick={handlePrev}
                    className="btn btn-outline-secondary"
                    style={{ zIndex: 10 }}
                    disabled={currentIndex === 0}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
            </div>

            <div className="col-8 col-md-10 overflow-hidden" style={{ padding: 0 }}>
                <div
                    className="d-flex"
                    style={{
                        transform: `translateX(-${266 * currentIndex}px)`,
                        width: `${266 * products.length}px`,
                        transition: "transform 0.5s ease",
                    }}
                >
                   
                    {products.map((product) => (
                        <div key={product.id}>
                            <ProductCard product={product}  />
                        </div>
                    ))}
                </div>
            </div>

            <div className="col-2 col-md-1 d-flex align-items-center justify-content-center" >
                <button
                    onClick={handleNext}
                    className="btn btn-outline-secondary"
                    style={{ zIndex: 10 }}
                    disabled={currentIndex >= products.length - itemsPerPage}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>
        </div>
    );
}

export default TagProducts;