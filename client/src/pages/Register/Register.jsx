import { useState } from "react";
import { registerUser } from "../../services/authService";

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
    // 📝 HANDLE INPUT CHANGE
    // =========================
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    // =========================
    // 🚀 HANDLE REGISTER
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        // =========================
        // ⚠️ FRONTEND VALIDATION (PRO)
        // =========================
        if (
            !form.username ||
            !form.firstName ||
            !form.lastName ||
            !form.email ||
            !form.password ||
            !form.confirmPassword ||
            !form.address ||
            !form.postalCode ||
            !form.city
        ) {
            setError("All fields are required");
            setLoading(false);
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // =========================
            // 🔥 REMOVE confirmPassword (NOT IN DB)
            // =========================
            const { confirmPassword: _, ...sendData } = form;

            const data = await registerUser(sendData);

            console.log("REGISTER SUCCESS:", data);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register">
            <form onSubmit={handleSubmit}>
                <h2>Register</h2>

                <input name="username" placeholder="Username" onChange={handleChange} />
                <input name="firstName" placeholder="First Name" onChange={handleChange} />
                <input name="lastName" placeholder="Last Name" onChange={handleChange} />
                <input name="email" placeholder="Email" onChange={handleChange} />

                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    onChange={handleChange}
                />

                <input
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm Password"
                    onChange={handleChange}
                />

                <input name="address" placeholder="Address" onChange={handleChange} />
                <input name="postalCode" placeholder="Postal Code" onChange={handleChange} />
                <input name="city" placeholder="City" onChange={handleChange} />

                <input
                    name="country"
                    placeholder="Country"
                    onChange={handleChange}
                    defaultValue=""
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
                </button>

                {/* =========================
                   ❌ ERROR UI (PRO)
                ========================= */}
                {error && <p className="error">{error}</p>}
            </form>
        </div>
    );
}
