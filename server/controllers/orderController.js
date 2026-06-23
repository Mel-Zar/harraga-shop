import Order from "../models/Order.js";

// =========================
// CREATE ORDER
// =========================
export const createOrder = async (req, res) => {
    try {
        const { items, customer, pricing, payment } = req.body;

        console.log("ORDER BODY:", req.body);

        if (!items?.length) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        if (!customer?.name || !customer?.address || !customer?.phone) {
            return res.status(400).json({ message: "Missing customer info" });
        }

        // 🔥 email optional (fixar ditt tidigare crash)
        const safeCustomer = {
            name: customer.name,
            email: customer.email || "",
            address: customer.address,
            phone: customer.phone,
        };

        const safeItems = items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        const order = new Order({
            user: req.user?._id || null,
            items: safeItems,
            customer: safeCustomer,
            pricing,
            payment: payment ?? {
                method: "cod",
                status: "pending",
            },
            status: "pending",
        });

        const savedOrder = await order.save();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            order: savedOrder,
        });

    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Server error while creating order",
        });
    }
};

// =========================
// GET ALL ORDERS
// =========================
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });

        return res.json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (error) {
        console.error("GET ORDERS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

// =========================
// GET SINGLE ORDER
// =========================
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.json({
            success: true,
            order,
        });

    } catch (error) {
        console.error("GET ORDER ERROR:", error);

        return res.status(500).json({
            message: "Error fetching order",
        });
    }
};