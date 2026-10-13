import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductGallery from "../ProductGallery/ProductGallery";
import "./HomeProductCard.scss";

function HomeProductCard({ product }) {
    const navigate = useNavigate();
    const [activeImage, setActiveImage] = useState(0);

    if (!product) return null;

    const images = Array.isArray(product.images)
        ? product.images.filter((image) => {
            if (typeof image === "string") return Boolean(image.trim());

            return Boolean(
                image &&
                typeof image === "object" &&
                (image.url || image.path || image.filename)
            );
        })
        : [];

    const safeActiveImage = images.length
        ? activeImage % images.length
        : 0;

    const openProduct = () => {
        const id = product._id || product.id;

        if (id) navigate(`/products/${id}`);
    };

    const previousImage = (event) => {
        event.stopPropagation();

        if (images.length > 1) {
            setActiveImage(
                (current) => (current - 1 + images.length) % images.length
            );
        }
    };

    const nextImage = (event) => {
        event.stopPropagation();

        if (images.length > 1) {
            setActiveImage((current) => (current + 1) % images.length);
        }
    };

    const handleGalleryKeyDown = (event) => {
        if (event.target !== event.currentTarget) return;

        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (images.length > 1) {
                setActiveImage((current) => (current + 1) % images.length);
            } else {
                openProduct();
            }
        }
    };

    const price = Number(product.price);

    const formattedPrice =
        product.price !== null &&
            product.price !== undefined &&
            product.price !== "" &&
            Number.isFinite(price)
            ? `${price.toLocaleString("sv-SE")} kr`
            : "";

    const description =
        product.shortDescription ||
        product.description ||
        "Upptäck produkten från Harraga Shop.";

    return (
        <article className="home-product-card">
            <div
                className="home-product-card__gallery"
                onClick={openProduct}
                onKeyDown={handleGalleryKeyDown}
                role="button"
                tabIndex={0}
                aria-label={`Visa ${product.name || "produkt"}`}
            >
                {images.length > 0 ? (
                    <>
                        <ProductGallery
                            images={[images[safeActiveImage]]}
                            productName={product.name}
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

                                <span
                                    className="home-product-card__image-indicator"
                                    aria-live="polite"
                                >
                                    {safeActiveImage + 1} / {images.length}
                                </span>
                            </>
                        )}
                    </>
                ) : (
                    <div className="home-product-card__no-image">
                        <span>HARRAGA</span>
                        <p>Ingen produktbild tillgänglig</p>
                    </div>
                )}
            </div>

            <div className="home-product-card__content">
                <h2>{product.name || "Produkt"}</h2>

                <p className="home-product-card__description">
                    {description}
                </p>

                <div className="home-product-card__bottom">
                    {formattedPrice && (
                        <p className="home-product-card__price">
                            {formattedPrice}
                        </p>
                    )}

                    <button
                        type="button"
                        className="home-product-card__button"
                        onClick={openProduct}
                    >
                        Visa produkt <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </div>
        </article>
    );
}

export default HomeProductCard;