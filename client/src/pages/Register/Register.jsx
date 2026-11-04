
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AddressInput from "../../components/address/AddressInput.jsx";
import CountrySelect from "../../components/CountrySelect/CountrySelect.jsx";
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
    const [fieldErrors, setFieldErrors] = useState({});
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        label: "",
        color: ""
    });

    const addressValuesRef = useRef({ address: form.address, city: form.city, postalCode: form.postalCode });

    useEffect(() => {
        const previous = addressValuesRef.current;
        if (previous.address !== form.address) clearFieldError("address");
        if (previous.city !== form.city) clearFieldError("city");
        if (previous.postalCode !== form.postalCode) clearFieldError("postalCode");
        addressValuesRef.current = {
            address: form.address,
            city: form.city,
            postalCode: form.postalCode
        };
    }, [form.address, form.city, form.postalCode]);

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
        const length = password.length;

        if (length === 0) {
            return { score: 0, label: "", color: "" };
        }

        if (length < 8) {
            return { score: 1, label: "Weak", color: "red" };
        }

        if (length < 20) {
            return { score: 3, label: "Medium", color: "orange" };
        }

        if (length < 25) {
            return { score: 4, label: "Strong", color: "green" };
        }

        return { score: 5, label: "Strong", color: "green" };
    };

    // Field validation stays beside its input. Only general errors use the
    // form-level message at the bottom; validation does not trigger a toast.
    const showValidationError = (message, field = null) => {
        setSuccess("");

        if (field) {
            setError("");
            setFieldErrors((prev) => ({ ...prev, [field]: message }));
            return;
        }

        setError(message);
    };

    const clearFieldError = (field) => {
        setFieldErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
        setError("");
    };

    const renderFieldError = (field) =>
        fieldErrors[field] ? (
            <small className="register-field-error" id={`${field}-error`} role="alert">
                {fieldErrors[field]}
            </small>
        ) : null;

    const capitalizeFirstLetter = (value) => {
        const text = String(value || "").trim();

        if (!text) return "";

        return text.charAt(0).toLocaleUpperCase() + text.slice(1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        clearFieldError(name);

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

    const handleBlur = (e) => {
        const { name, value } = e.target;

        if (name === "firstName" || name === "lastName" || name === "city") {
            setForm((prev) => ({
                ...prev,
                [name]: capitalizeFirstLetter(value)
            }));
        }

        if (name === "email") {
            setForm((prev) => ({
                ...prev,
                email: value.trim().toLowerCase()
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        setError("");
        setSuccess("");
        setFieldErrors({});

        if (form.website.trim()) {
            showValidationError("Bot detected.");
            return;
        }

        const now = Date.now();

        if (now - lastSubmitRef.current < cooldownMs) {
            const message = "Please wait before trying again.";
            setError(message);
            return;
        }

        if (retryAfterRef.current > now) {
            const message = "Too many attempts. Try again soon.";
            setError(message);
            return;
        }

        const username = form.username.trim().toLowerCase();
        const usernamePattern = /^[a-z0-9_]{3,20}$/;

        if (!username) {
            showValidationError("Username is required.", "username");
            return;
        }

        if (username.length < 3 || username.length > 20) {
            showValidationError(
                "Username must be between 3 and 20 characters.",
                "username"
            );
            return;
        }

        if (!usernamePattern.test(username)) {
            showValidationError(
                "Username can only contain letters, numbers, and underscores. Email addresses are not allowed.",
                "username"
            );
            return;
        }

        if (!form.firstName.trim()) {
            showValidationError("First name is required.", "firstName");
            return;
        }

        if (!form.lastName.trim()) {
            showValidationError("Last name is required.", "lastName");
            return;
        }

        const email = form.email.trim().toLowerCase();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) {
            showValidationError("Email is required.", "email");
            return;
        }

        if (email.length > 320 || !emailPattern.test(email)) {
            showValidationError("Please enter a valid email address.", "email");
            return;
        }

        const phone = form.phone.trim();
        const phoneDigits = phone.replace(/\D/g, "");

        if (!phone) {
            showValidationError("Phone number is required.", "phone");
            return;
        }

        if (phoneDigits.length < 7 || phoneDigits.length > 15) {
            showValidationError("Please enter a valid phone number.", "phone");
            return;
        }

        if (!form.password) {
            showValidationError("Password is required.", "password");
            return;
        }

        if (form.password.length < 8) {
            showValidationError("Password must be at least 8 characters.", "password");
            return;
        }

        if (form.password.length > 128) {
            showValidationError("Password must not exceed 128 characters.", "password");
            return;
        }

        if (form.password !== form.confirmPassword) {
            showValidationError("Passwords do not match.", "confirmPassword");
            return;
        }

        if (!form.country) {
            showValidationError("Please select a country.", "country");
            return;
        }

        if (!form.address.trim()) {
            showValidationError("Please enter your street address.", "address");
            return;
        }

        if (!form.addressVerified) {
            const message =
                "Please select a valid address from the address suggestions.";

            setError("");
            setFieldErrors((prev) => ({ ...prev, address: message }));
            return;
        }

        if (!form.city.trim()) {
            showValidationError("Please enter/select a city.", "city");
            return;
        }

        if (!form.postalCode.trim()) {
            showValidationError("Please enter/select a postal code.", "postalCode");
            return;
        }

        const registrationData = {
            username,
            firstName: capitalizeFirstLetter(form.firstName),
            lastName: capitalizeFirstLetter(form.lastName),
            email,
            phone,
            password: form.password,
            confirmPassword: form.confirmPassword,
            address: form.address.trim(),
            postalCode: form.postalCode.trim(),
            city: capitalizeFirstLetter(form.city),
            country: form.country
        };

        // Check username and email BEFORE navigating to CAPTCHA.
        setLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL;

            if (!apiUrl) {
                throw new Error("VITE_API_URL is not configured.");
            }

            const response = await fetch(
                `${apiUrl}/auth/check-availability`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        username: registrationData.username,
                        email: registrationData.email
                    })
                }
            );

            const result = await response.json().catch(() => ({}));

            if (!response.ok || result.available !== true) {
                const message =
                    result.message ||
                    "Username or email is already in use.";

                if (response.status === 429) {
                    const retryAfterHeader = Number(response.headers.get("Retry-After"));
                    const retrySeconds = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
                        ? retryAfterHeader
                        : 30;
                    retryAfterRef.current = Date.now() + retrySeconds * 1000;
                }

                const field = ["username", "email"].includes(result.field)
                    ? result.field
                    : null;
                showValidationError(message, field);
                return;
            }

            // Only continue when both values are available.
            lastSubmitRef.current = Date.now();

            navigate("/register/captcha", {
                state: { registrationData }
            });

        } catch (err) {
            console.error("REGISTRATION AVAILABILITY ERROR:", err);

            showValidationError(
                "Could not check username and email. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="register-form" onSubmit={handleSubmit} noValidate>
            <h2>Register</h2>

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
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? "username-error" : undefined}
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
            {renderFieldError("username")}

            <input
                name="firstName"
                aria-invalid={Boolean(fieldErrors.firstName)}
                aria-describedby={fieldErrors.firstName ? "firstName-error" : undefined}
                value={form.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="First Name"
                autoComplete="given-name"
                maxLength={100}
                required
            />
            {renderFieldError("firstName")}

            <input
                name="lastName"
                aria-invalid={Boolean(fieldErrors.lastName)}
                aria-describedby={fieldErrors.lastName ? "lastName-error" : undefined}
                value={form.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Last Name"
                autoComplete="family-name"
                maxLength={100}
                required
            />
            {renderFieldError("lastName")}

            <input
                name="email"
                aria-invalid={Boolean(fieldErrors.email)}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                type="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Email"
                autoComplete="email"
                maxLength={320}
                required
            />
            {renderFieldError("email")}

            <input
                name="phone"
                aria-invalid={Boolean(fieldErrors.phone)}
                aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                autoComplete="tel"
                maxLength={30}
                required
            />
            {renderFieldError("phone")}

            <input
                name="password"
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
                minLength={8}
                maxLength={128}
                required
            />
            {renderFieldError("password")}

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
                aria-invalid={Boolean(fieldErrors.confirmPassword)}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                autoComplete="new-password"
                maxLength={128}
                required
            />
            {renderFieldError("confirmPassword")}

            <CountrySelect
                countries={countries}
                value={form.country}
                onChange={(country) => {
                    clearFieldError("country");
                    setForm((prev) => ({
                        ...prev,
                        country
                    }));
                }}
            // language={language}
            />
            {renderFieldError("country")}

            <AddressInput
                form={form}
                setForm={setForm}
                loading={loading}
            />
            {renderFieldError("address")}

            <input
                name="postalCode"
                aria-invalid={Boolean(fieldErrors.postalCode)}
                aria-describedby={fieldErrors.postalCode ? "postalCode-error" : undefined}
                value={form.postalCode}
                onChange={handleChange}
                placeholder="Postal Code"
                autoComplete="postal-code"
                maxLength={20}
                required
            />
            {renderFieldError("postalCode")}

            <input
                name="city"
                aria-invalid={Boolean(fieldErrors.city)}
                aria-describedby={fieldErrors.city ? "city-error" : undefined}
                value={form.city}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="City"
                autoComplete="address-level2"
                maxLength={100}
                required
            />
            {renderFieldError("city")}

            <button type="submit" disabled={loading}>
                {loading ? "Checking..." : "Register"}
            </button>

            {error && (
                <p className="register-form-error" role="alert" aria-live="assertive" style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {success && (
                <p className="register-form-success" role="status" aria-live="polite" style={{ color: "green" }}>
                    {success}
                </p>
            )}
        </form>
    );
}
