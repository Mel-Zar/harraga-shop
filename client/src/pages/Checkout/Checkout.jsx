import { useState } from "react";
import { useCart } from "../../context/useCart";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { createOrder } from "../../services/orderService";

function Checkout() {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
        city: "",
        postalCode: "",
    });

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    // ============================================
    // 💰 PRICING
    // ============================================

    const subtotal = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.price || 0) *
            Number(item.quantity || 0),
        0
    );

    const tax = subtotal * 0.25;

    const shipping =
        cartItems.length > 0 ? 49 : 0;

    const totalPrice =
        subtotal +
        tax +
        shipping;

    // ============================================
    // 📦 TOTAL ITEMS
    // ============================================

    const totalItems = cartItems.reduce(
        (total, item) =>
            total +
            Number(item.quantity || 0),
        0
    );

    // ============================================
    // 📝 HANDLE FORM CHANGE
    // ============================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));
    };

    // ============================================
    // 🧹 NORMALIZE FORM
    // ============================================

    const normalizedForm = {
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
    };

    // ============================================
    // 📧 EMAIL VALIDATION
    // ============================================

    const isValidEmail = (email) => {
        if (!email) {
            return true;
        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            email
        );
    };

    // ============================================
    // 📞 PHONE VALIDATION
    // ============================================

    const isValidPhone = (phone) => {
        return /^[0-9+\s()-]{7,20}$/.test(
            phone
        );
    };

    // ============================================
    // 🛒 CREATE ORDER
    // ============================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ============================================
        // 🛒 CART VALIDATION
        // ============================================

        if (!cartItems.length) {
            toast.warning(
                "Your cart is empty!"
            );

            return;
        }

        // ============================================
        // 📝 REQUIRED FORM VALIDATION
        // ============================================

        if (
            !normalizedForm.name ||
            !normalizedForm.address ||
            !normalizedForm.phone
        ) {
            toast.error(
                "Please fill all required fields."
            );

            return;
        }

        // ============================================
        // 📧 EMAIL VALIDATION
        // ============================================

        if (
            normalizedForm.email &&
            !isValidEmail(
                normalizedForm.email
            )
        ) {
            toast.error(
                "Please enter a valid email address."
            );

            return;
        }

        // ============================================
        // 📞 PHONE VALIDATION
        // ============================================

        if (
            !isValidPhone(
                normalizedForm.phone
            )
        ) {
            toast.error(
                "Please enter a valid phone number."
            );

            return;
        }

        // ============================================
        // 🔒 PREVENT DOUBLE SUBMIT
        // ============================================

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);

        // ============================================
        // 📦 CREATE SAFE ORDER PAYLOAD
        // ============================================

        const order = {
            customer: {
                name:
                    normalizedForm.name,

                email:
                    normalizedForm.email,

                phone:
                    normalizedForm.phone,

                address:
                    normalizedForm.address,

                city:
                    normalizedForm.city,

                postalCode:
                    normalizedForm.postalCode,
            },

            items: cartItems.map(
                (item) => ({
                    productId:
                        item._id,

                    name:
                        item.name,

                    image:
                        item.image || "",

                    price:
                        Number(
                            item.price
                        ),

                    quantity:
                        Number(
                            item.quantity
                        ) || 1,
                })
            ),

            pricing: {
                subtotal,
                tax,
                shipping,
                total: totalPrice,
            },

            payment: {
                method: "cod",
                status: "pending",
            },
        };

        // ============================================
        // 🚀 SEND ORDER
        // ============================================

        try {
            const data =
                await createOrder(order);

            console.log(
                "ORDER CREATED:",
                data
            );

            // ============================================
            // ❗ VERIFY BACKEND RESPONSE
            // ============================================

            if (
                !data ||
                data.success === false
            ) {
                throw new Error(
                    data?.message ||
                    "Failed to create order."
                );
            }

            // ============================================
            // ✅ SUCCESS
            // ============================================

            toast.success(
                "Order placed successfully!"
            );

            // ============================================
            // 🧹 CLEAR CART
            // ============================================

            clearCart(false);

            // ============================================
            // 🏠 GO HOME
            // ============================================

            navigate("/");

        } catch (error) {
            console.error(
                "ORDER ERROR:",
                error
            );

            const message =
                error?.response?.data
                    ?.message ||
                error?.message ||
                "Failed to place order. Please try again.";

            toast.error(message);

        } finally {
            // ============================================
            // 🔓 ENABLE SUBMIT AGAIN
            // ============================================

            setIsSubmitting(false);
        }
    };

    // ============================================
    // 🧾 CHECKOUT PAGE
    // ============================================

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "20px",
            }}
        >
            <h1>
                Checkout 🧾
            </h1>

            <form
                onSubmit={handleSubmit}
            >
                {/* ============================================
                    👤 CUSTOMER INFORMATION
                ============================================ */}

                <h2>
                    Customer Information
                </h2>

                <input
                    name="name"
                    type="text"
                    placeholder="Full Name *"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    name="phone"
                    type="tel"
                    placeholder="Phone *"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />

                {/* ============================================
                    📍 SHIPPING INFORMATION
                ============================================ */}

                <h2>
                    Shipping Information
                </h2>

                <input
                    name="address"
                    type="text"
                    placeholder="Address *"
                    value={form.address}
                    onChange={handleChange}
                    required
                />

                <input
                    name="city"
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                />

                <input
                    name="postalCode"
                    type="text"
                    placeholder="Postal Code"
                    value={form.postalCode}
                    onChange={handleChange}
                />

                {/* ============================================
                    🧾 ORDER SUMMARY
                ============================================ */}

                <h2>
                    Order Summary
                </h2>

                <p>
                    {cartItems.length}{" "}
                    {cartItems.length === 1
                        ? "product"
                        : "products"}{" "}
                    · {totalItems}{" "}
                    {totalItems === 1
                        ? "item"
                        : "items"}
                </p>

                {!cartItems.length ? (
                    <p>
                        Your cart is empty.
                    </p>
                ) : (
                    cartItems.map(
                        (item) => {
                            const itemPrice =
                                Number(
                                    item.price || 0
                                );

                            const itemQuantity =
                                Number(
                                    item.quantity || 0
                                );

                            const itemTotal =
                                itemPrice *
                                itemQuantity;

                            return (
                                <div
                                    key={
                                        item._id
                                    }
                                >
                                    {/* ============================================
                                        🖼️ PRODUCT
                                    ============================================ */}
                                    {item.image ? (
                                        <img
                                            src={
                                                item.image.startsWith("http")
                                                    ? item.image
                                                    : `${import.meta.env.VITE_API_URL}${item.image}`
                                            }
                                            alt={
                                                item.name
                                            }
                                            width="100"
                                            height="100"
                                        />
                                    ) : (
                                        <div>
                                            No image
                                        </div>
                                    )}

                                    {/* ============================================
                                        📦 PRODUCT INFORMATION
                                    ============================================ */}

                                    <h3>
                                        {
                                            item.name
                                        }
                                    </h3>

                                    <p>
                                        Price per item: $
                                        {itemPrice.toFixed(
                                            2
                                        )}
                                    </p>

                                    <p>
                                        Quantity:{" "}
                                        {
                                            itemQuantity
                                        }
                                    </p>

                                    <p>
                                        Product total: $
                                        {itemTotal.toFixed(
                                            2
                                        )}
                                    </p>

                                    <hr />
                                </div>
                            );
                        }
                    )
                )}

                {/* ============================================
                    💰 PRICE BREAKDOWN
                ============================================ */}

                <h2>
                    Price Summary
                </h2>

                <p>
                    Subtotal: $
                    {subtotal.toFixed(2)}
                </p>

                <p>
                    Tax (25%): $
                    {tax.toFixed(2)}
                </p>

                <p>
                    Shipping: $
                    {shipping.toFixed(2)}
                </p>

                <hr />

                <h2>
                    Total: $
                    {totalPrice.toFixed(2)}
                </h2>

                {/* ============================================
                    📍 DELIVERY SUMMARY
                ============================================ */}

                <h2>
                    Delivery Information
                </h2>

                <p>
                    Name:{" "}
                    {normalizedForm.name ||
                        "Not provided"}
                </p>

                <p>
                    Phone:{" "}
                    {normalizedForm.phone ||
                        "Not provided"}
                </p>

                <p>
                    Address:{" "}
                    {normalizedForm.address ||
                        "Not provided"}
                </p>

                <p>
                    City:{" "}
                    {normalizedForm.city ||
                        "Not provided"}
                </p>

                <p>
                    Postal Code:{" "}
                    {normalizedForm.postalCode ||
                        "Not provided"}
                </p>

                {/* ============================================
                    💳 PAYMENT
                ============================================ */}

                <h2>
                    Payment
                </h2>

                <p>
                    Payment method:
                    {" "}
                    Cash on Delivery
                </p>

                <p>
                    Payment status:
                    {" "}
                    Pending
                </p>

                {/* ============================================
                    🚀 PLACE ORDER
                ============================================ */}

                <button
                    type="submit"
                    disabled={
                        isSubmitting ||
                        !cartItems.length
                    }
                >
                    {isSubmitting
                        ? "Placing Order..."
                        : "Place Order"}
                </button>
            </form>
        </div>
    );
}

export default Checkout;