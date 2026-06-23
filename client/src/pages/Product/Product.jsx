import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductGallery from "../../components/ProductGallery/ProductGallery";
import { useCart } from "../../context/useCart";

function Product() {
    const { id } = useParams();
    const navigate = useNavigate(); // 🔥 FIX

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const products = await getProducts();

                const foundProduct = products.find(
                    (p) => p._id === id
                );

                setProduct(foundProduct);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    if (!product) {
        return <h2>Product not found</h2>;
    }

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "20px",
            }}
        >
            <ProductGallery
                images={product.images}
                productName={product.name}
                imageStyle={{
                    width: "100%",
                    maxWidth: "600px",
                    aspectRatio: "1 / 1",
                    objectFit: "contain",
                    borderRadius: "12px",
                }}
            />

            <h1>{product.name}</h1>

            <p>{product.description}</p>

            <p>
                <strong>Price:</strong> ${product.price}
            </p>

            <p>
                <strong>Category:</strong> {product.category}
            </p>

            <p>
                <strong>Stock:</strong> {product.stock}
            </p>

            <div style={{ marginTop: "20px" }}>
                <label>Quantity:</label>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginLeft: "10px",
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

                    <span style={{ minWidth: "30px", textAlign: "center" }}>
                        {quantity}
                    </span>

                    <button
                        onClick={() =>
                            setQuantity((prev) =>
                                prev < product.stock ? prev + 1 : prev
                            )
                        }
                    >
                        +
                    </button>
                </div>
            </div>

            <br />

            <button
                onClick={() => addToCart(product, quantity)}
            >
                Add To Cart
            </button>

            {" "}

            <button
                onClick={() => {
                    addToCart(product, quantity);
                    navigate("/cart"); // 🔥 FIX
                }}
            >
                Buy Now
            </button>
        </div>
    );
}

export default Product;