import { useEffect, useRef, useState } from "react";
import { DndContext, PointerSensor, KeyboardSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { toast } from "react-toastify";

import "./ProductEdit.scss";
import "../ProductGallery/ProductGallery.scss";

const MAX_IMAGES = 4;

const MAX_CATEGORY_LEVELS = 20;

// Capitalize the first letter while preserving the rest of the user's chosen casing.
const capitalizeFirstLetter = (value) =>
    value.replace(/^(\s*)(\p{L})/u, (_, whitespace, character) =>
        whitespace + character.toLocaleUpperCase()
    );

function Section({ title, description, children }) {

    return (

        <section>

            <div>

                <h3>{title}</h3>

                {description && (

                    <p>

                        {description}

                    </p>

                )}

            </div>

            {children}

        </section>

    );

}

function Field({ label, required, help, children }) {

    return (

        <label>

            <span>

                {label} {required && <span>*</span>}

            </span>

            {children}

            {help && <span>{help}</span>}

        </label>

    );

}

function SortableProductImage({ entry, index, getImageSource, onRemove, productName }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: entry.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.55 : 1,
        zIndex: isDragging ? 2 : 1,
    };

    const imageUrl = getImageSource(entry);
    const isMainImage = index === 0;

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={[
                "product-edit__sortable-image",
                isMainImage ? "is-main-image" : "",
                isDragging ? "is-dragging" : "",
            ].filter(Boolean).join(" ")}
        >
            <div className="product-edit__sortable-image-preview">
                <span className="product-edit__image-position">
                    Bild {index + 1}{isMainImage ? " · Huvudbild" : ""}
                </span>
                {imageUrl && (
                    <img
                        className="product-gallery__image"
                        src={imageUrl}
                        alt={`${productName || "Produkt"} ${index + 1}`}
                        loading="lazy"
                        draggable={false}
                        {...attributes}
                        {...listeners}
                    />
                )}
            </div>
            <button
                className="product-edit__image-remove"
                type="button"
                onClick={() => onRemove(entry)}
                aria-label={`Ta bort bild ${index + 1}`}
            >
                Ta bort
            </button>
        </div>
    );
}

function ProductEdit({ product, onSave, onCancel }) {

    const [name, setName] = useState(product?.name || "");

    const [description, setDescription] = useState(product?.description || "");

    const [shortDescription, setShortDescription] = useState(product?.shortDescription || "");

    const [brand, setBrand] = useState(product?.brand || "");

    const [sku, setSku] = useState(product?.sku || "");

    const [barcode, setBarcode] = useState(product?.barcode || "");

    const [price, setPrice] = useState(product?.price ?? "");

    const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ?? "");

    const [costPrice, setCostPrice] = useState(product?.costPrice ?? "");

    const [stock, setStock] = useState(String(product?.stock ?? 0));

    const [lowStockThreshold, setLowStockThreshold] = useState(String(product?.lowStockThreshold ?? 5));

    const [categoryLevels, setCategoryLevels] = useState(Array.isArray(product?.categoryPath) && product.categoryPath.length ? product.categoryPath : [product?.category || ""]);

    const [tags, setTags] = useState(Array.isArray(product?.tags) ? product.tags.join(", ") : "");

    const [sizes, setSizes] = useState(Array.isArray(product?.sizes) ? product.sizes : []);

    const [customSize, setCustomSize] = useState(product?.customSize || "");

    const [colors, setColors] = useState(Array.isArray(product?.colors) ? product.colors : []);

    const [customColor, setCustomColor] = useState(product?.customColor || "");

    const [material, setMaterial] = useState(product?.material || "");

    const [fit, setFit] = useState(product?.fit || "");

    const [targetGroup, setTargetGroup] = useState(product?.targetGroup || "Unisex");

    const [weight, setWeight] = useState(product?.weight ?? "");

    const [length, setLength] = useState(product?.dimensions?.length ?? "");

    const [width, setWidth] = useState(product?.dimensions?.width ?? "");

    const [height, setHeight] = useState(product?.dimensions?.height ?? "");

    const [shippingClass, setShippingClass] = useState(product?.shippingClass || "");

    const [status, setStatus] = useState(product?.status || (product?.isActive ? "published" : "draft"));

    const [featured, setFeatured] = useState(Boolean(product?.isFeatured ?? product?.featured));

    const [allowBackorders, setAllowBackorders] = useState(Boolean(product?.allowBackorders));

    const [seoTitle, setSeoTitle] = useState(product?.seoTitle || "");

    const [metaDescription, setMetaDescription] = useState(product?.metaDescription || "");

    const [slug, setSlug] = useState(product?.slug || "");

    const [images, setImages] = useState([]);

    const [existingImages, setExistingImages] = useState(Array.isArray(product?.images) && product.images.length ? product.images : (product?.image ? [product.image] : []));

    const [removedImages, setRemovedImages] = useState([]);

    const [imagePreviews, setImagePreviews] = useState([]);

    // Keeps existing and newly uploaded images in one sortable display order.
    const [imageOrder, setImageOrder] = useState(() => {
        const initialImages = Array.isArray(product?.images) && product.images.length
            ? product.images
            : (product?.image ? [product.image] : []);
        return initialImages.map((url, index) => ({
            id: `existing-${index}`,
            type: "existing",
            url,
        }));
    });

    const [submitting, setSubmitting] = useState(false);

    const fileInputRef = useRef(null);
    const submittingRef = useRef(false);
    const objectUrlsRef = useRef(new Set());

    const revokePreview = (preview) => {
        if (!preview || !objectUrlsRef.current.has(preview)) return;
        URL.revokeObjectURL(preview);
        objectUrlsRef.current.delete(preview);
    };

    useEffect(() => {
        const objectUrls = objectUrlsRef.current;
        return () => {
            objectUrls.forEach((preview) => URL.revokeObjectURL(preview));
            objectUrls.clear();
        };
    }, []);

    // Refill every field when the selected product changes.
    useEffect(() => {
        if (!product) return;
        setName(product.name || "");
        setDescription(product.description || "");
        setShortDescription(product.shortDescription || "");
        setBrand(product.brand || "");
        setSku(product.sku || "");
        setBarcode(product.barcode || "");
        setPrice(product.price ?? "");
        setCompareAtPrice(product.compareAtPrice ?? "");
        setCostPrice(product.costPrice ?? "");
        setStock(String(product.stock ?? 0));
        setLowStockThreshold(String(product.lowStockThreshold ?? 5));
        setCategoryLevels(Array.isArray(product.categoryPath) && product.categoryPath.length ? product.categoryPath : [product.category || ""]);
        setTags(Array.isArray(product.tags) ? product.tags.join(", ") : "");
        setSizes(Array.isArray(product.sizes) ? product.sizes : []);
        setCustomSize(product.customSize || "");
        setColors(Array.isArray(product.colors) ? product.colors : []);
        setCustomColor(product.customColor || "");
        setMaterial(product.material || "");
        setFit(product.fit || "");
        setTargetGroup(product.targetGroup || "Unisex");
        setWeight(product.weight ?? "");
        setLength(product.dimensions?.length ?? "");
        setWidth(product.dimensions?.width ?? "");
        setHeight(product.dimensions?.height ?? "");
        setShippingClass(product.shippingClass || "");
        setStatus(product.status || (product.isActive ? "published" : "draft"));
        setFeatured(Boolean(product.isFeatured ?? product.featured));
        setAllowBackorders(Boolean(product.allowBackorders));
        setSeoTitle(product.seoTitle || "");
        setMetaDescription(product.metaDescription || "");
        setSlug(product.slug || "");
        const initialImages = Array.isArray(product.images) && product.images.length
            ? product.images
            : (product.image ? [product.image] : []);
        setExistingImages(initialImages);
        setImageOrder(initialImages.map((url, index) => ({
            id: `existing-${index}`,
            type: "existing",
            url,
        })));
        setRemovedImages([]);
        setImages([]);
        setImagePreviews([]);
        setSubmitting(false);
        submittingRef.current = false;
    }, [product]);

    const updateCategoryLevel = (index, value) => {

        setCategoryLevels((previous) =>

            previous.map((category, i) => (i === index ? value : category))

        );

    };

    const addCategoryLevel = () => {

        if (categoryLevels.length >= MAX_CATEGORY_LEVELS) {

            toast.error(`Maximum ${MAX_CATEGORY_LEVELS} category levels allowed.`);

            return;

        }

        if (!categoryLevels[categoryLevels.length - 1].trim()) {

            toast.error("Fill in the current category first.");

            return;

        }

        setCategoryLevels((previous) => [...previous, ""]);

    };

    const removeCategoryLevel = (index) => {

        setCategoryLevels((previous) =>

            previous.length === 1 ? [""] : previous.filter((_, i) => i !== index)

        );

    };

    const handleImageChange = (event) => {

        const files = Array.from(event.target.files || []);

        if (!files.length) return;

        if (files.some((file) => !file.type.startsWith("image/"))) {

            toast.error("Only image files are allowed.");

            event.target.value = "";

            return;

        }

        if (images.length + files.length > MAX_IMAGES) {

            toast.error(`You can only upload ${MAX_IMAGES} images.`);

            event.target.value = "";

            return;

        }

        if (files.some((file) => file.size > 10 * 1024 * 1024)) {

            toast.error("Each image must be smaller than 10 MB.");

            event.target.value = "";

            return;

        }

        const newPreviews = files.map((file) => {
            const preview = URL.createObjectURL(file);
            objectUrlsRef.current.add(preview);
            return {
                file,
                preview,
                id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            };
        });

        setImages((previous) => [...previous, ...files]);

        setImagePreviews((previous) => [...previous, ...newPreviews]);

        setImageOrder((previous) => [
            ...previous,
            ...newPreviews.map((item) => ({
                id: item.id,
                type: "new",
                file: item.file,
                preview: item.preview,
            })),
        ]);

        event.target.value = "";

    };

    const handleRemoveImage = (index) => {

        const item = imagePreviews[index];
        if (item) {
            revokePreview(item.preview);
            setImageOrder((previous) => previous.filter((entry) => entry.id !== item.id));
        }

        setImagePreviews((previous) => previous.filter((_, i) => i !== index));
        setImages((previous) => previous.filter((_, i) => i !== index));

    };

    // Match ProductGallery's URL handling so existing images resolve the same way in edit mode.
    const apiUrl = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
    const baseUrl = apiUrl.replace(/\/api$/i, "");

    const getImageSource = (entry) => {
        if (!entry) return "";
        if (entry.type === "new") return entry.preview || "";

        const image = entry.url;
        const rawValue =
            typeof image === "string"
                ? image
                : image && typeof image === "object"
                    ? image.url || image.path || image.filename || image.secure_url || image.src
                    : "";

        if (typeof rawValue !== "string" || !rawValue.trim()) return "";

        const value = rawValue.trim();
        if (/^(https?:|data:|blob:)/i.test(value)) return value;

        const path = value.startsWith("/") ? value : `/${value}`;
        return `${baseUrl}${path}`;
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 6 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleImageDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        setImageOrder((previous) => {
            const fromIndex = previous.findIndex((entry) => entry.id === active.id);
            const toIndex = previous.findIndex((entry) => entry.id === over.id);
            if (fromIndex < 0 || toIndex < 0) return previous;
            return arrayMove(previous, fromIndex, toIndex);
        });
    };

    const handleRemoveOrderedImage = (entry) => {
        if (entry.type === "existing") {
            setExistingImages((previous) => previous.filter((url) => url !== entry.url));
            setRemovedImages((previous) => [...previous, entry.url]);
            setImageOrder((previous) => previous.filter((item) => item.id !== entry.id));
        } else {
            const previewIndex = imagePreviews.findIndex((item) => item.id === entry.id);
            if (previewIndex !== -1) handleRemoveImage(previewIndex);
        }
    };

    const toggleListValue = (value, setter, current) => {

        setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (submittingRef.current || submitting) return;

        if (!name.trim()) return toast.error("Product name is required.");

        if (!description.trim()) return toast.error("Full description is required.");

        if (name.trim().length > 200) return toast.error("Product name must be 200 characters or fewer.");

        if (description.trim().length > 5000) return toast.error("Description must be 5000 characters or fewer.");

        const categoryPath = categoryLevels.map((value) => value.trim());

        if (!categoryPath.length || categoryPath.some((value) => !value)) {

            return toast.error("Complete every category level.");

        }

        if (categoryPath.length > MAX_CATEGORY_LEVELS || categoryPath.some((value) => value.length > 100)) {

            return toast.error("Check category levels. Each level must be 100 characters or fewer.");

        }

        const numericFields = [

            ["Price", price, true],

            ["Compare-at price", compareAtPrice, false],

            ["Purchase cost", costPrice, false],

            ["Stock", stock, true],

            ["Low-stock threshold", lowStockThreshold, true],

            ["Weight", weight, false],

            ["Length", length, false],

            ["Width", width, false],

            ["Height", height, false],

        ];

        for (const [label, value, required] of numericFields) {

            if (value === "" && !required) continue;

            const number = Number(value);

            if (!Number.isFinite(number) || number < 0) {

                return toast.error(`${label} must be a valid non-negative number.`);

            }

            if (["Stock", "Low-stock threshold"].includes(label) && !Number.isInteger(number)) {

                return toast.error(`${label} must be a whole number.`);

            }

        }

        if (images.length + existingImages.length > MAX_IMAGES) return toast.error(`You can only keep or upload ${MAX_IMAGES} images.`);

        if (images.length > MAX_IMAGES) return toast.error(`You can only upload ${MAX_IMAGES} images.`);

        const finalSlug = (slug.trim() || name.trim())

            .toLowerCase()

            .normalize("NFD")

            .replace(/[\u0300-\u036f]/g, "")

            .replace(/[^a-z0-9]+/g, "-")

            .replace(/^-+|-+$/g, "");

        const formData = new FormData();

        const fields = {

            name: capitalizeFirstLetter(name.trim()),

            description: description.trim(),

            shortDescription: shortDescription.trim(),

            brand: brand.trim(),

            sku: sku.trim(),

            barcode: barcode.trim(),

            price: String(Number(price)),

            compareAtPrice: compareAtPrice === "" ? "" : String(Number(compareAtPrice)),

            costPrice: costPrice === "" ? "" : String(Number(costPrice)),

            stock: String(Number(stock)),

            lowStockThreshold: String(Number(lowStockThreshold)),

            category: categoryPath[0],

            categoryPath: JSON.stringify(categoryPath),

            subCategory: categoryPath[categoryPath.length - 1],

            tags: JSON.stringify(tags.split(",").map((tag) => tag.trim()).filter(Boolean)),

            sizes: JSON.stringify(sizes),

            colors: JSON.stringify(colors),

            material: material.trim(),

            fit: fit.trim(),

            targetGroup,

            weight: weight === "" ? "" : String(Number(weight)),

            dimensions: JSON.stringify({

                length: length === "" ? null : Number(length),

                width: width === "" ? null : Number(width),

                height: height === "" ? null : Number(height),

            }),

            shippingClass: shippingClass.trim(),

            status,

            isActive: String(status === "published"),

            isFeatured: String(featured),

            allowBackorders: String(allowBackorders),

            seoTitle: seoTitle.trim() || name.trim(),

            metaDescription: metaDescription.trim() || shortDescription.trim() || description.trim().slice(0, 160),

            slug: finalSlug,

        };

        Object.entries(fields).forEach(([key, value]) => formData.append(key, value));

        formData.append("removedImages", JSON.stringify(removedImages));

        const orderedExistingImages = imageOrder
            .filter((entry) => entry.type === "existing")
            .map((entry) => entry.url);
        const orderedNewImages = imageOrder
            .filter((entry) => entry.type === "new")
            .map((entry) => entry.file);
        const imageOrderMetadata = imageOrder.map((entry) => entry.type === "existing"
            ? { type: "existing", index: orderedExistingImages.indexOf(entry.url) }
            : { type: "new", index: orderedNewImages.indexOf(entry.file) });

        formData.append("existingImages", JSON.stringify(orderedExistingImages));
        formData.append("imageOrder", JSON.stringify(imageOrderMetadata));

        orderedNewImages.forEach((image) => formData.append("images", image));

        try {

            submittingRef.current = true;
            setSubmitting(true);

            await onSave(product._id, formData);

            toast.success("Product updated successfully!");

        } catch (error) {

            console.error("PRODUCT EDIT SAVE ERROR:", error);

            toast.error(error?.response?.data?.message || error?.message || "Could not update product.");

        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }

    };

    const addCustomSize = () => {

        const value = customSize.trim().toUpperCase();

        if (!value) return;

        if (!sizes.includes(value)) setSizes((previous) => [...previous, value]);

        setCustomSize("");

    };

    const addCustomColor = () => {

        const value = customColor.trim().toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase());

        if (!value) return;

        if (!colors.includes(value)) setColors((previous) => [...previous, value]);

        setCustomColor("");

    };

    const sizesOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One size"];

    const colorsOptions = ["Black", "White", "Grey", "Navy", "Blue", "Red", "Green", "Beige", "Brown"];

    const stockNumber = Number(stock || 0);
    const thresholdNumber = Number(lowStockThreshold || 5);
    const stockStatus = stockNumber <= 0
        ? { text: "Out of Stock", className: "out-of-stock", icon: "🔴" }
        : stockNumber <= thresholdNumber
            ? { text: "Low Stock", className: "low-stock", icon: "🟡" }
            : { text: "In Stock", className: "in-stock", icon: "🟢" };

    const categoryPath = categoryLevels.map((item) => item.trim()).filter(Boolean);
    const publicationStatus = status || "draft";

    return (
        <form className="product-edit admin-product-card" onSubmit={handleSubmit} noValidate>
            {/* PRODUCT HEADER — same position and hierarchy as ProductCard */}
            <div className="admin-product-card__header">
                <div className="product-edit__heading">
                    <span className="admin-product-card__label">HARRAGA SHOP · CATALOG</span>
                    <Field label="Product name" required>
                        <input
                            value={name}
                            onChange={(e) => setName(capitalizeFirstLetter(e.target.value))}
                            autoCapitalize="sentences"
                            maxLength={200}
                            placeholder="e.g. Premium Essential Tracksuit"
                            required
                        />
                    </Field>
                </div>
                <span className={`admin-product-card__status ${stockStatus.className}`}>
                    <span aria-hidden="true">{stockStatus.icon}</span>
                    {stockStatus.text}
                </span>
            </div>

            {/* BASIC INFORMATION */}
            <div className="admin-product-card__basic-info">
                <Field label="Brand">
                    <input value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={100} placeholder="e.g. Harraga" />
                </Field>
                <Field label="SKU / Product Code">
                    <input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} className="product-form__input-uppercase" maxLength={100} placeholder="e.g. HRG-TRK-001" />
                </Field>
                <Field label="Barcode / EAN">
                    <input value={barcode} onChange={(e) => setBarcode(e.target.value)} maxLength={100} placeholder="Optional" />
                </Field>
            </div>

            {/* SHORT DESCRIPTION */}
            <div className="admin-product-card__description">
                <span className="admin-product-card__label">Short Description</span>
                <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={300} placeholder="A concise summary for product cards" />
            </div>

            {/* FULL DESCRIPTION */}
            <div className="admin-product-card__description">
                <span className="admin-product-card__label">Full Description *</span>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} placeholder="Describe the product, fit, features and care instructions..." required />
            </div>

            {/* PRICING */}
            <div className="admin-product-card__pricing">
                <Field label="Selling Price" required>
                    <input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required />
                </Field>
                <Field label="Original Price">
                    <input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="0.00" />
                </Field>
                <Field label="Purchase Cost">
                    <input type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" />
                </Field>
            </div>

            {/* CATEGORIES */}
            <div className="admin-product-card__categories">
                <div className="admin-product-card__category-info">
                    <span className="admin-product-card__label">Main Category</span>
                    <input value={categoryLevels[0] || ""} onChange={(e) => updateCategoryLevel(0, e.target.value)} maxLength={100} placeholder="Main category" required />
                </div>
                <div className="admin-product-card__category-path">
                    <span className="admin-product-card__label">Category Path</span>
                    <div className="product-edit__category-levels">
                        {categoryLevels.map((category, index) => (
                            <div className="product-edit__category-level" key={index}>
                                <span>{index + 1}.</span>
                                <input value={category} onChange={(e) => updateCategoryLevel(index, e.target.value)} maxLength={100} placeholder={index === 0 ? "Main category" : `Category level ${index + 1}`} required />
                                <button type="button" onClick={() => removeCategoryLevel(index)} aria-label={`Remove category level ${index + 1}`}>×</button>
                            </div>
                        ))}
                        <button type="button" onClick={addCategoryLevel} disabled={categoryLevels.length >= MAX_CATEGORY_LEVELS}>+ Add subcategory</button>
                    </div>
                    <div className="admin-product-card__breadcrumbs">
                        {categoryPath.length ? categoryPath.map((category, index) => (
                            <span className="admin-product-card__breadcrumb-item" key={`${category}-${index}`}>
                                <span className={index === categoryPath.length - 1 ? "current" : ""}>{category}</span>
                                {index < categoryPath.length - 1 && <span className="separator" aria-hidden="true">→</span>}
                            </span>
                        )) : <span>Uncategorized</span>}
                    </div>
                </div>
            </div>

            {/* TAGS */}
            <div className="admin-product-card__tags">
                <label className="admin-product-card__label" htmlFor="product-edit-tags">Product Tags</label>
                <input id="product-edit-tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="streetwear, new collection, sportswear" />
                <span className="product-edit__help">Separate tags with commas.</span>
                <div className="admin-product-card__tag-list">
                    {tags.split(",").map((tag) => tag.trim()).filter(Boolean).map((tag, index) => <span key={`${tag}-${index}`}>{tag}</span>)}
                </div>
            </div>

            {/* SIZE AND COLOUR VARIANTS */}
            <div className="admin-product-card__variants">
                <div>
                    <span className="admin-product-card__label">Available Sizes</span>
                    <div className="product-edit__choice-list">
                        {sizesOptions.map((size) => (
                            <label key={size}><input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleListValue(size, setSizes, sizes)} />{size}</label>
                        ))}
                    </div>
                    <div className="product-edit__custom-value">
                        <input value={customSize} onChange={(e) => setCustomSize(e.target.value.toUpperCase())} className="product-form__input-uppercase" placeholder="Add custom size" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }} />
                        <button type="button" onClick={addCustomSize}>Add</button>
                    </div>
                    <div className="admin-product-card__variant-list">
                        {sizes.filter((size) => !sizesOptions.includes(size)).map((size) => <button type="button" key={size} onClick={() => setSizes((previous) => previous.filter((item) => item !== size))}>{size} ×</button>)}
                    </div>
                </div>
                <div>
                    <span className="admin-product-card__label">Available Colours</span>
                    <div className="product-edit__choice-list">
                        {colorsOptions.map((color) => (
                            <label key={color}><input type="checkbox" checked={colors.includes(color)} onChange={() => toggleListValue(color, setColors, colors)} />{color}</label>
                        ))}
                    </div>
                    <div className="product-edit__custom-value">
                        <input value={customColor} onChange={(e) => setCustomColor(e.target.value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()))} className="product-form__input-capitalize" placeholder="Add custom colour" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColor(); } }} />
                        <button type="button" onClick={addCustomColor}>Add</button>
                    </div>
                    <div className="admin-product-card__variant-list">
                        {colors.filter((color) => !colorsOptions.includes(color)).map((color) => <button type="button" key={color} onClick={() => setColors((previous) => previous.filter((item) => item !== color))}>{color} ×</button>)}
                    </div>
                </div>
                <Field label="Material"><input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. 80% cotton, 20% polyester" /></Field>
                <Field label="Fit / Style"><input value={fit} onChange={(e) => setFit(e.target.value)} placeholder="Regular, slim, oversized..." /></Field>
                <Field label="Target Group">
                    <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>
                        <option>Unisex</option><option>Men</option><option>Women</option><option>Kids</option><option>Baby</option>
                    </select>
                </Field>
            </div>

            {/* STOCK INFORMATION */}
            <div className="admin-product-card__stock">
                <Field label="Available Stock" required><input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required /></Field>
                <Field label="Low Stock Alert At"><input type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} /></Field>
                <div className={`admin-product-card__stock-indicator ${stockStatus.className}`}>{stockStatus.text}</div>
                <label className="product-edit__toggle"><input type="checkbox" checked={allowBackorders} onChange={(e) => setAllowBackorders(e.target.checked)} />Allow Backorders</label>
            </div>

            {/* PRODUCT GALLERY */}
            <div className="admin-product-card__gallery">
                <span className="admin-product-card__label">Product Images ({existingImages.length + images.length}/{MAX_IMAGES})</span>
                <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} disabled={images.length + existingImages.length >= MAX_IMAGES} />
                <p>Maximum 4 images, 10 MB per image. The first image is the main image.</p>
                <div className="product-edit__image-sort">
                    <span className="admin-product-card__label">Dina produktbilder</span>
                    <p>Dra bilderna för att ändra ordningen. Bild 1 blir huvudbilden i butiken.</p>
                    {imageOrder.length > 0 ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleImageDragEnd}
                        >
                            <SortableContext
                                items={imageOrder.map((entry) => entry.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="product-edit__image-sort-list">
                                    {imageOrder.map((entry, index) => (
                                        <SortableProductImage
                                            key={entry.id}
                                            entry={entry}
                                            index={index}
                                            getImageSource={getImageSource}
                                            onRemove={handleRemoveOrderedImage}
                                            productName={name}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <p>Inga bilder tillagda ännu.</p>
                    )}
                </div>
            </div>

            {/* SHIPPING DETAILS */}
            <div className="admin-product-card__shipping">
                <h4>Shipping Details</h4>
                <Field label="Weight (g)"><input type="number" min="0" step="1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 650" /></Field>
                <Field label="Length (cm)"><input type="number" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} /></Field>
                <Field label="Width (cm)"><input type="number" min="0" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} /></Field>
                <Field label="Height (cm)"><input type="number" min="0" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>
                <Field label="Shipping Class"><input value={shippingClass} onChange={(e) => setShippingClass(e.target.value)} placeholder="e.g. standard, bulky" /></Field>
            </div>

            {/* SEO AND VISIBILITY */}
            <div className="admin-product-card__seo">
                <h4>Search Engine & Visibility</h4>
                <Field label="URL Slug" help="Generated from the product name if left blank.">
                    <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="product-form__input-lowercase" placeholder="premium-essential-tracksuit" />
                </Field>
                <Field label="SEO Title" help="Defaults to the product name.">
                    <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="Product title for search engines" />
                </Field>
                <Field label="Meta Description" help="Defaults to the short description or the beginning of the full description.">
                    <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={320} placeholder="Short search-result description" />
                </Field>
                <label className="product-edit__toggle"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />Featured Product</label>
                <Field label="Publication Status" required>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="draft">Draft — save without publishing</option>
                        <option value="published">Published — visible in the store</option>
                    </select>
                </Field>
                <span className={`admin-product-card__publication-status ${publicationStatus}`}>{publicationStatus === "published" ? "Published" : "Draft"}</span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="admin-product-card__actions">
                <button type="button" className="admin-product-card__delete" onClick={onCancel} disabled={submitting}>Cancel Editing</button>
                <button type="submit" className="admin-product-card__edit" disabled={submitting}>{submitting ? "Saving changes…" : "Save Changes"}</button>
            </div>

            <p className="product-edit__note">Your Express controller and Product model must support the advanced fields for them to be persisted.</p>
        </form>
    );
}

export default ProductEdit;
