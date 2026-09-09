import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
    getOrderById,
    updateOrderStatus,
} from "../../services/orderService";

import { toast } from "react-toastify";

function OrderDetail() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [status, setStatus] = useState("");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // =========================
    // STATUS FLOW
    // =========================
    const allowedTransitions = {
        pending: [
            "processing",
            "cancelled",
        ],

        processing: [
            "shipped",
            "cancelled",
        ],

        shipped: [
            "delivered",
        ],

        delivered: [],

        cancelled: [],
    };

    // =========================
    // FETCH ORDER
    // =========================
    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true);
                setError("");

                const data =
                    await getOrderById(id);

                if (!data?.order) {
                    throw new Error(
                        "Order not found."
                    );
                }

                setOrder(
                    data.order
                );

                setStatus(
                    data.order.status ||
                    "pending"
                );

            } catch (error) {
                console.error(
                    "GET ORDER ERROR:",
                    error
                );

                const message =
                    error.response
                        ?.data
                        ?.message ||
                    error.message ||
                    "Failed to load order.";

                setError(message);

                toast.error(
                    message
                );

            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrder();
        }
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
        (value) => {

            if (!value) {
                return "Pending";
            }

            return (
                value
                    .charAt(0)
                    .toUpperCase() +
                value.slice(1)
            );
        };

    // =========================
    // STATUS STYLE
    // =========================
    const getStatusStyle =
        (value) => {

            switch (value) {

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
    // PAYMENT STYLE
    // =========================
    const getPaymentStyle =
        (value) => {

            switch (value) {

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
    // IMAGE URL
    // =========================
    const getImageUrl =
        (image) => {

            if (!image) {
                return "";
            }

            if (
                image.startsWith(
                    "http://"
                ) ||
                image.startsWith(
                    "https://"
                )
            ) {
                return image;
            }

            const apiUrl =
                import.meta.env
                    .VITE_API_URL || "";

            return `${apiUrl}${image.startsWith("/")
                ? ""
                : "/"
                }${image}`;
        };

    // =========================
    // AVAILABLE STATUS OPTIONS
    // =========================
    const getAvailableStatuses =
        () => {

            const currentStatus =
                order?.status ||
                "pending";

            const nextStatuses =
                allowedTransitions[
                currentStatus
                ] || [];

            return [
                currentStatus,
                ...nextStatuses.filter(
                    (nextStatus) =>
                        nextStatus !==
                        currentStatus
                ),
            ];
        };

    // =========================
    // STATUS UPDATE
    // =========================
    const handleStatusUpdate =
        async () => {

            if (!order) {
                return;
            }

            const previousStatus =
                order.status ||
                "pending";

            // =========================
            // NO CHANGE
            // =========================
            if (
                status ===
                previousStatus
            ) {

                toast.info(
                    "Order status is already set to this status."
                );

                return;
            }

            // =========================
            // CHECK FRONTEND TRANSITION
            // BACKEND ALSO VALIDATES THIS
            // =========================
            const possibleTransitions =
                allowedTransitions[
                previousStatus
                ] || [];

            if (
                !possibleTransitions.includes(
                    status
                )
            ) {

                toast.error(
                    `Invalid status transition from ${formatStatus(
                        previousStatus
                    )} to ${formatStatus(
                        status
                    )}.`
                );

                setStatus(
                    previousStatus
                );

                return;
            }

            // =========================
            // CONFIRM CANCELLATION
            // =========================
            if (
                status ===
                "cancelled"
            ) {

                const confirmed =
                    window.confirm(
                        `Are you sure you want to cancel order #${order.orderNumber ||
                        order._id
                        }?\n\nThe products will be returned to stock.`
                    );

                if (!confirmed) {

                    setStatus(
                        previousStatus
                    );

                    return;
                }
            }

            try {

                setSaving(true);

                const data =
                    await updateOrderStatus(
                        order._id,
                        status
                    );

                if (!data?.order) {
                    throw new Error(
                        "Order status update failed."
                    );
                }

                setOrder(
                    data.order
                );

                setStatus(
                    data.order.status ||
                    status
                );

                // =========================
                // SUCCESS MESSAGE
                // =========================
                if (
                    status ===
                    "cancelled"
                ) {

                    toast.success(
                        "Order cancelled successfully. Stock has been restored."
                    );

                } else {

                    toast.success(
                        `Order status changed to ${formatStatus(
                            status
                        )}.`
                    );
                }

            } catch (error) {

                console.error(
                    "UPDATE ORDER STATUS ERROR:",
                    error
                );

                const message =
                    error.response
                        ?.data
                        ?.message ||
                    error.message ||
                    "Failed to update order status.";

                toast.error(
                    message
                );

                // =========================
                // RESTORE CURRENT STATUS
                // =========================
                setStatus(
                    previousStatus
                );

            } finally {

                setSaving(false);

            }
        };

    // =========================
    // LOADING
    // =========================
    if (loading) {

        return (
            <div
                style={{
                    maxWidth:
                        "1200px",
                    margin:
                        "40px auto",
                    padding:
                        "20px",
                }}
            >
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
                    <h2>
                        Loading order...
                    </h2>

                    <p
                        style={{
                            color:
                                "#666",
                            marginBottom:
                                0,
                        }}
                    >
                        Please wait while the order is being loaded.
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
                    maxWidth:
                        "1200px",
                    margin:
                        "40px auto",
                    padding:
                        "20px",
                }}
            >
                <div
                    style={{
                        border:
                            "1px solid #f1aeb5",
                        background:
                            "#f8d7da",
                        color:
                            "#842029",
                        borderRadius:
                            "12px",
                        padding:
                            "30px",
                    }}
                >
                    <h2
                        style={{
                            marginTop:
                                0,
                        }}
                    >
                        Failed to load order
                    </h2>

                    <p
                        style={{
                            marginBottom:
                                0,
                        }}
                    >
                        {error}
                    </p>
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
                    maxWidth:
                        "1200px",
                    margin:
                        "40px auto",
                    padding:
                        "20px",
                }}
            >
                <h2>
                    Order not found
                </h2>
            </div>
        );
    }

    // =========================
    // CURRENT STATUS
    // =========================
    const currentStatus =
        order.status ||
        "pending";

    const availableStatuses =
        getAvailableStatuses();

    const isFinalStatus =
        currentStatus ===
        "delivered" ||
        currentStatus ===
        "cancelled";

    const hasStatusChanged =
        status !==
        currentStatus;

    const statusHistory =
        Array.isArray(
            order.statusHistory
        )
            ? order.statusHistory
            : [];

    return (
        <div
            style={{
                maxWidth:
                    "1200px",
                margin:
                    "0 auto",
                padding:
                    "20px",
            }}
        >

            {/* =========================
                HEADER
            ========================= */}
            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    gap:
                        "20px",
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
                        Order management
                    </p>

                </div>

                <span
                    style={{
                        ...getStatusStyle(
                            currentStatus
                        ),
                        display:
                            "inline-block",
                        padding:
                            "9px 16px",
                        borderRadius:
                            "999px",
                        fontWeight:
                            "700",
                        fontSize:
                            "14px",
                    }}
                >
                    {formatStatus(
                        currentStatus
                    )}
                </span>

            </div>

            {/* =========================
                CUSTOMER INFORMATION
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

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
                    Customer Information
                </h2>

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

                {order.customer?.postalCode && (
                    <p>
                        <strong>
                            Postal Code:
                        </strong>{" "}
                        {
                            order.customer
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
                            order.customer
                                .city
                        }
                    </p>
                )}

            </div>

            {/* =========================
                PRODUCTS
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

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
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

                                const itemTotal =
                                    Number(
                                        item.price
                                    ) *
                                    Number(
                                        item.quantity
                                    );

                                return (
                                    <div
                                        key={`${item.productId}-${index}`}
                                        style={{
                                            border:
                                                "1px solid #eee",
                                            borderRadius:
                                                "10px",
                                            padding:
                                                "15px",
                                            background:
                                                "#fafafa",
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
                                                        getImageUrl(
                                                            image
                                                        )
                                                    }
                                                    alt={
                                                        item.name ||
                                                        "Product"
                                                    }
                                                    style={{
                                                        width:
                                                            "80px",
                                                        height:
                                                            "80px",
                                                        objectFit:
                                                            "cover",
                                                        borderRadius:
                                                            "8px",
                                                        border:
                                                            "1px solid #ddd",
                                                    }}
                                                    onError={(
                                                        event
                                                    ) => {
                                                        event.currentTarget.style.display =
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

                                                <p>
                                                    <strong>
                                                        Product:
                                                    </strong>{" "}
                                                    {item.name ||
                                                        "-"}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Quantity:
                                                    </strong>{" "}
                                                    {item.quantity}
                                                </p>

                                                <p>
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
                                                        marginBottom:
                                                            0,
                                                    }}
                                                >
                                                    <strong>
                                                        Total:
                                                    </strong>{" "}
                                                    {formatPrice(
                                                        itemTotal
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

            </div>

            {/* =========================
                PRICING
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

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
                    Pricing
                </h2>

                <div
                    style={{
                        display:
                            "flex",
                        justifyContent:
                            "space-between",
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
                                ?.subtotal
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
                                ?.tax
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
                                ?.shipping
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
                        borderTop:
                            "2px solid #222",
                        marginTop:
                            "10px",
                        paddingTop:
                            "15px",
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
                                ?.total
                        )}{" "}
                        kr
                    </strong>
                </div>

            </div>

            {/* =========================
                PAYMENT
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

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
                    Payment
                </h2>

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

                <p
                    style={{
                        marginBottom:
                            0,
                    }}
                >
                    <strong>
                        Status:
                    </strong>{" "}

                    <span
                        style={{
                            ...getPaymentStyle(
                                order.payment
                                    ?.status
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
                ORDER STATUS
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
                            "20px",
                        flexWrap:
                            "wrap",
                        marginBottom:
                            "20px",
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
                            Manage the current order status.
                        </p>

                    </div>

                    <span
                        style={{
                            ...getStatusStyle(
                                currentStatus
                            ),
                            display:
                                "inline-block",
                            padding:
                                "8px 14px",
                            borderRadius:
                                "999px",
                            fontWeight:
                                "600",
                        }}
                    >
                        {formatStatus(
                            currentStatus
                        )}
                    </span>

                </div>

                {/* =========================
                    STATUS CONTROLS
                ========================= */}
                <div
                    style={{
                        display:
                            "flex",
                        alignItems:
                            "center",
                        gap:
                            "12px",
                        flexWrap:
                            "wrap",
                    }}
                >

                    <select
                        value={
                            status
                        }
                        onChange={(
                            event
                        ) =>
                            setStatus(
                                event.target.value
                            )
                        }
                        disabled={
                            saving ||
                            isFinalStatus
                        }
                        style={{
                            minWidth:
                                "220px",
                            padding:
                                "10px 12px",
                            border:
                                "1px solid #ccc",
                            borderRadius:
                                "8px",
                            background:
                                isFinalStatus
                                    ? "#f5f5f5"
                                    : "#fff",
                            cursor:
                                isFinalStatus
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >

                        {availableStatuses.map(
                            (
                                availableStatus
                            ) => (

                                <option
                                    key={
                                        availableStatus
                                    }
                                    value={
                                        availableStatus
                                    }
                                >
                                    {formatStatus(
                                        availableStatus
                                    )}
                                </option>

                            )
                        )}

                    </select>

                    <button
                        type="button"
                        onClick={
                            handleStatusUpdate
                        }
                        disabled={
                            saving ||
                            !hasStatusChanged ||
                            isFinalStatus
                        }
                        style={{
                            padding:
                                "10px 18px",
                            border:
                                "none",
                            borderRadius:
                                "8px",
                            background:
                                saving ||
                                    !hasStatusChanged ||
                                    isFinalStatus
                                    ? "#aaa"
                                    : "#222",
                            color:
                                "#fff",
                            fontWeight:
                                "600",
                            cursor:
                                saving ||
                                    !hasStatusChanged ||
                                    isFinalStatus
                                    ? "not-allowed"
                                    : "pointer",
                        }}
                    >
                        {saving
                            ? "Saving..."
                            : "Save Status"}
                    </button>

                </div>

                {/* =========================
                    FINAL STATUS MESSAGE
                ========================= */}
                {isFinalStatus && (
                    <div
                        style={{
                            marginTop:
                                "15px",
                            padding:
                                "12px 15px",
                            borderRadius:
                                "8px",
                            background:
                                "#f8f9fa",
                            border:
                                "1px solid #ddd",
                            color:
                                "#555",
                        }}
                    >
                        {currentStatus ===
                            "cancelled"
                            ? "This order is cancelled and cannot be moved to another status."
                            : "This order has been delivered and cannot be moved to another status."}
                    </div>
                )}

            </div>

            {/* =========================
                STATUS HISTORY
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

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
                    Order Progress
                </h2>

                {statusHistory.length > 0 ? (

                    <div>

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
                                                color:
                                                    "#666",
                                                fontSize:
                                                    "14px",
                                                marginTop:
                                                    "4px",
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

                ) : (

                    <p
                        style={{
                            color:
                                "#666",
                            marginBottom:
                                0,
                        }}
                    >
                        No status history available.
                    </p>

                )}

            </div>

            {/* =========================
                ORDER DATES
            ========================= */}
            <div
                style={{
                    border:
                        "1px solid #ddd",
                    borderRadius:
                        "12px",
                    padding:
                        "25px",
                    background:
                        "#fff",
                }}
            >

                <h2
                    style={{
                        marginTop:
                            0,
                    }}
                >
                    Order Information
                </h2>

                <p>
                    <strong>
                        Current Status:
                    </strong>{" "}
                    {formatStatus(
                        currentStatus
                    )}
                </p>

                <p>
                    <strong>
                        Created:
                    </strong>{" "}
                    {order.createdAt
                        ? new Date(
                            order.createdAt
                        ).toLocaleString()
                        : "-"}
                </p>

                <p
                    style={{
                        marginBottom:
                            0,
                    }}
                >
                    <strong>
                        Updated:
                    </strong>{" "}
                    {order.updatedAt
                        ? new Date(
                            order.updatedAt
                        ).toLocaleString()
                        : "-"}
                </p>

            </div>

        </div>
    );
}

export default OrderDetail;