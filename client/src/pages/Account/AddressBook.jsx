import { useEffect, useState } from "react";
import {
    getAddresses,
    addAddress,
    deleteAddress,
} from "../../services/userService";

function AddressBook() {
    const [addresses, setAddresses] = useState([]);

    const [form, setForm] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        postalCode: "",
        country: "",
    });

    // =========================
    // LOAD FROM BACKEND
    // =========================
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const token = localStorage.getItem("token");

                console.log("🔑 TOKEN:", token);

                if (!token) {
                    console.error("❌ No token in localStorage");
                    return;
                }

                const data = await getAddresses(token);

                console.log("✅ Backend response:", data);

                if (Array.isArray(data)) {
                    setAddresses(data);
                } else if (Array.isArray(data.addresses)) {
                    setAddresses(data.addresses);
                } else {
                    setAddresses([]);
                }
            } catch (err) {
                console.error("❌ Failed loading addresses");

                console.log(err);

                if (err.response) {
                    console.log("Status:", err.response.status);
                    console.log("Data:", err.response.data);
                }
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
                alert("You are not logged in.");
                return;
            }

            const res = await addAddress(token, form);

            console.log("ADD RESPONSE:", res);

            if (Array.isArray(res)) {
                setAddresses(res);
            } else if (Array.isArray(res.addresses)) {
                setAddresses(res.addresses);
            }

            setForm({
                fullName: "",
                phone: "",
                street: "",
                city: "",
                postalCode: "",
                country: "",
            });
        } catch (err) {
            console.error(err);

            if (err.response) {
                console.log(err.response.status);
                console.log(err.response.data);
            }
        }
    };

    // =========================
    // DELETE ADDRESS
    // =========================
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await deleteAddress(token, id);

            console.log("DELETE RESPONSE:", res);

            if (Array.isArray(res)) {
                setAddresses(res);
            } else if (Array.isArray(res.addresses)) {
                setAddresses(res.addresses);
            }
        } catch (err) {
            console.error(err);

            if (err.response) {
                console.log(err.response.status);
                console.log(err.response.data);
            }
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
                    name="phone"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                />

                <input
                    name="street"
                    placeholder="Street Address"
                    value={form.street}
                    onChange={handleChange}
                    required
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

                <input
                    name="country"
                    placeholder="Country"
                    value={form.country}
                    onChange={handleChange}
                    required
                />

                <button type="submit">
                    Add Address
                </button>
            </form>

            <h2>Saved Addresses</h2>

            {addresses.length === 0 ? (
                <p>No saved addresses.</p>
            ) : (
                addresses.map((address) => (
                    <div
                        key={address._id || address.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginBottom: "20px",
                        }}
                    >
                        <h3>{address.fullName}</h3>

                        <p>{address.phone}</p>

                        <p>{address.street}</p>

                        <p>
                            {address.postalCode} {address.city}
                        </p>

                        <p>{address.country}</p>

                        <button
                            onClick={() =>
                                handleDelete(address._id || address.id)
                            }
                            style={{
                                marginTop: "15px",
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