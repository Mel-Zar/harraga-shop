
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/productService";
import ProductGallery from "../../components/ProductGallery/ProductGallery";
import { useCart } from "../../context/useCart";
import "./Product.scss";

function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [expandedImage, setExpandedImage] = useState(null);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);

            try {
                const product = await getProductById(id);
                setProduct(product);
                setQuantity(1);
                setExpandedImage(null);
            } catch (error) {
                console.error("Failed to load product:", error);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Close enlarged image with Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setExpandedImage(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (loading) {
        return (
            <div className="product-loading">
                <div className="product-loading__spinner"></div>
                <p>LOADING PRODUCT</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <h2>PRODUCT NOT FOUND</h2>
                <button onClick={() => navigate(-1)}>
                    GO BACK
                </button>
            </div>
        );
    }

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const addProductToCart = () => {
        if (product.stock === 0) {
            return;
        }

        addToCart(product, quantity);
        setQuantity(1);
    };

    const buyNow = () => {
        if (product.stock === 0) {
            return;
        }

        addToCart(product, quantity);
        navigate("/cart");
    };

    return (
        <main className="product-page">

            {/* BREADCRUMB */}

            <div className="product-breadcrumb">
                <button onClick={() => navigate("/")}>
                    HOME
                </button>

                <span>/</span>

                <span>SHOP</span>

                <span>/</span>

                <span className="product-breadcrumb__current">
                    {product.name}
                </span>
            </div>

            {/* PRODUCT CONTENT */}

            <section className="product-layout">

                {/* LEFT: PRODUCT GALLERY */}

                <div className="product-visual">

                    <div className="product-visual__badge">
                        HARRAGA EXCLUSIVE
                    </div>

                    <div className="product-gallery-wrapper">
                        <ProductGallery
                            images={product.images}
                            productName={product.name}
                            onImageClick={(imageUrl) => {
                                setExpandedImage(imageUrl);
                            }}
                            imageStyle={{
                                width: "100%",
                                maxWidth: "100%",
                                aspectRatio: "1 / 1",
                                objectFit: "contain",
                                borderRadius: "4px",
                            }}
                        />
                    </div>

                    <div className="product-visual__caption">
                        <span>HARRAGA SHOP</span>
                        <span>PREMIUM COLLECTION</span>
                    </div>

                </div>

                {/* RIGHT: PRODUCT INFORMATION */}

                <div className="product-info">

                    <div className="product-info__eyebrow">
                        <span className="product-info__line"></span>
                        PREMIUM SELECTION
                    </div>

                    <h1>{product.name}</h1>

                    <div className="product-info__divider"></div>

                    <div className="product-price">
                        <span className="product-price__label">
                            PRICE
                        </span>

                        <span className="product-price__value">
                            ${product.price}
                        </span>
                    </div>

                    <div className="product-description">
                        <h3>PRODUCT DETAILS</h3>

                        <p>
                            {product.description}
                        </p>
                    </div>

                    {/* PRODUCT INFORMATION */}

                    <div className="product-specifications">

                        <div className="product-specification">
                            <span>CATEGORY</span>
                            <strong>{product.category}</strong>
                        </div>

                        <div className="product-specification">
                            <span>AVAILABILITY</span>

                            <strong
                                className={
                                    product.stock > 0
                                        ? "stock-available"
                                        : "stock-unavailable"
                                }
                            >
                                {product.stock > 0
                                    ? "IN STOCK"
                                    : "OUT OF STOCK"}
                            </strong>
                        </div>

                    </div>

                    {/* QUANTITY */}

                    <div className="product-purchase">

                        <label className="product-purchase__label">
                            SELECT QUANTITY
                        </label>

                        <div className="quantity-control">

                            <button
                                type="button"
                                onClick={decreaseQuantity}
                                disabled={
                                    quantity <= 1 ||
                                    product.stock === 0
                                }
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <span>{quantity}</span>

                            <button
                                type="button"
                                onClick={increaseQuantity}
                                disabled={
                                    quantity >= product.stock ||
                                    product.stock === 0
                                }
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>

                    </div>

                    {/* ACTION BUTTONS */}

                    <div className="product-actions">

                        <button
                            type="button"
                            className="product-add-button"
                            onClick={addProductToCart}
                            disabled={product.stock === 0}
                        >
                            <span>
                                {product.stock === 0
                                    ? "OUT OF STOCK"
                                    : "ADD TO CART"}
                            </span>

                            <span className="product-button-arrow">
                                →
                            </span>
                        </button>

                        <button
                            type="button"
                            className="product-buy-button"
                            onClick={buyNow}
                            disabled={product.stock === 0}
                        >
                            BUY NOW
                        </button>

                    </div>

                    {/* TRUST INFORMATION */}

                    <div className="product-trust">

                        <div>
                            <span className="product-trust__icon">
                                ✦
                            </span>

                            <span>PREMIUM QUALITY</span>
                        </div>

                        <div>
                            <span className="product-trust__icon">
                                ✓
                            </span>

                            <span>SECURE SHOPPING</span>
                        </div>

                    </div>

                </div>

            </section>

            {/* BOTTOM BRAND SECTION */}

            <section className="product-brand-footer">

                <span>HARRAGA SHOP</span>

                <div></div>

                <p>
                    STYLE. QUALITY. IDENTITY.
                </p>

            </section>

            {/* ENLARGED PRODUCT IMAGE */}

            {expandedImage && (
                <div
                    className="image-lightbox"
                    onClick={() => setExpandedImage(null)}
                    role="presentation"
                >
                    <button
                        type="button"
                        className="lightbox-close"
                        onClick={() => setExpandedImage(null)}
                        aria-label="Close enlarged image"
                    >
                        ×
                    </button>

                    <img
                        src={expandedImage}
                        alt={product.name}
                        onClick={(event) => event.stopPropagation()}
                    />

                    <span className="lightbox-caption">
                        {product.name}
                    </span>
                </div>
            )}

        </main>
    );
}

export default Product;
