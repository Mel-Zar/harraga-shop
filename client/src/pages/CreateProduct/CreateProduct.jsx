import { useNavigate } from "react-router-dom";
import ProductForm from "../../components/ProductForm/ProductForm";
import { createProduct } from "../../services/productService";

function CreateProduct() {
    const navigate = useNavigate();

    const handleCreate = async (formData) => {
        try {
            await createProduct(formData);
            navigate("/products");
        } catch (error) {
            console.error("Create product failed:", error);
        }
    };

    return (
        <ProductForm
            onSubmit={handleCreate}
        />
    );
}

export default CreateProduct;