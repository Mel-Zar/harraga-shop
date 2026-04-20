import { useState } from "react";
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
        country: ""
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

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

        if (!form.username.trim()) return setError("Username is required");
        if (!form.firstName.trim()) return setError("First name is required");
        if (!form.lastName.trim()) return setError("Last name is required");
        if (!form.email.trim()) return setError("Email is required");
        if (!form.password) return setError("Password is required");
        if (!form.confirmPassword) return setError("Confirm password is required");

        // =========================
        // ✅ PASSWORD VALIDATION (MATCH BACKEND)
        // =========================
        if (form.password.length < 8) {
            return setError("Password must be at least 8 characters");
        }

        const hasNumber = /\d/.test(form.password);

        // FIX: cleaner regex for frontend (no unnecessary escapes)
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
                country: ""
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                disabled={loading}
            />

            <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                disabled={loading}
            />

            <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                disabled={loading}
            />

            <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                disabled={loading}
            />

            <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                disabled={loading}
            />

            <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                disabled={loading}
            />

            <select
                name="country"
                value={form.country}
                onChange={handleChange}
                disabled={loading}
            >
                <option value="">Select country</option>
                {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            <AddressInput form={form} setForm={setForm} loading={loading} />

            <input
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                disabled={loading}
            />

            <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                disabled={loading}
            />

            <button disabled={loading}>
                {loading ? "Creating account..." : "Register"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            {success && <p style={{ color: "green" }}>{success}</p>}
        </form>
    );
}
