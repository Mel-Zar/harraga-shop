import ProductGallery from "../ProductGallery/ProductGallery";

function ProductCard({
    product,
    onEdit,
    onDelete,
}) {
    const getStockStatus = () => {
        if (product.stock === 0) {
            return {
                text: "🔴 Out of Stock",
                color: "#dc2626",
            };
        }

        if (product.stock <= 10) {
            return {
                text: "🟡 Low Stock",
                color: "#f59e0b",
            };
        }

        return {
            text: "🟢 In Stock",
            color: "#16a34a",
        };
    };

    const stockStatus = getStockStatus();

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08)",
            }}
        >
            <h3
                style={{
                    marginTop: 0,
                    marginBottom: "10px",
                }}
            >
                {product.name}
            </h3>

            <p>{product.description}</p>

            <p>
                <strong>Price:</strong> $
                {product.price}
            </p>

            <p>
                <strong>Category:</strong>{" "}
                {product.category}
            </p>

            <p>
                <strong>Stock:</strong>{" "}
                {product.stock}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                <span
                    style={{
                        color: stockStatus.color,
                        fontWeight: "bold",
                    }}
                >
                    {stockStatus.text}
                </span>
            </p>

            <ProductGallery
                images={product.images}
                productName={product.name}
                imageStyle={{
                    width: "150px",
                    height: "300px",
                    objectFit: "contain",
                    borderRadius: "8px",
                }}
            />

            <br />

            <button onClick={onEdit}>
                Edit
            </button>

            {" "}

            <button onClick={onDelete}>
                Delete
            </button>
        </div>
    );
}

export default ProductCard;