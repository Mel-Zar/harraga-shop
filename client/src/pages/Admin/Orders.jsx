import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllOrders } from "../../services/ordersService";

function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await getAllOrders();
                setOrders(data.orders || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

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

            {orders.length === 0 ? (
                <p>No orders found.</p>
            ) : (
                orders.map((order) => (
                    <div
                        key={order._id}
                        onClick={() =>
                            navigate(`/admin/orders/${order._id}`)
                        }
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginBottom: "15px",
                            background: "#fff",
                            cursor: "pointer",
                        }}
                    >
                        <h2>
                            {order.orderNumber || order._id}
                        </h2>

                        <p>
                            <strong>Customer:</strong>{" "}
                            {order.customer?.name}
                        </p>

                        <p>
                            <strong>Total:</strong>{" "}
                            {order.pricing?.total} kr
                        </p>

                        <p>
                            <strong>Status:</strong>{" "}
                            {order.status}
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {new Date(
                                order.createdAt
                            ).toLocaleDateString()}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Orders;