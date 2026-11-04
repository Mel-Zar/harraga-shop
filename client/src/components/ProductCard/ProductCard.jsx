
import ProductGallery from "../ProductGallery/ProductGallery";
import "./ProductCard.scss";

function ProductCard({ product, onEdit, onDelete }) {
    const getStockStatus = () => {
        if (product.stock === 0) {
            return {
                text: "Out of Stock",
                className: "out-of-stock",
                icon: "🔴",
            };
        }

        if (product.stock <= 10) {
            return {
                text: "Low Stock",
                className: "low-stock",
                icon: "🟡",
            };
        }

        return {
            text: "In Stock",
            className: "in-stock",
            icon: "🟢",
        };
    };

    const stockStatus = getStockStatus();

    // Support both new and legacy products.
    const categoryPath =
        Array.isArray(product.categoryPath) &&
            product.categoryPath.length > 0
            ? product.categoryPath
            : product.category
                ? [product.category]
                : [];

    const mainCategory = categoryPath[0] || "Uncategorized";

    const subCategory =
        categoryPath.length > 1
            ? categoryPath[categoryPath.length - 1]
            : product.subCategory || "";

    return (
        <article className="admin-product-card">
            {/* PRODUCT HEADER */}

            <div className="admin-product-card__header">
                <h3>{product.name}</h3>

                <span
                    className={`admin-product-card__status ${stockStatus.className}`}
                >
                    <span aria-hidden="true">
                        {stockStatus.icon}
                    </span>
                    {stockStatus.text}
                </span>
            </div>

            {/* DESCRIPTION */}

            <p className="admin-product-card__description">
                {product.description}
            </p>

            {/* PRICE */}

            <div className="admin-product-card__price">
                <span>Price</span>
                <strong>${product.price}</strong>
            </div>

            {/* CATEGORIES */}

            <div className="admin-product-card__categories">
                <div className="admin-product-card__category-info">
                    <span className="admin-product-card__label">
                        Main Category
                    </span>
                    <strong>{mainCategory}</strong>
                </div>

                {/* FULL CATEGORY PATH */}

                <div className="admin-product-card__category-path">
                    <span className="admin-product-card__label">
                        Category Path
                    </span>

                    <div className="admin-product-card__breadcrumbs">
                        {categoryPath.length > 0 ? (
                            categoryPath.map((category, index) => (
                                <span
                                    className="admin-product-card__breadcrumb-item"
                                    key={`${category}-${index}`}
                                >
                                    <span
                                        className={
                                            index === categoryPath.length - 1
                                                ? "current"
                                                : ""
                                        }
                                    >
                                        {category}
                                    </span>

                                    {index < categoryPath.length - 1 && (
                                        <span
                                            className="separator"
                                            aria-hidden="true"
                                        >
                                            →
                                        </span>
                                    )}
                                </span>
                            ))
                        ) : (
                            <span>Uncategorized</span>
                        )}
                    </div>
                </div>

                {/* SUBCATEGORY */}

                {subCategory && (
                    <div className="admin-product-card__category-info">
                        <span className="admin-product-card__label">
                            Subcategory
                        </span>
                        <strong>{subCategory}</strong>
                    </div>
                )}
            </div>

            {/* STOCK INFORMATION */}

            <div className="admin-product-card__stock">
                <div>
                    <span className="admin-product-card__label">
                        Available Stock
                    </span>
                    <strong>{product.stock}</strong>
                </div>

                <div
                    className={`admin-product-card__stock-indicator ${stockStatus.className}`}
                >
                    {stockStatus.text}
                </div>
            </div>

            {/* PRODUCT GALLERY */}

            <div className="admin-product-card__gallery">
                <span className="admin-product-card__label">
                    Product Images
                </span>

                <ProductGallery
                    images={product.images}
                    productName={product.name}
                    imageStyle={{
                        width: "100%",
                        maxWidth: "230px",
                        height: "260px",
                        objectFit: "contain",
                        borderRadius: "6px",
                    }}
                />
            </div>

            {/* ACTION BUTTONS */}

            <div className="admin-product-card__actions">
                <button
                    type="button"
                    className="admin-product-card__edit"
                    onClick={onEdit}
                >
                    Edit Product
                </button>

                <button
                    type="button"
                    className="admin-product-card__delete"
                    onClick={onDelete}
                >
                    Delete Product
                </button>
            </div>
        </article>
    );
}

export default ProductCard;
