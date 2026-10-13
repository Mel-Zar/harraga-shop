import "./ProductGallery.scss";

function ProductGallery({
    images = [],
    productName,
    onRemove,
    imageStyle = {},
}) {
    if (!Array.isArray(images) || images.length === 0) return null;

    const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
    const baseUrl = apiUrl.replace(/\/api$/i, "");

    const getImageUrl = (image) => {
        const rawValue =
            typeof image === "string"
                ? image
                : image && typeof image === "object"
                    ? image.url || image.path || image.filename
                    : "";

        if (typeof rawValue !== "string" || !rawValue.trim()) return "";

        const value = rawValue.trim();
        if (/^(https?:|data:|blob:)/i.test(value)) return value;

        const path = value.startsWith("/") ? value : `/${value}`;
        return `${baseUrl}${path}`;
    };

    return (
        <div className="product-gallery">
            {images.map((image, index) => {
                const imageUrl = getImageUrl(image);
                const key =
                    typeof image === "string"
                        ? image
                        : image?._id || image?.url || image?.path || index;

                return (
                    <div className="product-gallery__item" key={`${key}-${index}`}>
                        {imageUrl && (
                            <img
                                className="product-gallery__image"
                                src={imageUrl}
                                alt={`${productName || "Produkt"} ${index + 1}`}
                                style={{
                                    objectFit: "contain",
                                    objectPosition: "center center",
                                    ...imageStyle,
                                }}
                                loading="lazy"
                            />
                        )}

                        {onRemove && (
                            <button type="button" onClick={() => onRemove(image, index)}>
                                Ta bort
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default ProductGallery;
