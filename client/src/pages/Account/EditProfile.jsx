import { useState } from "react";

function EditProfile() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [username, setUsername] = useState(user?.username || "");
    const [email] = useState(user?.email || "");

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setMessage("");
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/users/profile`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        username,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            window.dispatchEvent(new Event("authChanged"));

            setMessage("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: "600px",
                margin: "40px auto",
                padding: "30px",
                border: "1px solid #ddd",
                borderRadius: "12px",
            }}
        >
            <h1>Edit Profile</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                    <label>First Name</label>

                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) =>
                            setFirstName(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label>Last Name</label>

                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) =>
                            setLastName(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label>Username</label>

                    <input
                        type="text"
                        value={username}
                        onChange={(e) =>
                            setUsername(e.target.value)
                        }
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                        }}
                    />
                </div>

                <div style={{ marginBottom: 20 }}>
                    <label>Email</label>

                    <input
                        type="email"
                        value={email}
                        disabled
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "6px",
                            background: "#eee",
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: "100%",
                        padding: "12px",
                        cursor: "pointer",
                    }}
                >
                    {loading
                        ? "Saving..."
                        : "Save Changes"}
                </button>

                {message && (
                    <p
                        style={{
                            color: "green",
                            marginTop: "20px",
                        }}
                    >
                        {message}
                    </p>
                )}

                {error && (
                    <p
                        style={{
                            color: "red",
                            marginTop: "20px",
                        }}
                    >
                        {error}
                    </p>
                )}
            </form>
        </div>
    );
}

export default EditProfile;