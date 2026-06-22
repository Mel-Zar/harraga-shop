function ProductGallery({
    images = [],
    productName,
    onRemove,
}) {
    if (!images.length) return null;

    return (
        <div
            style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
            }}
        >
            {images.map((image, index) => (
                <div
                    key={index}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "120px",
                    }}
                >
                    <img
                        src={`${import.meta.env.VITE_API_URL}${image}`}
                        alt={productName}
                        style={{
                            width: "120px",
                            height: "250px",
                            objectFit: "cover",
                        }}
                    />

                    {onRemove && (
                        <button
                            type="button"
                            style={{
                                marginTop: "10px",
                                width: "100%",
                            }}
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