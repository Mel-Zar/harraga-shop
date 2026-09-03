import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CartContext from "./CartContext";

export function CartProvider({ children }) {

    const [cartItems, setCartItems] = useState(() => {

        const savedCart = localStorage.getItem("cart");

        return savedCart
            ? JSON.parse(savedCart)
            : [];

    });



    useEffect(() => {

        localStorage.setItem(
            "cart",
            JSON.stringify(cartItems)
        );

    }, [cartItems]);



    const addToCart = (
        product,
        quantity = 1
    ) => {

        setCartItems((prev) => {

            const existing = prev.find(
                (item) =>
                    String(item._id) ===
                    String(product._id)
            );


            // ==========================================
            // EXISTING PRODUCT
            // ==========================================

            if (existing) {

                const requestedQuantity =
                    existing.quantity + quantity;

                const newQuantity = Math.min(
                    requestedQuantity,
                    product.stock
                );


                // ------------------------------------------
                // Product removed
                // ------------------------------------------

                if (newQuantity <= 0) {

                    toast.info(
                        `🗑️ ${product.name} removed from your cart.`,
                        {
                            position: "top-right",
                            autoClose: 2500,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            theme: "colored",
                        }
                    );

                    return prev.filter(
                        (item) =>
                            String(item._id) !==
                            String(product._id)
                    );

                }


                // ------------------------------------------
                // Quantity increased
                // ------------------------------------------

                if (quantity > 0) {

                    if (
                        newQuantity ===
                        product.stock
                    ) {

                        toast.warning(
                            `⚠️ ${product.name}: maximum stock reached (${product.stock}).`,
                            {
                                position: "top-right",
                                autoClose: 3000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                theme: "colored",
                            }
                        );

                    } else {

                        toast.success(
                            `🛒 ${product.name} quantity increased to ${newQuantity}.`,
                            {
                                position: "top-right",
                                autoClose: 2000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                theme: "colored",
                            }
                        );

                    }

                }


                // ------------------------------------------
                // Quantity decreased
                // ------------------------------------------

                if (quantity < 0) {

                    toast.info(
                        `➖ ${product.name} quantity decreased to ${newQuantity}.`,
                        {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            theme: "colored",
                        }
                    );

                }


                // ------------------------------------------
                // Update existing product
                // ------------------------------------------

                return prev.map((item) => {

                    if (
                        String(item._id) ===
                        String(product._id)
                    ) {

                        return {
                            ...item,
                            quantity: newQuantity,
                        };

                    }

                    return item;

                });

            }


            // ==========================================
            // NEW PRODUCT
            // ==========================================

            const quantityToAdd = Math.min(
                quantity,
                product.stock
            );


            if (quantityToAdd <= 0) {

                toast.warning(
                    `⚠️ ${product.name} is currently out of stock.`,
                    {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        theme: "colored",
                    }
                );

                return prev;

            }


            toast.success(
                `🛒 ${product.name} added to your cart.`,
                {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    theme: "colored",
                }
            );


            return [
                ...prev,
                {
                    ...product,
                    quantity: quantityToAdd,
                },
            ];

        });

    };



    // ➕ Increase quantity
    const increaseQuantity = (product) => {

        addToCart(
            product,
            1
        );

    };



    // ➖ Decrease quantity
    const decreaseQuantity = (product) => {

        addToCart(
            product,
            -1
        );

    };



    // 🔢 Update quantity directly
    const updateQuantity = (
        product,
        quantity
    ) => {

        setCartItems((prev) => {

            const currentItem = prev.find(
                (item) =>
                    String(item._id) ===
                    String(product._id)
            );


            if (!currentItem) {
                return prev;
            }


            const newQuantity = Math.max(
                1,
                Math.min(
                    quantity,
                    currentItem.stock
                )
            );


            // ------------------------------------------
            // Quantity increased
            // ------------------------------------------

            if (
                newQuantity >
                currentItem.quantity
            ) {

                if (
                    newQuantity ===
                    currentItem.stock
                ) {

                    toast.warning(
                        `⚠️ ${currentItem.name}: maximum stock reached (${currentItem.stock}).`,
                        {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            theme: "colored",
                        }
                    );

                } else {

                    toast.success(
                        `➕ ${currentItem.name} quantity increased to ${newQuantity}.`,
                        {
                            position: "top-right",
                            autoClose: 2000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            theme: "colored",
                        }
                    );

                }

            }


            // ------------------------------------------
            // Quantity decreased
            // ------------------------------------------

            if (
                newQuantity <
                currentItem.quantity
            ) {

                toast.info(
                    `➖ ${currentItem.name} quantity decreased to ${newQuantity}.`,
                    {
                        position: "top-right",
                        autoClose: 2000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        theme: "colored",
                    }
                );

            }


            return prev.map((item) => {

                if (
                    String(item._id) !==
                    String(product._id)
                ) {

                    return item;

                }


                return {
                    ...item,
                    quantity: newQuantity,
                };

            });

        });

    };



    // 🗑️ Remove product
    const removeFromCart = (productId) => {

        const product = cartItems.find(
            (item) =>
                String(item._id) ===
                String(productId)
        );


        if (product) {

            toast.success(
                `🗑️ ${product.name} removed from your cart.`,
                {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    theme: "colored",
                }
            );

        }


        setCartItems((prev) =>
            prev.filter(
                (item) =>
                    String(item._id) !==
                    String(productId)
            )
        );

    };



    // 🧹 Clear entire cart
    const clearCart = () => {

        setCartItems([]);

        localStorage.removeItem(
            "cart"
        );


        toast.warning(
            "🧹 Your cart has been cleared.",
            {
                position: "top-right",
                autoClose: 2500,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                theme: "colored",
            }
        );

    };



    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                increaseQuantity,
                decreaseQuantity,
                updateQuantity,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );

}