import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error(
                    "Failed to fetch products:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <h2>Loading...</h2>;
    }

    return (
        <div>
            <h1>Products</h1>

            {products.length === 0 ? (
                <p>No products found</p>
            ) : (
                products.map((product) => (
                    <div
                        key={product._id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "8px",
                        }}
                    >
                        <h2>{product.name}</h2>

                        <p>
                            <strong>
                                Description:
                            </strong>{" "}
                            {
                                product.description
                            }
                        </p>

                        <p>
                            <strong>
                                Price:
                            </strong>{" "}
                            ${product.price}
                        </p>

                        <p>
                            <strong>
                                Category:
                            </strong>{" "}
                            {product.category}
                        </p>

                        <p>
                            <strong>
                                Stock:
                            </strong>{" "}
                            {product.stock}
                        </p>

                        {product.image && (
                            <div>
                                <p>
                                    Main image:
                                </p>

                                <img
                                    src={`${import.meta.env.VITE_API_URL}${product.image}`}
                                    alt={
                                        product.name
                                    }
                                    width="200"
                                />
                            </div>
                        )}

                        {product.images &&
                            product.images
                                .length >
                            0 && (
                                <div>
                                    <p>
                                        Gallery:
                                    </p>

                                    {product.images.map(
                                        (
                                            image,
                                            index
                                        ) => (
                                            <img
                                                key={
                                                    index
                                                }
                                                src={`${import.meta.env.VITE_API_URL}${image}`}
                                                alt={`${product.name}-${index}`}
                                                width="100"
                                                style={{
                                                    marginRight:
                                                        "10px",
                                                }}
                                            />
                                        )
                                    )}
                                </div>
                            )}
                    </div>
                ))
            )}
        </div>
    );
}

export default Home;