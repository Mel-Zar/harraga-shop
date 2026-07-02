import { Link } from "react-router-dom";
import { useMemo } from "react";

function Profile() {
    const user = useMemo(() => {
        try {
            return JSON.parse(localStorage.getItem("user"));
        } catch {
            return null;
        }
    }, []);

    if (!user) {
        return (
            <div
                style={{
                    maxWidth: "900px",
                    margin: "40px auto",
                    padding: "20px",
                }}
            >
                <h1>My Profile</h1>
                <p>No user information found.</p>
            </div>
        );
    }

    return (
        <div
            style={{
                maxWidth: "900px",
                margin: "40px auto",
                padding: "20px",
            }}
        >
            <h1>My Profile</h1>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "220px 1fr",
                    gap: "30px",
                    marginTop: "30px",
                }}
            >
                {/* LEFT MENU */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        height: "fit-content",
                    }}
                >
                    <h3>Account</h3>

                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                            marginTop: "15px",
                        }}
                    >
                        <Link to="/profile">
                            My Profile
                        </Link>

                        <Link to="/profile/orders">
                            My Orders
                        </Link>

                        <Link to="/profile/edit">
                            Edit Profile
                        </Link>

                        <Link to="/profile/password">
                            Change Password
                        </Link>

                        <Link to="/profile/address">
                            Address Book
                        </Link>
                    </div>
                </div>

                {/* RIGHT CONTENT */}
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "25px",
                    }}
                >
                    <h2>Personal Information</h2>

                    <hr />

                    <p>
                        <strong>Username:</strong>{" "}
                        {user.username || "-"}
                    </p>

                    <p>
                        <strong>Email:</strong>{" "}
                        {user.email || "-"}
                    </p>

                    <p>
                        <strong>First name:</strong>{" "}
                        {user.firstName || "-"}
                    </p>

                    <p>
                        <strong>Last name:</strong>{" "}
                        {user.lastName || "-"}
                    </p>

                    <p>
                        <strong>Phone:</strong>{" "}
                        {user.phone || "-"}
                    </p>

                    <p>
                        <strong>Role:</strong>{" "}
                        {user.isAdmin ? "Administrator" : "Customer"}
                    </p>

                    <p>
                        <strong>Email verified:</strong>{" "}
                        {user.isVerified ? "✅ Verified" : "❌ Not verified"}
                    </p>

                    <div
                        style={{
                            marginTop: "30px",
                            display: "flex",
                            gap: "15px",
                            flexWrap: "wrap",
                        }}
                    >
                        <Link to="/profile/edit">
                            <button>
                                Edit Profile
                            </button>
                        </Link>

                        <Link to="/profile/orders">
                            <button>
                                My Orders
                            </button>
                        </Link>

                        <Link to="/profile/password">
                            <button>
                                Change Password
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;