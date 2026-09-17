import { useEffect, useState } from "react";
import {
    getAddresses,
    addAddress,
    deleteAddress,
    setDefaultAddress,
} from "../../services/userService";
import { toast } from "react-toastify";
import AddressInput from "../../components/address/AddressInput.jsx";

function AddressBook() {
    const [addresses, setAddresses] = useState([]);
    const [countries, setCountries] = useState([]);

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        street: "",
        address: "",
        city: "",
        postalCode: "",
        country: "",
        countryCode: "",
        addressVerified: false,
    });

    // =========================
    // LOAD COUNTRIES
    // =========================
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

    // =========================
    // LOAD FROM BACKEND
    // =========================
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem("token");

                console.log("🔑 TOKEN:", token);

                if (!token) {
                    console.error(
                        "❌ No token in localStorage"
                    );

                    toast.error(
                        "You are not logged in."
                    );

                    return;
                }

                const data = await getAddresses(token);

                console.log(
                    "✅ Backend response:",
                    data
                );

                if (Array.isArray(data)) {
                    setAddresses(data);
                } else if (
                    Array.isArray(data.addresses)
                ) {
                    setAddresses(data.addresses);
                } else {
                    setAddresses([]);
                }
            } catch (err) {
                console.error(
                    "❌ Failed loading addresses"
                );

                console.log(err);

                if (err.response) {
                    console.log(
                        "Status:",
                        err.response.status
                    );

                    console.log(
                        "Data:",
                        err.response.data
                    );
                }

                toast.error(
                    err.response?.data?.message ||
                    err.message ||
                    "Failed to load addresses."
                );
            }
        };

        fetchAddresses();
    }, []);

    // =========================
    // ADD ADDRESS
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "You are not logged in."
                );

                return;
            }

            // =========================
            // GOOGLE VERIFIED ADDRESS
            // =========================
            const normalizedStreet =
                form.address?.trim() ||
                form.street?.trim() ||
                "";

            if (!normalizedStreet) {
                toast.error(
                    "Please enter your street address."
                );

                return;
            }

            if (!form.addressVerified) {
                toast.warning(
                    "Please select a valid address from the address suggestions."
                );

                return;
            }

            if (!form.country) {
                toast.warning(
                    "Please select a country."
                );

                return;
            }

            const res = await addAddress(token, {
                ...form,
                street: normalizedStreet,
            });

            console.log(
                "ADD RESPONSE:",
                res
            );

            if (Array.isArray(res)) {
                setAddresses(res);
            } else if (
                Array.isArray(res.addresses)
            ) {
                setAddresses(res.addresses);
            }

            setForm({
                fullName: "",
                email: "",
                phone: "",
                street: "",
                address: "",
                city: "",
                postalCode: "",
                country: "",
                countryCode: "",
                addressVerified: false,
            });

            toast.success(
                "Address added successfully!"
            );
        } catch (err) {
            console.error(err);

            if (err.response) {
                console.log(
                    err.response.status
                );

                console.log(
                    err.response.data
                );
            }

            toast.error(
                err.response?.data?.message ||
                err.message ||
                "Failed to add address."
            );
        }
    };

    // =========================
    // SET PRIMARY ADDRESS
    // =========================
    const handleSetDefault = async (id) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "You are not logged in."
                );

                return;
            }

            const res = await setDefaultAddress(
                token,
                id
            );

            console.log(
                "SET DEFAULT RESPONSE:",
                res
            );

            if (Array.isArray(res)) {
                setAddresses(res);
            } else if (
                Array.isArray(res.addresses)
            ) {
                setAddresses(res.addresses);
            }

            toast.success(
                "Primary address updated successfully!"
            );
        } catch (err) {
            console.error(err);

            if (err.response) {
                console.log(
                    err.response.status
                );

                console.log(
                    err.response.data
                );
            }

            toast.error(
                err.response?.data?.message ||
                err.message ||
                "Failed to set primary address."
            );
        }
    };

    // =========================
    // DELETE ADDRESS
    // =========================
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error(
                    "You are not logged in."
                );

                return;
            }

            const res = await deleteAddress(
                token,
                id
            );

            console.log(
                "DELETE RESPONSE:",
                res
            );

            if (Array.isArray(res)) {
                setAddresses(res);
            } else if (
                Array.isArray(res.addresses)
            ) {
                setAddresses(res.addresses);
            }

            toast.success(
                "Address deleted successfully!"
            );
        } catch (err) {
            console.error(err);

            if (err.response) {
                console.log(
                    err.response.status
                );

                console.log(
                    err.response.data
                );
            }

            toast.error(
                err.response?.data?.message ||
                err.message ||
                "Failed to delete address."
            );
        }
    };

    // =========================
    // FORM CHANGE
    // =========================
    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    // =========================
    // COUNTRY CHANGE
    // =========================
    const handleCountryChange = (e) => {
        const selectedCountry =
            e.target.value;

        setForm((prev) => ({
            ...prev,
            country: selectedCountry,
            countryCode: "",
            addressVerified: false,
        }));
    };

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "40px auto",
                padding: "20px",
            }}
        >
            <h1>Address Book</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    display: "grid",
                    gap: "15px",
                    marginTop: "30px",
                    marginBottom: "40px",
                }}
            >
                <input
                    name="fullName"
                    placeholder="Full Name"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <input
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />

                {/* =========================
                    COUNTRY
                ========================= */}

                <select
                    name="country"
                    value={form.country}
                    onChange={handleCountryChange}
                    required
                >
                    <option value="">
                        Select country
                    </option>

                    {countries.map(
                        (country, index) => (
                            <option
                                key={`${country}-${index}`}
                                value={country}
                            >
                                {country}
                            </option>
                        )
                    )}
                </select>

                {/* =========================
                    GOOGLE ADDRESS INPUT
                ========================= */}

                <AddressInput
                    form={form}
                    setForm={setForm}
                    loading={false}
                />

                {/* Keep street field connected to the
                    existing Address Book data structure */}

                <input
                    name="street"
                    type="hidden"
                    value={
                        form.address ||
                        form.street
                    }
                    onChange={handleChange}
                />

                <input
                    name="city"
                    placeholder="City"
                    value={form.city}
                    onChange={handleChange}
                    required
                />

                <input
                    name="postalCode"
                    placeholder="Postal Code"
                    value={form.postalCode}
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Add Address
                </button>
            </form>

            <h2>Saved Addresses</h2>

            {addresses.length === 0 ? (
                <p>
                    No saved addresses.
                </p>
            ) : (
                addresses.map((address) => (
                    <div
                        key={
                            address._id ||
                            address.id
                        }
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        {/* =========================
                            PRIMARY ADDRESS
                        ========================= */}

                        {address.isDefault && (
                            <p
                                style={{
                                    fontWeight:
                                        "bold",
                                    marginBottom:
                                        "10px",
                                }}
                            >
                                ★ Primary Address
                            </p>
                        )}

                        <h3>
                            {address.fullName}
                        </h3>

                        <p>
                            {address.email}
                        </p>

                        <p>
                            {address.phone}
                        </p>

                        <p>
                            {address.street}
                        </p>

                        <p>
                            {address.postalCode}{" "}
                            {address.city}
                        </p>

                        <p>
                            {address.country}
                        </p>

                        {/* =========================
                            SET PRIMARY
                        ========================= */}

                        {!address.isDefault && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleSetDefault(
                                        address._id ||
                                        address.id
                                    )
                                }
                                style={{
                                    marginTop:
                                        "15px",
                                    marginRight:
                                        "10px",
                                }}
                            >
                                Make Primary
                            </button>
                        )}

                        {/* =========================
                            DELETE
                        ========================= */}

                        <button
                            type="button"
                            onClick={() =>
                                handleDelete(
                                    address._id ||
                                    address.id
                                )
                            }
                            style={{
                                marginTop:
                                    "15px",
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default AddressBook;