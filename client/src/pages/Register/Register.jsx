import { useState, useEffect, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { toast } from "react-toastify";

import { registerUser } from "../../services/authService";
import AddressInput from "../../components/address/AddressInput.jsx";

export default function Register() {
    const [form, setForm] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        address: "",
        postalCode: "",
        city: "",
        country: "",
        website: ""
    });

    const [countries, setCountries] = useState([]);

    const [captchaToken, setCaptchaToken] = useState("");
    const [showCaptcha, setShowCaptcha] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: "",
        color: ""
    });

    const lastSubmitRef = useRef(0);
    const cooldownMs = 5000;
    const retryAfterRef = useRef(0);

    useEffect(() => {
        const loadCountries = async () => {
            try {
                const res = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/countries`
                );

                const data = await res.json();

                console.log(
                    "📦 COUNTRIES API RESPONSE:",
                    data
                );

                if (Array.isArray(data)) {
                    setCountries(data);
                } else if (
                    data &&
                    typeof data === "object"
                ) {
                    setCountries(
                        Object.values(data)
                    );
                } else {
                    setCountries([]);
                }

            } catch (err) {
                console.error(
                    "Failed to load countries:",
                    err
                );

                setCountries([]);

                toast.error(
                    "Failed to load countries."
                );
            }
        };

        loadCountries();
    }, []);

    const checkPasswordStrength = (password) => {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/\d/.test(password)) score++;
        if (
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
                password
            )
        ) {
            score++;
        }

        if (/[A-Z]/.test(password)) score++;

        if (score <= 2) {
            return {
                score,
                label: "Weak",
                color: "red"
            };
        }

        if (score === 3 || score === 4) {
            return {
                score,
                label: "Medium",
                color: "orange"
            };
        }

        return {
            score,
            label: "Strong",
            color: "green"
        };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "address" && {
                city: "",
                postalCode: "",
            })
        }));

        if (name === "password") {
            setPasswordStrength(
                checkPasswordStrength(value)
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log(
            "🚀 FORM SUBMIT START"
        );

        console.log(
            "🔐 CAPTCHA TOKEN:",
            captchaToken
        );

        console.log(
            "📄 FORM DATA:",
            form
        );

        if (loading) return;

        setError("");
        setSuccess("");

        // =================================================
        // 🤖 BOT PROTECTION
        // =================================================

        if (form.website) {
            const message =
                "Bot detected";

            setError(message);
            toast.error(message);

            return;
        }

        // =================================================
        // ⏳ SUBMIT COOLDOWN
        // =================================================

        const now = Date.now();

        if (
            now - lastSubmitRef.current <
            cooldownMs
        ) {
            const message =
                "Please wait before trying again.";

            setError(message);
            toast.warning(message);

            return;
        }

        // =================================================
        // 🚫 RATE LIMIT
        // =================================================

        if (
            retryAfterRef.current >
            now
        ) {
            const message =
                "Too many attempts. Try again soon.";

            setError(message);
            toast.warning(message);

            return;
        }

        lastSubmitRef.current = now;

        // =================================================
        // 🛡️ CAPTCHA
        // =================================================

        if (!captchaToken) {
            setShowCaptcha(true);

            const message =
                "Please complete the captcha.";

            setError(message);
            toast.warning(message);

            return;
        }

        // =================================================
        // 📝 FORM VALIDATION
        // =================================================

        if (!form.username.trim()) {
            const message =
                "Username is required";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.firstName.trim()) {
            const message =
                "First name is required";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.lastName.trim()) {
            const message =
                "Last name is required";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.email.trim()) {
            const message =
                "Email is required";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.password) {
            const message =
                "Password is required";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.confirmPassword) {
            const message =
                "Confirm password is required";

            setError(message);
            toast.error(message);

            return;
        }

        if (form.password.length < 8) {
            const message =
                "Password must be at least 8 characters";

            setError(message);
            toast.error(message);

            return;
        }

        const hasNumber =
            /\d/.test(form.password);

        const hasSpecial =
            /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
                form.password
            );

        if (
            !hasNumber ||
            !hasSpecial
        ) {
            const message =
                "Password must contain at least 1 number and 1 special character";

            setError(message);
            toast.error(message);

            return;
        }

        if (
            form.password !==
            form.confirmPassword
        ) {
            const message =
                "Passwords do not match";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.country) {
            const message =
                "Please select a country";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.address.trim()) {
            const message =
                "Please enter your street address";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.city.trim()) {
            const message =
                "Please enter/select a city";

            setError(message);
            toast.error(message);

            return;
        }

        if (!form.postalCode.trim()) {
            const message =
                "Please enter/select a postal code";

            setError(message);
            toast.error(message);

            return;
        }

        // =================================================
        // 🚀 REGISTER
        // =================================================

        setLoading(true);

        try {
            const res =
                await registerUser({
                    ...form,
                    captchaToken
                });

            console.log(
                "✅ REGISTER SUCCESS:",
                res
            );

            const message =
                "Account created successfully!";

            setSuccess(message);
            toast.success(message);

            // =================================================
            // 🧹 RESET FORM
            // =================================================

            setForm({
                username: "",
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
                address: "",
                postalCode: "",
                city: "",
                country: "",
                website: ""
            });

            setCaptchaToken("");
            setShowCaptcha(false);

            setPasswordStrength({
                score: 0,
                label: "",
                color: ""
            });

        } catch (err) {

            console.log(
                "❌ REGISTER ERROR:",
                err
            );

            const message =
                err?.message ||
                "Something went wrong";

            setError(message);
            toast.error(message);

        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
        >
            <h2>
                Register
            </h2>

            <input
                name="website"
                value={form.website}
                onChange={handleChange}
                style={{
                    display: "none"
                }}
            />

            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
            />

            <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
            />

            <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
            />

            <input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
            />

            <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
            />

            {/* PASSWORD STRENGTH (SASS HANDLES STYLE) */}

            {form.password && (
                <div className="password-strength">

                    <div
                        className="password-strength__bar"
                        data-strength={
                            passwordStrength.label
                        }
                        style={{
                            width: `${passwordStrength.score * 20}%`
                        }}
                    />

                    <small className="password-strength__label">
                        {
                            passwordStrength.label
                        }
                    </small>

                </div>
            )}

            <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
            />

            <select
                name="country"
                value={form.country}
                onChange={handleChange}
            >
                <option value="">
                    Select country
                </option>

                {countries.map((c, i) => (
                    <option
                        key={i}
                        value={c}
                    >
                        {c}
                    </option>
                ))}
            </select>

            <AddressInput
                form={form}
                setForm={setForm}
                loading={loading}
            />

            <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
            />

            <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
            />

            {showCaptcha && (
                <div
                    style={{
                        marginTop: "20px"
                    }}
                >
                    <HCaptcha
                        sitekey="fc8ee466-865a-456e-87ae-edc4e3983756"
                        onVerify={(token) => {
                            setCaptchaToken(
                                token
                            );

                            setError("");
                        }}
                        onExpire={() => {
                            setCaptchaToken("");
                        }}
                    />
                </div>
            )}

            <button
                disabled={loading}
            >
                {
                    loading
                        ? "Creating account..."
                        : "Register"
                }
            </button>

            {error && (
                <p
                    style={{
                        color: "red"
                    }}
                >
                    {error}
                </p>
            )}

            {success && (
                <p
                    style={{
                        color: "green"
                    }}
                >
                    {success}
                </p>
            )}

        </form>
    );
}
