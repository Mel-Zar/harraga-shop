import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../../services/productService";
import ProductGallery from "../../components/ProductGallery/ProductGallery";
import { useCart } from "../../context/useCart";

function Product() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    // Quantity för produktsidan
    const [quantity, setQuantity] = useState(1);

    const {
        addToCart
    } = useCart();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const product = await getProductById(id);

                setProduct(product);

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

    console.log("Product images:", product.images);

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

    const addProductToCart = () => {

        if (product.stock === 0) {
            return;
        }

        addToCart(
            product,
            quantity
        );

        // Återställ väljaren efter att produkten lagts till
        setQuantity(1);

    };

    const buyNow = () => {

        if (product.stock === 0) {
            return;
        }

        addToCart(
            product,
            quantity
        );

        navigate("/cart");

    };

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

                <label>
                    Quantity:
                </label>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        marginLeft: "10px",
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

            </div>

            <br />

            <button
                onClick={addProductToCart}
                disabled={product.stock === 0}
            >
                {product.stock === 0
                    ? "Out of Stock"
                    : "Add To Cart"}
            </button>

            {" "}

            <button
                onClick={buyNow}
                disabled={product.stock === 0}
            >
                Buy Now
            </button>

        </div>
    );
}

export default Product;