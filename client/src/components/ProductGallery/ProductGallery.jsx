function ProductGallery({
    images = [],
    productName,
    onRemove,
    imageStyle = {},
}) {
    if (!images.length) return null;

    const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

    const getImageUrl = (image) => {
        if (typeof image !== "string" || !image) {
            return "";
        }

        if (/^https?:\/\//i.test(image)) {
            return image;
        }

        const path = image.startsWith("/") ? image : `/${image}`;

        // Om API-adressen slutar på /api ska uppladdade bilder
        // hämtas från serverns rot i stället.
        const baseUrl = apiUrl.replace(/\/api$/i, "");

        return `${baseUrl}${path}`;
    };

    return (
        <div className="product-gallery">
            {images.map((image, index) => {
                const imageUrl = getImageUrl(image);

                return (
                    <div
                        className="product-gallery__item"
                        key={`${image}-${index}`}
                    >
                        {imageUrl && (
                            <img
                                className="product-gallery__image"
                                src={imageUrl}
                                alt={`${productName || "Produkt"} ${index + 1}`}
                                style={imageStyle}
                                loading="lazy"
                            />
                        )}

                        {onRemove && (
                            <button
                                type="button"
                                onClick={() => onRemove(image, index)}
                            >
                                Remove
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ProductGallery;
