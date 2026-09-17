import {
    useEffect,
    useState,
} from "react";

import { toast } from "react-toastify";

import ProductListCard from "../../components/ProductListCard/ProductListCard";
import {
    getProducts,
    getProductCategories,
} from "../../services/productService";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("newest");

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] =
        useState(true);

    // =========================
    // GET CATEGORIES
    // =========================

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);

                const data =
                    await getProductCategories();

                setCategories(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {
                console.error(
                    "GET CATEGORIES ERROR:",
                    error
                );

                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load categories."
                );

            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // =========================
    // GET PRODUCTS
    // =========================

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                const data =
                    await getProducts({
                        search,
                        category,
                        sort,
                    });

                setProducts(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {
                console.error(
                    "GET PRODUCTS ERROR:",
                    error
                );

                toast.error(
                    error?.response?.data?.message ||
                    error?.message ||
                    "Failed to load products. Please try again."
                );

            } finally {
                setLoading(false);
            }
        };

        // =========================
        // DEBOUNCE SEARCH
        // =========================

        const timer =
            setTimeout(() => {
                fetchProducts();
            }, 300);

        return () => {
            clearTimeout(timer);
        };

    }, [
        search,
        category,
        sort,
    ]);

    // =========================
    // CLEAR FILTERS
    // =========================

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setSort("newest");
    };

    const hasFilters =
        search.trim() !== "" ||
        category !== "" ||
        sort !== "newest";

    return (
        <div
            style={{
                maxWidth: "1400px",
                margin: "0 auto",
                padding: "30px 20px",
            }}
        >
            {/* =========================
                HEADER
            ========================= */}

            <div
                style={{
                    marginBottom: "30px",
                }}
            >
                <h1
                    style={{
                        marginBottom: "8px",
                    }}
                >
                    Products
                </h1>

                <p
                    style={{
                        margin: 0,
                        color: "#666",
                    }}
                >
                    Browse our products and find
                    exactly what you are looking for.
                </p>
            </div>

            {/* =========================
                FILTER BAR
            ========================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "minmax(250px, 1fr) minmax(180px, 220px) minmax(180px, 220px)",
                    gap: "15px",
                    marginBottom: "20px",
                    padding: "20px",
                    border: "1px solid #e5e5e5",
                    borderRadius: "12px",
                    background: "#fff",
                    boxSizing: "border-box",
                }}
            >
                {/* =========================
                    SEARCH
                ========================= */}

                <div>
                    <label
                        htmlFor="product-search"
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                        }}
                    >
                        Search
                    </label>

                    <input
                        id="product-search"
                        type="search"
                        value={search}
                        onChange={(event) =>
                            setSearch(
                                event.target.value
                            )
                        }
                        placeholder="Search products..."
                        autoComplete="off"
                        style={{
                            width: "100%",
                            padding:
                                "12px 14px",
                            border:
                                "1px solid #ccc",
                            borderRadius:
                                "8px",
                            fontSize:
                                "15px",
                            boxSizing:
                                "border-box",
                            outline:
                                "none",
                        }}
                    />
                </div>

                {/* =========================
                    CATEGORY
                ========================= */}

                <div>
                    <label
                        htmlFor="product-category"
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                        }}
                    >
                        Category
                    </label>

                    <select
                        id="product-category"
                        value={category}
                        onChange={(event) =>
                            setCategory(
                                event.target.value
                            )
                        }
                        disabled={
                            categoriesLoading
                        }
                        style={{
                            width: "100%",
                            padding:
                                "12px 14px",
                            border:
                                "1px solid #ccc",
                            borderRadius:
                                "8px",
                            fontSize:
                                "15px",
                            background:
                                "#fff",
                            cursor:
                                categoriesLoading
                                    ? "not-allowed"
                                    : "pointer",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <option value="">
                            All categories
                        </option>

                        {categories.map(
                            (item) => (
                                <option
                                    key={item}
                                    value={item}
                                >
                                    {item}
                                </option>
                            )
                        )}
                    </select>
                </div>

                {/* =========================
                    SORT
                ========================= */}

                <div>
                    <label
                        htmlFor="product-sort"
                        style={{
                            display: "block",
                            marginBottom: "7px",
                            fontWeight: "600",
                        }}
                    >
                        Sort by
                    </label>

                    <select
                        id="product-sort"
                        value={sort}
                        onChange={(event) =>
                            setSort(
                                event.target.value
                            )
                        }
                        style={{
                            width: "100%",
                            padding:
                                "12px 14px",
                            border:
                                "1px solid #ccc",
                            borderRadius:
                                "8px",
                            fontSize:
                                "15px",
                            background:
                                "#fff",
                            cursor:
                                "pointer",
                            boxSizing:
                                "border-box",
                        }}
                    >
                        <option value="newest">
                            Newest
                        </option>

                        <option value="oldest">
                            Oldest
                        </option>

                        <option value="price_asc">
                            Price: Low to High
                        </option>

                        <option value="price_desc">
                            Price: High to Low
                        </option>

                        <option value="name_asc">
                            Name: A to Z
                        </option>

                        <option value="name_desc">
                            Name: Z to A
                        </option>
                    </select>
                </div>
            </div>

            {/* =========================
                FILTER STATUS
            ========================= */}

            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems: "center",
                    gap: "15px",
                    flexWrap: "wrap",
                    marginBottom: "20px",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        color: "#666",
                    }}
                >
                    {loading
                        ? "Loading products..."
                        : products.length === 1
                            ? "1 product found"
                            : `${products.length} products found`}
                </p>

                {hasFilters && (
                    <button
                        type="button"
                        onClick={
                            clearFilters
                        }
                        style={{
                            padding:
                                "9px 14px",
                            border:
                                "1px solid #ccc",
                            borderRadius:
                                "8px",
                            background:
                                "#fff",
                            cursor:
                                "pointer",
                        }}
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* =========================
                LOADING
            ========================= */}

            {loading ? (
                <div
                    style={{
                        padding:
                            "50px 20px",
                        textAlign:
                            "center",
                    }}
                >
                    <p>
                        Loading products...
                    </p>
                </div>
            ) : products.length === 0 ? (
                /* =========================
                   NO PRODUCTS
                ========================= */

                <div
                    style={{
                        padding:
                            "50px 20px",
                        textAlign:
                            "center",
                        border:
                            "1px solid #e5e5e5",
                        borderRadius:
                            "12px",
                        background:
                            "#fff",
                    }}
                >
                    <h2>
                        No products found
                    </h2>

                    <p
                        style={{
                            color:
                                "#666",
                        }}
                    >
                        Try changing your
                        search or filters.
                    </p>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={
                                clearFilters
                            }
                            style={{
                                marginTop:
                                    "10px",
                                padding:
                                    "10px 18px",
                                border:
                                    "none",
                                borderRadius:
                                    "8px",
                                background:
                                    "#000",
                                color:
                                    "#fff",
                                cursor:
                                    "pointer",
                            }}
                        >
                            Clear filters
                        </button>
                    )}
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
                            "repeat(auto-fill, minmax(350px, 1fr))",
                        gap: "20px",
                    }}
                >
                    {products.map(
                        (product) => (
                            <ProductListCard
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

export default Products;