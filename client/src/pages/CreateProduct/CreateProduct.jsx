import {
    useEffect,
    useState,
} from "react";

import ProductForm from "../../components/ProductForm/ProductForm";

import {
    createProduct,
    getProducts,
    deleteProduct,
    updateProduct,
} from "../../services/productService";

function CreateProduct() {
    const [products, setProducts] =
        useState([]);

    const [editingId, setEditingId] =
        useState(null);

    const [editData, setEditData] =
        useState({});

    const [editImages, setEditImages] =
        useState([]);

    const [removedImages, setRemovedImages] =
        useState([]);

    const [newImagePreviews, setNewImagePreviews] =
        useState([]);

    useEffect(() => {
        let mounted = true;

        const fetchProducts = async () => {
            try {
                const data =
                    await getProducts();

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

    const loadProducts = async () => {
        try {
            const data =
                await getProducts();

            setProducts(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreate = async (
        formData
    ) => {
        try {
            await createProduct(
                formData
            );

            await loadProducts();
        } catch (error) {
            console.error(error);

            alert(
                error.message ||
                "Failed to create product"
            );
        }
    };

    const startEdit = (product) => {
        setEditingId(product._id);

        setEditData({
            ...product,
        });

        setEditImages([]);
        setRemovedImages([]);
        setNewImagePreviews([]);
    };

    const saveEdit = async (
        productId
    ) => {
        try {
            const formData =
                new FormData();

            Object.entries(
                editData
            ).forEach(
                ([key, value]) => {
                    if (
                        key !== "images" &&
                        key !== "_id"
                    ) {
                        formData.append(
                            key,
                            value
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

            if (
                editImages &&
                editImages.length > 0
            ) {
                Array.from(
                    editImages
                ).forEach((image) => {
                    formData.append(
                        "images",
                        image
                    );
                });
            }

            await updateProduct(
                productId,
                formData
            );

            setEditingId(null);
            setEditImages([]);
            setRemovedImages([]);
            setNewImagePreviews([]);

            await loadProducts();
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (
        id
    ) => {
        const confirmed =
            window.confirm(
                "Delete product?"
            );

        if (!confirmed) return;

        try {
            await deleteProduct(id);

            await loadProducts();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <h1>Create Product</h1>

            <ProductForm
                onSubmit={
                    handleCreate
                }
            />

            <hr />

            <h2>
                Existing Products
            </h2>

            {products.map(
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
                        {editingId ===
                            product._id ? (
                            <>
                                <h3>
                                    <input
                                        style={{
                                            fontSize: "1.17em",
                                            fontWeight: "bold",
                                            border: "none",
                                            background: "transparent",
                                            width: "100%",
                                            outline: "none",
                                        }}
                                        value={editData.name || ""}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                name: e.target.value,
                                            })
                                        }
                                    />
                                </h3>

                                <p>
                                    <textarea
                                        style={{
                                            width: "100%",
                                            border: "none",
                                            background: "transparent",
                                            resize: "none",
                                            outline: "none",
                                            font: "inherit",
                                        }}
                                        value={editData.description || ""}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                description:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </p>

                                <p>
                                    Price: $
                                    <input
                                        type="number"
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            outline: "none",
                                            font: "inherit",
                                            width: "100px",
                                        }}
                                        value={editData.price || ""}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                price:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </p>

                                <p>
                                    Category:{" "}
                                    <input
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            outline: "none",
                                            font: "inherit",
                                        }}
                                        value={editData.category || ""}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                category:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </p>

                                <p>
                                    Stock:{" "}
                                    <input
                                        type="number"
                                        style={{
                                            border: "none",
                                            background: "transparent",
                                            outline: "none",
                                            font: "inherit",
                                            width: "80px",
                                        }}
                                        value={editData.stock || 0}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                stock:
                                                    e.target.value,
                                            })
                                        }
                                    />
                                </p>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "10px",
                                        flexWrap: "wrap",
                                        marginBottom: "15px",
                                    }}
                                >
                                    {editData.images?.map((img, index) => (
                                        <div
                                            key={`old-${index}`}
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                            }}
                                        >
                                            <img
                                                src={`${import.meta.env.VITE_API_URL}${img}`}
                                                alt=""
                                                style={{
                                                    width: "120px",
                                                    height: "250px",
                                                    objectFit: "cover",
                                                }}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setRemovedImages([
                                                        ...removedImages,
                                                        img,
                                                    ]);

                                                    setEditData({
                                                        ...editData,
                                                        images: editData.images.filter(
                                                            (image) =>
                                                                image !== img
                                                        ),
                                                    });
                                                }}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                    {newImagePreviews.map(
                                        (image, index) => (
                                            <div key={`new-${index}`}>
                                                <img
                                                    src={image.preview}
                                                    alt=""
                                                    style={{
                                                        width: "120px",
                                                        height: "250px",
                                                        objectFit: "cover",
                                                    }}
                                                />

                                                <br />

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const updated =
                                                            newImagePreviews.filter(
                                                                (_, i) =>
                                                                    i !== index
                                                            );

                                                        setNewImagePreviews(
                                                            updated
                                                        );

                                                        setEditImages(
                                                            updated.map(
                                                                (item) =>
                                                                    item.file
                                                            )
                                                        );
                                                    }}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>

                                <p
                                    style={{
                                        fontWeight: "bold",
                                        marginBottom: "10px",
                                    }}
                                >
                                    Images:{" "}
                                    {(editData.images?.length || 0) +
                                        newImagePreviews.length}
                                    /4
                                </p>

                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => {
                                        const files = Array.from(
                                            e.target.files
                                        );

                                        const currentImages =
                                            (editData.images?.length || 0) +
                                            newImagePreviews.length;

                                        if (
                                            currentImages +
                                            files.length >
                                            4
                                        ) {
                                            alert(
                                                `Maximum 4 images allowed. You currently have ${currentImages} image(s).`
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

                                        setNewImagePreviews((prev) => [
                                            ...prev,
                                            ...newPreviews,
                                        ]);

                                        e.target.value = "";
                                    }}
                                />

                                <br />
                                <br />

                                <button
                                    onClick={() =>
                                        saveEdit(
                                            product._id
                                        )
                                    }
                                >
                                    Save
                                </button>

                                {" "}

                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditImages([]);
                                        setRemovedImages([]);
                                        setNewImagePreviews([]);
                                    }}
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <h3>
                                    {
                                        product.name
                                    }
                                </h3>

                                <p>
                                    {
                                        product.description
                                    }
                                </p>

                                <p>
                                    Price: $
                                    {
                                        product.price
                                    }
                                </p>

                                <p>
                                    Category:{" "}
                                    {
                                        product.category
                                    }
                                </p>

                                <p>
                                    Stock:{" "}
                                    {
                                        product.stock
                                    }
                                </p>

                                {product.images &&
                                    product
                                        .images
                                        .length >
                                    0 && (
                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                gap: "10px",
                                                flexWrap:
                                                    "wrap",
                                            }}
                                        >
                                            {product.images.map(
                                                (
                                                    image,
                                                    index
                                                ) => (
                                                    <img
                                                        key={index}
                                                        src={`${import.meta.env.VITE_API_URL}${image}`}
                                                        alt={product.name}
                                                        style={{
                                                            width: "120px",
                                                            height: "250px",
                                                            objectFit: "cover",
                                                        }}
                                                    />
                                                )
                                            )}
                                        </div>
                                    )}

                                <br />
                                <br />

                                <button
                                    onClick={() =>
                                        startEdit(
                                            product
                                        )
                                    }
                                >
                                    Edit
                                </button>

                                {" "}

                                <button
                                    onClick={() =>
                                        handleDelete(
                                            product._id
                                        )
                                    }
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                )
            )}
        </div>
    );
}

export default CreateProduct;