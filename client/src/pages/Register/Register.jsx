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
        country: "Sweden"
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = await registerUser(form);

            console.log("REGISTER SUCCESS:", data);

            alert("User created successfully 🚀");

        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            <input name="username" placeholder="Username" onChange={handleChange} />
            <input name="firstName" placeholder="First Name" onChange={handleChange} />
            <input name="lastName" placeholder="Last Name" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />

            <input name="password" type="password" placeholder="Password" onChange={handleChange} />
            <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} />

            <input name="address" placeholder="Address" onChange={handleChange} />
            <input name="postalCode" placeholder="Postal Code" onChange={handleChange} />
            <input name="city" placeholder="City" onChange={handleChange} />

            <button type="submit">Register</button>
        </form>
    );
}
