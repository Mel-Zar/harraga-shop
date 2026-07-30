import { useState, useEffect } from "react";
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


                const newQuantity =
                    existing.quantity + quantity;



                if (newQuantity <= 0) {

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
                            quantity:
                                newQuantity,
                        };

                    }


                    return item;

                });


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