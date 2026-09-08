import { useCart } from "../../context/useCart";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function Cart() {

    const {
        cartItems,
        updateQuantity,
        removeFromCart,
        clearCart,
    } = useCart();


    const totalPrice =
        cartItems.reduce(
            (total, item) =>
                total +
                Number(
                    item.price || 0
                ) *
                Number(
                    item.quantity || 0
                ),
            0
        );


    const handleIncreaseQuantity =
        (item) => {

            if (
                Number(
                    item.quantity
                ) >=
                Number(
                    item.stock
                )
            ) {

                toast.warning(
                    `Only ${item.stock} unit${item.stock !== 1 ? "s" : ""} of "${item.name}" available in stock.`
                );

                return;
            }


            updateQuantity(
                item,
                Number(
                    item.quantity
                ) + 1
            );

        };


    const handleDecreaseQuantity =
        (item) => {

            if (
                Number(
                    item.quantity
                ) <= 1
            ) {

                return;
            }


            updateQuantity(
                item,
                Number(
                    item.quantity
                ) - 1
            );

        };


    const handleRemove =
        (item) => {

            removeFromCart(
                item._id
            );

        };


    const handleClearCart =
        () => {

            clearCart();

        };


    const handleCheckout =
        () => {

            // Checkout navigation remains unchanged

        };


    if (
        cartItems.length === 0
    ) {

        return (
            <div
                style={{
                    padding: "20px",
                }}
            >

                <h1>
                    Your Cart
                </h1>

                <p>
                    Your cart is empty 🛒
                </p>

                <Link to="/products">
                    <button>
                        Continue Shopping
                    </button>
                </Link>

            </div>
        );

    }


    return (
        <div
            style={{
                padding: "20px",
            }}
        >

            <h1>
                Your Cart 🛒
            </h1>


            <p>
                {cartItems.length} product
                {cartItems.length !== 1
                    ? "s"
                    : ""} in your cart
            </p>


            {cartItems.map(
                (item) => {

                    const subtotal =
                        Number(
                            item.price || 0
                        ) *
                        Number(
                            item.quantity || 0
                        );


                    const image =
                        item.images?.[0] ||
                        item.image ||
                        "";


                    const imageUrl =
                        image.startsWith(
                            "http"
                        )
                            ? image
                            : `${import.meta.env.VITE_API_URL}${image}`;


                    return (
                        <div
                            key={
                                item._id
                            }
                            style={{
                                display:
                                    "flex",
                                justifyContent:
                                    "space-between",
                                alignItems:
                                    "center",
                                border:
                                    "1px solid #ddd",
                                padding:
                                    "15px",
                                marginBottom:
                                    "15px",
                                borderRadius:
                                    "8px",
                            }}
                        >

                            {/* Product */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap:
                                        "15px",
                                }}
                            >

                                {image ? (
                                    <img
                                        src={
                                            imageUrl
                                        }
                                        alt={
                                            item.name
                                        }
                                        style={{
                                            width:
                                                "90px",
                                            height:
                                                "90px",
                                            objectFit:
                                                "cover",
                                            borderRadius:
                                                "8px",
                                        }}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width:
                                                "90px",
                                            height:
                                                "90px",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                            border:
                                                "1px solid #ddd",
                                            borderRadius:
                                                "8px",
                                        }}
                                    >
                                        No image
                                    </div>
                                )}


                                <div>

                                    <h3>
                                        {
                                            item.name
                                        }
                                    </h3>

                                    <p>
                                        Price: $
                                        {Number(
                                            item.price ||
                                            0
                                        ).toFixed(
                                            2
                                        )}
                                    </p>

                                    <p>
                                        Stock:{" "}
                                        {
                                            item.stock
                                        }
                                    </p>

                                </div>

                            </div>


                            {/* Quantity */}

                            <div
                                style={{
                                    display:
                                        "flex",
                                    alignItems:
                                        "center",
                                    gap:
                                        "10px",
                                }}
                            >

                                <button
                                    onClick={() =>
                                        handleDecreaseQuantity(
                                            item
                                        )
                                    }
                                    disabled={
                                        Number(
                                            item.quantity
                                        ) <=
                                        1
                                    }
                                >
                                    -
                                </button>


                                <span
                                    style={{
                                        minWidth:
                                            "30px",
                                        textAlign:
                                            "center",
                                        fontWeight:
                                            "bold",
                                    }}
                                >
                                    {
                                        item.quantity
                                    }
                                </span>


                                <button
                                    onClick={() =>
                                        handleIncreaseQuantity(
                                            item
                                        )
                                    }
                                    disabled={
                                        Number(
                                            item.quantity
                                        ) >=
                                        Number(
                                            item.stock
                                        )
                                    }
                                >
                                    +
                                </button>

                            </div>


                            {/* Subtotal */}

                            <div
                                style={{
                                    minWidth:
                                        "120px",
                                    textAlign:
                                        "right",
                                }}
                            >

                                <strong>
                                    $
                                    {subtotal.toFixed(
                                        2
                                    )}
                                </strong>

                            </div>


                            {/* Remove */}

                            <button
                                onClick={() =>
                                    handleRemove(
                                        item
                                    )
                                }
                                style={{
                                    background:
                                        "red",
                                    color:
                                        "white",
                                }}
                            >
                                Remove
                            </button>

                        </div>
                    );

                }
            )}


            <hr />


            <h2>
                Total: $
                {totalPrice.toFixed(
                    2
                )}
            </h2>


            <button
                onClick={
                    handleClearCart
                }
                style={{
                    background:
                        "black",
                    color:
                        "white",
                    marginRight:
                        "10px",
                }}
            >
                Clear Cart
            </button>


            <Link to="/checkout">
                <button
                    onClick={
                        handleCheckout
                    }
                    style={{
                        background:
                            "green",
                        color:
                            "white",
                    }}
                >
                    Checkout
                </button>
            </Link>

        </div>
    );
}

export default Cart;