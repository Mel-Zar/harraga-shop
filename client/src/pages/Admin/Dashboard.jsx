import { Link } from "react-router-dom";

import {
    getUser,
} from "../../utils/auth";

function Dashboard() {
    const user = getUser();

    return (
        <div
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 20px",
            }}
        >
            {/* =========================
                HEADER
            ========================= */}

            <div
                style={{
                    marginBottom: "35px",
                }}
            >
                <p
                    style={{
                        margin: "0 0 8px",
                        color: "#666",
                        fontSize: "14px",
                    }}
                >
                    ADMIN PANEL
                </p>

                <h1
                    style={{
                        margin: 0,
                        fontSize: "36px",
                    }}
                >
                    Dashboard
                </h1>

                <p
                    style={{
                        marginTop: "10px",
                        color: "#666",
                    }}
                >
                    Welcome back,{" "}
                    <strong>
                        {user?.firstName ||
                            user?.username ||
                            "Admin"}
                    </strong>
                </p>
            </div>

            {/* =========================
                QUICK ACTIONS
            ========================= */}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(240px, 1fr))",
                    gap: "20px",
                    marginBottom: "35px",
                }}
            >
                <Link
                    to="/admin/users"
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "14px",
                            padding: "25px",
                            minHeight: "150px",
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "32px",
                                marginBottom: "15px",
                            }}
                        >
                            👥
                        </div>

                        <h2
                            style={{
                                margin: "0 0 8px",
                            }}
                        >
                            Users
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#666",
                            }}
                        >
                            Manage registered users.
                        </p>
                    </div>
                </Link>

                <Link
                    to="/admin/orders"
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "14px",
                            padding: "25px",
                            minHeight: "150px",
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "32px",
                                marginBottom: "15px",
                            }}
                        >
                            📦
                        </div>

                        <h2
                            style={{
                                margin: "0 0 8px",
                            }}
                        >
                            Orders
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#666",
                            }}
                        >
                            View and manage customer orders.
                        </p>
                    </div>
                </Link>

                <Link
                    to="/admin/products"
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "14px",
                            padding: "25px",
                            minHeight: "150px",
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "32px",
                                marginBottom: "15px",
                            }}
                        >
                            🛍️
                        </div>

                        <h2
                            style={{
                                margin: "0 0 8px",
                            }}
                        >
                            Products
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#666",
                            }}
                        >
                            Manage your product catalogue.
                        </p>
                    </div>
                </Link>

                <Link
                    to="/admin/products/create"
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                    }}
                >
                    <div
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "14px",
                            padding: "25px",
                            minHeight: "150px",
                            background: "#fff",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "32px",
                                marginBottom: "15px",
                            }}
                        >
                            ➕
                        </div>

                        <h2
                            style={{
                                margin: "0 0 8px",
                            }}
                        >
                            Create Product
                        </h2>

                        <p
                            style={{
                                margin: 0,
                                color: "#666",
                            }}
                        >
                            Add a new product to the shop.
                        </p>
                    </div>
                </Link>
            </div>

            {/* =========================
                ADMIN INFORMATION
            ========================= */}

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "14px",
                    padding: "25px",
                    background: "#fff",
                }}
            >
                <h2
                    style={{
                        marginTop: 0,
                    }}
                >
                    Administration
                </h2>

                <p>
                    Use the dashboard to manage
                    users, products and orders.
                </p>

                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                        marginTop: "20px",
                    }}
                >
                    <Link
                        to="/admin/users"
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "#111",
                            color: "#fff",
                            textDecoration: "none",
                        }}
                    >
                        Manage Users
                    </Link>

                    <Link
                        to="/admin/orders"
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "#111",
                            color: "#fff",
                            textDecoration: "none",
                        }}
                    >
                        Manage Orders
                    </Link>

                    <Link
                        to="/admin/products/create"
                        style={{
                            padding: "10px 16px",
                            borderRadius: "8px",
                            background: "#111",
                            color: "#fff",
                            textDecoration: "none",
                        }}
                    >
                        Create Product
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;