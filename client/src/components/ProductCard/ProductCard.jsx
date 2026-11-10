
import ProductGallery from "../ProductGallery/ProductGallery";
import "./ProductCard.scss";

function ProductCard({ product, onEdit, onDelete }) {
    const getStockStatus = () => {
        const stock = Number(product.stock ?? 0);
        const threshold = Number(product.lowStockThreshold ?? 5);

        if (stock === 0) {
            return {
                text: "Out of Stock",
                className: "out-of-stock",
                icon: "🔴",
            };
        }

        if (stock <= threshold) {
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

    // Support arrays and JSON strings.
    const parseList = (value) => {
        if (Array.isArray(value)) return value;

        if (typeof value === "string" && value.trim()) {
            try {
                const parsed = JSON.parse(value);
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return value.split(",").map((item) => item.trim()).filter(Boolean);
            }
        }

        return [];
    };

    const formatPrice = (value) => {
        if (value === undefined || value === null || value === "") {
            return "—";
        }

        return `$${Number(value).toFixed(2)}`;
    };

    const displayValue = (value) => {
        return value !== undefined && value !== null && value !== ""
            ? value
            : "—";
    };

    const stockStatus = getStockStatus();

    // Categories
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

    // Product variants
    const sizes = parseList(product.sizes);
    const colors = parseList(product.colors);
    const tags = parseList(product.tags);

    // Images
    const images =
        Array.isArray(product.images) && product.images.length > 0
            ? product.images
            : product.image
                ? [product.image]
                : [];

    // Shipping dimensions
    const dimensions = product.dimensions || {};

    // Publication
    const publicationStatus =
        product.status ||
        (product.isActive ? "published" : "draft");

    const isFeatured = Boolean(
        product.isFeatured ?? product.featured
    );

    const allowBackorders = Boolean(product.allowBackorders);

    return (
        <article className="admin-product-card">

            {/* PRODUCT HEADER */}

            <div className="admin-product-card__header">
                <h3>{product.name}</h3>

                <span
                    className={`admin-product-card__status ${stockStatus.className}`}
                >
                    <span aria-hidden="true">{stockStatus.icon}</span>
                    {stockStatus.text}
                </span>
            </div>

            {/* BASIC INFORMATION */}

            <div className="admin-product-card__basic-info">

                <div>
                    <span className="admin-product-card__label">
                        Brand
                    </span>
                    <strong>{displayValue(product.brand)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        SKU / Product Code
                    </span>
                    <strong>{displayValue(product.sku)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Barcode / EAN
                    </span>
                    <strong>{displayValue(product.barcode)}</strong>
                </div>

            </div>

            {/* SHORT DESCRIPTION */}

            {product.shortDescription && (
                <div className="admin-product-card__description">
                    <span className="admin-product-card__label">
                        Short Description
                    </span>
                    <p>{product.shortDescription}</p>
                </div>
            )}

            {/* FULL DESCRIPTION */}

            <div className="admin-product-card__description">
                <span className="admin-product-card__label">
                    Full Description
                </span>
                <p>{displayValue(product.description)}</p>
            </div>

            {/* PRICING */}

            <div className="admin-product-card__pricing">

                <div className="admin-product-card__price">
                    <span className="admin-product-card__label">
                        Selling Price
                    </span>
                    <strong>{formatPrice(product.price)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Original Price
                    </span>
                    <strong>
                        {formatPrice(product.compareAtPrice)}
                    </strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Purchase Cost
                    </span>
                    <strong>
                        {formatPrice(product.costPrice)}
                    </strong>
                </div>

            </div>

            {/* CATEGORIES */}

            <div className="admin-product-card__categories">

                <div className="admin-product-card__category-info">
                    <span className="admin-product-card__label">
                        Main Category
                    </span>
                    <strong>{mainCategory}</strong>
                </div>

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

                {subCategory && (
                    <div className="admin-product-card__category-info">
                        <span className="admin-product-card__label">
                            Subcategory
                        </span>
                        <strong>{subCategory}</strong>
                    </div>
                )}

            </div>

            {/* TAGS */}

            <div className="admin-product-card__tags">
                <span className="admin-product-card__label">
                    Product Tags
                </span>

                <div className="admin-product-card__tag-list">
                    {tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <span key={`${tag}-${index}`}>
                                {tag}
                            </span>
                        ))
                    ) : (
                        <span>—</span>
                    )}
                </div>
            </div>

            {/* SIZE AND COLOUR VARIANTS */}

            <div className="admin-product-card__variants">

                <div>
                    <span className="admin-product-card__label">
                        Available Sizes
                    </span>

                    <div className="admin-product-card__variant-list">
                        {sizes.length > 0
                            ? sizes.map((size, index) => (
                                <span key={`${size}-${index}`}>
                                    {size}
                                </span>
                            ))
                            : "—"}
                    </div>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Available Colours
                    </span>

                    <div className="admin-product-card__variant-list">
                        {colors.length > 0
                            ? colors.map((color, index) => (
                                <span key={`${color}-${index}`}>
                                    {color}
                                </span>
                            ))
                            : "—"}
                    </div>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Material
                    </span>
                    <strong>{displayValue(product.material)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Fit / Style
                    </span>
                    <strong>{displayValue(product.fit)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Target Group
                    </span>
                    <strong>{displayValue(product.targetGroup)}</strong>
                </div>

            </div>

            {/* STOCK INFORMATION */}

            <div className="admin-product-card__stock">

                <div>
                    <span className="admin-product-card__label">
                        Available Stock
                    </span>
                    <strong>{product.stock ?? 0}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Low Stock Alert At
                    </span>
                    <strong>{product.lowStockThreshold ?? 5}</strong>
                </div>

                <div
                    className={`admin-product-card__stock-indicator ${stockStatus.className}`}
                >
                    {stockStatus.text}
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Allow Backorders
                    </span>
                    <strong>
                        {allowBackorders ? "Yes" : "No"}
                    </strong>
                </div>

            </div>

            {/* PRODUCT GALLERY */}

            <div className="admin-product-card__gallery">

                <span className="admin-product-card__label">
                    Product Images ({images.length})
                </span>

                {images.length > 0 ? (
                    <ProductGallery
                        images={images}
                        productName={product.name}
                        imageStyle={{
                            width: "100%",
                            maxWidth: "230px",
                            height: "260px",
                            objectFit: "contain",
                            borderRadius: "6px",
                        }}
                    />
                ) : (
                    <p>No product images available.</p>
                )}

            </div>

            {/* SHIPPING DETAILS */}

            <div className="admin-product-card__shipping">

                <h4>Shipping Details</h4>

                <div>
                    <span className="admin-product-card__label">
                        Weight
                    </span>
                    <strong>
                        {product.weight !== undefined &&
                            product.weight !== null &&
                            product.weight !== ""
                            ? `${product.weight} g`
                            : "—"}
                    </strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Length
                    </span>
                    <strong>
                        {dimensions.length != null
                            ? `${dimensions.length} cm`
                            : "—"}
                    </strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Width
                    </span>
                    <strong>
                        {dimensions.width != null
                            ? `${dimensions.width} cm`
                            : "—"}
                    </strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Height
                    </span>
                    <strong>
                        {dimensions.height != null
                            ? `${dimensions.height} cm`
                            : "—"}
                    </strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Shipping Class
                    </span>
                    <strong>
                        {displayValue(product.shippingClass)}
                    </strong>
                </div>

            </div>

            {/* SEO AND VISIBILITY */}

            <div className="admin-product-card__seo">

                <h4>Search Engine & Visibility</h4>

                <div>
                    <span className="admin-product-card__label">
                        URL Slug
                    </span>
                    <strong>{displayValue(product.slug)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        SEO Title
                    </span>
                    <strong>{displayValue(product.seoTitle)}</strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Meta Description
                    </span>
                    <p>{displayValue(product.metaDescription)}</p>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Featured Product
                    </span>
                    <strong>
                        {isFeatured ? "Yes" : "No"}
                    </strong>
                </div>

                <div>
                    <span className="admin-product-card__label">
                        Publication Status
                    </span>

                    <span
                        className={`admin-product-card__publication-status ${publicationStatus}`}
                    >
                        {publicationStatus === "published"
                            ? "Published"
                            : "Draft"}
                    </span>
                </div>

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
