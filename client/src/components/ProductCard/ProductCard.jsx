import ProductGallery from "../ProductGallery/ProductGallery";

function ProductCard({
    product,
    onEdit,
    onDelete,
}) {
    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "15px",
                marginBottom: "15px",
                borderRadius: "8px",
            }}
        >
            <h3>{product.name}</h3>

            <p>{product.description}</p>

            <p>
                Price: ${product.price}
            </p>

            <p>
                Category: {product.category}
            </p>

            <p>
                Stock: {product.stock}
            </p>

            <ProductGallery
                images={product.images}
                productName={product.name}
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