function ProductGallery({
    images = [],
    productName,
    onRemove,
    imageStyle = {},
}) {
    if (!images.length) return null;

    return (
        <div>
            {images.map((image, index) => (
                <div key={index}>
                    <img
                        src={`${import.meta.env.VITE_API_URL}${image}`}
                        alt={productName}
                        style={imageStyle}
                    />

                    {onRemove && (
                        <button
                            type="button"
                            onClick={() =>
                                onRemove(image, index)
                            }
                        >
                            Remove
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ProductGallery;