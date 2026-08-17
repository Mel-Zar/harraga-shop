import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import ProductForm from "../../components/ProductForm/ProductForm";
import ProductCard from "../../components/ProductCard/ProductCard";
import ProductEdit from "../../components/ProductEdit/ProductEdit";

import {
    createProduct,
    getProducts,
    deleteProduct,
    updateProduct,
} from "../../services/productService";

function CreateProduct() {
    const [products, setProducts] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);

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

        } finally {
            setLoading(false);
        }
    };

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

        } catch (error) {
            console.error(
                "CREATE PRODUCT ERROR:",
                error
            );

            alert(
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

        } catch (error) {
            console.error(
                "DELETE PRODUCT ERROR:",
                error
            );

            alert(
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

        } catch (error) {
            console.error(
                "UPDATE PRODUCT ERROR:",
                error
            );

            alert(
                error.response
                    ?.data
                    ?.message ||
                error.message ||
                "Failed to update product"
            );
        }
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
                    padding: "20px",
                }}
            >
                <h2>
                    Loading products...
                </h2>
            </div>
        );
    }

    return (
        <div>
            <h1>
                Create Product
            </h1>

            {/* =========================
                CREATE PRODUCT FORM
            ========================= */}
            <ProductForm
                onSubmit={
                    handleCreate
                }
            />

            <hr />

            {/* =========================
                EXISTING PRODUCTS
            ========================= */}
            <h2>
                Existing Products
            </h2>

            {products.length ===
                0 ? (
                <p>
                    No products found.
                </p>
            ) : (
                products.map(
                    (product) => (
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
                            }}
                        >
                            {/* =========================
                                EDIT PRODUCT
                            ========================= */}
                            {editingId ===
                                product._id ? (
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
                                    onEdit={() => {
                                        setEditingId(
                                            product._id
                                        );

                                        setSearchParams(
                                            {
                                                edit: product._id,
                                            }
                                        );
                                    }}
                                    onDelete={() =>
                                        handleDelete(
                                            product._id
                                        )
                                    }
                                />
                            )}
                        </div>
                    )
                )
            )}
        </div>
    );
}

export default CreateProduct;