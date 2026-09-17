import { useEffect, useState } from "react";
import HomeProductCard from "../../components/HomeProductCard/HomeProductCard";
import { getProducts } from "../../services/productService";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================
    // GET FEATURED PRODUCTS
    // =========================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getProducts({
                    sort: "newest",
                });

                // Visa bara de 4 nyaste produkterna
                setProducts(
                    Array.isArray(data)
                        ? data.slice(0, 4)
                        : []
                );

            } catch (error) {
                console.error(
                    "HOME PRODUCTS ERROR:",
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div
                style={{
                    padding: "20px",
                }}
            >
                <h2>
                    Loading...
                </h2>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "20px",
            }}
        >
            {/* =========================
                FEATURED PRODUCTS
            ========================= */}

            <h1>
                Featured Products
            </h1>

            {products.length === 0 ? (
                <p>
                    No products found.
                </p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {products.map(
                        (product) => (
                            <HomeProductCard
                                key={
                                    product._id
                                }
                                product={
                                    product
                                }
                            />
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default Home;