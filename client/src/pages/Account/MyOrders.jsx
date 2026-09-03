import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

import {
    getMyOrders,
} from "../../services/orderService";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const token =
                    localStorage.getItem("token");

                if (
                    !token ||
                    token === "null" ||
                    token === "undefined"
                ) {
                    throw new Error(
                        "You must be logged in to view your orders."
                    );
                }

                // =========================
                // GET CUSTOMER ORDERS
                // =========================
                const data =
                    await getMyOrders();

                // =========================
                // BACKEND RETURNS:
                // {
                //   success: true,
                //   count: ...,
                //   orders: [...]
                // }
                // =========================
                setOrders(
                    Array.isArray(data.orders)
                        ? data.orders
                        : []
                );

            } catch (error) {
                console.error(
                    "MY ORDERS ERROR:",
                    error
                );

                setOrders([]);

                toast.error(
                    error?.message ||
                    "Failed to load your orders."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>
                    My Orders
                </h1>

                <p>
                    Loading orders...
                </p>
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
            <h1>
                My Orders
            </h1>

            {orders.length === 0 ? (
                <div
                    style={{
                        marginTop: "30px",
                        border: "1px solid #ddd",
                        padding: "30px",
                        borderRadius: "10px",
                    }}
                >
                    <h3>
                        No orders yet.
                    </h3>

                    <p>
                        You haven't placed any
                        orders.
                    </p>
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
                        {/* =========================
                            ORDER NUMBER
                        ========================= */}
                        <h3>
                            Order #
                            {order.orderNumber ||
                                order._id
                                    ?.slice(-8)
                                    .toUpperCase()}
                        </h3>

                        {/* =========================
                            DATE
                        ========================= */}
                        <p>
                            <strong>
                                Date:
                            </strong>{" "}
                            {order.createdAt
                                ? new Date(
                                    order.createdAt
                                ).toLocaleDateString()
                                : "-"}
                        </p>

                        {/* =========================
                            STATUS
                        ========================= */}
                        <p>
                            <strong>
                                Status:
                            </strong>{" "}
                            {order.status ||
                                "pending"}
                        </p>

                        {/* =========================
                            TOTAL
                        ========================= */}
                        <p>
                            <strong>
                                Total:
                            </strong>{" "}
                            {order.pricing?.total ??
                                0}{" "}
                            kr
                        </p>

                        <hr />

                        {/* =========================
                            PRODUCTS
                        ========================= */}
                        {order.items?.map(
                            (item, index) => (
                                <div
                                    key={`${item.productId}-${index}`}
                                    style={{
                                        marginBottom:
                                            "12px",
                                    }}
                                >
                                    <strong>
                                        {item.name}
                                    </strong>

                                    <br />

                                    Qty:{" "}
                                    {item.quantity}

                                    <br />

                                    Price:{" "}
                                    {item.price} kr

                                    <br />

                                    Total:{" "}
                                    {(
                                        Number(
                                            item.price
                                        ) *
                                        Number(
                                            item.quantity
                                        )
                                    ).toFixed(2)}{" "}
                                    kr
                                </div>
                            )
                        )}

                        <hr />

                        {/* =========================
                            VIEW ORDER
                        ========================= */}
                        <Link
                            to={`/profile/orders/${order._id}`}
                        >
                            View Order Details
                        </Link>
                    </div>
                ))
            )}
        </div>
    );
}

export default MyOrders;