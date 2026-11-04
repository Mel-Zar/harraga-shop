
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

import "./Products.scss";

function Products() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [sort, setSort] = useState("newest");

    const [loading, setLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // =====================================================
    // GET CATEGORIES
    // =====================================================

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);

                const data = await getProductCategories();

                setCategories(
                    Array.isArray(data) ? data : []
                );
            } catch (error) {
                console.error("GET CATEGORIES ERROR:", error);

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

    // =====================================================
    // GET PRODUCTS
    // =====================================================

    useEffect(() => {
        let isActive = true;

        const fetchProducts = async () => {
            try {
                setLoading(true);

                const data = await getProducts({
                    search,
                    category,
                    sort,
                });

                if (isActive) {
                    setProducts(
                        Array.isArray(data) ? data : []
                    );
                }
            } catch (error) {
                if (isActive) {
                    console.error("GET PRODUCTS ERROR:", error);

                    toast.error(
                        error?.response?.data?.message ||
                        error?.message ||
                        "Failed to load products. Please try again."
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        // DEBOUNCE SEARCH

        const timer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, [search, category, sort]);

    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    const clearFilters = () => {
        setSearch("");
        setCategory("");
        setSort("newest");
    };

    const hasFilters =
        search.trim() !== "" ||
        category !== "" ||
        sort !== "newest";

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <main className="products-page">

            <div className="products-page__inner">

                {/* PAGE HEADER */}

                <header className="products-page__header">
                    <span className="products-page__eyebrow">
                        HARRAGA SHOP COLLECTION
                    </span>

                    <h1 className="products-page__title">
                        Our <span className="chrome-text">Products</span>
                    </h1>

                    <p className="products-page__subtitle">
                        Browse our products and find exactly what
                        you are looking for.
                    </p>
                </header>

                {/* FILTER BAR */}

                <section
                    className="products-page__filters"
                    aria-label="Product filters"
                >

                    {/* SEARCH */}

                    <div className="products-page__field products-page__search">
                        <label htmlFor="product-search">
                            Search Products
                        </label>

                        <input
                            id="product-search"
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search products..."
                            autoComplete="off"
                        />
                    </div>

                    {/* CATEGORY */}

                    <div className="products-page__field">
                        <label htmlFor="product-category">
                            Category
                        </label>

                        <select
                            id="product-category"
                            value={category}
                            onChange={(event) =>
                                setCategory(event.target.value)
                            }
                            disabled={categoriesLoading}
                        >
                            <option value="">
                                {categoriesLoading
                                    ? "Loading categories..."
                                    : "All categories"}
                            </option>

                            {categories.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* SORT */}

                    <div className="products-page__field">
                        <label htmlFor="product-sort">
                            Sort By
                        </label>

                        <select
                            id="product-sort"
                            value={sort}
                            onChange={(event) =>
                                setSort(event.target.value)
                            }
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
                </section>

                {/* FILTER STATUS */}

                <div className="products-page__toolbar">

                    <p
                        className="products-page__count"
                        aria-live="polite"
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
                            className="products-page__clear"
                            onClick={clearFilters}
                        >
                            Clear Filters
                            <span aria-hidden="true"> ×</span>
                        </button>
                    )}
                </div>

                {/* LOADING */}

                {loading ? (
                    <div
                        className="products-page__message"
                        role="status"
                    >
                        <span className="products-page__loader" />
                        <h2>Loading Products</h2>
                        <p>Please wait while we load our collection.</p>
                    </div>
                ) : products.length === 0 ? (

                    /* NO PRODUCTS */

                    <div className="products-page__message">
                        <span
                            className="products-page__empty-icon"
                            aria-hidden="true"
                        >
                            ◇
                        </span>

                        <h2>No Products Found</h2>

                        <p>
                            Try changing your search or filters
                            to find what you are looking for.
                        </p>

                        {hasFilters && (
                            <button
                                type="button"
                                className="products-page__empty-button"
                                onClick={clearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                ) : (

                    /* PRODUCTS GRID */

                    <section
                        className="products-page__grid"
                        aria-label="Products"
                    >
                        {products.map((product) => (
                            <ProductListCard
                                key={product._id}
                                product={product}
                            />
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}

export default Products;
