import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    getProducts,
    deleteProduct,
} from "../../services/productService";

function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    // =========================
    // GET PRODUCTS
    // =========================

    const fetchProducts = useCallback(
        async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getProducts();

                setProducts(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (error) {
                console.error(
                    "PRODUCTS PAGE ERROR:",
                    error
                );

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load products."
                );
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // =========================
    // DELETE PRODUCT
    // =========================

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmed) {
            return;
        }

        try {
            await deleteProduct(id);

            setProducts(
                (prev) =>
                    prev.filter(
                        (product) =>
                            product._id !== id
                    )
            );
        } catch (error) {
            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete product."
            );
        }
    };

    // =========================
    // SEARCH
    // =========================

    const filteredProducts =
        useMemo(() => {
            const searchText =
                search
                    .toLowerCase()
                    .trim();

            if (!searchText) {
                return products;
            }

            return products.filter(
                (product) =>
                    product.name
                        ?.toLowerCase()
                        .includes(searchText) ||
                    product.category
                        ?.toLowerCase()
                        .includes(searchText) ||
                    product.description
                        ?.toLowerCase()
                        .includes(searchText)
            );
        }, [products, search]);

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>Products</h1>

                <p>
                    Loading products...
                </p>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================

    if (error) {
        return (
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>Products</h1>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "25px",
                    }}
                >
                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            fetchProducts
                        }
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "40px auto",
                padding: "20px",
            }}
        >
            {/* =========================
                HEADER
            ========================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom: "30px",
                }}
            >
                <div>
                    <h1>
                        Products
                    </h1>

                    <p>
                        Manage your products.
                    </p>
                </div>

                <Link
                    to="/admin/products/create"
                    style={{
                        display:
                            "inline-block",
                        padding:
                            "10px 18px",
                        borderRadius:
                            "8px",
                        textDecoration:
                            "none",
                        background:
                            "#000",
                        color:
                            "#fff",
                    }}
                >
                    + Create Product
                </Link>
            </div>

            {/* =========================
                SEARCH
            ========================= */}

            <div
                style={{
                    marginBottom: "25px",
                }}
            >
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    style={{
                        width: "100%",
                        maxWidth: "500px",
                        padding: "12px",
                        border:
                            "1px solid #ccc",
                        borderRadius:
                            "8px",
                        fontSize: "16px",
                        boxSizing:
                            "border-box",
                    }}
                />
            </div>

            {/* =========================
                PRODUCT COUNT
            ========================= */}

            <p>
                <strong>
                    Products:
                </strong>{" "}
                {filteredProducts.length}
            </p>

            {/* =========================
                NO PRODUCTS
            ========================= */}

            {filteredProducts.length ===
                0 ? (
                <div
                    style={{
                        border:
                            "1px solid #ddd",
                        borderRadius:
                            "10px",
                        padding:
                            "30px",
                        marginTop:
                            "20px",
                    }}
                >
                    <h3>
                        No products found.
                    </h3>

                    <p>
                        {products.length ===
                            0
                            ? "You have not created any products yet."
                            : "No products match your search."}
                    </p>
                </div>
            ) : (
                /* =========================
                   PRODUCTS
                ========================= */

                <div
                    style={{
                        display:
                            "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(280px, 1fr))",
                        gap: "20px",
                        marginTop:
                            "20px",
                    }}
                >
                    {filteredProducts.map(
                        (product) => (
                            <div
                                key={
                                    product._id
                                }
                                style={{
                                    border:
                                        "1px solid #ddd",
                                    borderRadius:
                                        "10px",
                                    padding:
                                        "20px",
                                    background:
                                        "#fff",
                                }}
                            >
                                {/* =========================
                                    IMAGE
                                ========================= */}

                                {product.image ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${product.image}`}
                                        alt={
                                            product.name
                                        }
                                        style={{
                                            width:
                                                "100%",
                                            height:
                                                "220px",
                                            objectFit:
                                                "cover",
                                            borderRadius:
                                                "8px",
                                            marginBottom:
                                                "15px",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width:
                                                "100%",
                                            height:
                                                "220px",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            background:
                                                "#f5f5f5",
                                            borderRadius:
                                                "8px",
                                            marginBottom:
                                                "15px",
                                        }}
                                    >
                                        No image
                                    </div>
                                )}

                                {/* =========================
                                    NAME
                                ========================= */}

                                <h2
                                    style={{
                                        marginTop:
                                            "0",
                                    }}
                                >
                                    {
                                        product.name
                                    }
                                </h2>

                                {/* =========================
                                    CATEGORY
                                ========================= */}

                                <p>
                                    <strong>
                                        Category:
                                    </strong>{" "}
                                    {
                                        product.category ||
                                        "-"
                                    }
                                </p>

                                {/* =========================
                                    PRICE
                                ========================= */}

                                <p>
                                    <strong>
                                        Price:
                                    </strong>{" "}
                                    {
                                        product.price ??
                                        0
                                    }{" "}
                                    kr
                                </p>

                                {/* =========================
                                    STOCK
                                ========================= */}

                                <p>
                                    <strong>
                                        Stock:
                                    </strong>{" "}
                                    {
                                        product.stock ??
                                        0
                                    }
                                </p>

                                {/* =========================
                                    STATUS
                                ========================= */}

                                <p>
                                    <strong>
                                        Status:
                                    </strong>{" "}
                                    {product.isActive
                                        ? "Active"
                                        : "Inactive"}
                                </p>

                                {/* =========================
                                    DESCRIPTION
                                ========================= */}

                                <p>
                                    <strong>
                                        Description:
                                    </strong>
                                </p>

                                <p>
                                    {product.description ||
                                        "-"}
                                </p>

                                {/* =========================
                                    ACTIONS
                                ========================= */}

                                <div
                                    style={{
                                        display:
                                            "flex",
                                        gap:
                                            "10px",
                                        marginTop:
                                            "20px",
                                        flexWrap:
                                            "wrap",
                                    }}
                                >
                                    <Link
                                        to={`/admin/products/create?edit=${product._id}`}
                                        style={{
                                            padding:
                                                "10px 15px",
                                            border:
                                                "1px solid #ccc",
                                            borderRadius:
                                                "8px",
                                            textDecoration:
                                                "none",
                                            color:
                                                "#000",
                                        }}
                                    >
                                        Edit
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                product._id
                                            )
                                        }
                                        style={{
                                            padding:
                                                "10px 15px",
                                            border:
                                                "none",
                                            borderRadius:
                                                "8px",
                                            cursor:
                                                "pointer",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
}

export default Products;