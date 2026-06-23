import { useState } from "react";
import CartContext from "./CartContext";

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([]);

    const addToCart = (product, quantity = 1) => {
        setCartItems((prev) => {
            const existing = prev.find(
                (item) => item._id === product._id
            );

            if (existing) {
                const newQuantity =
                    existing.quantity + quantity;

                if (newQuantity <= 0) {
                    return prev.filter(
                        (item) =>
                            item._id !== product._id
                    );
                }

                return prev.map((item) =>
                    item._id === product._id
                        ? {
                            ...item,
                            quantity:
                                newQuantity,
                        }
                        : item
                );
            }

            return [
                ...prev,
                {
                    ...product,
                    quantity,
                },
            ];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prev) =>
            prev.filter(
                (item) => item._id !== productId
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}