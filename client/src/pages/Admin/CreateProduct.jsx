import { useEffect, useState } from "react";

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

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CREATE PRODUCT
    // =========================
    const handleCreate = async (formData) => {
        try {
            const newProduct = await createProduct(formData);

            setProducts((prev) => [
                newProduct,
                ...prev,
            ]);
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message ||
                error.message ||
                "Failed to create product"
            );
        }
    };

    // =========================
    // DELETE PRODUCT
    // =========================
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Delete product?"
        );

        if (!confirmed) return;

        try {
            await deleteProduct(id);

            setProducts((prev) =>
                prev.filter(
                    (product) => product._id !== id
                )
            );
        } catch (error) {
            console.error(error);
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

            setProducts((prev) =>
                prev.map((product) =>
                    product._id === productId
                        ? updatedProduct
                        : product
                )
            );

            setEditingId(null);
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return <h2>Loading products...</h2>;
    }

    return (
        <div>
            <h1>Create Product</h1>

            <ProductForm
                onSubmit={handleCreate}
            />

            <hr />

            <h2>Existing Products</h2>

            {products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                products.map((product) => (
                    <div
                        key={product._id}
                        style={{
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "8px",
                        }}
                    >
                        {editingId ===
                            product._id ? (
                            <ProductEdit
                                product={product}
                                onSave={handleSave}
                                onCancel={() =>
                                    setEditingId(null)
                                }
                            />
                        ) : (
                            <ProductCard
                                product={product}
                                onEdit={() =>
                                    setEditingId(
                                        product._id
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
                ))
            )}
        </div>
    );
}

export default CreateProduct;