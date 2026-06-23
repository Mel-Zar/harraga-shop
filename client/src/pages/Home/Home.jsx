import { useEffect, useState } from "react";
import HomeProductCard from "../../components/HomeProductCard/HomeProductCard";
import { getProducts } from "../../services/productService";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts();

                // Visa t.ex. bara de 4 första produkterna på startsidan
                setProducts(data.slice(0, 4));
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
        <div
            style={{
                padding: "20px",
            }}
        >
            <h1>Featured Products</h1>

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {products.map((product) => (
                        <HomeProductCard
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