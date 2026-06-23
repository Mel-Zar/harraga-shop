import { useState } from "react";
import { useCart } from "../../context/useCart";
import { useNavigate } from "react-router-dom";
import { createOrder } from "../../services/ordersService";

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
        (total, item) => total + item.price * item.quantity,
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

        if (!cartItems.length) {
            alert("Cart is empty!");
            return;
        }

        if (!form.name || !form.address || !form.phone) {
            alert("Please fill all required fields");
            return;
        }

        const order = {
            customer: {
                name: form.name,
                email: form.email,
                phone: form.phone,
                address: form.address,
                city: form.city,
                postalCode: form.postalCode,
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
                total: totalPrice + totalPrice * 0.25 + 49,
            },

            payment: {
                method: "cod",
                status: "pending",
            },
        };

        try {
            const data = await createOrder(order);

            console.log("ORDER CREATED:", data);

            alert("Order placed successfully!");

            clearCart();
            navigate("/");

        } catch (error) {
            console.error("ORDER ERROR:", error);
            alert("Failed to place order");
        }
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
            <h1>Checkout 🧾</h1>

            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Full Name" onChange={handleChange} />
                <input name="email" placeholder="Email" onChange={handleChange} />
                <input name="address" placeholder="Address" onChange={handleChange} />
                <input name="phone" placeholder="Phone" onChange={handleChange} />
                <input name="city" placeholder="City" onChange={handleChange} />
                <input name="postalCode" placeholder="Postal Code" onChange={handleChange} />

                <h2>Order Summary</h2>

                {cartItems.map((item) => (
                    <div key={item._id}>
                        {item.name} × {item.quantity}
                    </div>
                ))}

                <h3>Total: ${totalPrice.toFixed(2)}</h3>

                <button type="submit">Place Order</button>
            </form>
        </div>
    );
}

export default Checkout;