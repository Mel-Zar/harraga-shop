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

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    const handleIncreaseQuantity = (item) => {
        if (item.quantity >= item.stock) {
            toast.warning(
                `Only ${item.stock} unit${item.stock !== 1 ? "s" : ""} of "${item.name}" available in stock.`
            );
            return;
        }

        updateQuantity(
            item,
            item.quantity + 1
        );
    };

    const handleDecreaseQuantity = (item) => {
        if (item.quantity <= 1) {
            return;
        }

        updateQuantity(
            item,
            item.quantity - 1
        );
    };

    const handleRemove = (item) => {
        removeFromCart(item._id);
    };

    const handleClearCart = () => {
        clearCart();
    };

    const handleCheckout = () => {
        // Checkout navigation remains unchanged
    };

    if (cartItems.length === 0) {
        return (
            <div style={{ padding: "20px" }}>
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
        <div style={{ padding: "20px" }}>

            <h1>
                Your Cart 🛒
            </h1>

            <p>
                {cartItems.length} product
                {cartItems.length !== 1
                    ? "s"
                    : ""} in your cart
            </p>

            {cartItems.map((item) => {

                const subtotal =
                    item.price *
                    item.quantity;

                return (
                    <div
                        key={item._id}
                        style={{
                            display: "flex",
                            justifyContent:
                                "space-between",
                            alignItems:
                                "center",
                            border:
                                "1px solid #ddd",
                            padding: "15px",
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
                                gap: "15px",
                            }}
                        >

                            <img
                                src={`http://localhost:5050${item.images?.[0]}`}
                                alt={item.name}
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

                            <div>

                                <h3>
                                    {item.name}
                                </h3>

                                <p>
                                    Price: $
                                    {item.price.toFixed(
                                        2
                                    )}
                                </p>

                                <p>
                                    Stock:{" "}
                                    {item.stock}
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
                                gap: "10px",
                            }}
                        >

                            <button
                                onClick={() =>
                                    handleDecreaseQuantity(
                                        item
                                    )
                                }
                                disabled={
                                    item.quantity <=
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
                                    item.quantity >=
                                    item.stock
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
            })}

            <hr />

            <h2>
                Total: $
                {totalPrice.toFixed(2)}
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