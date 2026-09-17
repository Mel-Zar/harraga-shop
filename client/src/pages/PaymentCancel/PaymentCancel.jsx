import { useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function PaymentCancel() {
    useEffect(() => {
        toast.info(
            "Payment was cancelled. Your order was not completed."
        );
    }, []);

    return (
        <div
            style={{
                maxWidth: "700px",
                margin: "80px auto",
                padding: "40px 20px",
                textAlign: "center",
            }}
        >
            <h1>Payment Cancelled</h1>

            <p
                style={{
                    marginTop: "20px",
                    fontSize: "18px",
                }}
            >
                Your payment was cancelled.
            </p>

            <p
                style={{
                    marginTop: "10px",
                }}
            >
                You can return to your cart and try again.
            </p>

            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    gap: "15px",
                    justifyContent: "center",
                    flexWrap: "wrap",
                }}
            >
                <Link
                    to="/cart"
                    style={{
                        padding: "12px 24px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        background: "#000",
                        color: "#fff",
                    }}
                >
                    Back to Cart
                </Link>

                <Link
                    to="/products"
                    style={{
                        padding: "12px 24px",
                        textDecoration: "none",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        color: "#000",
                    }}
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default PaymentCancel;