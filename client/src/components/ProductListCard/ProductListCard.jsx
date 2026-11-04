
import { useState } from "react";
import ProductGallery from "../ProductGallery/ProductGallery";
import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";
import "./ProductListCard.scss";

function ProductListCard({ product }) {
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);

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

    const buyProduct = () => {
        if (product.stock === 0) {
            return;
        }

        addToCart(product, quantity);

        // Reset quantity after adding to cart.
        setQuantity(1);
    };

    const outOfStock = product.stock === 0;

    return (
        <article className="shop-product-card">

            {/* PRODUCT IMAGE */}

            <div className="shop-product-card__image">
                <ProductGallery
                    images={product.images}
                    productName={product.name}
                    imageStyle={{
                        width: "100%",
                        height: "100%",
                        minHeight: "260px",
                        maxHeight: "380px",
                        objectFit: "contain",
                        objectPosition: "center",
                        display: "block",
                        margin: "0 auto",
                        borderRadius: "8px",
                    }}
                />
            </div>

            {/* PRODUCT INFORMATION */}

            <div className="shop-product-card__content">

                <h2 className="shop-product-card__title">
                    {product.name}
                </h2>

                <p className="shop-product-card__description">
                    {product.description}
                </p>

                {/* PRICE */}

                <div className="shop-product-card__price">
                    <span className="shop-product-card__label">
                        PRICE
                    </span>

                    <strong>${product.price}</strong>
                </div>

                {/* STOCK */}

                <div className="shop-product-card__stock">
                    <span>Availability</span>

                    <strong
                        className={
                            outOfStock
                                ? "out-of-stock"
                                : "in-stock"
                        }
                    >
                        {outOfStock
                            ? "Out of Stock"
                            : `${product.stock} Available`}
                    </strong>
                </div>

                {/* QUANTITY */}

                <div className="shop-product-card__purchase">

                    <span className="shop-product-card__label">
                        QUANTITY
                    </span>

                    <div className="shop-product-card__quantity">

                        <button
                            type="button"
                            onClick={decreaseQuantity}
                            disabled={quantity <= 1 || outOfStock}
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span aria-live="polite">
                            {quantity}
                        </span>

                        <button
                            type="button"
                            onClick={increaseQuantity}
                            disabled={
                                quantity >= product.stock ||
                                outOfStock
                            }
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>
                </div>

                {/* ACTIONS */}

                <div className="shop-product-card__actions">

                    <button
                        type="button"
                        className="shop-product-card__cart"
                        onClick={buyProduct}
                        disabled={outOfStock}
                    >
                        {outOfStock
                            ? "Out of Stock"
                            : "Add To Cart"}
                    </button>

                    <Link
                        to={`/products/${product._id}`}
                        className="shop-product-card__view"
                    >
                        View Product
                    </Link>

                </div>

            </div>
        </article>
    );
}

export default ProductListCard;
