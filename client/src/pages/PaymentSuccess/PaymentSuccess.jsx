import { useEffect, useContext, useRef } from "react";
import {
    Link,
    useSearchParams,
} from "react-router-dom";
import { toast } from "react-toastify";
import CartContext from "../../context/CartContext";

function PaymentSuccess() {
    const [searchParams] =
        useSearchParams();

    const {
        clearCart,
    } = useContext(CartContext);

    const hasClearedCart =
        useRef(false);

    useEffect(() => {
        const sessionId =
            searchParams.get(
                "session_id"
            );

        if (sessionId) {
            console.log(
                "STRIPE SESSION ID:",
                sessionId
            );
        }

        // ==========================================
        // 🧹 CLEAR CART ONLY ONCE
        // ==========================================

        if (!hasClearedCart.current) {
            hasClearedCart.current = true;

            clearCart(false);

            toast.success(
                "Payment successful! Thank you for your order."
            );
        }

    }, [
        searchParams,
        clearCart,
    ]);

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "80px auto",
                padding: "40px 20px",
                textAlign: "center",
            }}
        >
            <h1>
                🎉 Payment Successful!
            </h1>

            <p
                style={{
                    marginTop: "20px",
                    fontSize: "18px",
                }}
            >
                Your payment was successful!
            </p>

            <p
                style={{
                    marginTop: "10px",
                }}
            >
                Your order has been received.
            </p>

            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    gap: "15px",
                    justifyContent:
                        "center",
                    flexWrap: "wrap",
                }}
            >
                <Link
                    to="/products"
                    style={{
                        padding:
                            "12px 24px",
                        textDecoration:
                            "none",
                        borderRadius:
                            "6px",
                        background:
                            "#000",
                        color:
                            "#fff",
                    }}
                >
                    Continue Shopping
                </Link>

                <Link
                    to="/"
                    style={{
                        padding:
                            "12px 24px",
                        textDecoration:
                            "none",
                        borderRadius:
                            "6px",
                        border:
                            "1px solid #ccc",
                        color:
                            "#000",
                    }}
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}

export default PaymentSuccess;