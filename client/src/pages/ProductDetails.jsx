import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [selectedSize, setSelectedSize] = useState('');
    const [stock, setStock] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const [toastMsg, setToastMsg] = useState('');

    const [reviews, setReviews] = useState([]);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:8000/products/product/${id}`);
                const data = await res.json();
                setProduct(data.product);
                if (data.product.images?.length) {
                    setMainImage(data.product.images[0]);
                }
                setReviews(data.product.reviews || []);
            } catch (err) {
                console.error('Error fetching product:', err);
            }
        };

        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product && selectedColor && selectedSize) {
            const variant = product.variants.find(
                v => v.color === selectedColor && v.size === selectedSize
            );
            setStock(variant?.stock_number ?? null);
            setQuantity(1);
        } else {
            setStock(null);
            setQuantity(1);
        }
    }, [selectedColor, selectedSize, product]);

    useEffect(() => {
        if (toastMsg) {
            const timeout = setTimeout(() => setToastMsg(''), 3000);
            return () => clearTimeout(timeout);
        }
    }, [toastMsg]);

    if (!product) return <div className="container py-5">Loading...</div>;

    const availableColors = [...new Set(product.variants.map(v => v.color))];
    const availableSizes = [...new Set(product.variants.map(v => v.size))];

    const isColorAvailable = (color) =>
        product.variants.some(
            v => v.color === color &&
                (!selectedSize || v.size === selectedSize) &&
                v.stock_number > 0
        );

    const isSizeAvailable = (size) =>
        product.variants.some(
            v => v.size === size &&
                (!selectedColor || v.color === selectedColor) &&
                v.stock_number > 0
        );

    const handleAddToCart = () => {
        const variant = product.variants.find(
            v => v.color === selectedColor && v.size === selectedSize
        );

        if (!variant || quantity > variant.stock_number) {
            alert('Invalid variant or quantity exceeds stock');
            return;
        }

        const cartItem = {
            product_id: product.product_id,
            name: product.name,
            price: product.price,
            image: mainImage,
            color: selectedColor,
            size: selectedSize,
            variant_id: variant.variant_id,
            discount_amount: product.discount_amount,
            quantity,
        };

        addToCart(cartItem);
        setToastMsg(`${product.name} (${selectedColor}/${selectedSize}) added to cart`);
    };

    const handleAddReview = () => {
        if (newRating < 1 || newRating > 5 || !newComment.trim()) {
            alert('Please provide a valid rating and comment');
            return;
        }

        const review = {
            rating: newRating,
            comment: newComment.trim(),
            createdAt: new Date().toISOString(),
        };

        setReviews([review, ...reviews]);
        setNewRating(0);
        setNewComment('');
    };

    const renderStars = (count) => (
        <>
            {[...Array(count)].map((_, idx) => (
                <i key={idx} className="bi bi-star-fill text-warning"></i>
            ))}
            {[...Array(5 - count)].map((_, idx) => (
                <i key={idx + count} className="bi bi-star text-warning"></i>
            ))}
        </>
    );

    // Check discount
    const hasDiscount = product.discount_amount != null;
    const discountedPrice = hasDiscount
        ? product.price * (1 - product.discount_amount / 100)
        : product.price;

    return (
        <div className="container">
            <div className="row mt-1">
                {/* LEFT: IMAGES */}
                <div className="col-md-6">
                    <img
                        src={mainImage}
                        alt="Product"
                        className="img-fluid border rounded mb-3"
                        style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
                    />
                    <div className="d-flex gap-2">
                        {product.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={img}
                                alt={`thumb-${idx}`}
                                className="img-thumbnail"
                                style={{ width: '80px', height: '80px', objectFit: 'cover', cursor: 'pointer' }}
                                onClick={() => setMainImage(img)}
                            />
                        ))}
                    </div>
                </div>

                {/* RIGHT: PRODUCT INFO */}
                <div className="col-md-6">
                    <h2>{product.name}</h2>
                    <h5 className="text-muted">{product.category} • {product.gender}</h5>
                    <p>{product.description}</p>

                    {/* PRICE DISPLAY */}
                    <div className="mb-2">
                        {hasDiscount ? (
                            <>
                                <h5 className="text-success mb-0">
                                    Price:
                                    <span className="text-decoration-line-through text-muted ms-2">${product.price}</span>
                                    <span className="ms-2 text-danger">${discountedPrice}</span>
                                </h5>
                                <small className="text-success">{product.discount_amount}% OFF</small>
                            </>
                        ) : (
                            <h5 className="text-success">Price: ${product.price}</h5>
                        )}
                    </div>

                    <p>Loyalty Points: {product.loyalty_points}</p>
                    <hr />

                    {/* COLOR SELECTION */}
                    <div className="mb-3">
                        <strong>Choose Color:</strong>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {availableColors.map((color, idx) => (
                                <button
                                    key={idx}
                                    className={`btn ${selectedColor === color ? 'btn-primary' : 'btn-outline-primary'}`}
                                    disabled={!isColorAvailable(color)}
                                    onClick={() => {
                                        setSelectedColor(color);
                                        if (selectedSize && !isSizeAvailable(selectedSize)) {
                                            setSelectedSize(''); // Reset size if no available size for selected color
                                        }
                                    }}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* SIZE SELECTION */}
                    <div className="mb-3">
                        <strong>Choose Size:</strong>
                        <div className="d-flex flex-wrap gap-2 mt-2">
                            {availableSizes.map((size, idx) => (
                                <button
                                    key={idx}
                                    className={`btn ${selectedSize === size ? 'btn-success' : 'btn-outline-success'}`}
                                    disabled={!isSizeAvailable(size)}
                                    onClick={() => {
                                        setSelectedSize(size);
                                        if (selectedColor && !isColorAvailable(selectedColor)) {
                                            setSelectedColor(''); // Reset color if no available color for selected size
                                        }
                                    }}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* STOCK & QUANTITY */}
                    {selectedColor && selectedSize && (
                        <div className="mt-3">
                            {stock !== null ? (
                                <>
                                    <h6 className="text-info">Stock Available: {stock}</h6>
                                    <div className="d-flex align-items-center gap-2 mt-2">
                                        <label className="form-label m-0"><strong>Quantity:</strong></label>
                                        <input
                                            type="number"
                                            min="1"
                                            max={stock}
                                            value={quantity}
                                            onChange={(e) => setQuantity(Number(e.target.value))}
                                            className="form-control"
                                            style={{ width: '100px' }}
                                        />
                                    </div>
                                </>
                            ) : (
                                <h6 className="text-danger">Not Available</h6>
                            )}
                        </div>
                    )}

                    {/* ADD TO CART */}
                    <button
                        className="btn btn-warning mt-3"
                        disabled={!selectedColor || !selectedSize || stock <= 0 || quantity < 1 || quantity > stock}
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* REVIEW SECTION */}
            <div className="col-12 mt-5">
                <h4>Add a Review</h4>
                <div className="mb-3">
                    <div className="d-flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={`bi ${(hoverRating || newRating) >= star ? 'bi-star-fill text-warning' : 'bi-star text-secondary'}`}
                                style={{ fontSize: '2rem', cursor: 'pointer' }}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setNewRating(star)}
                            ></i>
                        ))}
                    </div>
                </div>

                <div className="mb-3 mt-3">
                    <textarea
                        className="form-control"
                        rows="4"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write your thoughts here..."
                    ></textarea>
                </div>

                <button className="btn btn-primary" onClick={handleAddReview}>
                    Submit Review
                </button>
            </div>

            {/* REVIEWS LIST */}
            <div className="col-12 mt-5">
                <h4>Reviews</h4>
                {reviews.length > 0 ? (
                    reviews.map((review, idx) => (
                        <div key={idx} className="border p-3 mb-3 rounded">
                            <div className="d-flex mb-2">
                                {renderStars(review.rating)}
                                <span className='ms-2'>by {review.username}</span>
                                <span className="ms-auto text-muted">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p>{review.comment}</p>
                        </div>
                    ))
                ) : (
                    <p>No reviews yet.</p>
                )}
            </div>

            {/* TOAST NOTIFICATION */}
            {toastMsg && (
                <div className="toast-container position-fixed bottom-0 end-0 p-3">
                    <div className="toast show align-items-center text-bg-success border-0">
                        <div className="d-flex">
                            <div className="toast-body">{toastMsg}</div>
                            <button
                                type="button"
                                className="btn-close btn-close-white me-2 m-auto"
                                onClick={() => setToastMsg('')}
                            ></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProductDetails;
