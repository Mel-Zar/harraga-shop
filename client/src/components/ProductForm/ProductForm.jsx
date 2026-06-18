import { useState } from "react";

function ProductForm({ onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] =
        useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] =
        useState("");
    const [stock, setStock] = useState(0);
    const [images, setImages] = useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();

        formData.append("name", name);
        formData.append(
            "description",
            description
        );
        formData.append("price", price);
        formData.append(
            "category",
            category
        );
        formData.append("stock", stock);

        Array.from(images).forEach((image) => {
            formData.append("images", image);
        });

        onSubmit(formData);

        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setStock(0);
        setImages([]);
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
                required
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) =>
                    setDescription(
                        e.target.value
                    )
                }
                required
            />

            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) =>
                    setPrice(e.target.value)
                }
                required
            />

            <input
                type="text"
                placeholder="Category"
                value={category}
                onChange={(e) =>
                    setCategory(
                        e.target.value
                    )
                }
                required
            />

            <input
                type="number"
                placeholder="Stock"
                value={stock}
                onChange={(e) =>
                    setStock(e.target.value)
                }
            />

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) =>
                    setImages(
                        e.target.files
                    )
                }
            />

            <button type="submit">
                Save Product
            </button>
        </form>
    );
}

export default ProductForm;