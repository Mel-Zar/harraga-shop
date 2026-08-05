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


            if (existing) {

                const newQuantity = Math.min(
                    existing.quantity + quantity,
                    product.stock
                );


                if (newQuantity <= 0) {

                    toast.info(
                        `🗑️ ${product.name} removed from cart`
                    );

                    return prev.filter(
                        (item) =>
                            String(item._id) !==
                            String(product._id)
                    );

                }


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


            toast.success(
                `🛒 ${product.name} added to cart`
            );


            return [
                ...prev,
                {
                    ...product,
                    quantity: Math.min(
                        quantity,
                        product.stock
                    ),
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

        setCartItems((prev) =>

            prev.map((item) => {

                if (
                    String(item._id) !==
                    String(product._id)
                ) {

                    return item;

                }

                return {

                    ...item,

                    quantity: Math.max(
                        1,
                        Math.min(
                            quantity,
                            item.stock
                        )
                    ),

                };

            })

        );

    };



    const removeFromCart = (productId) => {

        const product = cartItems.find(
            (item) =>
                String(item._id) ===
                String(productId)
        );


        if (product) {

            toast.info(
                `🗑️ ${product.name} removed from cart`
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



    const clearCart = () => {

        setCartItems([]);

        localStorage.removeItem(
            "cart"
        );

        toast.warning(
            "🧹 Cart cleared"
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