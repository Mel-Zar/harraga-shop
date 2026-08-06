import Order from "../models/Order.js";
import Product from "../models/Product.js";

// =========================
// CREATE ORDER
// =========================
export const createOrder = async (req, res) => {
    try {
        const { items, customer, pricing, payment } = req.body;

        console.log("ORDER BODY:", req.body);

        if (!items?.length) {
            return res.status(400).json({
                message: "Cart is empty",
            });
        }

        if (
            !customer?.name ||
            !customer?.address ||
            !customer?.phone
        ) {
            return res.status(400).json({
                message: "Missing customer info",
            });
        }

        // =========================
        // VALIDATE STOCK
        // =========================
        for (const item of items) {
            const product = await Product.findById(
                item.productId
            );

            if (!product) {
                return res.status(404).json({
                    message: `Product not found: ${item.name}`,
                });
            }

            if (!product.isActive) {
                return res.status(400).json({
                    message: `${product.name} is unavailable`,
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for ${product.name}. Available: ${product.stock}`,
                });
            }
        }

        // =========================
        // GENERATE ORDER NUMBER
        // =========================
        const lastOrder = await Order.findOne().sort({
            createdAt: -1,
        });

        let nextNumber = 1;

        if (lastOrder?.orderNumber) {
            const currentNumber = parseInt(
                lastOrder.orderNumber.replace(
                    "HARRAGA-",
                    ""
                )
            );

            if (!isNaN(currentNumber)) {
                nextNumber = currentNumber + 1;
            }
        }

        const orderNumber = `HARRAGA-${String(
            nextNumber
        ).padStart(6, "0")}`;

        // =========================
        // SAFE CUSTOMER
        // =========================
        const safeCustomer = {
            name: customer.name,
            email: customer.email || "",
            address: customer.address,
            phone: customer.phone,
            city: customer.city || "",
            postalCode:
                customer.postalCode || "",
        };

        // =========================
        // SAFE ITEMS
        // =========================
        const safeItems = items.map((item) => ({
            productId: item.productId,
            name: item.name,
            image: item.image || "",
            price: item.price,
            quantity: item.quantity,
        }));

        // =========================
        // DECREASE STOCK
        // =========================
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.productId,
                {
                    $inc: {
                        stock: -item.quantity,
                    },
                }
            );
        }

        // =========================
        // CREATE ORDER
        // =========================
        const order = new Order({
            orderNumber,
            user: req.user?._id || null,
            items: safeItems,
            customer: safeCustomer,
            pricing,
            payment:
                payment ?? {
                    method: "cod",
                    status: "pending",
                },
            status: "pending",
        });

        const savedOrder = await order.save();

        return res.status(201).json({
            success: true,
            message:
                "Order created successfully",
            order: savedOrder,
        });
    } catch (error) {
        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Server error while creating order",
        });
    }
};

// =========================
// GET ALL ORDERS
// =========================
export const getAllOrders = async (
    req,
    res
) => {
    try {
        const orders = await Order.find().sort({
            createdAt: -1,
        });

        return res.json({
            success: true,
            count: orders.length,
            orders,
        });
    } catch (error) {
        console.error(
            "GET ORDERS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to fetch orders",
        });
    }
};

// =========================
// GET SINGLE ORDER
// =========================
export const getOrderById = async (
    req,
    res
) => {
    try {
        const order = await Order.findById(
            req.params.id
        );

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
        console.error(
            "GET ORDER ERROR:",
            error
        );

        return res.status(500).json({
            message: "Error fetching order",
        });
    }
};


// =========================
// UPDATE ORDER STATUS
// =========================
// =========================
// UPDATE ORDER STATUS
// =========================
export const updateOrderStatus = async (
    req,
    res
) => {
    try {

        const { id } = req.params;
        const { status } = req.body;

        const allowedStatuses = [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        order.status = status;

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            order,
        });

    } catch (error) {
        console.error(
            "UPDATE ORDER STATUS ERROR:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Failed to update order status",
        });
    }
};