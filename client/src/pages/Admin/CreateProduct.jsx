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


    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        let mounted = true;

        const fetchProducts = async () => {
            try {
                const data = await getProducts();

                if (mounted) {
                    setProducts(data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchProducts();

        return () => {
            mounted = false;
        };
    }, []);

    const handleCreate = async (formData) => {
        try {
            await createProduct(formData);

            await loadProducts();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Failed to create product"
            );
        }
    };

    const handleDelete = async (id) => {
        const confirmed =
            window.confirm("Delete product?");

        if (!confirmed) return;

        try {
            await deleteProduct(id);

            await loadProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleSave = async (
        productId,
        formData
    ) => {
        try {
            await updateProduct(
                productId,
                formData
            );

            setEditingId(null);

            await loadProducts();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Create Product</h1>

            <ProductForm
                onSubmit={handleCreate}
            />

            <hr />

            <h2>Existing Products</h2>

            {products.map((product) => (
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
            ))}
        </div>
    );

}

export default CreateProduct;
