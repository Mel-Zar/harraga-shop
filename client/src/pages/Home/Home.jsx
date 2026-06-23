import { useEffect, useState } from "react";
import ProductListCard from "../../components/ProductListCard/ProductListCard";
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
                console.error(error);
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
            <h1>Featured Products</h1>

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(350px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {products.map((product) => (
                        <ProductListCard
                            key={product._id}
                            product={product}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;