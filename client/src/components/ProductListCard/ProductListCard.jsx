import { useState } from "react";
import ProductGallery from "../ProductGallery/ProductGallery";
import { Link } from "react-router-dom";
import { useCart } from "../../context/useCart";

function ProductListCard({ product }) {

    const {
        addToCart
    } = useCart();

    const [quantity, setQuantity] = useState(1);

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity((prev) => prev + 1);
        }
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);
        }
    };

    const buyProduct = () => {
        if (product.stock === 0) {
            return;
        }

        addToCart(product, quantity);

        // Återställ efter att produkten lagts till
        setQuantity(1);
    };

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
                <strong>Price:</strong> ${product.price}
            </p>

            <p>
                <strong>Stock:</strong> {product.stock}
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
                        onClick={decreaseQuantity}
                        disabled={
                            quantity <= 1 ||
                            product.stock === 0
                        }
                    >
                        -
                    </button>

                    <span
                        style={{
                            minWidth: "30px",
                            textAlign: "center",
                            fontWeight: "bold",
                        }}
                    >
                        {quantity}
                    </span>

                    <button
                        onClick={increaseQuantity}
                        disabled={
                            quantity >= product.stock ||
                            product.stock === 0
                        }
                    >
                        +
                    </button>

                </div>

                <button
                    onClick={buyProduct}
                    disabled={product.stock === 0}
                >
                    {product.stock === 0
                        ? "Out of Stock"
                        : "Add To Cart"}
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