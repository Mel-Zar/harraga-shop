import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CartContext from "./CartContext";
import { getUser } from "../utils/auth";

const GUEST_CART_KEY = "guestCart";

const getUserCartKey = (user) => {
    if (!user) {
        return GUEST_CART_KEY;
    }

    const userId =
        user._id ||
        user.id ||
        user.userId;

    if (!userId) {
        return GUEST_CART_KEY;
    }

    return `cart_${String(userId)}`;
};

const loadCart = (key) => {
    try {
        const savedCart =
            localStorage.getItem(key);

        if (!savedCart) {
            return [];
        }

        const parsedCart =
            JSON.parse(savedCart);

        if (!Array.isArray(parsedCart)) {
            return [];
        }

        return parsedCart.filter(
            (item) =>
                item &&
                item._id &&
                Number(item.quantity) > 0
        );

    } catch (error) {
        console.error(
            "LOAD CART ERROR:",
            error
        );

        localStorage.removeItem(key);

        return [];
    }
};

const saveCart = (
    key,
    cart
) => {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(cart)
        );
    } catch (error) {
        console.error(
            "SAVE CART ERROR:",
            error
        );
    }
};

const mergeCarts = (
    guestCart,
    userCart
) => {
    const merged = [...userCart];

    guestCart.forEach(
        (guestItem) => {
            const existingIndex =
                merged.findIndex(
                    (item) =>
                        String(item._id) ===
                        String(
                            guestItem._id
                        )
                );

            if (
                existingIndex === -1
            ) {
                const stock = Number(
                    guestItem.stock
                );

                const quantity = Math.min(
                    Number(
                        guestItem.quantity
                    ) || 1,
                    stock > 0
                        ? stock
                        : 0
                );

                if (quantity > 0) {
                    merged.push({
                        ...guestItem,
                        quantity,
                    });
                }

                return;
            }

            const existing =
                merged[
                existingIndex
                ];

            const stock = Number(
                existing.stock ??
                guestItem.stock ??
                0
            );

            const requestedQuantity =
                Number(
                    existing.quantity
                ) +
                Number(
                    guestItem.quantity
                );

            const quantity =
                stock > 0
                    ? Math.min(
                        requestedQuantity,
                        stock
                    )
                    : 0;

            if (quantity <= 0) {
                merged.splice(
                    existingIndex,
                    1
                );

                return;
            }

            merged[
                existingIndex
            ] = {
                ...existing,
                quantity,
            };
        }
    );

    return merged;
};

export function CartProvider({
    children,
}) {

    const [currentCartKey, setCurrentCartKey] =
        useState(() => {
            const user = getUser();

            return getUserCartKey(
                user
            );
        });

    const [cartItems, setCartItems] =
        useState(() => {
            const user = getUser();

            const key =
                getUserCartKey(
                    user
                );

            return loadCart(key);
        });



    // ==========================================
    // 🔐 HANDLE LOGIN / LOGOUT
    // ==========================================

    useEffect(() => {

        const handleAuthChange =
            () => {

                const user =
                    getUser();

                const newCartKey =
                    getUserCartKey(
                        user
                    );

                if (
                    newCartKey ===
                    currentCartKey
                ) {
                    return;
                }

                // ==========================================
                // 👤 USER LOGGED IN
                // ==========================================

                if (user) {

                    const guestCart =
                        loadCart(
                            GUEST_CART_KEY
                        );

                    const userCart =
                        loadCart(
                            newCartKey
                        );

                    const mergedCart =
                        mergeCarts(
                            guestCart,
                            userCart
                        );

                    saveCart(
                        newCartKey,
                        mergedCart
                    );

                    localStorage.removeItem(
                        GUEST_CART_KEY
                    );

                    setCartItems(
                        mergedCart
                    );

                }

                // ==========================================
                // 🚪 USER LOGGED OUT
                // ==========================================

                else {

                    /*
                     * The logged-in user's cart remains
                     * saved under cart_<userId>.
                     *
                     * We switch to the guest cart after
                     * logout instead of exposing one user's
                     * cart to another user on the same device.
                     */

                    const guestCart =
                        loadCart(
                            GUEST_CART_KEY
                        );

                    setCartItems(
                        guestCart
                    );
                }

                setCurrentCartKey(
                    newCartKey
                );
            };


        window.addEventListener(
            "auth-change",
            handleAuthChange
        );


        return () => {

            window.removeEventListener(
                "auth-change",
                handleAuthChange
            );

        };

    }, [
        currentCartKey,
    ]);



    // ==========================================
    // 💾 SAVE CURRENT CART
    // ==========================================

    useEffect(() => {

        saveCart(
            currentCartKey,
            cartItems
        );

    }, [
        cartItems,
        currentCartKey,
    ]);



    // ==========================================
    // 🛒 ADD TO CART
    // ==========================================

    const addToCart = (
        product,
        quantity = 1
    ) => {

        if (
            !product ||
            !product._id
        ) {
            toast.error(
                "Unable to add this product to the cart."
            );

            return;
        }

        const stock = Number(
            product.stock
        );

        if (
            !Number.isFinite(stock) ||
            stock <= 0
        ) {
            toast.warning(
                `⚠️ ${product.name} is currently out of stock.`
            );

            return;
        }


        setCartItems((prev) => {

            const existing =
                prev.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            product._id
                        )
                );


            // ==========================================
            // EXISTING PRODUCT
            // ==========================================

            if (existing) {

                const requestedQuantity =
                    Number(
                        existing.quantity
                    ) +
                    Number(
                        quantity
                    );

                const newQuantity =
                    Math.min(
                        requestedQuantity,
                        stock
                    );


                // ------------------------------------------
                // Product removed
                // ------------------------------------------

                if (
                    newQuantity <= 0
                ) {

                    return prev.filter(
                        (item) =>
                            String(
                                item._id
                            ) !==
                            String(
                                product._id
                            )
                    );

                }


                // ------------------------------------------
                // Maximum stock reached
                // ------------------------------------------

                if (
                    quantity > 0 &&
                    newQuantity === stock &&
                    Number(
                        existing.quantity
                    ) < stock
                ) {

                    toast.warning(
                        `⚠️ ${product.name}: maximum stock reached (${stock}).`
                    );

                }


                // ------------------------------------------
                // Update existing product
                // ------------------------------------------

                return prev.map(
                    (item) => {

                        if (
                            String(
                                item._id
                            ) ===
                            String(
                                product._id
                            )
                        ) {

                            return {
                                ...item,
                                quantity:
                                    newQuantity,
                                stock,
                            };

                        }

                        return item;

                    }
                );

            }


            // ==========================================
            // NEW PRODUCT
            // ==========================================

            const quantityToAdd =
                Math.min(
                    Number(
                        quantity
                    ) || 1,
                    stock
                );


            if (
                quantityToAdd <= 0
            ) {

                toast.warning(
                    `⚠️ ${product.name} is currently out of stock.`
                );

                return prev;

            }


            toast.success(
                `🛒 ${product.name} added to your cart.`
            );


            return [
                ...prev,
                {
                    ...product,
                    quantity:
                        quantityToAdd,
                },
            ];

        });

    };



    // ➕ Increase quantity

    const increaseQuantity = (
        product
    ) => {

        addToCart(
            product,
            1
        );

    };



    // ➖ Decrease quantity

    const decreaseQuantity = (
        product
    ) => {

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

            const currentItem =
                prev.find(
                    (item) =>
                        String(
                            item._id
                        ) ===
                        String(
                            product._id
                        )
                );


            if (
                !currentItem
            ) {
                return prev;
            }


            const stock =
                Number(
                    currentItem.stock
                );


            if (
                !Number.isFinite(
                    stock
                ) ||
                stock <= 0
            ) {

                return prev.filter(
                    (item) =>
                        String(
                            item._id
                        ) !==
                        String(
                            product._id
                        )
                );

            }


            const requestedQuantity =
                Number(
                    quantity
                );


            const newQuantity =
                Math.max(
                    1,
                    Math.min(
                        Number.isFinite(
                            requestedQuantity
                        )
                            ? requestedQuantity
                            : 1,
                        stock
                    )
                );


            // ------------------------------------------
            // Maximum stock
            // ------------------------------------------

            if (
                newQuantity >
                Number(
                    currentItem.quantity
                ) &&
                newQuantity === stock
            ) {

                toast.warning(
                    `⚠️ ${currentItem.name}: maximum stock reached (${stock}).`
                );

            }


            return prev.map(
                (item) => {

                    if (
                        String(
                            item._id
                        ) !==
                        String(
                            product._id
                        )
                    ) {

                        return item;

                    }


                    return {
                        ...item,
                        quantity:
                            newQuantity,
                    };

                }
            );

        });

    };



    // 🗑️ Remove product

    const removeFromCart = (
        productId
    ) => {

        const product =
            cartItems.find(
                (item) =>
                    String(
                        item._id
                    ) ===
                    String(
                        productId
                    )
            );


        if (product) {

            toast.success(
                `🗑️ ${product.name} removed from your cart.`
            );

        }


        setCartItems(
            (prev) =>
                prev.filter(
                    (item) =>
                        String(
                            item._id
                        ) !==
                        String(
                            productId
                        )
                )
        );

    };



    // 🧹 Clear entire cart

    const clearCart = (
        showToast = true
    ) => {

        setCartItems([]);

        localStorage.removeItem(
            currentCartKey
        );


        if (
            showToast
        ) {

            toast.warning(
                "🧹 Your cart has been cleared."
            );

        }

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