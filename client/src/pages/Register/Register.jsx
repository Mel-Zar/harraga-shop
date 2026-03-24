import { useState } from "react";
import { registerUser } from "../../services/authService";
import countries from "../../data/countries";

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
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await registerUser(form);
            console.log("SUCCESS:", data);

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

            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />

            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />

            <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
            <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" />

            <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Select country</option>
                {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            <button disabled={loading}>
                {loading ? "Creating..." : "Register"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}
