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
                        Continue Shopping
                    </button>
                </Link>
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>

            <h1>Your Cart 🛒</h1>

            <p>
                {cartItems.length} product
                {cartItems.length !== 1 ? "s" : ""} in your cart
            </p>

            {cartItems.map((item) => {

                const subtotal =
                    item.price * item.quantity;

                return (

                    <div
                        key={item._id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            border: "1px solid #ddd",
                            padding: "15px",
                            marginBottom: "15px",
                            borderRadius: "8px",
                        }}
                    >

                        {/* Product */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                            }}
                        >

                            <img
                                src={`http://localhost:5050${item.images?.[0]}`}
                                alt={item.name}
                                style={{
                                    width: "90px",
                                    height: "90px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                }}
                            />

                            <div>

                                <h3>{item.name}</h3>

                                <p>
                                    Price: ${item.price.toFixed(2)}
                                </p>

                                <p>
                                    Stock: {item.stock}
                                </p>

                            </div>

                        </div>


                        {/* Quantity */}

                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}
                        >

                            <button
                                onClick={() =>
                                    addToCart(item, -1)
                                }
                                disabled={item.quantity <= 1}
                            >
                                -
                            </button>

                            <span
                                style={{
                                    minWidth: "30px",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                }}
                            >
                                {item.quantity}
                            </span>

                            <button
                                onClick={() =>
                                    addToCart(item, 1)
                                }
                                disabled={
                                    item.quantity >= item.stock
                                }
                            >
                                +
                            </button>

                        </div>


                        {/* Subtotal */}

                        <div
                            style={{
                                minWidth: "120px",
                                textAlign: "right",
                            }}
                        >

                            <strong>
                                ${subtotal.toFixed(2)}
                            </strong>

                        </div>


                        {/* Remove */}

                        <button
                            onClick={() =>
                                removeFromCart(item._id)
                            }
                            style={{
                                background: "red",
                                color: "white",
                            }}
                        >
                            Remove
                        </button>

                    </div>

                );
            })}

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
                        background: "green",
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