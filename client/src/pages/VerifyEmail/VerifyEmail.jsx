import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function VerifyEmail() {
    const { userId, token } = useParams();
    const [status, setStatus] = useState("loading");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/auth/verify-email/${userId}/${token}`
                );

                const data = await res.json();

                console.log("VERIFY RESPONSE:", data);

                if (!res.ok) {
                    setStatus("error");
                    return;
                }

                if (data.message === "Email already verified") {
                    setStatus("already");
                    return;
                }

                setStatus("success");
            } catch (err) {
                console.log("NETWORK ERROR:", err);
                setStatus("error");
            }
        };

        verify();
    }, [userId, token]);

    if (status === "loading") return <h2>Verifying email...</h2>;

    if (status === "success") {
        return (
            <div>
                <h2>✅ Email verified! You can now login.</h2>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    if (status === "already") {
        return (
            <div>
                <h2>✅ Your email is already verified.</h2>
                <a href="/login">Go to Login</a>
            </div>
        );
    }

    return <h2>❌ Verification failed or expired link</h2>;
}
