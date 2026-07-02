import { useEffect, useState } from "react";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/orders/my-orders`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: "include",
                    }
                );

                if (!response.ok) {
                    throw new Error("Failed to load orders");
                }

                const data = await response.json();

                setOrders(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>My Orders</h1>
                <p>Loading orders...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: "1000px",
                margin: "40px auto",
                padding: "20px",
            }}
        >
            <h1>My Orders</h1>

            {orders.length === 0 ? (
                <div
                    style={{
                        marginTop: "30px",
                        border: "1px solid #ddd",
                        padding: "30px",
                        borderRadius: "10px",
                    }}
                >
                    <h3>No orders yet.</h3>
                    <p>You haven't placed any orders.</p>
                </div>
            ) : (
                orders.map((order) => (
                    <div
                        key={order._id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <h3>
                            Order #{order._id.slice(-8).toUpperCase()}
                        </h3>

                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(
                                order.createdAt
                            ).toLocaleDateString()}
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {order.status}
                        </p>

                        <p>
                            <strong>Total:</strong>{" "}
                            ${order.totalPrice}
                        </p>

                        <hr />

                        {order.orderItems?.map((item) => (
                            <div
                                key={item.product}
                                style={{
                                    marginBottom: "12px",
                                }}
                            >
                                <strong>{item.name}</strong>

                                <br />

                                Qty: {item.quantity}

                                <br />

                                Price: ${item.price}
                            </div>
                        ))}
                    </div>
                ))
            )}
        </div>
    );
}

export default MyOrders;