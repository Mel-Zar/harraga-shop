import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
    getMyOrderById,
} from "../../services/orderService";

function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        const fetchOrder =
            async () => {
                try {
                    setLoading(true);
                    setError("");

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    if (
                        !token ||
                        token === "null" ||
                        token === "undefined"
                    ) {
                        setError(
                            "You must be logged in to view this order."
                        );

                        return;
                    }

                    if (!id) {
                        setError(
                            "Order ID is missing."
                        );

                        return;
                    }

                    // =========================
                    // GET CUSTOMER ORDER
                    // =========================
                    const data =
                        await getMyOrderById(
                            id
                        );

                    if (!data?.order) {
                        throw new Error(
                            "Order not found"
                        );
                    }

                    setOrder(
                        data.order
                    );

                } catch (error) {
                    console.error(
                        "ORDER DETAILS ERROR:",
                        error
                    );

                    setError(
                        error.response
                            ?.data
                            ?.message ||
                        error.message ||
                        "Failed to load order."
                    );

                } finally {
                    setLoading(false);
                }
            };

        fetchOrder();
    }, [id]);

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
    // STATUS CLASS
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
    // STATUS HISTORY
    // =========================
    const statusHistory =
        Array.isArray(
            order?.statusHistory
        )
            ? order.statusHistory
            : [];

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
                    Order Details
                </h1>

                <div
                    style={{
                        border:
                            "1px solid #ddd",
                        borderRadius:
                            "12px",
                        padding:
                            "30px",
                        background:
                            "#fff",
                    }}
                >
                    <p>
                        Loading order...
                    </p>
                </div>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================
    if (error) {
        return (
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>
                    Order Details
                </h1>

                <div
                    style={{
                        border:
                            "1px solid #f1aeb5",
                        background:
                            "#f8d7da",
                        color:
                            "#842029",
                        padding:
                            "30px",
                        borderRadius:
                            "12px",
                    }}
                >
                    <p
                        style={{
                            marginTop:
                                0,
                            marginBottom:
                                "20px",
                        }}
                    >
                        {error}
                    </p>

                    <Link
                        to="/profile/orders"
                    >
                        Back to My Orders
                    </Link>
                </div>
            </div>
        );
    }

    // =========================
    // ORDER NOT FOUND
    // =========================
    if (!order) {
        return (
            <div
                style={{
                    maxWidth: "1000px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>
                    Order not found
                </h1>

                <Link to="/profile/orders">
                    Back to My Orders
                </Link>
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
                HEADER
            ========================= */}
            <div
                style={{
                    display: "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    gap: "20px",
                    flexWrap:
                        "wrap",
                    marginBottom:
                        "25px",
                }}
            >
                <div>
                    <h1
                        style={{
                            margin:
                                "0 0 10px",
                        }}
                    >
                        Order #
                        {order.orderNumber ||
                            order._id}
                    </h1>

                    <p
                        style={{
                            margin:
                                0,
                            color:
                                "#666",
                        }}
                    >
                        <strong>
                            Date:
                        </strong>{" "}
                        {order.createdAt
                            ? new Date(
                                order.createdAt
                            ).toLocaleString()
                            : "-"}
                    </p>
                </div>

                <Link
                    to="/profile/orders"
                    style={{
                        textDecoration:
                            "none",
                    }}
                >
                    ← Back to My Orders
                </Link>
            </div>

            {/* =========================
                ORDER STATUS CARD
            ========================= */}
            <div
                style={{
                    border:
                        "1px solid #ddd",
                    borderRadius:
                        "12px",
                    padding:
                        "25px",
                    marginBottom:
                        "25px",
                    background:
                        "#fff",
                }}
            >
                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",
                        gap:
                            "15px",
                        flexWrap:
                            "wrap",
                    }}
                >
                    <div>
                        <h2
                            style={{
                                margin:
                                    "0 0 8px",
                            }}
                        >
                            Order Status
                        </h2>

                        <p
                            style={{
                                margin:
                                    0,
                                color:
                                    "#666",
                            }}
                        >
                            Current status of your order
                        </p>
                    </div>

                    <span
                        style={{
                            ...getStatusStyle(
                                order.status
                            ),
                            display:
                                "inline-block",
                            padding:
                                "8px 14px",
                            borderRadius:
                                "999px",
                            fontWeight:
                                "600",
                            fontSize:
                                "14px",
                        }}
                    >
                        {formatStatus(
                            order.status ||
                            "pending"
                        )}
                    </span>
                </div>
            </div>

            {/* =========================
                STATUS HISTORY
            ========================= */}
            {statusHistory.length > 0 && (
                <>
                    <hr />

                    <h2>
                        Order Progress
                    </h2>

                    <div
                        style={{
                            border:
                                "1px solid #ddd",
                            borderRadius:
                                "12px",
                            padding:
                                "20px",
                            marginBottom:
                                "25px",
                            background:
                                "#fff",
                        }}
                    >
                        {statusHistory.map(
                            (
                                history,
                                index
                            ) => (
                                <div
                                    key={`${history.status}-${history.changedAt}-${index}`}
                                    style={{
                                        display:
                                            "flex",
                                        alignItems:
                                            "flex-start",
                                        gap:
                                            "15px",
                                        padding:
                                            "14px 0",
                                        borderBottom:
                                            index <
                                                statusHistory.length -
                                                1
                                                ? "1px solid #eee"
                                                : "none",
                                    }}
                                >
                                    <div
                                        style={{
                                            width:
                                                "12px",
                                            height:
                                                "12px",
                                            borderRadius:
                                                "50%",
                                            background:
                                                "#222",
                                            marginTop:
                                                "5px",
                                            flexShrink:
                                                0,
                                        }}
                                    />

                                    <div
                                        style={{
                                            flex:
                                                1,
                                        }}
                                    >
                                        <strong>
                                            {formatStatus(
                                                history.status
                                            )}
                                        </strong>

                                        <div
                                            style={{
                                                marginTop:
                                                    "4px",
                                                color:
                                                    "#666",
                                                fontSize:
                                                    "14px",
                                            }}
                                        >
                                            {history.changedAt
                                                ? new Date(
                                                    history.changedAt
                                                ).toLocaleString()
                                                : "-"}
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </>
            )}

            {/* =========================
                CUSTOMER INFORMATION
            ========================= */}
            <hr />

            <h2>
                Customer Information
            </h2>

            <div
                style={{
                    border:
                        "1px solid #ddd",
                    borderRadius:
                        "12px",
                    padding:
                        "20px",
                    marginBottom:
                        "25px",
                    background:
                        "#fff",
                }}
            >
                <p>
                    <strong>
                        Name:
                    </strong>{" "}
                    {order.customer?.name ||
                        "-"}
                </p>

                <p>
                    <strong>
                        Email:
                    </strong>{" "}
                    {order.customer?.email ||
                        "-"}
                </p>

                <p>
                    <strong>
                        Phone:
                    </strong>{" "}
                    {order.customer?.phone ||
                        "-"}
                </p>

                <p>
                    <strong>
                        Address:
                    </strong>{" "}
                    {order.customer?.address ||
                        "-"}
                </p>

                {order.customer
                    ?.postalCode && (
                        <p>
                            <strong>
                                Postal Code:
                            </strong>{" "}
                            {
                                order
                                    .customer
                                    .postalCode
                            }
                        </p>
                    )}

                {order.customer?.city && (
                    <p>
                        <strong>
                            City:
                        </strong>{" "}
                        {
                            order
                                .customer
                                .city
                        }
                    </p>
                )}
            </div>

            {/* =========================
                PRODUCTS
            ========================= */}
            <hr />

            <h2>
                Products
            </h2>

            {order.items?.length ? (
                <div
                    style={{
                        display:
                            "flex",
                        flexDirection:
                            "column",
                        gap:
                            "15px",
                    }}
                >
                    {order.items.map(
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
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "12px",
                                        padding:
                                            "20px",
                                        background:
                                            "#fff",
                                    }}
                                >
                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            gap:
                                                "20px",
                                            alignItems:
                                                "center",
                                            flexWrap:
                                                "wrap",
                                        }}
                                    >
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
                                                        "90px",
                                                    height:
                                                        "90px",
                                                    objectFit:
                                                        "cover",
                                                    borderRadius:
                                                        "10px",
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

                                        <div
                                            style={{
                                                flex:
                                                    1,
                                                minWidth:
                                                    "220px",
                                            }}
                                        >
                                            <h3
                                                style={{
                                                    margin:
                                                        "0 0 10px",
                                                }}
                                            >
                                                {
                                                    item.name
                                                }
                                            </h3>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0",
                                                }}
                                            >
                                                <strong>
                                                    Quantity:
                                                </strong>{" "}
                                                {
                                                    item.quantity
                                                }
                                            </p>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0",
                                                }}
                                            >
                                                <strong>
                                                    Price:
                                                </strong>{" "}
                                                {formatPrice(
                                                    item.price
                                                )}{" "}
                                                kr
                                            </p>

                                            <p
                                                style={{
                                                    margin:
                                                        "5px 0",
                                                }}
                                            >
                                                <strong>
                                                    Total:
                                                </strong>{" "}
                                                {formatPrice(
                                                    Number(
                                                        item.price
                                                    ) *
                                                    Number(
                                                        item.quantity
                                                    )
                                                )}{" "}
                                                kr
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    )}
                </div>
            ) : (
                <p>
                    No products found.
                </p>
            )}

            {/* =========================
                PRICING
            ========================= */}
            <hr />

            <h2>
                Pricing
            </h2>

            <div
                style={{
                    border:
                        "1px solid #ddd",
                    borderRadius:
                        "12px",
                    padding:
                        "20px",
                    background:
                        "#fff",
                    marginBottom:
                        "25px",
                }}
            >
                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        gap:
                            "20px",
                        padding:
                            "8px 0",
                    }}
                >
                    <span>
                        Subtotal
                    </span>

                    <strong>
                        {formatPrice(
                            order.pricing
                                ?.subtotal ??
                            0
                        )}{" "}
                        kr
                    </strong>
                </div>

                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        gap:
                            "20px",
                        padding:
                            "8px 0",
                    }}
                >
                    <span>
                        Tax
                    </span>

                    <strong>
                        {formatPrice(
                            order.pricing
                                ?.tax ??
                            0
                        )}{" "}
                        kr
                    </strong>
                </div>

                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        gap:
                            "20px",
                        padding:
                            "8px 0",
                    }}
                >
                    <span>
                        Shipping
                    </span>

                    <strong>
                        {formatPrice(
                            order.pricing
                                ?.shipping ??
                            0
                        )}{" "}
                        kr
                    </strong>
                </div>

                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
                        gap:
                            "20px",
                        padding:
                            "15px 0 0",
                        marginTop:
                            "10px",
                        borderTop:
                            "2px solid #222",
                        fontSize:
                            "20px",
                    }}
                >
                    <strong>
                        Total
                    </strong>

                    <strong>
                        {formatPrice(
                            order.pricing
                                ?.total ??
                            0
                        )}{" "}
                        kr
                    </strong>
                </div>
            </div>

            {/* =========================
                PAYMENT
            ========================= */}
            <hr />

            <h2>
                Payment
            </h2>

            <div
                style={{
                    border:
                        "1px solid #ddd",
                    borderRadius:
                        "12px",
                    padding:
                        "20px",
                    background:
                        "#fff",
                    marginBottom:
                        "25px",
                }}
            >
                <p>
                    <strong>
                        Method:
                    </strong>{" "}
                    {order.payment
                        ?.method ===
                        "cod"
                        ? "Cash on Delivery"
                        : order.payment
                            ?.method ||
                        "-"}
                </p>

                <p>
                    <strong>
                        Payment Status:
                    </strong>{" "}

                    <span
                        style={{
                            ...getPaymentStatusStyle(
                                order.payment
                                    ?.status ||
                                "pending"
                            ),
                            display:
                                "inline-block",
                            padding:
                                "5px 10px",
                            borderRadius:
                                "999px",
                            fontWeight:
                                "600",
                            fontSize:
                                "13px",
                        }}
                    >
                        {formatStatus(
                            order.payment
                                ?.status ||
                            "pending"
                        )}
                    </span>
                </p>
            </div>

            {/* =========================
                UPDATED
            ========================= */}
            <hr />

            <p
                style={{
                    color:
                        "#666",
                    fontSize:
                        "14px",
                }}
            >
                <strong>
                    Last Updated:
                </strong>{" "}
                {order.updatedAt
                    ? new Date(
                        order.updatedAt
                    ).toLocaleString()
                    : "-"}
            </p>
        </div>
    );
}

export default OrderDetails;