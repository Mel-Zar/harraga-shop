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

    // Stöd för både nya och gamla produkter.
    const categoryPath =
        Array.isArray(product.categoryPath) &&
            product.categoryPath.length > 0
            ? product.categoryPath
            : product.category
                ? [product.category]
                : [];

    const mainCategory = categoryPath[0] || "Uncategorized";

    const subCategory =
        categoryPath.length > 1
            ? categoryPath[categoryPath.length - 1]
            : product.subCategory || "";

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
                backgroundColor: "#fff",
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
                <strong>Price:</strong> ${product.price}
            </p>

            {/* Huvudkategori */}
            <p>
                <strong>Main Category:</strong>{" "}
                {mainCategory}
            </p>

            {/* Hela kategorisökvägen */}
            <div
                style={{
                    marginBottom: "12px",
                    padding: "10px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "6px",
                }}
            >
                <p
                    style={{
                        margin: "0 0 6px",
                        fontWeight: "bold",
                    }}
                >
                    Category Path:
                </p>

                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: "6px",
                    }}
                >
                    {categoryPath.length > 0 ? (
                        categoryPath.map((category, index) => (
                            <span
                                key={`${category}-${index}`}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}
                            >
                                <span
                                    style={{
                                        padding: "4px 8px",
                                        backgroundColor:
                                            index === categoryPath.length - 1
                                                ? "#dbeafe"
                                                : "#e5e7eb",
                                        color: "#1f2937",
                                        borderRadius: "5px",
                                        fontSize: "13px",
                                    }}
                                >
                                    {category}
                                </span>

                                {index < categoryPath.length - 1 && (
                                    <span
                                        style={{
                                            color: "#64748b",
                                        }}
                                        aria-hidden="true"
                                    >
                                        →
                                    </span>
                                )}
                            </span>
                        ))
                    ) : (
                        <span>Uncategorized</span>
                    )}
                </div>
            </div>

            {/* Sista underkategorin */}
            {subCategory && (
                <p>
                    <strong>Subcategory:</strong>{" "}
                    {subCategory}
                </p>
            )}

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

            {/* Befintligt bildgalleri behålls */}
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

            {/* Befintlig redigering behålls */}
            <button onClick={onEdit}>
                Edit
            </button>

            {" "}

            {/* Befintlig borttagning behålls */}
            <button onClick={onDelete}>
                Delete
            </button>
        </div>
    );
}

export default ProductCard;
