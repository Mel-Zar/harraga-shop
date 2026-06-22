import { useState } from "react";
import ProductGallery from "../ProductGallery/ProductGallery";

function ProductEdit({
    product,
    onSave,
    onCancel,
}) {
    const [editData, setEditData] = useState({
        ...product,
    });

    const [editImages, setEditImages] = useState([]);

    const [removedImages, setRemovedImages] = useState([]);

    const [newImagePreviews, setNewImagePreviews] = useState([]);

    const handleSave = () => {
        const formData = new FormData();

        Object.entries(editData).forEach(([key, value]) => {
            if (key !== "images" && key !== "_id") {
                formData.append(key, value);
            }
        });

        formData.append(
            "removedImages",
            JSON.stringify(removedImages)
        );

        editImages.forEach((image) => {
            formData.append("images", image);
        });

        onSave(product._id, formData);
    };

    return (
        <>
            <h3>
                <input
                    value={editData.name || ""}
                    onChange={(e) =>
                        setEditData({
                            ...editData,
                            name: e.target.value,
                        })
                    }
                />
            </h3>

            <textarea
                value={editData.description || ""}
                onChange={(e) =>
                    setEditData({
                        ...editData,
                        description: e.target.value,
                    })
                }
            />

            <p>
                Price:
                <input
                    type="number"
                    value={editData.price || ""}
                    onChange={(e) =>
                        setEditData({
                            ...editData,
                            price: e.target.value,
                        })
                    }
                />
            </p>

            <p>
                Category:
                <input
                    value={editData.category || ""}
                    onChange={(e) =>
                        setEditData({
                            ...editData,
                            category: e.target.value,
                        })
                    }
                />
            </p>

            <p>
                Stock:
                <input
                    type="number"
                    value={editData.stock || 0}
                    onChange={(e) =>
                        setEditData({
                            ...editData,
                            stock: e.target.value,
                        })
                    }
                />
            </p>

            {/* BEFINTLIGA BILDER (nu via ProductGallery) */}
            <ProductGallery
                images={editData.images}
                productName={editData.name}
                onRemove={(img) => {
                    setRemovedImages((prev) => [...prev, img]);

                    setEditData({
                        ...editData,
                        images: editData.images.filter(
                            (image) => image !== img
                        ),
                    });
                }}
            />

            {/* NYA BILDER (preview + upload) */}
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                }}
            >
                {newImagePreviews.map((image, index) => (
                    <div
                        key={index}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "120px",
                        }}
                    >
                        <img
                            src={image.preview}
                            alt=""
                            style={{
                                width: "120px",
                                height: "250px",
                                objectFit: "cover",
                            }}
                        />

                        <button
                            type="button"
                            style={{
                                marginTop: "10px",
                                width: "100%",
                            }}
                            onClick={() => {
                                const updated = newImagePreviews.filter(
                                    (_, i) => i !== index
                                );

                                setNewImagePreviews(updated);

                                setEditImages(
                                    updated.map((item) => item.file)
                                );
                            }}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>

            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                    const files = Array.from(e.target.files);

                    const newPreviews = files.map((file) => ({
                        file,
                        preview: URL.createObjectURL(file),
                    }));

                    setEditImages((prev) => [...prev, ...files]);

                    setNewImagePreviews((prev) => [
                        ...prev,
                        ...newPreviews,
                    ]);
                }}
            />

            <br />
            <br />

            <button onClick={handleSave}>Save</button>{" "}

            <button onClick={onCancel}>Cancel</button>
        </>
    );
}

export default ProductEdit; 