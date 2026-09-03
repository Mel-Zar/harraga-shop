import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";

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
                        const message =
                            "You must be logged in to view this order.";

                        setError(message);
                        toast.error(message);

                        return;
                    }

                    if (!id) {
                        const message =
                            "Order ID is missing.";

                        setError(message);
                        toast.error(message);

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

                    const errorMessage =
                        error.response
                            ?.data
                            ?.message ||
                        error.message ||
                        "Failed to load order.";

                    setError(
                        errorMessage
                    );

                    toast.error(
                        errorMessage
                    );

                } finally {
                    setLoading(false);
                }
            };

        fetchOrder();
    }, [id]);

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

                <p>
                    Loading order...
                </p>
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
                        border: "1px solid #ddd",
                        padding: "30px",
                        borderRadius: "10px",
                    }}
                >
                    <p>
                        {error}
                    </p>

                    <Link to="/profile/orders">
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
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <h1>
                        Order #
                        {order.orderNumber ||
                            order._id}
                    </h1>

                    <p>
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

                <Link to="/profile/orders">
                    ← Back to My Orders
                </Link>
            </div>

            <hr />

            {/* =========================
                ORDER STATUS
            ========================= */}
            <h2>
                Order Status
            </h2>

            <p>
                <strong>
                    Status:
                </strong>{" "}
                {order.status ||
                    "pending"}
            </p>

            {/* =========================
                CUSTOMER INFORMATION
            ========================= */}
            <hr />

            <h2>
                Customer Information
            </h2>

            <p>
                <strong>
                    Name:
                </strong>{" "}
                {order.customer?.name || "-"}
            </p>

            <p>
                <strong>
                    Email:
                </strong>{" "}
                {order.customer?.email || "-"}
            </p>

            <p>
                <strong>
                    Phone:
                </strong>{" "}
                {order.customer?.phone || "-"}
            </p>

            <p>
                <strong>
                    Address:
                </strong>{" "}
                {order.customer?.address || "-"}
            </p>

            {order.customer?.postalCode && (
                <p>
                    <strong>
                        Postal Code:
                    </strong>{" "}
                    {order.customer.postalCode}
                </p>
            )}

            {order.customer?.city && (
                <p>
                    <strong>
                        City:
                    </strong>{" "}
                    {order.customer.city}
                </p>
            )}

            {/* =========================
                PRODUCTS
            ========================= */}
            <hr />

            <h2>
                Products
            </h2>

            {order.items?.length ? (
                order.items.map(
                    (item, index) => (
                        <div
                            key={`${item.productId}-${index}`}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "20px",
                                marginBottom: "15px",
                            }}
                        >
                            <p>
                                <strong>
                                    Product:
                                </strong>{" "}
                                {item.name}
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
                                {item.price} kr
                            </p>

                            <p>
                                <strong>
                                    Total:
                                </strong>{" "}
                                {(
                                    Number(item.price) *
                                    Number(item.quantity)
                                ).toFixed(2)}{" "}
                                kr
                            </p>
                        </div>
                    )
                )
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

            <p>
                <strong>
                    Subtotal:
                </strong>{" "}
                {order.pricing?.subtotal ?? 0} kr
            </p>

            <p>
                <strong>
                    Tax:
                </strong>{" "}
                {order.pricing?.tax ?? 0} kr
            </p>

            <p>
                <strong>
                    Shipping:
                </strong>{" "}
                {order.pricing?.shipping ?? 0} kr
            </p>

            <h2>
                Total:{" "}
                {order.pricing?.total ?? 0} kr
            </h2>

            {/* =========================
                PAYMENT
            ========================= */}
            <hr />

            <h2>
                Payment
            </h2>

            <p>
                <strong>
                    Method:
                </strong>{" "}
                {order.payment?.method || "-"}
            </p>

            <p>
                <strong>
                    Payment Status:
                </strong>{" "}
                {order.payment?.status ||
                    "pending"}
            </p>

            {/* =========================
                UPDATED
            ========================= */}
            <hr />

            <p>
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