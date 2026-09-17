import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../services/orderService";
import { toast } from "react-toastify";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();

                setOrders(data.orders || []);
            } catch (error) {
                console.error(error);

                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load orders."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        return [...orders]
            .sort(
                (a, b) =>
                    new Date(b.createdAt) -
                    new Date(a.createdAt)
            )
            .filter((order) => {
                const value = search.toLowerCase();

                return (
                    order.orderNumber
                        ?.toLowerCase()
                        .includes(value) ||
                    order.customer?.name
                        ?.toLowerCase()
                        .includes(value) ||
                    order.status
                        ?.toLowerCase()
                        .includes(value) ||
                    order.payment?.status
                        ?.toLowerCase()
                        .includes(value) ||
                    order.payment?.method
                        ?.toLowerCase()
                        .includes(value)
                );
            });
    }, [orders, search]);

    const getStatusColor = (status) => {
        switch (status) {
            case "pending":
                return "#f59e0b";

            case "processing":
                return "#2563eb";

            case "shipped":
                return "#7c3aed";

            case "delivered":
                return "#16a34a";

            case "cancelled":
                return "#dc2626";

            default:
                return "#555";
        }
    };

    const getPaymentColor = (status) => {
        switch (status) {
            case "paid":
                return "#16a34a";

            case "failed":
                return "#dc2626";

            case "refunded":
                return "#6b7280";

            case "pending":
            default:
                return "#f59e0b";
        }
    };

    const formatStatus = (value) => {
        if (!value) {
            return "Pending";
        }

        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );
    };

    const formatPaymentMethod = (method) => {
        switch (method) {
            case "cod":
                return "Cash on Delivery";

            case "stripe":
                return "Stripe";

            case "klarna":
                return "Klarna";

            case "swish":
                return "Swish";

            default:
                return method || "-";
        }
    };

    if (loading) {
        return <h2>Loading orders...</h2>;
    }

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "20px",
            }}
        >
            <h1>Orders</h1>

            <div
                style={{
                    display: "flex",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom: "25px",
                }}
            >
                <div>
                    <strong>Total Orders</strong>

                    <br />

                    {orders.length}
                </div>

                <div>
                    <strong>Pending</strong>

                    <br />

                    {
                        orders.filter(
                            (o) =>
                                o.status === "pending"
                        ).length
                    }
                </div>

                <div>
                    <strong>Delivered</strong>

                    <br />

                    {
                        orders.filter(
                            (o) =>
                                o.status ===
                                "delivered"
                        ).length
                    }
                </div>

                <div>
                    <strong>Cancelled</strong>

                    <br />

                    {
                        orders.filter(
                            (o) =>
                                o.status ===
                                "cancelled"
                        ).length
                    }
                </div>

                <div>
                    <strong>Paid</strong>

                    <br />

                    {
                        orders.filter(
                            (o) =>
                                o.payment?.status ===
                                "paid"
                        ).length
                    }
                </div>

                <div>
                    <strong>Payment Pending</strong>

                    <br />

                    {
                        orders.filter(
                            (o) =>
                                o.payment?.status ===
                                "pending"
                        ).length
                    }
                </div>
            </div>

            <input
                type="text"
                placeholder="Search order..."
                value={search}
                onChange={(e) =>
                    setSearch(e.target.value)
                }
                style={{
                    width: "100%",
                    padding: "12px",
                    marginBottom: "20px",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                    fontSize: "15px",
                }}
            />

            {filteredOrders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                filteredOrders.map((order) => (
                    <div
                        key={order._id}
                        onClick={() =>
                            navigate(
                                `/admin/orders/${order._id}`
                            )
                        }
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginBottom: "15px",
                            background: "#fff",
                            cursor: "pointer",
                            transition:
                                "0.2s ease",
                        }}
                    >
                        <h2
                            style={{
                                marginTop: 0,
                            }}
                        >
                            {order.orderNumber ||
                                order._id}
                        </h2>

                        <p>
                            <strong>
                                Customer:
                            </strong>{" "}
                            {
                                order.customer
                                    ?.name
                            }
                        </p>

                        <p>
                            <strong>
                                Products:
                            </strong>{" "}
                            {order.items
                                ?.length || 0}
                        </p>

                        <p>
                            <strong>
                                Total:
                            </strong>{" "}
                            {
                                order.pricing
                                    ?.total
                            }{" "}
                            kr
                        </p>

                        <p>
                            <strong>
                                Status:
                            </strong>{" "}
                            <span
                                style={{
                                    color: getStatusColor(
                                        order.status
                                    ),
                                    fontWeight:
                                        "bold",
                                    textTransform:
                                        "capitalize",
                                }}
                            >
                                {
                                    order.status
                                }
                            </span>
                        </p>

                        <p>
                            <strong>
                                Payment:
                            </strong>{" "}
                            <span
                                style={{
                                    color: getPaymentColor(
                                        order.payment
                                            ?.status
                                    ),
                                    fontWeight:
                                        "bold",
                                    textTransform:
                                        "capitalize",
                                }}
                            >
                                {formatStatus(
                                    order.payment
                                        ?.status ||
                                    "pending"
                                )}
                            </span>
                        </p>

                        <p>
                            <strong>
                                Payment Method:
                            </strong>{" "}
                            {formatPaymentMethod(
                                order.payment
                                    ?.method
                            )}
                        </p>

                        <p>
                            <strong>
                                Date:
                            </strong>{" "}
                            {new Date(
                                order.createdAt
                            ).toLocaleString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Orders;