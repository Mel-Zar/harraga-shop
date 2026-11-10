import { useEffect, useRef, useState } from "react";

import { toast } from "react-toastify";

import "./ProductEdit.scss";

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

        event.target.value = "";

    };

    const handleRemoveImage = (index) => {

        const item = imagePreviews[index];
        if (item) revokePreview(item.preview);
        setImagePreviews((previous) => previous.filter((_, i) => i !== index));

        setImages((previous) => previous.filter((_, i) => i !== index));

    };

    const toggleListValue = (value, setter, current) => {

        setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);

    };

    const handleSubmit = async (event) => {

        event.preventDefault();

        if (submitting) return;

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

        if (images.length + existingImages.length === 0) return toast.error("Please keep or upload at least one product image.");

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

        formData.append("removedImages", JSON.stringify(removedImages));

        formData.append("existingImages", JSON.stringify(existingImages));

        images.forEach((image) => formData.append("images", image));

        try {

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

    return (

        <form className="product-edit" onSubmit={handleSubmit} noValidate>

            <header>

                <p>

                    HARRAGA SHOP · CATALOG

                </p>

                <h2>Edit product</h2>

                <p>

                    Add product details, variants, images and search information.

                </p>

            </header>

            <div>

                <Section title="1. Basic information" description="The details customers see on the product page.">

                    <Field label="Product name" required>

                        <input value={name} onChange={(e) => setName(capitalizeFirstLetter(e.target.value))} autoCapitalize="sentences" maxLength={200} placeholder="e.g. Premium Essential Tracksuit" required />

                    </Field>

                    <Field label="Short description" help="A concise summary for product cards (recommended).">

                        <textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} maxLength={300} placeholder="A short summary of the product" />

                    </Field>

                    <Field label="Full description" required>

                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={5000} placeholder="Describe the product, fit, features and care instructions..." required />

                    </Field>

                    <div>

                        <Field label="Brand"><input value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={100} placeholder="e.g. Harraga" /></Field>

                        <Field label="SKU / product code"><input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} className="product-form__input-uppercase" maxLength={100} placeholder="e.g. HRG-TRK-001" /></Field>

                        <Field label="Barcode / EAN"><input value={barcode} onChange={(e) => setBarcode(e.target.value)} maxLength={100} placeholder="Optional" /></Field>

                    </div>

                </Section>

                <Section title="2. Categories" description="Build the full category path, from the broad category to the most specific one.">

                    {categoryLevels.map((category, index) => (

                        <div key={index} >

                            <span>{index + 1}.</span>

                            <input value={category} onChange={(e) => updateCategoryLevel(index, e.target.value)} maxLength={100} placeholder={index === 0 ? "Main category, e.g. Clothing" : `Category level ${index + 1}`} required />

                            <button type="button" onClick={() => removeCategoryLevel(index)} aria-label={`Remove category level ${index + 1}`} >×</button>

                        </div>

                    ))}

                    <button type="button" onClick={addCategoryLevel} disabled={categoryLevels.length >= MAX_CATEGORY_LEVELS} >

                        \+ Add subcategory

                    </button>

                    <Field label="Tags" help="Separate tags with commas, e.g. streetwear, new collection, sportswear.">

                        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="streetwear, new collection" />

                    </Field>

                    <div>

                        <strong>Category path:</strong> {categoryLevels.filter((item) => item.trim()).join(" → ") || "Not set"}

                    </div>

                </Section>

                <Section title="3. Pricing and inventory" description="Prices are non-negative. Keep internal costs for administration only.">

                    <div>

                        <Field label="Selling price" required><input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" required /></Field>

                        <Field label="Original / compare-at price" help="Optional crossed-out price."><input type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="0.00" /></Field>

                        <Field label="Purchase cost" help="Internal admin information."><input type="number" min="0" step="0.01" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} placeholder="0.00" /></Field>

                        <Field label="Stock quantity" required><input type="number" min="0" step="1" value={stock} onChange={(e) => setStock(e.target.value)} required /></Field>

                        <Field label="Low-stock alert at"><input type="number" min="0" step="1" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} /></Field>

                    </div>

                    <label>

                        <input type="checkbox" checked={allowBackorders} onChange={(e) => setAllowBackorders(e.target.checked)} />

                        Allow orders when out of stock

                    </label>

                </Section>

                <Section title="4. Size and colour variants" description="Select all options that apply. For true variant-level stock and prices, the backend must store each combination separately.">

                    <div>

                        <p>Sizes *</p>

                        <div>

                            {sizesOptions.map((size) => (

                                <label key={size} >

                                    <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleListValue(size, setSizes, sizes)} />{size}

                                </label>

                            ))}

                        </div>

                        <div>

                            <input value={customSize} onChange={(e) => setCustomSize(e.target.value.toUpperCase())} className="product-form__input-uppercase" placeholder="Add custom size" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSize(); } }} />

                            <button type="button" onClick={addCustomSize} >Add</button>

                        </div>

                        {sizes.filter((size) => !sizesOptions.includes(size)).map((size) => <button type="button" key={size} onClick={() => setSizes((previous) => previous.filter((item) => item !== size))} >{size} ×</button>)}

                    </div>

                    <div>

                        <p>Colours *</p>

                        <div>

                            {colorsOptions.map((color) => (

                                <label key={color} >

                                    <input type="checkbox" checked={colors.includes(color)} onChange={() => toggleListValue(color, setColors, colors)} />{color}

                                </label>

                            ))}

                        </div>

                        <div>

                            <input value={customColor} onChange={(e) => setCustomColor(e.target.value.toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase()))} className="product-form__input-capitalize" placeholder="Add custom colour" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomColor(); } }} />

                            <button type="button" onClick={addCustomColor} >Add</button>

                        </div>

                        {colors.filter((color) => !colorsOptions.includes(color)).map((color) => <button type="button" key={color} onClick={() => setColors((previous) => previous.filter((item) => item !== color))} >{color} ×</button>)}

                    </div>

                    <div>

                        <Field label="Material"><input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g. 80% cotton, 20% polyester" /></Field>

                        <Field label="Fit / style"><input value={fit} onChange={(e) => setFit(e.target.value)} placeholder="Regular, slim, oversized..." /></Field>

                        <Field label="Target group">

                            <select value={targetGroup} onChange={(e) => setTargetGroup(e.target.value)}>

                                <option>Unisex</option><option>Men</option><option>Women</option><option>Kids</option><option>Baby</option>

                            </select>

                        </Field>

                    </div>

                </Section>

                <Section title="5. Product images" description="Use clear product photography. The first image is treated as the main image.">

                    <div>

                        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} disabled={images.length + existingImages.length >= MAX_IMAGES} />

                        <p>Maximum 4 images, 10 MB per image. Supported formats depend on your server configuration.</p>

                        <p>Selected: {existingImages.length + images.length}/{MAX_IMAGES}</p>

                    </div>

                    {existingImages.length > 0 && (

                        <div>

                            {existingImages.map((url, index) => (

                                <div key={`${url} - ${index}`} >

                                    <img src={url} alt={`Existing product image ${index + 1} `} />

                                    <p>{index === 0 ? "Current main image" : `Current image ${index + 1} `}</p>

                                    <button type="button" onClick={() => { setExistingImages((prev) => prev.filter((_, i) => i !== index)); setRemovedImages((prev) => [...prev, url]); }} >Remove</button>

                                </div>

                            ))}

                        </div>

                    )}

                    {imagePreviews.length > 0 && (

                        <div>

                            {imagePreviews.map((item, index) => (

                                <div key={item.id} >

                                    <img src={item.preview} alt={`Product preview ${index + 1}`} />

                                    <p>{index === 0 ? "Main image" : `Image ${index + 1}`}</p>

                                    <button type="button" onClick={() => handleRemoveImage(index)} >Remove</button>

                                </div>

                            ))}

                        </div>

                    )}

                </Section>

                <Section title="6. Shipping details" description="Optional information for shipping calculations.">

                    <div>

                        <Field label="Weight (grams)"><input type="number" min="0" step="1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g. 650" /></Field>

                        <Field label="Length (cm)"><input type="number" min="0" step="0.1" value={length} onChange={(e) => setLength(e.target.value)} /></Field>

                        <Field label="Width (cm)"><input type="number" min="0" step="0.1" value={width} onChange={(e) => setWidth(e.target.value)} /></Field>

                        <Field label="Height (cm)"><input type="number" min="0" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} /></Field>

                    </div>

                    <Field label="Shipping class"><input value={shippingClass} onChange={(e) => setShippingClass(e.target.value)} placeholder="e.g. standard, bulky" /></Field>

                </Section>

                <Section title="7. Search engine and visibility" description="Improve how the product appears in your store and search results.">

                    <Field label="URL slug" help="Generated from the product name if left blank.">

                        <input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} className="product-form__input-lowercase" placeholder="premium-essential-tracksuit" />

                    </Field>

                    <Field label="SEO title" help="Defaults to the product name.">

                        <input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="Product title for search engines" />

                    </Field>

                    <Field label="Meta description" help="Defaults to the short description or the beginning of the full description.">

                        <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} maxLength={320} placeholder="Short search-result description" />

                    </Field>

                    <label>

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

                <footer>

                    <button type="button" onClick={onCancel} disabled={submitting} >

                        Cancel editing

                    </button>

                    <button type="submit" disabled={submitting} >

                        {submitting ? "Saving changes…" : "Save changes"}

                    </button>

                </footer>

            </div>

            <p>

                Note: Your Express controller and Product model must support the advanced fields for them to be persisted.

            </p>

        </form>

    );

}

export default ProductEdit;
