import { useState } from "react";
import { registerUser } from "../../services/authService";
import countries from "../../../../shared/countries.json";

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
    const [loading, setLoading] = useState(false);

    // =========================
    // 🔄 HANDLE INPUT CHANGE
    // =========================
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,

            // 🚨 Reset dependent fields when user edits address manually
            ...(name === "address" && {
                city: "",
                postalCode: "",
            })
        }));
    };

    // =========================
    // 🚀 SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // ✅ PRO VALIDATION (IMPORTANT)
        if (!form.country) {
            setError("Please select a country");
            return;
        }

        if (!form.address) {
            setError("Please enter your street address");
            return;
        }

        if (!form.city) {
            setError("Please enter/select a city");
            return;
        }

        if (!form.postalCode) {
            setError("Please enter/select a postal code");
            return;
        }

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
            console.log("❌ REGISTER ERROR:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            {/* USER INFO */}
            <input name="username" value={form.username} onChange={handleChange} placeholder="Username" />
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" />
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" />
            <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />

            {/* PASSWORD */}
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />

            {/* COUNTRY */}
            <select name="country" value={form.country} onChange={handleChange}>
                <option value="">Select country</option>
                {countries.map((c) => (
                    <option key={c} value={c}>{c}</option>
                ))}
            </select>

            {/* ADDRESS COMPONENT */}
            <AddressInput form={form} setForm={setForm} />

            {/* CITY + POSTAL */}
            <input name="postalCode" value={form.postalCode} onChange={handleChange} placeholder="Postal Code" />
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" />

            <button disabled={loading}>
                {loading ? "Creating..." : "Register"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
    );
}
