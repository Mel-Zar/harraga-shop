import { useEffect, useState } from "react";
import ProductGallery from "../ProductGallery/ProductGallery";

function ProductEdit({
    product,
    onSave,
    onCancel,
}) {
    const [editData, setEditData] =
        useState({
            ...product,
            images: Array.isArray(
                product?.images
            )
                ? product.images
                : product?.image
                    ? [product.image]
                    : [],
        });

    const [editImages, setEditImages] =
        useState([]);

    const [removedImages, setRemovedImages] =
        useState([]);

    const [newImagePreviews, setNewImagePreviews] =
        useState([]);

    const [saving, setSaving] =
        useState(false);

    // =========================
    // UPDATE WHEN PRODUCT CHANGES
    // =========================
    useEffect(() => {
        const existingImages =
            Array.isArray(
                product?.images
            )
                ? product.images
                : product?.image
                    ? [product.image]
                    : [];

        setEditData({
            ...product,
            images: existingImages,
        });

        setEditImages([]);
        setRemovedImages([]);
        setNewImagePreviews([]);
        setSaving(false);
    }, [product]);

    // =========================
    // CHANGE FIELD
    // =========================
    const handleChange = (
        field,
        value
    ) => {
        setEditData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =========================
    // REMOVE EXISTING IMAGE
    // =========================
    const handleRemoveExistingImage = (
        img
    ) => {
        if (!img) {
            return;
        }

        setRemovedImages((prev) => {
            if (prev.includes(img)) {
                return prev;
            }

            return [
                ...prev,
                img,
            ];
        });

        setEditData((prev) => ({
            ...prev,
            images: (
                prev.images || []
            ).filter(
                (image) =>
                    image !== img
            ),
        }));
    };

    // =========================
    // ADD NEW IMAGES
    // =========================
    const handleNewImages = (e) => {
        const files = Array.from(
            e.target.files || []
        );

        if (files.length === 0) {
            return;
        }

        const existingCount =
            editData.images?.length ||
            0;

        const newCount =
            editImages.length;

        const totalAfterUpload =
            existingCount +
            newCount +
            files.length;

        if (
            totalAfterUpload >
            4
        ) {
            const available =
                4 -
                existingCount -
                newCount;

            alert(
                available > 0
                    ? `You can only add ${available} more image${available === 1 ? "" : "s"}. Maximum is 4 images.`
                    : "You already have 4 images."
            );

            e.target.value = "";

            return;
        }

        const newPreviews =
            files.map((file) => ({
                file,
                preview:
                    URL.createObjectURL(
                        file
                    ),
            }));

        setEditImages((prev) => [
            ...prev,
            ...files,
        ]);

        setNewImagePreviews(
            (prev) => [
                ...prev,
                ...newPreviews,
            ]
        );

        e.target.value = "";
    };

    // =========================
    // REMOVE NEW IMAGE
    // =========================
    const handleRemoveNewImage = (
        index
    ) => {
        const image =
            newImagePreviews[index];

        if (image?.preview) {
            URL.revokeObjectURL(
                image.preview
            );
        }

        setNewImagePreviews(
            (prev) =>
                prev.filter(
                    (_, i) =>
                        i !== index
                )
        );

        setEditImages(
            (prev) =>
                prev.filter(
                    (_, i) =>
                        i !== index
                )
        );
    };

    // =========================
    // SAVE
    // =========================
    const handleSave = async () => {
        if (!editData.name?.trim()) {
            alert(
                "Product name is required."
            );
            return;
        }

        if (
            !editData.description?.trim()
        ) {
            alert(
                "Description is required."
            );
            return;
        }

        if (
            !editData.category?.trim()
        ) {
            alert(
                "Category is required."
            );
            return;
        }

        if (
            editData.price === "" ||
            Number(editData.price) <
            0
        ) {
            alert(
                "Please enter a valid price."
            );
            return;
        }

        if (
            editData.stock === "" ||
            Number(editData.stock) <
            0
        ) {
            alert(
                "Please enter a valid stock."
            );
            return;
        }

        const existingImages =
            editData.images || [];

        const totalImages =
            existingImages.length +
            editImages.length;

        if (totalImages > 4) {
            alert(
                "A product can have a maximum of 4 images."
            );
            return;
        }

        try {
            setSaving(true);

            const formData =
                new FormData();

            Object.entries(
                editData
            ).forEach(
                ([key, value]) => {
                    if (
                        key !==
                        "images" &&
                        key !==
                        "_id" &&
                        key !==
                        "__v" &&
                        key !==
                        "createdAt" &&
                        key !==
                        "updatedAt"
                    ) {
                        formData.append(
                            key,
                            value ?? ""
                        );
                    }
                }
            );

            formData.append(
                "removedImages",
                JSON.stringify(
                    removedImages
                )
            );

            editImages.forEach(
                (image) => {
                    formData.append(
                        "images",
                        image
                    );
                }
            );

            await onSave(
                product._id,
                formData
            );
        } catch (error) {
            console.error(
                "PRODUCT EDIT SAVE ERROR:",
                error
            );
        } finally {
            setSaving(false);
        }
    };

    // =========================
    // CLEAN UP PREVIEWS
    // =========================
    useEffect(() => {
        return () => {
            newImagePreviews.forEach(
                (image) => {
                    if (
                        image?.preview
                    ) {
                        URL.revokeObjectURL(
                            image.preview
                        );
                    }
                }
            );
        };
    }, [newImagePreviews]);

    return (
        <div
            style={{
                padding: "10px",
            }}
        >
            <h3>
                Edit Product
            </h3>

            {/* =========================
                NAME
            ========================= */}
            <p>
                <strong>
                    Name:
                </strong>

                <input
                    type="text"
                    value={
                        editData.name ||
                        ""
                    }
                    onChange={(e) =>
                        handleChange(
                            "name",
                            e.target.value
                        )
                    }
                    style={{
                        display:
                            "block",
                        width:
                            "100%",
                        padding:
                            "10px",
                        marginTop:
                            "5px",
                        boxSizing:
                            "border-box",
                    }}
                />
            </p>

            {/* =========================
                DESCRIPTION
            ========================= */}
            <p>
                <strong>
                    Description:
                </strong>

                <textarea
                    value={
                        editData.description ||
                        ""
                    }
                    onChange={(e) =>
                        handleChange(
                            "description",
                            e.target.value
                        )
                    }
                    style={{
                        display:
                            "block",
                        width:
                            "100%",
                        minHeight:
                            "100px",
                        padding:
                            "10px",
                        marginTop:
                            "5px",
                        boxSizing:
                            "border-box",
                    }}
                />
            </p>

            {/* =========================
                PRICE
            ========================= */}
            <p>
                <strong>
                    Price:
                </strong>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                        editData.price ??
                        ""
                    }
                    onChange={(e) =>
                        handleChange(
                            "price",
                            e.target.value
                        )
                    }
                    style={{
                        display:
                            "block",
                        padding:
                            "10px",
                        marginTop:
                            "5px",
                    }}
                />
            </p>

            {/* =========================
                CATEGORY
            ========================= */}
            <p>
                <strong>
                    Category:
                </strong>

                <input
                    type="text"
                    value={
                        editData.category ||
                        ""
                    }
                    onChange={(e) =>
                        handleChange(
                            "category",
                            e.target.value
                        )
                    }
                    style={{
                        display:
                            "block",
                        padding:
                            "10px",
                        marginTop:
                            "5px",
                    }}
                />
            </p>

            {/* =========================
                STOCK
            ========================= */}
            <p>
                <strong>
                    Stock:
                </strong>

                <input
                    type="number"
                    min="0"
                    value={
                        editData.stock ??
                        0
                    }
                    onChange={(e) =>
                        handleChange(
                            "stock",
                            e.target.value
                        )
                    }
                    style={{
                        display:
                            "block",
                        padding:
                            "10px",
                        marginTop:
                            "5px",
                    }}
                />
            </p>

            {/* =========================
                EXISTING IMAGES
            ========================= */}
            <div
                style={{
                    marginTop:
                        "20px",
                    marginBottom:
                        "20px",
                }}
            >
                <h4>
                    Existing Images (
                    {
                        editData.images
                            ?.length ||
                        0
                    }
                    /4)
                </h4>

                {editData.images
                    ?.length >
                    0 ? (
                    <ProductGallery
                        images={
                            editData.images
                        }
                        productName={
                            editData.name
                        }
                        onRemove={
                            handleRemoveExistingImage
                        }
                    />
                ) : (
                    <p>
                        No existing
                        images.
                    </p>
                )}
            </div>

            {/* =========================
                NEW IMAGES
            ========================= */}
            <div
                style={{
                    marginTop:
                        "20px",
                }}
            >
                <h4>
                    Add New Images
                </h4>

                <p
                    style={{
                        fontSize:
                            "14px",
                    }}
                >
                    Maximum 4 images
                    total.
                </p>

                {newImagePreviews.length >
                    0 && (
                        <div
                            style={{
                                display:
                                    "flex",
                                gap:
                                    "10px",
                                flexWrap:
                                    "wrap",
                                marginBottom:
                                    "15px",
                            }}
                        >
                            {newImagePreviews.map(
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
                                            width:
                                                "120px",
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
                                                    "10px",
                                                width:
                                                    "100%",
                                                cursor:
                                                    "pointer",
                                            }}
                                            onClick={() =>
                                                handleRemoveNewImage(
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

                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={
                        handleNewImages
                    }
                />
            </div>

            {/* =========================
                ACTIONS
            ========================= */}
            <div
                style={{
                    display:
                        "flex",
                    gap: "10px",
                    marginTop:
                        "25px",
                }}
            >
                <button
                    type="button"
                    onClick={
                        handleSave
                    }
                    disabled={saving}
                    style={{
                        padding:
                            "10px 18px",
                        cursor:
                            saving
                                ? "not-allowed"
                                : "pointer",
                    }}
                >
                    {saving
                        ? "Saving..."
                        : "Save"}
                </button>

                <button
                    type="button"
                    onClick={
                        onCancel
                    }
                    disabled={saving}
                    style={{
                        padding:
                            "10px 18px",
                        cursor:
                            saving
                                ? "not-allowed"
                                : "pointer",
                    }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

export default ProductEdit;