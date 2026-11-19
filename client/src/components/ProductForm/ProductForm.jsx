import { useEffect, useRef, useState } from "react";
import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    arrayMove,
    rectSortingStrategy,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "react-toastify";
import "./ProductForm.scss";

const MAX_IMAGES = 4;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One size"];
const COLOR_OPTIONS = [
    "Black", "White", "Grey", "Navy", "Blue",
    "Red", "Green", "Beige", "Brown",
];

const capitalizeFirstLetter = (value) =>
    value.replace(/^(\s*)(\p{L})/u, (_, whitespace, character) =>
        whitespace + character.toLocaleUpperCase()
    );

function Field({ label, required = false, help, children }) {
    return (
        <label className="product-form__field">
            <span className="product-form__field-label">
                {label} {required && <span aria-hidden="true">*</span>}
            </span>
            {children}
            {help && <span className="product-form__field-help">{help}</span>}
        </label>
    );
}

function Section({ title, description, children }) {
    return (
        <section className="product-form__section">
            <div className="product-form__section-heading">
                <h3>{title}</h3>
                {description && <p>{description}</p>}
            </div>
            {children}
        </section>
    );
}



function SortableFormImage({ item, index, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 5 : "auto",
        opacity: isDragging ? 0.65 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            className={`product-form__image-card${index === 0 ? " is-main-image" : ""}`}
            style={style}
        >
            <span className="product-form__image-position">
                {index === 0 ? "BILD 1 · HUVUDBILD" : `BILD ${index + 1}`}
            </span>
            <img
                src={item.preview}
                alt={`Product image ${index + 1}`}
                draggable="false"
                {...attributes}
                {...listeners}
            />
            <button
                type="button"
                onClick={() => onRemove(index)}
                onPointerDown={(event) => event.stopPropagation()}
            >
                Remove
            </button>
        </div>
    );
}

function TargetAudienceSelect({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const optionRefs = useRef([]);

    const options = ["Unisex", "Men", "Women", "Kids", "Baby"];
    const selectedIndex = Math.max(0, options.indexOf(value));
    const activeOptionId = `product-audience-option-${activeIndex}`;

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
        }
    }, [activeIndex, isOpen]);

    const chooseOption = (option) => {
        onChange(option);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const openMenu = () => {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
    };

    const handleTriggerKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();

            if (!isOpen) {
                openMenu();
                return;
            }

            setActiveIndex((current) =>
                event.key === "ArrowDown"
                    ? (current + 1) % options.length
                    : (current - 1 + options.length) % options.length
            );
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            if (!isOpen) {
                openMenu();
            } else {
                chooseOption(options[activeIndex]);
            }
        } else if (event.key === "Home" && isOpen) {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === "End" && isOpen) {
            event.preventDefault();
            setActiveIndex(options.length - 1);
        }
    };

    const handleOptionKeyDown = (event, index) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex(
                event.key === "ArrowDown"
                    ? (index + 1) % options.length
                    : (index - 1 + options.length) % options.length
            );
            triggerRef.current?.focus();
        } else if (event.key === "Home") {
            event.preventDefault();
            setActiveIndex(0);
            triggerRef.current?.focus();
        } else if (event.key === "End") {
            event.preventDefault();
            setActiveIndex(options.length - 1);
            triggerRef.current?.focus();
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            chooseOption(options[index]);
        }
    };

    return (
        <div
            className={`product-form__audience-select${isOpen ? " is-open" : ""}`}
            ref={dropdownRef}
        >
            <button
                ref={triggerRef}
                className="product-form__audience-trigger"
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls="product-target-audience-listbox"
                aria-activedescendant={isOpen ? activeOptionId : undefined}
                aria-label="Target audience"
                onClick={() => {
                    if (isOpen) {
                        setIsOpen(false);
                    } else {
                        openMenu();
                    }
                }}
                onKeyDown={handleTriggerKeyDown}
            >
                <span className="product-form__audience-value">{value}</span>
                <svg className="product-form__audience-chevron" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m5 7.5 5 5 5-5" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="product-form__audience-menu"
                    id="product-target-audience-listbox"
                    role="listbox"
                    aria-label="Target audience"
                    aria-activedescendant={activeOptionId}
                >
                    {options.map((option, index) => (
                        <button
                            id={`product-audience-option-${index}`}
                            key={option}
                            ref={(element) => { optionRefs.current[index] = element; }}
                            className={[
                                "product-form__audience-option",
                                option === value ? "is-selected" : "",
                                index === activeIndex ? "is-active" : "",
                            ].filter(Boolean).join(" ")}
                            type="button"
                            role="option"
                            aria-selected={option === value}
                            tabIndex={-1}
                            onMouseEnter={() => setActiveIndex(index)}
                            onKeyDown={(event) => handleOptionKeyDown(event, index)}
                            onClick={() => chooseOption(option)}
                        >
                            <span>{option}</span>
                            {option === value && (
                                <span className="product-form__audience-check" aria-hidden="true">✓</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function NumberInput({
    value,
    onChange,
    min = 0,
    step = 1,
    placeholder,
    required = false,
    ariaLabel,
}) {
    const adjustValue = (direction) => {
        const current = value === "" ? Number(min) || 0 : Number(value);
        const precision = String(step).includes(".")
            ? String(step).split(".")[1].length
            : 0;
        const next = Math.max(Number(min) || 0, current + direction * Number(step));
        onChange(String(Number(next.toFixed(precision))));
    };

    return (
        <div className="product-form__number-control">
            <input
                className="product-form__number-input"
                type="number"
                min={min}
                step={step}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                aria-label={ariaLabel}
            />
            <span className="product-form__number-buttons">
                <button
                    className="product-form__number-button"
                    type="button"
                    aria-label={`Increase ${ariaLabel || "value"}`}
                    onClick={() => adjustValue(1)}
                >
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2 8 6 4l4 4" />
                    </svg>
                </button>
                <button
                    className="product-form__number-button"
                    type="button"
                    aria-label={`Decrease ${ariaLabel || "value"}`}
                    onClick={() => adjustValue(-1)}
                >
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                        <path d="m2 4 4 4 4-4" />
                    </svg>
                </button>
            </span>
        </div>
    );
}


function ProductStatusSelect({ value, onChange }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const optionRefs = useRef([]);

    const options = [
        { value: "draft", label: "Draft – not published yet", description: "Only visible to administrators" },
        { value: "published", label: "Published – visible in the store", description: "Customers can view this product" },
    ];
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value));
    const activeOptionId = `product-status-option-${activeIndex}`;

    useEffect(() => {
        if (!isOpen) return undefined;

        const handlePointerDown = (event) => {
            if (!dropdownRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            optionRefs.current[activeIndex]?.scrollIntoView?.({ block: "nearest" });
        }
    }, [activeIndex, isOpen]);

    const chooseOption = (option) => {
        onChange(option.value);
        setIsOpen(false);
        triggerRef.current?.focus();
    };

    const openMenu = () => {
        setActiveIndex(selectedIndex);
        setIsOpen(true);
    };

    const handleTriggerKeyDown = (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!isOpen) {
                openMenu();
                return;
            }
            setActiveIndex((current) =>
                event.key === "ArrowDown"
                    ? (current + 1) % options.length
                    : (current - 1 + options.length) % options.length
            );
        } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!isOpen) {
                openMenu();
            } else {
                chooseOption(options[activeIndex]);
            }
        } else if (event.key === "Home" && isOpen) {
            event.preventDefault();
            setActiveIndex(0);
        } else if (event.key === "End" && isOpen) {
            event.preventDefault();
            setActiveIndex(options.length - 1);
        } else if (event.key === "Tab" && isOpen) {
            setIsOpen(false);
        }
    };

    return (
        <div
            className={`product-form__status-select${isOpen ? " is-open" : ""}`}
            ref={dropdownRef}
        >
            <button
                ref={triggerRef}
                className="product-form__status-trigger"
                type="button"
                role="combobox"
                aria-label="Product status"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls="product-status-listbox"
                aria-activedescendant={isOpen ? activeOptionId : undefined}
                onClick={() => (isOpen ? setIsOpen(false) : openMenu())}
                onKeyDown={handleTriggerKeyDown}
            >
                <span className="product-form__status-trigger-copy">
                    <span className="product-form__status-current">
                        {options[selectedIndex].label}
                    </span>
                    <span className="product-form__status-caption">
                        {options[selectedIndex].description}
                    </span>
                </span>
                <svg className="product-form__status-chevron" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="m5 7.5 5 5 5-5" />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="product-form__status-menu"
                    id="product-status-listbox"
                    role="listbox"
                    aria-label="Product status"
                    aria-activedescendant={activeOptionId}
                >
                    {options.map((option, index) => (
                        <button
                            id={`product-status-option-${index}`}
                            key={option.value}
                            ref={(element) => { optionRefs.current[index] = element; }}
                            className={[
                                "product-form__status-option",
                                option.value === value ? "is-selected" : "",
                                index === activeIndex ? "is-active" : "",
                            ].filter(Boolean).join(" ")}
                            type="button"
                            role="option"
                            aria-selected={option.value === value}
                            tabIndex={-1}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => chooseOption(option)}
                        >
                            <span className="product-form__status-option-indicator" aria-hidden="true">
                                {option.value === value ? "✓" : ""}
                            </span>
                            <span className="product-form__status-option-copy">
                                <span className="product-form__status-option-label">{option.label}</span>
                                <span className="product-form__status-option-description">{option.description}</span>
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProductForm({ onSubmit }) {
    // Product information
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [shortDescription, setShortDescription] = useState("");
    const [brand, setBrand] = useState("");
    const [sku, setSku] = useState("");
    const [barcode, setBarcode] = useState("");

    // Pricing and inventory
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [costPrice, setCostPrice] = useState("");
    const [stock, setStock] = useState("0");
    const [lowStockThreshold, setLowStockThreshold] = useState("5");
    const [allowBackorders, setAllowBackorders] = useState(false);

    // Categories
    const [categoryLevels, setCategoryLevels] = useState([""]);
    const [tags, setTags] = useState("");

    // Clothing variants and details
    const [sizes, setSizes] = useState([]);
    const [customSize, setCustomSize] = useState("");
    const [colors, setColors] = useState([]);
    const [customColor, setCustomColor] = useState("");
    const [material, setMaterial] = useState("");
    const [fit, setFit] = useState("");
    const [targetGroup, setTargetGroup] = useState("Unisex");

    // Shipping
    const [weight, setWeight] = useState("");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [shippingClass, setShippingClass] = useState("");

    // Store visibility and SEO
    const [status, setStatus] = useState("draft");
    const [featured, setFeatured] = useState(false);
    const [seoTitle, setSeoTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [slug, setSlug] = useState("");

    // Images and submission
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const submittingRef = useRef(false);
    const objectUrlsRef = useRef(new Set());
    const imageSensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleImageDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;

        setImagePreviews((previous) => {
            const oldIndex = previous.findIndex((item) => item.id === active.id);
            const newIndex = previous.findIndex((item) => item.id === over.id);
            if (oldIndex < 0 || newIndex < 0) return previous;
            return arrayMove(previous, oldIndex, newIndex);
        });

        setImages((previous) => {
            const oldIndex = imagePreviews.findIndex((item) => item.id === active.id);
            const newIndex = imagePreviews.findIndex((item) => item.id === over.id);
            if (oldIndex < 0 || newIndex < 0) return previous;
            return arrayMove(previous, oldIndex, newIndex);
        });
    };

    useEffect(() => {
        const objectUrls = objectUrlsRef.current;
        return () => {
            objectUrls.forEach((url) => URL.revokeObjectURL(url));
            objectUrls.clear();
        };
    }, []);

    const revokePreview = (preview) => {
        if (!preview || !objectUrlsRef.current.has(preview)) return;
        URL.revokeObjectURL(preview);
        objectUrlsRef.current.delete(preview);
    };

    const toggleListValue = (value, setter) => {
        setter((previous) =>
            previous.includes(value)
                ? previous.filter((item) => item !== value)
                : [...previous, value]
        );
    };

    const addCategoryLevel = () => {
        if (!categoryLevels[categoryLevels.length - 1]?.trim()) {
            toast.error("Please fill in the current category first.");
            return;
        }
        setCategoryLevels((previous) => [...previous, ""]);
    };

    const updateCategoryLevel = (index, value) => {
        setCategoryLevels((previous) =>
            previous.map((item, itemIndex) => itemIndex === index ? value : item)
        );
    };

    const removeCategoryLevel = (index) => {
        setCategoryLevels((previous) =>
            previous.length === 1 ? [""] : previous.filter((_, i) => i !== index)
        );
    };

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);
        if (!files.length) return;

        if (files.some((file) => !file.type?.startsWith("image/") || file.size === 0)) {
            toast.error("Please upload valid image files only.");
            event.target.value = "";
            return;
        }

        if (images.length + files.length > MAX_IMAGES) {
            toast.error(`You can upload up to ${MAX_IMAGES} images.`);
            event.target.value = "";
            return;
        }

        if (files.some((file) => file.size > MAX_IMAGE_SIZE)) {
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

    const addCustomSize = () => {
        const value = customSize.trim().toUpperCase();
        if (!value) return;
        if (!sizes.includes(value)) setSizes((previous) => [...previous, value]);
        setCustomSize("");
    };

    const addCustomColor = () => {
        const value = customColor.trim().toLowerCase()
            .replace(/\b\w/g, (character) => character.toUpperCase());
        if (!value) return;
        if (!colors.includes(value)) setColors((previous) => [...previous, value]);
        setCustomColor("");
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

        if (!name.trim()) return toast.error("Please enter a product name.");
        if (!description.trim()) return toast.error("Please add a product description.");
        if (name.trim().length > 200) return toast.error("Product name must be 200 characters or fewer.");
        if (description.trim().length > 5000) return toast.error("Description must be 5,000 characters or fewer.");

        // The first category is required. Extra category levels are optional.
        const categoryPath = categoryLevels.map((value) => value.trim()).filter(Boolean);
        if (!categoryPath.length) return toast.error("Please select a product category.");
        if (categoryPath.length > 20 || categoryPath.some((value) => value.length > 100)) {
            return toast.error("Please check the categories. Each level must be 100 characters or fewer.");
        }

        const numericFields = [
            ["Price", price, true],
            ["Compare-at price", compareAtPrice, false],
            ["Purchase cost", costPrice, false],
            ["Stock quantity", stock, true],
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
            if (["Stock quantity", "Low-stock threshold"].includes(label) && !Number.isInteger(number)) {
                return toast.error(`${label} must be a whole number.`);
            }
        }

        if (images.length === 0) return toast.error("Please upload at least one product image.");
        if (sizes.length === 0) return toast.error("Please select at least one size.");
        if (colors.length === 0) return toast.error("Please select at least one color.");

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

    return (
        <form className="product-form product-form--simplified" onSubmit={handleSubmit} noValidate>
            <header className="product-form__header">
                <p className="product-form__eyebrow">YOUR STORE · PRODUCTS</p>
                <h2>Add product</h2>
                <p>Create a product page for your design.</p>
            </header>

            <div className="product-form__content">
                <Section title="Product information" description="Start with the details your customers need to know.">
                    <Field label="Product name" required>
                        <input
                            value={name}
                            onChange={(event) => setName(capitalizeFirstLetter(event.target.value))}
                            autoCapitalize="sentences"
                            maxLength={200}
                            placeholder="Ex. Essential Hoodie"
                            required
                        />
                    </Field>

                    <Field label="Short description" help="A short summary that can appear in product listings.">
                        <input
                            value={shortDescription}
                            onChange={(event) => setShortDescription(event.target.value)}
                            maxLength={300}
                            placeholder="E.g. A clean hoodie with a relaxed fit."
                        />
                    </Field>

                    <Field label="Product description" required help="Describe the design, fit, and material.">
                        <textarea
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            autoCapitalize="sentences"
                            maxLength={5000}
                            rows={5}
                            placeholder="Tell customers about the garment and what makes it special..."
                            required
                        />
                    </Field>

                    <div className="product-form__field-grid product-form__field-grid--two">
                        <Field label="Brand">
                            <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Your brand" />
                        </Field>
                        <Field label="Category" required>
                            <input
                                value={categoryLevels[0] || ""}
                                onChange={(event) => updateCategoryLevel(0, event.target.value)}
                                placeholder="E.g. Hoodies"
                                required
                            />
                        </Field>
                    </div>
                    <div className="product-form__category-extra">
                        {categoryLevels.slice(1).map((category, index) => (
                            <div className="product-form__category-row" key={index + 1}>
                                <input
                                    value={category}
                                    onChange={(event) => updateCategoryLevel(index + 1, event.target.value)}
                                    placeholder={`Subcategory ${index + 1}`}
                                    aria-label={`Subcategory ${index + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeCategoryLevel(index + 1)}
                                    aria-label={`Remove subcategory ${index + 1}`}
                                    title="Remove subcategory"
                                >
                                    ×
                                </button>
                            </div>
                        ))}

                        <div className="product-form__subcategory-actions">
                            <button
                                className="product-form__text-button"
                                type="button"
                                onClick={addCategoryLevel}
                            >
                                <span className="product-form__text-button-icon" aria-hidden="true">+</span>
                                <span>Add subcategory</span>
                            </button>

                            <details className="product-form__subcategory-tooltip">
                                <summary aria-label="What is a subcategory?" title="What is a subcategory?">
                                    <span aria-hidden="true">?</span>
                                </summary>
                                <div className="product-form__subcategory-tooltip-content" role="tooltip">
                                    <strong>What is a subcategory?</strong>
                                    <p>
                                        A subcategory is a more specific group within a main category.
                                        It helps customers browse your products more easily.
                                    </p>
                                    <span className="product-form__subcategory-tooltip-example">
                                        Example: Clothing <span aria-hidden="true">›</span> Hoodies <span aria-hidden="true">›</span> Zip-up hoodies
                                    </span>
                                </div>
                            </details>
                            <span className="product-form__subcategory-optional">Optional</span>
                        </div>
                    </div>
                </Section>

                <Section title="Images" description="Add up to four images. The first image will be the main image.">
                    <div className="product-form__image-upload">
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            disabled={images.length >= MAX_IMAGES}
                        />
                        <p>{images.length} of {MAX_IMAGES} images selected · Max 10 MB per image</p>
                    </div>
                    {imagePreviews.length > 0 && (
                        <DndContext
                            sensors={imageSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleImageDragEnd}
                        >
                            <SortableContext
                                items={imagePreviews.map((item) => item.id)}
                                strategy={rectSortingStrategy}
                            >
                                <div className="product-form__image-grid">
                                    {imagePreviews.map((item, index) => (
                                        <SortableFormImage
                                            key={item.id}
                                            item={item}
                                            index={index}
                                            onRemove={handleRemoveImage}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </Section>

                <Section title="Sizes & colors" description="Select all options customers can order.">
                    <div className="product-form__variant-group">
                        <p className="product-form__group-label">Sizes <span>*</span></p>
                        <div className="product-form__option-list">
                            {SIZE_OPTIONS.map((size) => (
                                <label className="product-form__option" key={size}>
                                    <input type="checkbox" checked={sizes.includes(size)} onChange={() => toggleListValue(size, setSizes)} />
                                    {size}
                                </label>
                            ))}
                        </div>
                        <div className="product-form__custom-option-row">
                            <input
                                value={customSize}
                                onChange={(event) => setCustomSize(event.target.value.toUpperCase())}
                                placeholder="Custom size"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addCustomSize();
                                    }
                                }}
                            />
                            <button type="button" onClick={addCustomSize}>Add</button>
                        </div>
                        <div className="product-form__custom-chip-list" aria-label="Custom sizes">
                            {sizes.filter((size) => !SIZE_OPTIONS.includes(size)).map((size) => (
                                <button
                                    className="product-form__custom-chip"
                                    type="button"
                                    key={size}
                                    onClick={() => setSizes((previous) => previous.filter((item) => item !== size))}
                                    aria-label={`Remove custom size ${size}`}
                                    title={`Remove ${size}`}
                                >
                                    <span className="product-form__custom-chip-label">{size}</span>
                                    <span className="product-form__custom-chip-remove" aria-hidden="true">×</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="product-form__variant-group">
                        <p className="product-form__group-label">Colors <span>*</span></p>
                        <div className="product-form__option-list">
                            {COLOR_OPTIONS.map((color) => (
                                <label className="product-form__option" key={color}>
                                    <input type="checkbox" checked={colors.includes(color)} onChange={() => toggleListValue(color, setColors)} />
                                    {color}
                                </label>
                            ))}
                        </div>
                        <div className="product-form__custom-option-row">
                            <input
                                value={customColor}
                                onChange={(event) => setCustomColor(event.target.value)}
                                placeholder="Custom color"
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") {
                                        event.preventDefault();
                                        addCustomColor();
                                    }
                                }}
                            />
                            <button type="button" onClick={addCustomColor}>Add</button>
                        </div>
                        <div className="product-form__custom-chip-list" aria-label="Custom colors">
                            {colors.filter((color) => !COLOR_OPTIONS.includes(color)).map((color) => (
                                <button
                                    className="product-form__custom-chip"
                                    type="button"
                                    key={color}
                                    onClick={() => setColors((previous) => previous.filter((item) => item !== color))}
                                    aria-label={`Remove custom color ${color}`}
                                    title={`Remove ${color}`}
                                >
                                    <span className="product-form__custom-chip-label">{color}</span>
                                    <span className="product-form__custom-chip-remove" aria-hidden="true">×</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="product-form__field-grid product-form__field-grid--three">
                        <Field label="Material">
                            <input value={material} onChange={(event) => setMaterial(event.target.value)} placeholder="E.g. 100% cotton" />
                        </Field>
                        <Field label="Fit">
                            <input value={fit} onChange={(event) => setFit(event.target.value)} placeholder="E.g. Oversized" />
                        </Field>
                        <div className="product-form__field">
                            <span className="product-form__field-label" id="product-target-audience-label">
                                Target audience
                            </span>
                            <TargetAudienceSelect
                                value={targetGroup}
                                onChange={setTargetGroup}
                            />
                        </div>
                    </div>
                </Section>

                <Section title="Pricing & inventory" description="Set the customer price and the quantity you have in stock.">
                    <div className="product-form__field-grid product-form__field-grid--two">
                        <Field label="Selling price" required>
                            <NumberInput value={price} onChange={setPrice} min={0} step={0.01} placeholder="0,00" required ariaLabel="Selling price" />
                        </Field>
                        <Field label="Compare-at price" help="Optional · Shown crossed out on sale.">
                            <NumberInput value={compareAtPrice} onChange={setCompareAtPrice} min={0} step={0.01} placeholder="0,00" ariaLabel="Compare-at price" />
                        </Field>
                        <Field label="Stock quantity" required>
                            <NumberInput value={stock} onChange={setStock} min={0} step={1} required ariaLabel="Stock quantity" />
                        </Field>
                    </div>
                    <label className="product-form__checkbox-field">
                        <input type="checkbox" checked={allowBackorders} onChange={(event) => setAllowBackorders(event.target.checked)} />
                        Allow orders when out of stock
                    </label>
                </Section>

                <details className="product-form__advanced">
                    <summary>
                        <span>
                            <strong>Advanced settings</strong>
                            <small>SKU, SEO, shipping, purchase cost, and more</small>
                        </span>
                        <span className="product-form__advanced-icon" aria-hidden="true">+</span>
                    </summary>

                    <div className="product-form__advanced-content">
                        <Section title="Inventory & product codes" description="Internal details to help manage your product catalog.">
                            <div className="product-form__field-grid product-form__field-grid--two">
                                <Field label="SKU / product code">
                                    <input value={sku} onChange={(event) => setSku(event.target.value.toUpperCase())} placeholder="Ex. HD-001" />
                                </Field>
                                <Field label="Barcode / EAN">
                                    <input value={barcode} onChange={(event) => setBarcode(event.target.value)} placeholder="Optional" />
                                </Field>
                                <Field label="Purchase cost" help="Visible to administrators only.">
                                    <NumberInput value={costPrice} onChange={setCostPrice} min={0} step={0.01} placeholder="0,00" ariaLabel="Purchase cost" />
                                </Field>
                                <Field label="Low-stock alert threshold">
                                    <NumberInput value={lowStockThreshold} onChange={setLowStockThreshold} min={0} step={1} ariaLabel="Low-stock threshold" />
                                </Field>
                            </div>
                            <Field label="Tags" help="Separate tags with commas.">
                                <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="streetwear, new collection, limited edition" />
                            </Field>
                        </Section>

                        <Section title="Shipping information" description="Optional – can be used for shipping calculations.">
                            <div className="product-form__field-grid product-form__field-grid--two">
                                <Field label="Weight (grams)">
                                    <NumberInput value={weight} onChange={setWeight} min={0} step={1} placeholder="Ex. 650" ariaLabel="Weight" />
                                </Field>
                                <Field label="Shipping class">
                                    <input value={shippingClass} onChange={(event) => setShippingClass(event.target.value)} placeholder="E.g. standard" />
                                </Field>
                                <Field label="Length (cm)">
                                    <NumberInput value={length} onChange={setLength} min={0} step={0.1} ariaLabel="Length" />
                                </Field>
                                <Field label="Width (cm)">
                                    <NumberInput value={width} onChange={setWidth} min={0} step={0.1} ariaLabel="Width" />
                                </Field>
                                <Field label="Height (cm)">
                                    <NumberInput value={height} onChange={setHeight} min={0} step={0.1} ariaLabel="Height" />
                                </Field>
                            </div>
                        </Section>

                        <Section title="SEO & visibility" description="Helps customers find your product through search engines.">
                            <Field label="URL slug" help="Generated automatically from the product name if left blank.">
                                <input value={slug} onChange={(event) => setSlug(event.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="essential-hoodie" />
                            </Field>
                            <Field label="SEO title">
                                <input value={seoTitle} onChange={(event) => setSeoTitle(event.target.value)} maxLength={70} placeholder="Title shown in search results" />
                            </Field>
                            <Field label="Meta description">
                                <textarea value={metaDescription} onChange={(event) => setMetaDescription(event.target.value)} maxLength={320} rows={3} placeholder="Short description for search results" />
                            </Field>
                            <label className="product-form__checkbox-field">
                                <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
                                Feature this product in the store
                            </label>
                        </Section>

                        <Section title="Publishing">
                            <Field label="Product status">
                                <ProductStatusSelect value={status} onChange={setStatus} />
                            </Field>
                        </Section>
                    </div>
                </details>

                <footer className="product-form__footer">
                    <button type="button" onClick={resetForm} disabled={submitting}>
                        Reset form
                    </button>
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Saving..." : status === "published" ? "Publish product" : "Save product"}
                    </button>
                </footer>
            </div>

        </form>
    );
}

export default ProductForm;
