import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AddressInput from "../../components/address/AddressInput.jsx";
import "./Register.scss";

export default function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        address: "",
        postalCode: "",
        city: "",
        country: "",
        website: "",
        addressVerified: false
    });

    const [countries, setCountries] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading] = useState(false);

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
                const apiUrl = import.meta.env.VITE_API_URL;

                if (!apiUrl) {
                    throw new Error("VITE_API_URL is not configured.");
                }

                const res = await fetch(`${apiUrl}/countries`);

                if (!res.ok) {
                    throw new Error("Failed to load countries.");
                }

                const data = await res.json();

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
                toast.error("Failed to load countries.");
            }
        };

        loadCountries();
    }, []);

    const checkPasswordStrength = (password) => {
        let score = 0;

        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/\d/.test(password)) score++;

        if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password)) {
            score++;
        }

        if (/[A-Z]/.test(password)) score++;

        if (score <= 2) {
            return { score, label: "Weak", color: "red" };
        }

        if (score <= 4) {
            return { score, label: "Medium", color: "orange" };
        }

        return { score, label: "Strong", color: "green" };
    };

    const showValidationError = (message) => {
        setError(message);
        setSuccess("");
        toast.error(message);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,

            ...(name === "address" && {
                city: "",
                postalCode: "",
                addressVerified: false
            })
        }));

        if (name === "password") {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");

        // Bot protection: honeypot
        if (form.website.trim()) {
            showValidationError("Bot detected.");
            return;
        }

        // Submit cooldown
        const now = Date.now();

        if (now - lastSubmitRef.current < cooldownMs) {
            const message = "Please wait before trying again.";
            setError(message);
            toast.warning(message);
            return;
        }

        // Rate-limit retry time, if supplied by the API
        if (retryAfterRef.current > now) {
            const message = "Too many attempts. Try again soon.";
            setError(message);
            toast.warning(message);
            return;
        }

        // Username: email addresses are not allowed.
        const username = form.username.trim().toLowerCase();
        const usernamePattern = /^[a-z0-9_]{3,20}$/;

        if (!username) {
            showValidationError("Username is required.");
            return;
        }

        if (username.length < 3 || username.length > 20) {
            showValidationError(
                "Username must be between 3 and 20 characters."
            );
            return;
        }

        if (!usernamePattern.test(username)) {
            showValidationError(
                "Username can only contain letters, numbers, and underscores. Email addresses are not allowed."
            );
            return;
        }

        // Names
        if (!form.firstName.trim()) {
            showValidationError("First name is required.");
            return;
        }

        if (!form.lastName.trim()) {
            showValidationError("Last name is required.");
            return;
        }

        // Email
        const email = form.email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            showValidationError("Email is required.");
            return;
        }

        if (email.length > 320 || !emailPattern.test(email)) {
            showValidationError("Please enter a valid email address.");
            return;
        }

        // Phone
        const phone = form.phone.trim();
        const phoneDigits = phone.replace(/\D/g, "");

        if (!phone) {
            showValidationError("Phone number is required.");
            return;
        }

        if (phoneDigits.length < 7 || phoneDigits.length > 15) {
            showValidationError("Please enter a valid phone number.");
            return;
        }

        // Password
        if (!form.password) {
            showValidationError("Password is required.");
            return;
        }

        if (form.password.length < 8) {
            showValidationError("Password must be at least 8 characters.");
            return;
        }

        if (form.password.length > 128) {
            showValidationError("Password must not exceed 128 characters.");
            return;
        }

        const hasNumber = /\d/.test(form.password);
        const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(
            form.password
        );

        if (!hasNumber || !hasSpecial) {
            showValidationError(
                "Password must contain at least 1 number and 1 special character."
            );
            return;
        }

        if (form.password !== form.confirmPassword) {
            showValidationError("Passwords do not match.");
            return;
        }

        // Country
        if (!form.country) {
            showValidationError("Please select a country.");
            return;
        }

        // Address
        if (!form.address.trim()) {
            showValidationError("Please enter your street address.");
            return;
        }

        console.log("REGISTER ADDRESS CHECK:", {
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
            country: form.country,
            addressVerified: form.addressVerified
        });

        if (!form.addressVerified) {
            const message =
                "Please select a valid address from the address suggestions.";

            setError(message);
            toast.warning(message);
            return;
        }

        if (!form.city.trim()) {
            showValidationError("Please enter/select a city.");
            return;
        }

        if (!form.postalCode.trim()) {
            showValidationError("Please enter/select a postal code.");
            return;
        }

        // Prepare validated registration data for the separate CAPTCHA page.
        const registrationData = {
            username: username.toLowerCase(),
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email,
            phone: form.phone.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
            address: form.address.trim(),
            postalCode: form.postalCode.trim(),
            city: form.city.trim(),
            country: form.country,
        };

        // Prevent rapid repeated submissions.
        lastSubmitRef.current = now;

        navigate("/register/captcha", {
            state: { registrationData }
        });
    };

    return (
        <form className="register-form" onSubmit={handleSubmit} noValidate>
            <h2>Register</h2>

            {/* Honeypot field for basic bot detection */}
            <input
                name="website"
                value={form.website}
                onChange={handleChange}
                style={{ display: "none" }}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
            />

            <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                autoComplete="username"
                minLength={3}
                maxLength={20}
                pattern="[a-zA-Z0-9_]{3,20}"
                title="Use 3–20 letters, numbers, or underscores. Email addresses are not allowed."
                required
            />

            <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                autoComplete="given-name"
                maxLength={100}
                required
            />

            <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                autoComplete="family-name"
                maxLength={100}
                required
            />

            <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                autoComplete="email"
                maxLength={320}
                required
            />

            <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                autoComplete="tel"
                maxLength={30}
                required
            />

            <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                maxLength={128}
                required
            />

            {/* PASSWORD STRENGTH (SASS HANDLES STYLE) */}
            {form.password && (
                <div className="password-strength">
                    <div
                        className="password-strength__bar"
                        data-strength={passwordStrength.label}
                        style={{
                            width: `${passwordStrength.score * 20}%`
                        }}
                    />

                    <small className="password-strength__label">
                        {passwordStrength.label}
                    </small>
                </div>
            )}

            <input
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                maxLength={128}
                required
            />

            <select
                name="country"
                value={form.country}
                onChange={handleChange}
                required
            >
                <option value="">Select country</option>

                {countries.map((country, index) => (
                    <option key={`${country}-${index}`} value={country}>
                        {country}
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
                autoComplete="postal-code"
                maxLength={20}
                required
            />

            <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                autoComplete="address-level2"
                maxLength={100}
                required
            />

            <button type="submit" disabled={loading}>
                Register
            </button>

            {error && (
                <p role="alert" style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {success && (
                <p role="status" style={{ color: "green" }}>
                    {success}
                </p>
            )}
        </form>
    );
}
