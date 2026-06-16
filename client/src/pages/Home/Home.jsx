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
                    <div key={product._id}>
                        <h3>{product.name}</h3>
                        <p>${product.price}</p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Home;