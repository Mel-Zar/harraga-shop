import { useState } from "react";

function ProductForm({ onSubmit }) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("name", name);
        formData.append("price", price);

        Array.from(images).forEach((image) => {
            formData.append("images", image);
        });

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
            />

            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) =>
                    setPrice(e.target.value)
                }
            />

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                    setImages(e.target.files)
                }
            />

            <button type="submit">
                Save Product
            </button>
        </form>
    );
}

export default ProductForm;