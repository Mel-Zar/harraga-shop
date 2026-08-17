import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

console.log("🚀 ORDER API:", API_URL);

// =========================
// 🔐 GET AUTH HEADERS
// =========================
const getAuthHeaders = () => {
    const token =
        localStorage.getItem("token");

    const headers = {};

    if (
        token &&
        token !== "null" &&
        token !== "undefined"
    ) {
        headers.Authorization =
            `Bearer ${token}`;
    }

    return headers;
};

// =========================
// 📦 CREATE ORDER
// =========================
export const createOrder = async (
    orderData
) => {
    try {
        const token =
            localStorage.getItem("token");

        // =========================
        // VALIDATE ORDER DATA
        // =========================
        if (!orderData) {
            throw new Error(
                "Order data is required"
            );
        }

        // =========================
        // CLEAN PAYLOAD
        // =========================
        const payload = {
            ...orderData,

            items:
                Array.isArray(
                    orderData.items
                )
                    ? orderData.items.map(
                        (item) => ({
                            productId:
                                item.productId,

                            name:
                                item.name,

                            price:
                                item.price,

                            quantity:
                                Number(
                                    item.quantity
                                ) || 1,

                            image:
                                item.image ||
                                "",
                        })
                    )
                    : [],

            customer: {
                name:
                    orderData.customer
                        ?.name || "",

                email:
                    orderData.customer
                        ?.email || "",

                address:
                    orderData.customer
                        ?.address || "",

                phone:
                    orderData.customer
                        ?.phone || "",

                city:
                    orderData.customer
                        ?.city || "",

                postalCode:
                    orderData.customer
                        ?.postalCode || "",
            },
        };

        // =========================
        // AUTH HEADERS
        // =========================
        const headers = {};

        if (
            token &&
            token !== "null" &&
            token !== "undefined"
        ) {
            headers.Authorization =
                `Bearer ${token}`;
        }

        // =========================
        // CREATE REQUEST
        // =========================
        const response =
            await axios.post(
                API_URL,
                payload,
                {
                    withCredentials: true,
                    headers,
                }
            );

        return response.data;

    } catch (error) {
        console.error(
            "❌ CREATE ORDER ERROR:",
            error.response?.data ||
            error.message
        );

        throw error;
    }
};

// =========================
// 📦 GET ALL ORDERS
// ADMIN ONLY
// =========================
export const getAllOrders =
    async () => {
        try {
            const response =
                await axios.get(
                    API_URL,
                    {
                        withCredentials:
                            true,

                        headers:
                            getAuthHeaders(),
                    }
                );

            return response.data;

        } catch (error) {
            console.error(
                "❌ GET ALL ORDERS ERROR:",
                error.response?.data ||
                error.message
            );

            throw error;
        }
    };

// =========================
// 📦 GET CUSTOMER ORDERS
// CUSTOMER ONLY
// =========================
export const getMyOrders =
    async () => {
        try {
            const response =
                await axios.get(
                    `${API_URL}/my-orders`,
                    {
                        withCredentials:
                            true,

                        headers:
                            getAuthHeaders(),
                    }
                );

            return response.data;

        } catch (error) {
            console.error(
                "❌ GET MY ORDERS ERROR:",
                error.response?.data ||
                error.message
            );

            throw error;
        }
    };

// =========================
// 📦 GET CUSTOMER SINGLE ORDER
// CUSTOMER ONLY
// =========================
export const getMyOrderById =
    async (id) => {
        try {
            if (!id) {
                throw new Error(
                    "Order ID is required"
                );
            }

            const response =
                await axios.get(
                    `${API_URL}/my-orders/${id}`,
                    {
                        withCredentials:
                            true,

                        headers:
                            getAuthHeaders(),
                    }
                );

            return response.data;

        } catch (error) {
            console.error(
                "❌ GET MY ORDER ERROR:",
                error.response?.data ||
                error.message
            );

            throw error;
        }
    };

// =========================
// 📦 GET SINGLE ORDER
// ADMIN ONLY
// =========================
export const getOrderById =
    async (id) => {
        try {
            if (!id) {
                throw new Error(
                    "Order ID is required"
                );
            }

            const response =
                await axios.get(
                    `${API_URL}/${id}`,
                    {
                        withCredentials:
                            true,

                        headers:
                            getAuthHeaders(),
                    }
                );

            return response.data;

        } catch (error) {
            console.error(
                "❌ GET ORDER ERROR:",
                error.response?.data ||
                error.message
            );

            throw error;
        }
    };

// =========================
// 📦 UPDATE ORDER STATUS
// ADMIN ONLY
// =========================
export const updateOrderStatus =
    async (
        id,
        status
    ) => {
        try {
            if (!id) {
                throw new Error(
                    "Order ID is required"
                );
            }

            if (!status) {
                throw new Error(
                    "Order status is required"
                );
            }

            const response =
                await axios.patch(
                    `${API_URL}/${id}/status`,
                    {
                        status,
                    },
                    {
                        withCredentials:
                            true,

                        headers:
                            getAuthHeaders(),
                    }
                );

            return response.data;

        } catch (error) {
            console.error(
                "❌ UPDATE ORDER STATUS ERROR:",
                error.response?.data ||
                error.message
            );

            throw error;
        }
    };