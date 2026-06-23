import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProducts } from "../../services/productService";
import ProductGallery from "../../components/ProductGallery/ProductGallery";

function Product() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const products = await getProducts();

                const foundProduct =
                    products.find(
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
            />

            <h1>{product.name}</h1>

            <p>
                {product.description}
            </p>

            <p>
                <strong>Price:</strong>
                {" "}
                ${product.price}
            </p>

            <p>
                <strong>Category:</strong>
                {" "}
                {product.category}
            </p>

            <p>
                <strong>Stock:</strong>
                {" "}
                {product.stock}
            </p>

            <div
                style={{
                    marginTop: "20px",
                }}
            >
                <label>
                    Quantity:
                </label>

                <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                        setQuantity(
                            Number(
                                e.target.value
                            )
                        )
                    }
                    style={{
                        marginLeft: "10px",
                        width: "80px",
                    }}
                />
            </div>

            <br />

            <button>
                Add To Cart
            </button>

            {" "}

            <button>
                Buy Now
            </button>
        </div>
    );
}

export default Product;