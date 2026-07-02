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
        const fetchData = async () => {
            try {
                const token = localStorage.getItem("token");

                const data = await getAddresses(token);

                setAddresses(data || []);
            } catch (err) {
                console.error("Failed to load addresses:", err);
            }
        };

        fetchData();
    }, []);

    // =========================
    // ADD ADDRESS
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const newAddress = {
                id: Date.now(),
                ...form,
            };

            const res = await addAddress(token, newAddress);

            setAddresses(res.addresses || []);

            setForm({
                fullName: "",
                phone: "",
                street: "",
                city: "",
                postalCode: "",
                country: "",
            });
        } catch (err) {
            console.error("Failed to add address:", err);
        }
    };

    // =========================
    // DELETE ADDRESS
    // =========================
    const handleDelete = async (id) => {
        try {
            const token = localStorage.getItem("token");

            const res = await deleteAddress(token, id);

            setAddresses(res.addresses || []);
        } catch (err) {
            console.error("Failed to delete address:", err);
        }
    };

    // =========================
    // FORM CHANGE
    // =========================
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
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

                <button type="submit">Add Address</button>
            </form>

            <h2>Saved Addresses</h2>

            {addresses.length === 0 ? (
                <p>No saved addresses.</p>
            ) : (
                addresses.map((address) => (
                    <div
                        key={address.id}
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
                            onClick={() => handleDelete(address.id)}
                            style={{ marginTop: "15px" }}
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