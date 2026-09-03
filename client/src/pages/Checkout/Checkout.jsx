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

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

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
        // 📝 FORM VALIDATION
        // ============================================

        if (
            !form.name ||
            !form.address ||
            !form.phone
        ) {
            toast.error(
                "Please fill all required fields."
            );

            return;
        }

        // ============================================
        // 📦 CREATE ORDER
        // ============================================

        const order = {
            customer: {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                city: form.city,
                postalCode:
                    form.postalCode,
            },

            items: cartItems.map((item) => ({
                productId: item._id,
                name: item.name,
                image: item.image || "",
                price: item.price,
                quantity: item.quantity,
            })),

            pricing: {
                subtotal: totalPrice,
                tax: totalPrice * 0.25,
                shipping: 49,
                total:
                    totalPrice +
                    totalPrice * 0.25 +
                    49,
            },

            payment: {
                method: "cod",
                status: "pending",
            },
        };

        try {
            const data =
                await createOrder(order);

            console.log(
                "ORDER CREATED:",
                data
            );

            // ============================================
            // ✅ SUCCESS
            // ============================================

            toast.success(
                "Order placed successfully!"
            );

            // ============================================
            // 🧹 CLEAR CART
            // ============================================

            clearCart();

            // ============================================
            // 🏠 GO HOME
            // ============================================

            navigate("/");

        } catch (error) {

            console.error(
                "ORDER ERROR:",
                error
            );

            // ============================================
            // ❌ ERROR
            // ============================================

            toast.error(
                error?.message ||
                "Failed to place order. Please try again."
            );
        }
    };

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
                <input
                    name="name"
                    placeholder="Full Name"
                    value={form.name}
                    onChange={handleChange}
                />

                <input
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                />

                <input
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                />

                <input
                    name="phone"
                    placeholder="Phone"
                    value={form.phone}
                    onChange={handleChange}
                />

                <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                />

                <input
                    name="postalCode"
                    placeholder="Postal Code"
                    value={form.postalCode}
                    onChange={handleChange}
                />

                <h2>
                    Order Summary
                </h2>

                {cartItems.map((item) => (
                    <div
                        key={item._id}
                    >
                        {item.name} ×{" "}
                        {item.quantity}
                    </div>
                ))}

                <h3>
                    Total: $
                    {totalPrice.toFixed(2)}
                </h3>

                <button
                    type="submit"
                >
                    Place Order
                </button>

            </form>
        </div>
    );
}

export default Checkout;
