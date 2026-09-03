import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useSearchParams,
} from "react-router-dom";

import ProductForm from "../../components/ProductForm/ProductForm";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductEdit from "../../components/ProductEdit/ProductEdit";

import {
    createProduct,
    getProducts,
    deleteProduct,
    updateProduct,
} from "../../services/productService";

import { toast } from "react-toastify";

function CreateProduct() {
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

    // =========================
    // SEARCH
    // =========================
    const [search, setSearch] = useState("");

    // =========================
    // URL SEARCH PARAMS
    // =========================
    const [searchParams, setSearchParams] =
        useSearchParams();

    // =========================
    // GET PRODUCTS
    // =========================
    useEffect(() => {
        fetchProducts();
    }, []);

    // =========================
    // OPEN PRODUCT FROM URL
    // =========================
    useEffect(() => {
        const editId =
            searchParams.get("edit");

        // Om det inte finns ?edit=
        // ska vi inte redigera någon produkt
        if (!editId) {
            setEditingId(null);
            return;
        }

        // Vänta tills produkterna har laddats
        if (loading) {
            return;
        }

        // Leta efter produkten
        const productExists =
            products.some(
                (product) =>
                    product._id === editId
            );

        if (productExists) {
            setEditingId(editId);
        } else {
            // Om produkten inte finns
            setEditingId(null);

            // Ta bort felaktigt edit-id från URL
            setSearchParams({});
        }
    }, [
        searchParams,
        products,
        loading,
        setSearchParams,
    ]);

    // =========================
    // FETCH PRODUCTS
    // =========================
    const fetchProducts = async () => {
        try {
            setLoading(true);

            const data =
                await getProducts();

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

            setProducts([]);

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to load products."
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================
    // SEARCH PRODUCTS
    // =========================
    const filteredProducts =
        useMemo(() => {
            const text =
                search
                    .toLowerCase()
                    .trim();

            if (!text) {
                return products;
            }

            return products.filter(
                (product) =>
                    product.name
                        ?.toLowerCase()
                        .includes(text) ||

                    product.category
                        ?.toLowerCase()
                        .includes(text) ||

                    product.description
                        ?.toLowerCase()
                        .includes(text)
            );
        }, [
            products,
            search,
        ]);

    // =========================
    // CREATE PRODUCT
    // =========================
    const handleCreate = async (
        formData
    ) => {
        try {
            const newProduct =
                await createProduct(
                    formData
                );

            setProducts(
                (prev) => [
                    newProduct,
                    ...prev,
                ]
            );

            toast.success(
                "Product created successfully!"
            );

        } catch (error) {
            console.error(
                "CREATE PRODUCT ERROR:",
                error
            );

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to create product"
            );
        }
    };

    // =========================
    // DELETE PRODUCT
    // =========================
    const handleDelete = async (
        id
    ) => {
        const confirmed =
            window.confirm(
                "Delete product?"
            );

        if (!confirmed) return;

        try {
            await deleteProduct(
                id
            );

            setProducts(
                (prev) =>
                    prev.filter(
                        (product) =>
                            product._id !==
                            id
                    )
            );

            // Om produkten som tas bort
            // är den som redigeras
            if (
                editingId === id
            ) {
                setEditingId(null);

                setSearchParams({});
            }

            toast.success(
                "Product deleted successfully!"
            );

        } catch (error) {
            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to delete product"
            );
        }
    };

    // =========================
    // UPDATE PRODUCT
    // =========================
    const handleSave = async (
        productId,
        formData
    ) => {
        try {
            const updatedProduct =
                await updateProduct(
                    productId,
                    formData
                );

            setProducts(
                (prev) =>
                    prev.map(
                        (product) =>
                            product._id ===
                                productId
                                ? updatedProduct
                                : product
                    )
            );

            setEditingId(null);

            // Ta bort ?edit=...
            // från URL
            setSearchParams({});

            toast.success(
                "Product updated successfully!"
            );

        } catch (error) {
            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );

            toast.error(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to update product"
            );
        }
    };

    // =========================
    // START EDIT
    // =========================
    const handleEdit = (
        product
    ) => {
        setEditingId(
            product._id
        );

        setSearchParams({
            edit: product._id,
        });
    };

    // =========================
    // CANCEL EDIT
    // =========================
    const handleCancelEdit = () => {
        setEditingId(null);

        // Ta bort ?edit=...
        setSearchParams({});
    };

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div
                style={{
                    maxWidth:
                        "1200px",
                    margin:
                        "40px auto",
                    padding:
                        "20px",
                }}
            >
                <h2>
                    Loading products...
                </h2>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth:
                    "1200px",
                margin:
                    "40px auto",
                padding:
                    "20px",
            }}
        >

            {/* =========================
                HEADER
            ========================= */}

            <div
                style={{
                    marginBottom:
                        "30px",
                }}
            >
                <h1>
                    Create Product
                </h1>

                <p
                    style={{
                        color:
                            "#666",
                    }}
                >
                    Create new products or
                    edit existing products.
                </p>
            </div>

            {/* =========================
                CREATE PRODUCT FORM
            ========================= */}

            <ProductForm
                onSubmit={
                    handleCreate
                }
            />

            <hr
                style={{
                    margin:
                        "40px 0",
                    border:
                        "none",
                    borderTop:
                        "1px solid #ddd",
                }}
            />

            {/* =========================
                EXISTING PRODUCTS HEADER
            ========================= */}

            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    gap:
                        "20px",
                    flexWrap:
                        "wrap",
                    marginBottom:
                        "25px",
                }}
            >
                <div>

                    <h2
                        style={{
                            margin:
                                "0 0 6px",
                        }}
                    >
                        Existing Products
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color:
                                "#666",
                        }}
                    >
                        Search for a product
                        to edit or delete it.
                    </p>

                </div>

                <div>
                    <strong>
                        Total products:
                    </strong>{" "}
                    {products.length}
                </div>
            </div>

            {/* =========================
                SEARCH
            ========================= */}

            <div
                style={{
                    marginBottom:
                        "25px",
                }}
            >
                <input
                    type="text"
                    placeholder="Search product name, category or description..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    style={{
                        width:
                            "100%",
                        maxWidth:
                            "600px",
                        padding:
                            "12px",
                        border:
                            "1px solid #ccc",
                        borderRadius:
                            "8px",
                        fontSize:
                            "16px",
                        boxSizing:
                            "border-box",
                    }}
                />
            </div>

            {/* =========================
                COUNT
            ========================= */}

            <p>
                Showing{" "}
                <strong>
                    {
                        filteredProducts.length
                    }
                </strong>{" "}
                of{" "}
                <strong>
                    {products.length}
                </strong>{" "}
                products
            </p>

            {/* =========================
                EMPTY
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
                            : "Try another search."}
                    </p>

                </div>

            ) : (

                /* =========================
                   PRODUCTS
                ========================= */

                <div>

                    {filteredProducts.map(
                        (product) => {

                            const isEditing =
                                editingId ===
                                product._id;

                            return (
                                <div
                                    key={
                                        product._id
                                    }
                                    style={{
                                        border:
                                            "1px solid #ddd",
                                        padding:
                                            "15px",
                                        marginBottom:
                                            "15px",
                                        borderRadius:
                                            "8px",
                                        background:
                                            "#fff",
                                    }}
                                >

                                    {/* =========================
                                        EDIT PRODUCT
                                    ========================= */}

                                    {isEditing ? (

                                        <ProductEdit
                                            product={
                                                product
                                            }
                                            onSave={
                                                handleSave
                                            }
                                            onCancel={
                                                handleCancelEdit
                                            }
                                        />

                                    ) : (

                                        /* =========================
                                            PRODUCT CARD
                                        ========================= */

                                        <ProductCard
                                            product={
                                                product
                                            }
                                            onEdit={() =>
                                                handleEdit(
                                                    product
                                                )
                                            }
                                            onDelete={() =>
                                                handleDelete(
                                                    product._id
                                                )
                                            }
                                        />

                                    )}

                                </div>
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
}

export default CreateProduct;