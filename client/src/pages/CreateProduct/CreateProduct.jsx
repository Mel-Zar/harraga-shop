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
                                <input
                                    value={
                                        editData.name ||
                                        ""
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEditData(
                                            {
                                                ...editData,
                                                name: e
                                                    .target
                                                    .value,
                                            }
                                        )
                                    }
                                />

                                <textarea
                                    value={
                                        editData.description ||
                                        ""
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEditData(
                                            {
                                                ...editData,
                                                description:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                />

                                <input
                                    type="number"
                                    value={
                                        editData.price ||
                                        ""
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEditData(
                                            {
                                                ...editData,
                                                price:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                />

                                <input
                                    value={
                                        editData.category ||
                                        ""
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEditData(
                                            {
                                                ...editData,
                                                category:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                />

                                <input
                                    type="number"
                                    value={
                                        editData.stock ||
                                        0
                                    }
                                    onChange={(
                                        e
                                    ) =>
                                        setEditData(
                                            {
                                                ...editData,
                                                stock:
                                                    e
                                                        .target
                                                        .value,
                                            }
                                        )
                                    }
                                />

                                {editData.images &&
                                    editData
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
                                                marginBottom:
                                                    "15px",
                                            }}
                                        >
                                            {editData.images.map(
                                                (
                                                    img,
                                                    index
                                                ) => (
                                                    <div
                                                        key={
                                                            index
                                                        }
                                                    >
                                                        <img
                                                            src={`${import.meta.env.VITE_API_URL}${img}`}
                                                            alt=""
                                                            width="100"
                                                        />

                                                        <br />

                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setRemovedImages(
                                                                    [
                                                                        ...removedImages,
                                                                        img,
                                                                    ]
                                                                );

                                                                setEditData(
                                                                    {
                                                                        ...editData,
                                                                        images:
                                                                            editData.images.filter(
                                                                                (
                                                                                    image
                                                                                ) =>
                                                                                    image !==
                                                                                    img
                                                                            ),
                                                                    }
                                                                );
                                                            }}
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
                                    onChange={(
                                        e
                                    ) =>
                                        setEditImages(
                                            e
                                                .target
                                                .files
                                        )
                                    }
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
                                    onClick={() =>
                                        setEditingId(
                                            null
                                        )
                                    }
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
                                                        key={
                                                            index
                                                        }
                                                        src={`${import.meta.env.VITE_API_URL}${image}`}
                                                        alt={
                                                            product.name
                                                        }
                                                        width="120"
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