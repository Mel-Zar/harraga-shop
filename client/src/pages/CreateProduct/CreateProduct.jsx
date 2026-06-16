import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm/ProductForm";
import { createProduct } from "../../services/productService";

function CreateProduct() {
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        try {
            const product = await createProduct(formData);

            console.log("✅ Product created:", product);

            navigate("/products");
        } catch (error) {
            console.error("❌ Create product failed:", error);

            alert(
                error.message ||
                "Failed to create product"
            );
        }
    };

    return (
        <ProductForm
            onSubmit={handleCreate}
        />
    );
}

export default CreateProduct;