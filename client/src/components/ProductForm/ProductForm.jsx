import { useState } from "react";
import { toast } from "react-toastify";

function ProductForm({ onSubmit }) {
    const [name, setName] = useState("");
    const [description, setDescription] =
        useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] =
        useState("");
    const [stock, setStock] = useState("");

    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] =
        useState([]);

    const handleSubmit = (e) => {
        e.preventDefault();

        // =========================
        // REQUIRED FIELDS
        // =========================

        if (!name.trim()) {
            toast.error(
                "Product name is required."
            );
            return;
        }

        if (!description.trim()) {
            toast.error(
                "Description is required."
            );
            return;
        }

        if (!category.trim()) {
            toast.error(
                "Category is required."
            );
            return;
        }

        // =========================
        // PRICE VALIDATION
        // =========================

        if (
            price === "" ||
            !Number.isFinite(
                Number(price)
            ) ||
            Number(price) < 0
        ) {
            toast.error(
                "Please enter a valid price."
            );
            return;
        }

        // =========================
        // STOCK VALIDATION
        // =========================

        if (
            stock === "" ||
            !Number.isFinite(
                Number(stock)
            ) ||
            Number(stock) < 0 ||
            !Number.isInteger(
                Number(stock)
            )
        ) {
            toast.error(
                "Please enter a valid stock amount."
            );
            return;
        }

        // =========================
        // IMAGE VALIDATION
        // =========================

        if (images.length === 0) {
            toast.error(
                "Please upload at least one product image."
            );
            return;
        }

        if (images.length > 4) {
            toast.error(
                "You can only upload 4 images."
            );
            return;
        }

        // =========================
        // CREATE FORM DATA
        // =========================

        const formData = new FormData();

        formData.append(
            "name",
            name.trim()
        );

        formData.append(
            "description",
            description.trim()
        );

        formData.append(
            "price",
            price
        );

        formData.append(
            "category",
            category.trim()
        );

        formData.append(
            "stock",
            stock
        );

        images.forEach((image) => {
            formData.append(
                "images",
                image
            );
        });

        // =========================
        // SUBMIT
        // =========================

        onSubmit(formData);

        // =========================
        // RESET FORM
        // =========================

        setName("");
        setDescription("");
        setPrice("");
        setCategory("");
        setStock("");

        setImages([]);
        setImagePreviews([]);
    };

    const handleImageChange = (e) => {
        const files = Array.from(
            e.target.files || []
        );

        if (files.length === 0) {
            return;
        }

        // =========================
        // CHECK IMAGE TYPE
        // =========================

        const invalidFile =
            files.find(
                (file) =>
                    !file.type.startsWith(
                        "image/"
                    )
            );

        if (invalidFile) {
            toast.error(
                "Only image files are allowed."
            );

            e.target.value = "";

            return;
        }

        // =========================
        // CHECK IMAGE COUNT
        // =========================

        const totalImages =
            images.length +
            files.length;

        if (totalImages > 4) {
            toast.error(
                `You can only upload 4 images. You already have ${images.length} selected.`
            );

            e.target.value = "";

            return;
        }

        // =========================
        // CREATE PREVIEWS
        // =========================

        const previews =
            files.map((file) => ({
                file,
                preview:
                    URL.createObjectURL(
                        file
                    ),
            }));

        setImages((prev) => [
            ...prev,
            ...files,
        ]);

        setImagePreviews((prev) => [
            ...prev,
            ...previews,
        ]);

        e.target.value = "";
    };

    const handleRemoveImage = (index) => {
        const previewToRemove =
            imagePreviews[index];

        if (previewToRemove?.preview) {
            URL.revokeObjectURL(
                previewToRemove.preview
            );
        }

        setImagePreviews((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );

        setImages((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };

    return (
        <form
            onSubmit={handleSubmit}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                maxWidth: "600px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                marginBottom: "20px",
            }}
        >
            <input
                type="text"
                placeholder="Product name"
                value={name}
                onChange={(e) =>
                    setName(
                        e.target.value
                    )
                }
                required
                style={{
                    padding: "10px",
                }}
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
                style={{
                    padding: "10px",
                    minHeight: "100px",
                }}
            />

            <input
                type="number"
                placeholder="Price"
                value={price}
                min="0"
                step="0.01"
                onChange={(e) =>
                    setPrice(
                        e.target.value
                    )
                }
                required
                style={{
                    padding: "10px",
                }}
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
                style={{
                    padding: "10px",
                }}
            />

            <input
                type="number"
                placeholder="Stock"
                value={stock}
                min="0"
                onChange={(e) =>
                    setStock(
                        e.target.value
                    )
                }
                required
                style={{
                    padding: "10px",
                }}
            />

            <p
                style={{
                    margin: 0,
                    fontSize: "14px",
                }}
            >
                Max 4 images (
                {images.length}/4)
            </p>

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={
                    handleImageChange
                }
            />

            {imagePreviews.length >
                0 && (
                    <div
                        style={{
                            display:
                                "flex",
                            gap: "10px",
                            flexWrap:
                                "wrap",
                            marginTop:
                                "10px",
                        }}
                    >
                        {imagePreviews.map(
                            (
                                image,
                                index
                            ) => (
                                <div
                                    key={
                                        index
                                    }
                                    style={{
                                        display:
                                            "flex",
                                        flexDirection:
                                            "column",
                                        alignItems:
                                            "center",
                                    }}
                                >
                                    <img
                                        src={
                                            image.preview
                                        }
                                        alt=""
                                        style={{
                                            width:
                                                "120px",
                                            height:
                                                "120px",
                                            objectFit:
                                                "cover",
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "8px",
                                        }}
                                    />

                                    <button
                                        type="button"
                                        style={{
                                            marginTop:
                                                "5px",
                                            padding:
                                                "5px 10px",
                                            cursor:
                                                "pointer",
                                        }}
                                        onClick={() =>
                                            handleRemoveImage(
                                                index
                                            )
                                        }
                                    >
                                        Remove
                                    </button>
                                </div>
                            )
                        )}
                    </div>
                )}

            <button
                type="submit"
                style={{
                    padding:
                        "12px",
                    cursor:
                        "pointer",
                    fontWeight:
                        "bold",
                }}
            >
                Save Product
            </button>
        </form>
    );
}

export default ProductForm;