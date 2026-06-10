import { useState, useEffect, useRef } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
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
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/countries`);
                const data = await res.json();

                console.log("📦 COUNTRIES API RESPONSE:", data);

                if (Array.isArray(data)) {
                    setCountries(data);
                } else if (data && typeof data === "object") {
                    setCountries(Object.values(data));
                } else {
                    setCountries([]);
                }

            } catch (err) {
                console.error("Failed to load countries:", err);
                setCountries([]);
            }
        };

        loadCountries();
    }, []);

    const checkPasswordStrength = (password) => {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/\d/.test(password)) score++;
        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;

        if (score <= 2) return { score, label: "Weak", color: "red" };
        if (score === 3 || score === 4) return { score, label: "Medium", color: "orange" };
        return { score, label: "Strong", color: "green" };
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
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("🚀 FORM SUBMIT START");
        console.log("🔐 CAPTCHA TOKEN:", captchaToken);
        console.log("📄 FORM DATA:", form);

        if (loading) return;

        setError("");
        setSuccess("");

        if (form.website) {
            setError("Bot detected");
            return;
        }

        const now = Date.now();

        if (now - lastSubmitRef.current < cooldownMs) {
            setError("⏳ Please wait before trying again");
            return;
        }

        if (retryAfterRef.current > now) {
            setError("⏳ Too many attempts. Try again soon.");
            return;
        }

        lastSubmitRef.current = now;

        if (!captchaToken) {
            setShowCaptcha(true);
            setError("Please complete captcha");
            return;
        }

        if (!form.username.trim()) return setError("Username is required");
        if (!form.firstName.trim()) return setError("First name is required");
        if (!form.lastName.trim()) return setError("Last name is required");
        if (!form.email.trim()) return setError("Email is required");
        if (!form.password) return setError("Password is required");
        if (!form.confirmPassword) return setError("Confirm password is required");

        if (form.password.length < 8) return setError("Password must be at least 8 characters");

        const hasNumber = /\d/.test(form.password);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(form.password);

        if (!hasNumber || !hasSpecial) {
            return setError("Password must contain at least 1 number and 1 special character");
        }

        if (form.password !== form.confirmPassword) {
            return setError("Passwords do not match");
        }

        if (!form.country) return setError("Please select a country");
        if (!form.address.trim()) return setError("Please enter your street address");
        if (!form.city.trim()) return setError("Please enter/select a city");
        if (!form.postalCode.trim()) return setError("Please enter/select a postal code");

        setLoading(true);

        try {
            const res = await registerUser({
                ...form,
                captchaToken
            });

            console.log("✅ REGISTER SUCCESS:", res);

            setSuccess("Account created!");

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
            setPasswordStrength({ score: 0, label: "", color: "" });

        } catch (err) {
            console.log("❌ REGISTER ERROR:", err);
            setError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            <input
                name="website"
                value={form.website}
                onChange={handleChange}
                style={{ display: "none" }}
            />

            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />

            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />

            {/* PASSWORD STRENGTH (SASS HANDLES STYLE) */}
            {form.password && (
                <div className="password-strength">
                    <div
                        className="password-strength__bar"
                        data-strength={passwordStrength.label}
                        style={{ width: `${passwordStrength.score * 20}%` }}
                    />
                    <small className="password-strength__label">
                        {passwordStrength.label}
                    </small>
                </div>
            )}

            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />

            <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Select country</option>
                {countries.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                ))}
            </select>

            <AddressInput form={form} setForm={setForm} loading={loading} />

            <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" />

            {showCaptcha && (
                <div style={{ marginTop: "20px" }}>
                    <HCaptcha
                        sitekey="fc8ee466-865a-456e-87ae-edc4e3983756"
                        onVerify={(token) => {
                            setCaptchaToken(token);
                            setError("");
                        }}
                        onExpire={() => setCaptchaToken("")}
                    />
                </div>
            )}

            <button disabled={loading}>
                {loading ? "Creating account..." : "Register"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </form>
    );
}