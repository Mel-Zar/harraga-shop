import ProductGallery from "../ProductGallery/ProductGallery";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "../../context/useCart";

function ProductListCard({ product }) {
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();

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
                imageStyle={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    borderRadius: "8px",
                }}
            />

            <h2>{product.name}</h2>

            <p>{product.description}</p>

            <p>
                <strong>Price:</strong>{" "}
                ${product.price}
            </p>

            <p>
                <strong>Stock:</strong>{" "}
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
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                    }}
                >
                    <button
                        onClick={() =>
                            setQuantity((prev) =>
                                prev > 1 ? prev - 1 : 1
                            )
                        }
                    >
                        -
                    </button>

                    <span
                        style={{
                            minWidth: "30px",
                            textAlign: "center",
                        }}
                    >
                        {quantity}
                    </span>

                    <button
                        onClick={() =>
                            setQuantity((prev) =>
                                prev < product.stock
                                    ? prev + 1
                                    : prev
                            )
                        }
                    >
                        +
                    </button>
                </div>

                <button
                    onClick={() =>
                        addToCart(
                            product,
                            quantity
                        )
                    }
                >
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