import { useState, useRef } from "react";
import { registerUser } from "../../services/authService";
import countryMap from "../../../../shared/countries.json";
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

        // 🧠 HONEYPOT FIELD (MÅSTE VARA TOM)
        website: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const lastSubmitRef = useRef(0);
    const cooldownMs = 5000;
    const retryAfterRef = useRef(0);

    const countries = Object.keys(countryMap);

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
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        // 🧠 HONEYPOT CHECK (bots fyller detta)
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

        if (!form.username.trim()) return setError("Username is required");
        if (!form.firstName.trim()) return setError("First name is required");
        if (!form.lastName.trim()) return setError("Last name is required");
        if (!form.email.trim()) return setError("Email is required");
        if (!form.password) return setError("Password is required");
        if (!form.confirmPassword) return setError("Confirm password is required");

        if (form.password.length < 8) {
            return setError("Password must be at least 8 characters");
        }

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
            await registerUser(form);

            setSuccess("✅ Account created! Please check your email and verify before logging in.");

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

        } catch (err) {
            if (err?.response?.status === 429) {
                const retryAfter = Date.now() + 10000;
                retryAfterRef.current = retryAfter;
                setError("⛔ Too many requests. Slow down.");
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            {/* 🧠 HONEYPOT (OSYNLIGT FÖR MÄNNISKOR) */}
            <input
                name="website"
                value={form.website}
                onChange={handleChange}
                style={{ display: "none" }}
                tabIndex="-1"
                autoComplete="off"
            />

            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />

            <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Select country</option>
                {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            <AddressInput form={form} setForm={setForm} loading={loading} />

            <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" />

            <button disabled={loading}>
                {loading ? "Creating account..." : "Register"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </form>
    );
}