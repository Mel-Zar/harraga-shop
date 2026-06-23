import ProductGallery from "../ProductGallery/ProductGallery";
import { Link } from "react-router-dom";
import { useState } from "react";

function ProductListCard({ product }) {
    const [quantity, setQuantity] = useState(1);

    return (
        <div
            style={{
                border: "1px solid #ddd",
                padding: "15px",
                borderRadius: "8px",
            }}
        >
            <ProductGallery
                images={product.images}
                productName={product.name}
            />

            <h2>{product.name}</h2>

            <p>{product.description}</p>

            <p>
                <strong>Price:</strong>
                {" "}
                ${product.price}
            </p>

            <p>
                <strong>Stock:</strong>
                {" "}
                {product.stock}
            </p>

            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    marginTop: "15px",
                }}
            >
                <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                        setQuantity(
                            Number(e.target.value)
                        )
                    }
                    style={{
                        width: "70px",
                    }}
                />

                <button>
                    Buy
                </button>

                <Link
                    to={`/products/${product._id}`}
                >
                    <button>
                        View Product
                    </button>
                </Link>
            </div>
        </div>
    );
}

export default ProductListCard;