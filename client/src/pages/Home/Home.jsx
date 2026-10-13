import { useEffect, useState } from "react";
import HomeProductCard from "../../components/HomeProductCard/HomeProductCard";
import { getProducts } from "../../services/productService";
import "./Home.scss";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchProducts = async () => {
            try {
                const data = await getProducts({
                    sort: "newest",
                });

                if (!cancelled) {
                    setProducts(
                        Array.isArray(data)
                            ? data.slice(0, 4)
                            : []
                    );
                }
            } catch (error) {
                console.error("HOME PRODUCTS ERROR:", error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="home-page">
            <section className="home-products">
                <div className="home-products__heading">
                    <p className="home-products__eyebrow">
                        HARRAGA · STREETWEAR
                    </p>

                    <h1>
                        FEATURED <span>PRODUCTS</span>
                    </h1>

                    <p className="home-products__intro">
                        Svart design. Silverdetaljer. Hitta dina favoriter.
                    </p>
                </div>

                {loading ? (
                    <p className="home-products__message">
                        Laddar produkter...
                    </p>
                ) : products.length === 0 ? (
                    <p className="home-products__message">
                        No products found.
                    </p>
                ) : (
                    <div className="home-products__grid">
                        {products.map((product) => (
                            <HomeProductCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

export default Home;