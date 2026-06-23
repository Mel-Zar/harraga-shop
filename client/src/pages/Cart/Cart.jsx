import { useCart } from "../../context/useCart";
import { Link } from "react-router-dom";

function Cart() {
    const {
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
    } = useCart();

    const totalPrice = cartItems.reduce(
        (total, item) =>
            total + item.price * item.quantity,
        0
    );

    if (cartItems.length === 0) {
        return (
            <div style={{ padding: "20px" }}>
                <h1>Your Cart</h1>
                <p>Your cart is empty 🛒</p>

                <Link to="/products">
                    <button>
                        Go to Products
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <h1>Your Cart 🛒</h1>

            {cartItems.map((item) => (
                <div
                    key={item._id}
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems: "center",
                        border: "1px solid #ddd",
                        padding: "10px",
                        marginBottom: "10px",
                        borderRadius: "8px",
                    }}
                >
                    {/* Product info */}
                    <div>
                        <h3>{item.name}</h3>
                        <p>${item.price}</p>
                    </div>

                    {/* Quantity controls */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                        }}
                    >
                        <button
                            onClick={() =>
                                addToCart(
                                    item,
                                    -1
                                )
                            }
                            disabled={
                                item.quantity <= 1
                            }
                        >
                            -
                        </button>

                        <span>
                            {item.quantity}
                        </span>

                        <button
                            onClick={() =>
                                addToCart(
                                    item,
                                    1
                                )
                            }
                        >
                            +
                        </button>
                    </div>

                    {/* Subtotal */}
                    <div>
                        <strong>
                            $
                            {(
                                item.price *
                                item.quantity
                            ).toFixed(2)}
                        </strong>
                    </div>

                    {/* Remove */}
                    <button
                        onClick={() =>
                            removeFromCart(
                                item._id
                            )
                        }
                        style={{
                            background:
                                "red",
                            color: "white",
                        }}
                    >
                        Remove
                    </button>
                </div>
            ))}

            <hr />

            <h2>
                Total: ${totalPrice.toFixed(2)}
            </h2>

            <button
                onClick={clearCart}
                style={{
                    background: "black",
                    color: "white",
                    marginRight: "10px",
                }}
            >
                Clear Cart
            </button>

            <Link to="/checkout">
                <button
                    style={{
                        background:
                            "green",
                        color: "white",
                    }}
                >
                    Checkout
                </button>
            </Link>
        </div>
    );
}

export default Cart;