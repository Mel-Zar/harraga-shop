import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderById } from "../../services/ordersService";

function OrderDetails() {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const data = await getOrderById(id);
                setOrder(data.order);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) {
        return <h2>Loading order...</h2>;
    }

    if (!order) {
        return <h2>Order not found</h2>;
    }

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "20px",
            }}
        >
            <h1>
                Order #{order.orderNumber || order._id}
            </h1>

            <hr />

            <h2>Customer Information</h2>

            <p>
                <strong>Name:</strong>{" "}
                {order.customer?.name}
            </p>

            <p>
                <strong>Email:</strong>{" "}
                {order.customer?.email || "-"}
            </p>

            <p>
                <strong>Phone:</strong>{" "}
                {order.customer?.phone}
            </p>

            <p>
                <strong>Address:</strong>{" "}
                {order.customer?.address}
            </p>

            {order.customer?.postalCode && (
                <p>
                    <strong>Postal Code:</strong>{" "}
                    {order.customer.postalCode}
                </p>
            )}

            {order.customer?.city && (
                <p>
                    <strong>City:</strong>{" "}
                    {order.customer.city}
                </p>
            )}

            <hr />

            <h2>Products</h2>

            {order.items?.map((item, index) => (
                <div
                    key={`${item.productId}-${index}`}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "15px",
                        marginBottom: "10px",
                    }}
                >
                    <p>
                        <strong>Product:</strong>{" "}
                        {item.name}
                    </p>

                    <p>
                        <strong>Quantity:</strong>{" "}
                        {item.quantity}
                    </p>

                    <p>
                        <strong>Price:</strong>{" "}
                        {item.price} kr
                    </p>

                    <p>
                        <strong>Total:</strong>{" "}
                        {item.price * item.quantity} kr
                    </p>
                </div>
            ))}

            <hr />

            <h2>Pricing</h2>

            <p>
                <strong>Subtotal:</strong>{" "}
                {order.pricing?.subtotal} kr
            </p>

            <p>
                <strong>Tax:</strong>{" "}
                {order.pricing?.tax} kr
            </p>

            <p>
                <strong>Shipping:</strong>{" "}
                {order.pricing?.shipping} kr
            </p>

            <h3>
                Total: {order.pricing?.total} kr
            </h3>

            <hr />

            <h2>Payment</h2>

            <p>
                <strong>Method:</strong>{" "}
                {order.payment?.method}
            </p>

            <p>
                <strong>Status:</strong>{" "}
                {order.payment?.status}
            </p>

            <hr />

            <h2>Order Status</h2>

            <p>
                <strong>Status:</strong>{" "}
                {order.status}
            </p>

            <p>
                <strong>Created:</strong>{" "}
                {new Date(order.createdAt).toLocaleString()}
            </p>

            <p>
                <strong>Updated:</strong>{" "}
                {new Date(order.updatedAt).toLocaleString()}
            </p>
        </div>
    );
}

export default OrderDetails;