import { useState } from "react";
import { useCart } from "../../context/useCart";
import { useNavigate } from "react-router-dom";

function Checkout() {
    const { cartItems, clearCart } = useCart();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        address: "",
        phone: "",
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("Cart is empty!");
            return;
        }

        if (
            !form.name ||
            !form.address ||
            !form.phone
        ) {
            alert("Please fill all fields");
            return;
        }

        // 🔥 Här kommer backend senare (order API)
        const order = {
            customer: form,
            items: cartItems,
            total: totalPrice,
            createdAt: new Date(),
        };

        console.log("ORDER CREATED:", order);

        alert("Order placed successfully!");

        clearCart();

        navigate("/");
    };

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "0 auto",
                padding: "20px",
            }}
        >
            <h1>Checkout 🧾</h1>

            {/* FORM */}
            <form onSubmit={handleSubmit}>
                <div>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={form.name}
                        onChange={handleChange}
                        style={{
                            display: "block",
                            marginBottom: "10px",
                            padding: "8px",
                            width: "100%",
                        }}
                    />

                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={form.address}
                        onChange={handleChange}
                        style={{
                            display: "block",
                            marginBottom: "10px",
                            padding: "8px",
                            width: "100%",
                        }}
                    />

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone"
                        value={form.phone}
                        onChange={handleChange}
                        style={{
                            display: "block",
                            marginBottom: "10px",
                            padding: "8px",
                            width: "100%",
                        }}
                    />
                </div>

                {/* ORDER SUMMARY */}
                <h2>Order Summary</h2>

                {cartItems.map((item) => (
                    <div
                        key={item._id}
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            marginBottom: "5px",
                        }}
                    >
                        <span>
                            {item.name} ×{" "}
                            {item.quantity}
                        </span>

                        <span>
                            $
                            {(
                                item.price *
                                item.quantity
                            ).toFixed(2)}
                        </span>
                    </div>
                ))}

                <hr />

                <h3>
                    Total: $
                    {totalPrice.toFixed(2)}
                </h3>

                <button
                    type="submit"
                    style={{
                        marginTop: "20px",
                        background: "green",
                        color: "white",
                        padding: "10px",
                        width: "100%",
                    }}
                >
                    Place Order
                </button>
            </form>
        </div>
    );
}

export default Checkout;