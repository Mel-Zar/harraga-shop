import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { toast } from "react-toastify";
import { registerUser } from "../../services/authService";
import "./RegisterCaptcha.scss";

export default function RegisterCaptcha() {
    const location = useLocation();
    const navigate = useNavigate();

    const registrationData = location.state?.registrationData;

    const [captchaToken, setCaptchaToken] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [captchaKey, setCaptchaKey] = useState(0);

    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window === "undefined") return false;
        return window.matchMedia("(max-width: 600px)").matches;
    });

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 600px)");

        const handleScreenChange = (event) => {
            setIsMobile(event.matches);
            setCaptchaToken("");
            setError("");
            setCaptchaKey((key) => key + 1);
        };

        setIsMobile(mediaQuery.matches);

        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener("change", handleScreenChange);
            return () => {
                mediaQuery.removeEventListener("change", handleScreenChange);
            };
        }

        mediaQuery.addListener(handleScreenChange);
        return () => {
            mediaQuery.removeListener(handleScreenChange);
        };
    }, []);

    const handleCaptchaVerify = useCallback((token) => {
        setCaptchaToken(token);
        setError("");
    }, []);

    const handleCaptchaExpire = useCallback(() => {
        setCaptchaToken("");
        setError("CAPTCHA har gått ut. Verifiera dig igen.");
    }, []);

    const handleCaptchaError = useCallback((err) => {
        console.error("HCAPTCHA ERROR:", err);
        setCaptchaToken("");
        setError("CAPTCHA kunde inte laddas. Försök igen.");
    }, []);

    const handleVerify = async () => {
        if (loading) return;

        if (!registrationData) {
            setError("Registreringsuppgifterna saknas. Börja om registreringen.");
            return;
        }

        if (!captchaToken) {
            setError("Slutför CAPTCHA-verifieringen först.");
            return;
        }

        const requiredFields = [
            "username",
            "firstName",
            "lastName",
            "email",
            "password",
            "confirmPassword",
            "address",
            "postalCode",
            "city",
            "country",
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = registrationData[field];
            return typeof value !== "string" || !value.trim();
        });

        if (missingFields.length > 0) {
            console.error("Missing registration fields:", missingFields);
            setError(
                "Vissa registreringsuppgifter saknas. Gå tillbaka och fyll i formuläret igen."
            );
            return;
        }

        if (registrationData.password !== registrationData.confirmPassword) {
            setError("Lösenorden matchar inte. Gå tillbaka och kontrollera dem.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await registerUser({
                ...registrationData,
                captchaToken,
            });

            toast.success("Kontot har skapats!");
            navigate("/login", { replace: true });
        } catch (err) {
            console.error("REGISTER ERROR:", err);

            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.message ||
                "Registreringen misslyckades. Försök igen.";

            setError(message);
            toast.error(message);

            setCaptchaToken("");
            setCaptchaKey((key) => key + 1);
        } finally {
            setLoading(false);
        }
    };

    if (!registrationData) {
        return (
            <main className="register-captcha">
                <section className="register-captcha__card">
                    <h2 className="register-captcha__title">
                        Registreringen saknas
                    </h2>

                    <p className="register-captcha__description">
                        Fyll i registreringsformuläret innan du fortsätter.
                    </p>

                    <button
                        className="register-captcha__button register-captcha__button--secondary"
                        type="button"
                        onClick={() => navigate("/register")}
                    >
                        Tillbaka till registrering
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="register-captcha">
            <section className="register-captcha__card">
                <h1 className="register-captcha__title">
                    Verifiera att du är människa
                </h1>

                <p className="register-captcha__description">
                    Slutför CAPTCHA-verifieringen för att fortsätta
                    och skapa ditt konto.
                </p>

                {error && (
                    <p className="register-captcha__error" role="alert">
                        {error}
                    </p>
                )}

                <div className="register-captcha__widget">
                    <HCaptcha
                        key={captchaKey}
                        sitekey={import.meta.env.VITE_HCAPTCHA_SITEKEY}
                        size={isMobile ? "compact" : "normal"}
                        onVerify={handleCaptchaVerify}
                        onExpire={handleCaptchaExpire}
                        onError={handleCaptchaError}
                    />
                </div>

                <button
                    className="register-captcha__button register-captcha__button--primary"
                    type="button"
                    onClick={handleVerify}
                    disabled={loading || !captchaToken}
                >
                    {loading ? "Skapar konto..." : "Slutför registrering"}
                </button>

                <button
                    className="register-captcha__button register-captcha__button--secondary"
                    type="button"
                    onClick={() => navigate("/register")}
                    disabled={loading}
                >
                    Tillbaka till registrering
                </button>
            </section>
        </main>
    );
}