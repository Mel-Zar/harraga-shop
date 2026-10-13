import { useEffect, useState } from "react";
import HomeProductCard from "../../components/HomeProductCard/HomeProductCard";
import { getProducts } from "../../services/productService";
import "./Home.scss";

function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function fetchProducts() {
            try {
                setLoading(true);
                setErrorMessage("");

                const data = await getProducts({ sort: "newest" });

                if (cancelled) return;

                const productList = Array.isArray(data)
                    ? data
                    : Array.isArray(data?.products)
                        ? data.products
                        : Array.isArray(data?.data)
                            ? data.data
                            : [];

                setProducts(productList.slice(0, 4));
            } catch (error) {
                console.error("HOME PRODUCTS ERROR:", error);
                if (!cancelled) {
                    setProducts([]);
                    setErrorMessage("Det gick inte att ladda produkterna. Försök igen senare.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchProducts();
        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <main className="home-page">
            <section className="home-products">
                <header className="home-products__heading">
                    <p className="home-products__eyebrow">HARRAGA · STREETWEAR</p>
                    <h1>FEATURED <span>PRODUCTS</span></h1>
                    <p className="home-products__intro">
                        Svart design. Silverdetaljer. Hitta dina favoriter.
                    </p>
                </header>

                {loading ? (
                    <p className="home-products__message" role="status" aria-live="polite">
                        Laddar produkter...
                    </p>
                ) : errorMessage ? (
                    <p className="home-products__message" role="alert">{errorMessage}</p>
                ) : products.length === 0 ? (
                    <p className="home-products__message">Inga produkter hittades.</p>
                ) : (
                    <div className="home-products__grid">
                        {products.map((product, index) => (
                            <HomeProductCard
                                key={product._id || product.id || `${product.name}-${index}`}
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
