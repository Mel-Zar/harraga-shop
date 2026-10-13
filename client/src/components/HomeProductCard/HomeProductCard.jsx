import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGallery from "../ProductGallery/ProductGallery";
import "./HomeProductCard.scss";

function HomeProductCard({ product }) {
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);

    if (!product) return null;

    const images = Array.isArray(product.images) ? product.images : [];
    const safeActiveImage = images.length > 0
        ? activeImage % images.length
        : 0;

    const openProduct = () => {
        navigate(`/products/${product._id}`);
    };

    const changeImage = (event) => {
        event.stopPropagation();

        if (images.length > 1) {
            setActiveImage((current) => (current + 1) % images.length);
        }
    };

    const previousImage = (event) => {
        event.stopPropagation();

        if (images.length > 1) {
            setActiveImage((current) =>
                (current - 1 + images.length) % images.length
            );
        }
    };

    const nextImage = (event) => {
        event.stopPropagation();

        if (images.length > 1) {
            setActiveImage((current) =>
                (current + 1) % images.length
            );
        }
    };

    return (
        <article className="home-product-card">
            <div
                className="home-product-card__gallery"
                onClick={images.length > 1 ? changeImage : openProduct}
                role="button"
                tabIndex={0}
                aria-label={
                    images.length > 1
                        ? `Byt bild för ${product.name}`
                        : `Visa ${product.name}`
                }
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();

                        if (images.length > 1) {
                            changeImage(event);
                        } else {
                            openProduct();
                        }
                    }
                }}
            >
                {images.length > 0 ? (
                    <>
                        <ProductGallery
                            images={[images[safeActiveImage]]}
                            productName={product.name}
                            imageStyle={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                padding: "8px",
                                boxSizing: "border-box",
                            }}
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    className="home-product-card__arrow home-product-card__arrow--left"
                                    aria-label="Föregående bild"
                                    onClick={previousImage}
                                >
                                    ‹
                                </button>

                                <button
                                    type="button"
                                    className="home-product-card__arrow home-product-card__arrow--right"
                                    aria-label="Nästa bild"
                                    onClick={nextImage}
                                >
                                    ›
                                </button>

                                <div
                                    className="home-product-card__image-indicator"
                                    aria-live="polite"
                                >
                                    {safeActiveImage + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <button
                        type="button"
                        className="home-product-card__button"
                        onClick={openProduct}
                    >
                        Visa produkt
                    </button>
                )}
            </div>

            <div className="home-product-card__content">
                <h2>{product.name}</h2>

                <p className="home-product-card__description">
                    {product.description}
                </p>

                <div className="home-product-card__bottom">
                    <p className="home-product-card__price">
                        ${product.price}
                    </p>

                    <button
                        type="button"
                        className="home-product-card__button"
                        onClick={openProduct}
                    >
                        View Product <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default HomeProductCard;