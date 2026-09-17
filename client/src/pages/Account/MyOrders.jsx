import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    getMyOrders,
    cancelMyOrder,
} from "../../services/orderService";

import { toast } from "react-toastify";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingOrder, setCancellingOrder] = useState(null);


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");

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

                setError(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load your orders."
                );

            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // =========================
    // CANCEL MY ORDER
    // CUSTOMER ONLY
    // =========================
    const handleCancelOrder = async (orderId) => {

        // =========================
        // TOAST CONFIRMATION
        // =========================
        const toastId = toast.warning(
            <div>
                <p
                    style={{
                        margin: "0 0 12px",
                        fontWeight: "600",
                    }}
                >
                    Are you sure you want to cancel this order?
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <button
                        type="button"
                        onClick={async () => {
                            toast.dismiss(toastId);

                            try {
                                setCancellingOrder(orderId);
                                setError("");

                                const data =
                                    await cancelMyOrder(orderId);

                                // =========================
                                // UPDATE ORDER IN LIST
                                // =========================
                                if (data?.order) {
                                    setOrders((currentOrders) =>
                                        currentOrders.map((order) =>
                                            order._id === orderId
                                                ? data.order
                                                : order
                                        )
                                    );
                                }

                                // =========================
                                // SUCCESS TOAST
                                // =========================
                                toast.success(
                                    "Order cancelled successfully!"
                                );

                            } catch (error) {
                                console.error(
                                    "CANCEL ORDER ERROR:",
                                    error
                                );

                                const message =
                                    error.response?.data?.message ||
                                    error.message ||
                                    "Failed to cancel order.";

                                setError(message);

                                // =========================
                                // ERROR TOAST
                                // =========================
                                toast.error(message);

                            } finally {
                                setCancellingOrder(null);
                            }
                        }}
                        style={{
                            padding: "7px 12px",
                            border: "none",
                            borderRadius: "6px",
                            background: "#dc3545",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "600",
                        }}
                    >
                        Yes, cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            toast.dismiss(toastId);
                        }}
                        style={{
                            padding: "7px 12px",
                            border: "1px solid #ccc",
                            borderRadius: "6px",
                            background: "#fff",
                            color: "#222",
                            cursor: "pointer",
                            fontWeight: "600",
                        }}
                    >
                        No
                    </button>
                </div>
            </div>,
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                position: "top-right",
            }
        );
    };

    // =========================
    // FORMAT PRICE
    // =========================
    const formatPrice = (
        value
    ) => {
        const number =
            Number(value);

        if (
            !Number.isFinite(
                number
            )
        ) {
            return "0.00";
        }

        return number.toFixed(2);
    };

    // =========================
    // FORMAT STATUS
    // =========================
    const formatStatus =
        (status) => {

            if (!status) {
                return "Pending";
            }

            return (
                status
                    .charAt(0)
                    .toUpperCase() +
                status.slice(1)
            );
        };

    // =========================
    // STATUS STYLE
    // =========================
    const getStatusStyle =
        (status) => {

            switch (status) {

                case "pending":
                    return {
                        background:
                            "#fff3cd",
                        color:
                            "#856404",
                        border:
                            "1px solid #ffe69c",
                    };

                case "processing":
                    return {
                        background:
                            "#cff4fc",
                        color:
                            "#055160",
                        border:
                            "1px solid #9eeaf9",
                    };

                case "shipped":
                    return {
                        background:
                            "#cfe2ff",
                        color:
                            "#084298",
                        border:
                            "1px solid #9ec5fe",
                    };

                case "delivered":
                    return {
                        background:
                            "#d1e7dd",
                        color:
                            "#0f5132",
                        border:
                            "1px solid #a3cfbb",
                    };

                case "cancelled":
                    return {
                        background:
                            "#f8d7da",
                        color:
                            "#842029",
                        border:
                            "1px solid #f1aeb5",
                    };

                default:
                    return {
                        background:
                            "#f8f9fa",
                        color:
                            "#212529",
                        border:
                            "1px solid #dee2e6",
                    };
            }
        };

    // =========================
    // PAYMENT STATUS STYLE
    // =========================
    const getPaymentStatusStyle =
        (status) => {

            switch (status) {

                case "paid":
                    return {
                        background:
                            "#d1e7dd",
                        color:
                            "#0f5132",
                        border:
                            "1px solid #a3cfbb",
                    };

                case "failed":
                    return {
                        background:
                            "#f8d7da",
                        color:
                            "#842029",
                        border:
                            "1px solid #f1aeb5",
                    };

                case "refunded":
                    return {
                        background:
                            "#e2e3e5",
                        color:
                            "#41464b",
                        border:
                            "1px solid #d3d6d8",
                    };

                case "pending":
                default:
                    return {
                        background:
                            "#fff3cd",
                        color:
                            "#856404",
                        border:
                            "1px solid #ffe69c",
                    };
            }
        };

    // =========================
    // PAYMENT METHOD
    // =========================
    const formatPaymentMethod =
        (method) => {

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
                <h1
                    style={{
                        marginBottom: "25px",
                    }}
                >
                    My Orders
                </h1>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "12px",
                        padding: "30px",
                        background: "#fff",
                        textAlign: "center",
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            color: "#666",
                        }}
                    >
                        Loading orders...
                    </p>
                </div>
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
            {/* =========================
        PAGE HEADER
    ========================= */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                    marginBottom: "30px",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin: "0 0 8px",
                        }}
                    >
                        My Orders
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "#666",
                        }}
                    >
                        View and track your orders.
                    </p>
                </div>

                {orders.length > 0 && (
                    <div
                        style={{
                            padding: "8px 14px",
                            background: "#f8f9fa",
                            border: "1px solid #ddd",
                            borderRadius: "999px",
                            fontSize: "14px",
                            fontWeight: "600",
                        }}
                    >
                        {orders.length}{" "}
                        {orders.length === 1
                            ? "Order"
                            : "Orders"}
                    </div>
                )}
            </div>

            {/* =========================
        ERROR
    ========================= */}
            {error && (
                <div
                    style={{
                        border: "1px solid #f1aeb5",
                        background: "#f8d7da",
                        color: "#842029",
                        padding: "20px",
                        borderRadius: "12px",
                        marginBottom: "25px",
                    }}
                >
                    <strong>
                        Unable to load orders
                    </strong>

                    <p
                        style={{
                            marginBottom: 0,
                        }}
                    >
                        {error}
                    </p>
                </div>
            )}

            {/* =========================
        EMPTY STATE
    ========================= */}
            {orders.length === 0 ? (
                <div
                    style={{
                        marginTop: "30px",
                        border: "1px solid #ddd",
                        padding: "40px 30px",
                        borderRadius: "12px",
                        background: "#fff",
                        textAlign: "center",
                    }}
                >
                    <div
                        style={{
                            fontSize: "42px",
                            marginBottom: "15px",
                        }}
                    >
                        📦
                    </div>

                    <h3
                        style={{
                            margin: "0 0 10px",
                        }}
                    >
                        No orders yet.
                    </h3>

                    <p
                        style={{
                            color: "#666",
                            margin: "0 0 20px",
                        }}
                    >
                        You haven't placed any
                        orders.
                    </p>

                    <Link
                        to="/"
                        style={{
                            display: "inline-block",
                            padding: "10px 18px",
                            borderRadius: "8px",
                            background: "#222",
                            color: "#fff",
                            textDecoration: "none",
                            fontWeight: "600",
                        }}
                    >
                        Continue Shopping
                    </Link>
                </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                    }}
                >
                    {orders.map((order) => {
                        const status =
                            order.status ||
                            "pending";

                        const paymentStatus =
                            order.payment?.status ||
                            "pending";

                        return (
                            <div
                                key={order._id}
                                style={{
                                    border: "1px solid #ddd",
                                    borderRadius: "12px",
                                    padding: "25px",
                                    background: "#fff",
                                    boxShadow:
                                        "0 2px 8px rgba(0,0,0,0.04)",
                                }}
                            >
                                {/* =========================
                            ORDER HEADER
                        ========================= */}
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        gap: "15px",
                                        flexWrap: "wrap",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <div>
                                        {/* =========================
                                    ORDER NUMBER
                                ========================= */}
                                        <h3
                                            style={{
                                                margin:
                                                    "0 0 8px",
                                            }}
                                        >
                                            Order #
                                            {order.orderNumber ||
                                                order._id
                                                    ?.slice(-8)
                                                    .toUpperCase()}
                                        </h3>

                                        {/* =========================
                                    DATE
                                ========================= */}
                                        <p
                                            style={{
                                                margin: 0,
                                                color: "#666",
                                                fontSize:
                                                    "14px",
                                            }}
                                        >
                                            <strong>
                                                Date:
                                            </strong>{" "}
                                            {order.createdAt
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleDateString()
                                                : "-"}
                                        </p>
                                    </div>

                                    {/* =========================
                                STATUS
                            ========================= */}
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "10px",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <span
                                            style={{
                                                ...getStatusStyle(
                                                    status
                                                ),
                                                display:
                                                    "inline-block",
                                                padding:
                                                    "7px 14px",
                                                borderRadius:
                                                    "999px",
                                                fontWeight:
                                                    "600",
                                                fontSize:
                                                    "14px",
                                            }}
                                        >
                                            {formatStatus(
                                                status
                                            )}
                                        </span>

                                        <span
                                            style={{
                                                ...getPaymentStatusStyle(
                                                    paymentStatus
                                                ),
                                                display:
                                                    "inline-block",
                                                padding:
                                                    "7px 14px",
                                                borderRadius:
                                                    "999px",
                                                fontWeight:
                                                    "600",
                                                fontSize:
                                                    "14px",
                                            }}
                                        >
                                            Payment:{" "}
                                            {formatStatus(
                                                paymentStatus
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <hr
                                    style={{
                                        border: 0,
                                        borderTop:
                                            "1px solid #eee",
                                        margin:
                                            "0 0 20px",
                                    }}
                                />

                                {/* =========================
                            PRODUCTS
                        ========================= */}
                                <div>
                                    {order.items?.map(
                                        (
                                            item,
                                            index
                                        ) => {
                                            const image =
                                                item.image ||
                                                item.images?.[0] ||
                                                "";

                                            return (
                                                <div
                                                    key={`${item.productId}-${index}`}
                                                    style={{
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        gap: "15px",
                                                        padding:
                                                            "12px 0",
                                                        borderBottom:
                                                            index <
                                                                (order.items?.length ||
                                                                    0) -
                                                                1
                                                                ? "1px solid #eee"
                                                                : "none",
                                                    }}
                                                >
                                                    {/* PRODUCT IMAGE */}
                                                    {image && (
                                                        <img
                                                            src={
                                                                image.startsWith(
                                                                    "http"
                                                                )
                                                                    ? image
                                                                    : `${import.meta.env.VITE_API_URL}${image.startsWith("/")
                                                                        ? ""
                                                                        : "/"
                                                                    }${image}`
                                                            }
                                                            alt={
                                                                item.name ||
                                                                "Product"
                                                            }
                                                            style={{
                                                                width:
                                                                    "70px",
                                                                height:
                                                                    "70px",
                                                                objectFit:
                                                                    "cover",
                                                                borderRadius:
                                                                    "8px",
                                                                border:
                                                                    "1px solid #eee",
                                                            }}
                                                            onError={(
                                                                e
                                                            ) => {
                                                                e.currentTarget.style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    )}

                                                    {/* PRODUCT INFO */}
                                                    <div
                                                        style={{
                                                            flex: 1,
                                                            minWidth:
                                                                0,
                                                        }}
                                                    >
                                                        <strong
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginBottom:
                                                                    "5px",
                                                            }}
                                                        >
                                                            {
                                                                item.name
                                                            }
                                                        </strong>

                                                        <span
                                                            style={{
                                                                color:
                                                                    "#666",
                                                                fontSize:
                                                                    "14px",
                                                            }}
                                                        >
                                                            Qty:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* PRODUCT TOTAL */}
                                                    <strong
                                                        style={{
                                                            whiteSpace:
                                                                "nowrap",
                                                        }}
                                                    >
                                                        {formatPrice(
                                                            Number(
                                                                item.price
                                                            ) *
                                                            Number(
                                                                item.quantity
                                                            )
                                                        )}{" "}
                                                        kr
                                                    </strong>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>

                                {/* =========================
                            ORDER FOOTER
                        ========================= */}
                                <div
                                    style={{
                                        display:
                                            "flex",
                                        justifyContent:
                                            "space-between",
                                        alignItems:
                                            "center",
                                        gap: "20px",
                                        flexWrap:
                                            "wrap",
                                        marginTop:
                                            "20px",
                                        paddingTop:
                                            "20px",
                                        borderTop:
                                            "2px solid #222",
                                    }}
                                >
                                    {/* TOTAL */}
                                    <div>
                                        <span
                                            style={{
                                                display:
                                                    "block",
                                                color:
                                                    "#666",
                                                fontSize:
                                                    "14px",
                                                marginBottom:
                                                    "4px",
                                            }}
                                        >
                                            Order Total
                                        </span>

                                        <strong
                                            style={{
                                                fontSize:
                                                    "20px",
                                            }}
                                        >
                                            {formatPrice(
                                                order
                                                    .pricing
                                                    ?.total ??
                                                0
                                            )}{" "}
                                            kr
                                        </strong>

                                        <span
                                            style={{
                                                display:
                                                    "block",
                                                marginTop:
                                                    "5px",
                                                color:
                                                    "#666",
                                                fontSize:
                                                    "13px",
                                            }}
                                        >
                                            Payment method:{" "}
                                            {formatPaymentMethod(
                                                order.payment
                                                    ?.method
                                            )}
                                        </span>
                                    </div>

                                    {/* =========================
                                ACTIONS
                            ========================= */}
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            gap: "10px",
                                            flexWrap:
                                                "wrap",
                                        }}
                                    >
                                        {/* =========================
                                    CANCEL ORDER
                                    ONLY PENDING
                                ========================= */}
                                        {status ===
                                            "pending" && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleCancelOrder(
                                                            order._id
                                                        )
                                                    }
                                                    disabled={
                                                        cancellingOrder ===
                                                        order._id
                                                    }
                                                    style={{
                                                        padding:
                                                            "10px 18px",
                                                        borderRadius:
                                                            "8px",
                                                        background:
                                                            cancellingOrder ===
                                                                order._id
                                                                ? "#ccc"
                                                                : "#dc3545",
                                                        color:
                                                            "#fff",
                                                        border:
                                                            "none",
                                                        cursor:
                                                            cancellingOrder ===
                                                                order._id
                                                                ? "not-allowed"
                                                                : "pointer",
                                                        fontWeight:
                                                            "600",
                                                    }}
                                                >
                                                    {cancellingOrder ===
                                                        order._id
                                                        ? "Cancelling..."
                                                        : "Cancel Order"}
                                                </button>
                                            )}

                                        {/* =========================
                                    VIEW ORDER
                                ========================= */}
                                        <Link
                                            to={`/profile/orders/${order._id}`}
                                            style={{
                                                display:
                                                    "inline-block",
                                                padding:
                                                    "10px 18px",
                                                borderRadius:
                                                    "8px",
                                                background:
                                                    "#222",
                                                color:
                                                    "#fff",
                                                textDecoration:
                                                    "none",
                                                fontWeight:
                                                    "600",
                                            }}
                                        >
                                            View Order Details →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );


}

export default MyOrders;