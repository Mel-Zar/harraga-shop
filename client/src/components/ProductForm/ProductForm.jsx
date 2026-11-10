import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

import "./ProductForm.scss";


const MAX_IMAGES = 4;

const MAX_CATEGORY_LEVELS = 20;

// Capitalize the first letter while preserving the rest of the user's chosen casing.
const capitalizeFirstLetter = (value) =>
    value.replace(/^(\s*)(\p{L})/u, (_, whitespace, character) =>
        whitespace + character.toLocaleUpperCase()
    );

function Section({ title, description, children }) {

    return (

        <section className="product-form__section">

            <div className="product-form__section-heading">

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

        <label className="product-form__field">

            <span className="product-form__field-label">

                {label} {required && <span>*</span>}

            </span>

            {children}

            {help && <span className="product-form__field-help">{help}</span>}

        </label>

    );

}

function ProductForm({ onSubmit }) {

    const [name, setName] = useState("");

    const [description, setDescription] = useState("");

    const [shortDescription, setShortDescription] = useState("");

    const [brand, setBrand] = useState("");

    const [sku, setSku] = useState("");

    const [barcode, setBarcode] = useState("");

    const [price, setPrice] = useState("");

    const [compareAtPrice, setCompareAtPrice] = useState("");

    const [costPrice, setCostPrice] = useState("");

    const [stock, setStock] = useState("0");

    const [lowStockThreshold, setLowStockThreshold] = useState("5");

    const [categoryLevels, setCategoryLevels] = useState([""]);

    const [tags, setTags] = useState("");

    const [sizes, setSizes] = useState([]);

    const [customSize, setCustomSize] = useState("");

    const [colors, setColors] = useState([]);

    const [customColor, setCustomColor] = useState("");

    const [material, setMaterial] = useState("");

    const [fit, setFit] = useState("");

    const [targetGroup, setTargetGroup] = useState("Unisex");

    const [weight, setWeight] = useState("");

    const [length, setLength] = useState("");

    const [width, setWidth] = useState("");

    const [height, setHeight] = useState("");

    const [shippingClass, setShippingClass] = useState("");

    const [status, setStatus] = useState("draft");

    const [featured, setFeatured] = useState(false);

    const [allowBackorders, setAllowBackorders] = useState(false);

    const [seoTitle, setSeoTitle] = useState("");

    const [metaDescription, setMetaDescription] = useState("");

    const [slug, setSlug] = useState("");

    const [images, setImages] = useState([]);

    const [imagePreviews, setImagePreviews] = useState([]);

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
        // Keep the same Set instance for this effect's cleanup.
        const objectUrls = objectUrlsRef.current;

        return () => {
            objectUrls.forEach((preview) => URL.revokeObjectURL(preview));
            objectUrls.clear();
        };
    }, []);

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

        if (files.some((file) => !file.type || !file.type.startsWith("image/") || file.size === 0)) {

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

        const newPreviews = files.map((file) => ({

            file,

            preview: URL.createObjectURL(file),

            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,

        }));

        setImages((previous) => [...previous, ...files]);

        setImagePreviews((previous) => [...previous, ...newPreviews]);

        event.target.value = "";

    };

    const handleRemoveImage = (index) => {
        const item = imagePreviews[index];
        if (item) revokePreview(item.preview);

        setImagePreviews((previous) => previous.filter((_, i) => i !== index));
        setImages((previous) => previous.filter((_, i) => i !== index));
    };

    const toggleListValue = (value, setter) => {
        setter((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value]
        );
    };

    const resetForm = () => {

        setName("");

        setDescription("");

        setShortDescription("");

        setBrand("");

        setSku("");

        setBarcode("");

        setPrice("");

        setCompareAtPrice("");

        setCostPrice("");

        setStock("0");

        setLowStockThreshold("5");

        setCategoryLevels([""]);

        setTags("");

        setSizes([]);

        setCustomSize("");

        setColors([]);

        setCustomColor("");

        setMaterial("");

        setFit("");

        setTargetGroup("Unisex");

        setWeight("");

        setLength("");

        setWidth("");

        setHeight("");

        setShippingClass("");

        setStatus("draft");

        setFeatured(false);

        setAllowBackorders(false);

        setSeoTitle("");

        setMetaDescription("");

        setSlug("");

        imagePreviews.forEach((item) => revokePreview(item.preview));

        setImages([]);

        setImagePreviews([]);

        if (fileInputRef.current) fileInputRef.current.value = "";

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (submittingRef.current) return;
        if (typeof onSubmit !== "function") {
            toast.error("Product save handler is not configured.");
            return;
        }

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

        if (images.length === 0) return toast.error("Please upload at least one product image.");

        if (images.length > MAX_IMAGES) return toast.error(`You can only upload ${MAX_IMAGES} images.`);

        if (sizes.length === 0) return toast.error("Select at least one size, or add One size.");

        if (colors.length === 0) return toast.error("Select at least one color.");

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

        images.forEach((image) => formData.append("images", image));

        try {
            submittingRef.current = true;
            setSubmitting(true);

            await onSubmit(formData);

            resetForm();

        } catch (error) {

            console.error("PRODUCT FORM SUBMIT ERROR:", error);

            toast.error(error?.response?.data?.message || error?.message || "Could not save product.");

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

    return (

        <form className="product-form" onSubmit={handleSubmit} noValidate>

            <header className="product-form__header">

                <p>

                    HARRAGA SHOP · CATALOG

                </p>

                <h2>Create product</h2>

                <p>

                    Add product details, variants, images and search information.

                </p>

            </header>

            <div className="product-form__content">

                <Section title="1. Basic information" description="The details customers see on the product page.">

                    <Field label="Product name" required>

                        <input value={name} onChange={(e) => setName(capitalizeFirstLetter(e.target.value))} autoCapitalize="sentences" spellCheck={false} maxLength={200} placeholder="e.g. Premium Essential Tracksuit" required />

                    </Field>

                    <Field label="Short description" help="A concise summary for product cards (recommended).">

                        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} autoCapitalize="sentences" maxLength={300} placeholder="A short summary of the product" />

                    </Field>

                    <Field label="Full description" required>

                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} autoCapitalize="sentences" maxLength={5000} placeholder="Describe the product, fit, features and care instructions..." required />

                    </Field>

                    <div className="product-form__field-grid">

                        <Field label="Brand"><input value={brand} onChange={(e) => setBrand(e.target.value)} autoCapitalize="words" maxLength={100} placeholder="e.g. Harraga" /></Field>

                        <Field label="SKU / product code"><input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} className="product-form__input-uppercase" maxLength={100} placeholder="e.g. HRG-TRK-001" /></Field>

                        <Field label="Barcode / EAN"><input value={barcode} onChange={(e) => setBarcode(e.target.value)} maxLength={100} placeholder="Optional" /></Field>

                    </div>

                </Section>

                <Section title="2. Categories" description="Build the full category path, from the broad category to the most specific one.">

                    {categoryLevels.map((category, index) => (

                        <div className="product-form__category-row" key={index}>

                            <span>{index + 1}.</span>

                            <input value={category} onChange={(e) => updateCategoryLevel(index, e.target.value)} autoCapitalize="words" maxLength={100} placeholder={index === 0 ? "Main category, e.g. Clothing" : `Category level ${index + 1}`} required />

                            <button type="button" onClick={() => removeCategoryLevel(index)} aria-label={`Remove category level ${index + 1}`}>×</button>

                        </div>

                    ))}

                    <button
                        className="product-form__add-category"
                        type="button"
                        onClick={addCategoryLevel}
                        disabled={categoryLevels.length >= MAX_CATEGORY_LEVELS}
                    >

                        + Add subcategory

                    </button>

                    <Field label="Tags" help="Separate tags with commas, e.g. streetwear, new collection, sportswear.">

                        <input value={tags} onChange={(e) => setTags(e.target.value)} autoCapitalize="none" placeholder="streetwear, new collection" />

                    </Field>

                    <div className="product-form__category-path">

                        <strong>Category path:</strong> {categoryLevels.filter((item) => item.trim()).join(" → ") || "Not set"}

                    </div>

                </Section>

                <Section title="3. Pricing and inventory" description="Prices are non-negative. Keep internal costs for administration only.">

                    <div className="product-form__field-grid product-form__field-grid--two">

                        <Field label="Selling price" required><input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required /></Field>

                        <Field label="Original / compare-at price" help="Optional crossed-out price."><input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="0.00" /></Field>

                        <Field label="Purchase cost" help="Internal admin information."><input type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" /></Field>

                        <Field label="Stock quantity" required><input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required /></Field>

                        <Field label="Low-stock alert at"><input type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} /></Field>

                    </div>

                    <label className="product-form__checkbox-field">

                        <input type="checkbox" checked={allowBackorders} onChange={(e) => setAllowBackorders(e.target.checked)} />

                        Allow orders when out of stock

                    </label>

                </Section>

                <Section title="4. Size and colour variants" description="Select all options that apply. For true variant-level stock and prices, the backend must store each combination separately.">

                    <div className="product-form__variant-group">

                        <p className="product-form__group-label">Sizes *</p>

                        <div className="product-form__option-list">

                            {sizesOptions.map((size) => (

                                <label className="product-form__option" key={size}>

                                    <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleListValue(size, setSizes)} />{size}

                                </label>

                            ))}

                        </div>

                        <div className="product-form__custom-option-row">

                            <input value={customSize} onChange={(e) => setCustomSize(e.target.value.toUpperCase())} className="product-form__input-uppercase" placeholder="Add custom size" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }} />

                            <button type="button" onClick={addCustomSize}>Add</button>

                        </div>

                        {sizes.filter((size) => !sizesOptions.includes(size)).map((size) => <button className="product-form__custom-chip" type="button" key={size} onClick={() => setSizes((previous) => previous.filter((item) => item !== size))}>{size} ×</button>)}

                    </div>

                    <div className="product-form__variant-group">

                        <p className="product-form__group-label">Colours *</p>

                        <div className="product-form__option-list">

                            {colorsOptions.map((color) => (

                                <label className="product-form__option" key={color}>

                                    <input type="checkbox" checked={colors.includes(color)} onChange={() => toggleListValue(color, setColors)} />{color}

                                </label>

                            ))}

                        </div>

                        <div className="product-form__custom-option-row">

                            <input value={customColor} onChange={(e) => setCustomColor(e.target.value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()))} className="product-form__input-capitalize" placeholder="Add custom colour" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColor(); } }} />

                            <button type="button" onClick={addCustomColor}>Add</button>

                        </div>

                        {colors.filter((color) => !colorsOptions.includes(color)).map((color) => <button className="product-form__custom-chip" type="button" key={color} onClick={() => setColors((previous) => previous.filter((item) => item !== color))}>{color} ×</button>)}

                    </div>

                    <div className="product-form__field-grid product-form__field-grid--three">

                        <Field label="Material"><input value={material} onChange={(e) => setMaterial(e.target.value)} autoCapitalize="sentences" placeholder="e.g. 80% cotton, 20% polyester" /></Field>

                        <Field label="Fit / style"><input value={fit} onChange={(e) => setFit(e.target.value)} autoCapitalize="words" placeholder="Regular, slim, oversized..." /></Field>

                        <Field label="Target group">

                            <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>

                                <option>Unisex</option><option>Men</option><option>Women</option><option>Kids</option><option>Baby</option>

                            </select>

                        </Field>

                    </div>

                </Section>

                <Section title="5. Product images" description="Use clear product photography. The first image is treated as the main image.">

                    <div className="product-form__image-upload">

                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} disabled={images.length >= MAX_IMAGES} />

                        <p>Maximum 4 images, 10 MB per image. Supported formats depend on your server configuration.</p>

                        <p>Selected: {images.length}/{MAX_IMAGES}</p>

                    </div>

                    {imagePreviews.length > 0 && (

                        <div className="product-form__image-grid">

                            {imagePreviews.map((item, index) => (

                                <div className="product-form__image-card" key={item.id}>

                                    <img src={item.preview} alt={`Product preview ${index + 1}`} />

                                    <p>{index === 0 ? "Main image" : `Image ${index + 1}`}</p>

                                    <button type="button" onClick={() => handleRemoveImage(index)}>Remove</button>

                                </div>

                            ))}

                        </div>

                    )}

                </Section>

                <Section title="6. Shipping details" description="Optional information for shipping calculations.">

                    <div className="product-form__field-grid product-form__field-grid--two">

                        <Field label="Weight (grams)"><input type="number" min="0" step="1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 650" /></Field>

                        <Field label="Length (cm)"><input type="number" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} /></Field>

                        <Field label="Width (cm)"><input type="number" min="0" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} /></Field>

                        <Field label="Height (cm)"><input type="number" min="0" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>

                    </div>

                    <Field label="Shipping class"><input value={shippingClass} onChange={(e) => setShippingClass(e.target.value)} autoCapitalize="none" placeholder="e.g. standard, bulky" /></Field>

                </Section>

                <Section title="7. Search engine and visibility" description="Improve how the product appears in your store and search results.">

                    <Field label="URL slug" help="Generated from the product name if left blank.">

                        <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="product-form__input-lowercase" placeholder="premium-essential-tracksuit" />

                    </Field>

                    <Field label="SEO title" help="Defaults to the product name.">

                        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} autoCapitalize="sentences" maxLength={70} placeholder="Product title for search engines" />

                    </Field>

                    <Field label="Meta description" help="Defaults to the short description or the beginning of the full description.">

                        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} autoCapitalize="sentences" maxLength={320} placeholder="Short search-result description" />

                    </Field>

                    <label className="product-form__checkbox-field">

                        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />

                        Feature this product in the store

                    </label>

                    <Field label="Publication status" required>

                        <select value={status} onChange={(e) => setStatus(e.target.value)}>

                            <option value="draft">Draft — save without publishing</option>

                            <option value="published">Published — visible in the store</option>

                        </select>

                    </Field>

                </Section>

                <footer className="product-form__footer">

                    <button type="button" onClick={resetForm} disabled={submitting}>

                        Reset form

                    </button>

                    <button type="submit" disabled={submitting}>

                        {submitting ? "Saving product…" : status === "published" ? "Publish product" : "Save as draft"}

                    </button>

                </footer>

            </div>

            <p className="product-form__note">

                Note: This form sends additional fields such as variants, SEO, shipping and publication status. Your Express controller and Product model must explicitly support these fields for them to be saved. The current basic Product schema may ignore fields it does not define.

            </p>

        </form>

    );

}

export default ProductForm;

