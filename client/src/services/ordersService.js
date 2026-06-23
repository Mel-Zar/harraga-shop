import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/orders`;

console.log("🚀 ORDER API:", API_URL);

// =========================
// 📦 CREATE ORDER
// =========================
export const createOrder = async (orderData) => {
    try {
        const token = localStorage.getItem("token");

        // 🔥 CLEAN payload (NO BREAKING MAPPING)
        const payload = {
            ...orderData,
            items: orderData.items?.map((item) => ({
                productId: item.productId,
                name: item.name,          // ✅ FIX
                price: item.price,
                quantity: item.quantity || 1,
            })),
            customer: {
                name: orderData.customer?.name,
                email: orderData.customer?.email,
                address: orderData.customer?.address,
                phone: orderData.customer?.phone, // ✅ FIX
            },
        };

        const headers = {};

        // 🔥 only add token if exists
        if (token && token !== "null" && token !== "undefined") {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.post(API_URL, payload, {
            withCredentials: true,
            headers,
        });

        return response.data;

    } catch (error) {
        console.error(
            "❌ CREATE ORDER ERROR:",
            error.response?.data || error.message
        );

        throw error;
    }
};

// =========================
// 📦 GET ALL ORDERS
// =========================
export const getAllOrders = async () => {
    try {
        const token = localStorage.getItem("token");

        const headers = {};
        if (token && token !== "null") {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get(API_URL, {
            withCredentials: true,
            headers,
        });

        return response.data;

    } catch (error) {
        console.error("❌ GET ORDERS ERROR:", error.response?.data || error.message);
        throw error;
    }
};

// =========================
// 📦 GET SINGLE ORDER
// =========================
export const getOrderById = async (id) => {
    try {
        const token = localStorage.getItem("token");

        const headers = {};
        if (token && token !== "null") {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await axios.get(`${API_URL}/${id}`, {
            withCredentials: true,
            headers,
        });

        return response.data;

    } catch (error) {
        console.error("❌ GET ORDER ERROR:", error.response?.data || error.message);
        throw error;
    }
};