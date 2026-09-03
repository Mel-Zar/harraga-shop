import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getUsers,
    updateUser,
    deleteUser,
} from "../../services/userService";

import { toast } from "react-toastify";

function Users() {

    const [users, setUsers] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [editingId, setEditingId] =
        useState(null);

    const [savingId, setSavingId] =
        useState(null);

    const [deletingId, setDeletingId] =
        useState(null);

    const [editData, setEditData] =
        useState({});

    // =====================================================
    // FETCH USERS
    // =====================================================

    const fetchUsers =
        useCallback(async () => {

            try {

                setLoading(true);
                setError("");

                const currentToken =
                    localStorage.getItem(
                        "token"
                    );

                if (
                    !currentToken ||
                    currentToken === "null" ||
                    currentToken === "undefined"
                ) {
                    throw new Error(
                        "No authentication token found."
                    );
                }

                const data =
                    await getUsers(
                        currentToken
                    );

                setUsers(
                    Array.isArray(data)
                        ? data
                        : []
                );

            } catch (error) {

                console.error(
                    "GET USERS ERROR:",
                    error
                );

                setError(
                    error.message ||
                    "Failed to load users."
                );

                toast.error(
                    error.response?.data?.message ||
                    error.message ||
                    "Failed to load users."
                );

            } finally {

                setLoading(false);
            }

        }, []);

    // =====================================================
    // LOAD USERS
    // =====================================================

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // =====================================================
    // SEARCH
    // =====================================================

    const filteredUsers =
        useMemo(() => {

            const text =
                search
                    .toLowerCase()
                    .trim();

            if (!text) {
                return users;
            }

            return users.filter(
                (user) =>
                    user.firstName
                        ?.toLowerCase()
                        .includes(text) ||

                    user.lastName
                        ?.toLowerCase()
                        .includes(text) ||

                    user.username
                        ?.toLowerCase()
                        .includes(text) ||

                    user.email
                        ?.toLowerCase()
                        .includes(text) ||

                    user.city
                        ?.toLowerCase()
                        .includes(text)
            );

        }, [
            users,
            search,
        ]);

    // =====================================================
    // START EDIT
    // =====================================================

    const handleEdit = (
        user
    ) => {

        setEditingId(
            user._id
        );

        setEditData({
            firstName:
                user.firstName || "",

            lastName:
                user.lastName || "",

            username:
                user.username || "",

            email:
                user.email || "",

            address:
                user.address || "",

            postalCode:
                user.postalCode || "",

            city:
                user.city || "",

            country:
                user.country || "",

            isAdmin:
                Boolean(
                    user.isAdmin
                ),

            isVerified:
                Boolean(
                    user.isVerified
                ),
        });
    };

    // =====================================================
    // CANCEL EDIT
    // =====================================================

    const handleCancel = () => {

        setEditingId(null);
        setEditData({});
    };

    // =====================================================
    // CHANGE EDIT DATA
    // =====================================================

    const handleChange = (
        event
    ) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setEditData(
            (prev) => ({
                ...prev,

                [name]:
                    type ===
                        "checkbox"
                        ? checked
                        : value,
            })
        );
    };

    // =====================================================
    // SAVE USER
    // =====================================================

    const handleSave = async (
        id
    ) => {

        try {

            setSavingId(id);
            setError("");

            const currentToken =
                localStorage.getItem(
                    "token"
                );

            if (
                !currentToken ||
                currentToken === "null" ||
                currentToken === "undefined"
            ) {
                throw new Error(
                    "No authentication token found."
                );
            }

            const response =
                await updateUser(
                    currentToken,
                    id,
                    editData
                );

            const updatedUser =
                response?.user;

            if (!updatedUser) {
                throw new Error(
                    "Server returned no updated user."
                );
            }

            setUsers(
                (prev) =>
                    prev.map(
                        (user) =>
                            user._id === id
                                ? updatedUser
                                : user
                    )
            );

            setEditingId(null);
            setEditData({});

            toast.success(
                "User updated successfully!"
            );

        } catch (error) {

            console.error(
                "UPDATE USER ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to update user."
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to update user."
            );

        } finally {

            setSavingId(null);
        }
    };

    // =====================================================
    // DELETE USER
    // =====================================================

    const handleDelete = async (
        user
    ) => {

        const name =
            [
                user.firstName,
                user.lastName,
            ]
                .filter(Boolean)
                .join(" ") ||
            user.username ||
            user.email ||
            "this user";

        const confirmed =
            window.confirm(
                `Are you sure you want to delete ${name}?`
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(
                user._id
            );

            setError("");

            const currentToken =
                localStorage.getItem(
                    "token"
                );

            if (
                !currentToken ||
                currentToken === "null" ||
                currentToken === "undefined"
            ) {
                throw new Error(
                    "No authentication token found."
                );
            }

            await deleteUser(
                currentToken,
                user._id
            );

            setUsers(
                (prev) =>
                    prev.filter(
                        (item) =>
                            item._id !==
                            user._id
                    )
            );

            if (
                editingId ===
                user._id
            ) {
                setEditingId(null);
                setEditData({});
            }

            toast.success(
                "User deleted successfully!"
            );

        } catch (error) {

            console.error(
                "DELETE USER ERROR:",
                error
            );

            setError(
                error.message ||
                "Failed to delete user."
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Failed to delete user."
            );

        } finally {

            setDeletingId(null);
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div
                style={{
                    maxWidth:
                        "1200px",
                    margin:
                        "40px auto",
                    padding:
                        "20px",
                }}
            >
                <h1>
                    Users
                </h1>

                <p>
                    Loading users...
                </p>
            </div>
        );
    }

    // =====================================================
    // PAGE
    // =====================================================

    return (
        <div
            style={{
                maxWidth:
                    "1200px",
                margin:
                    "40px auto",
                padding:
                    "20px",
            }}
        >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                style={{
                    display:
                        "flex",
                    justifyContent:
                        "space-between",
                    alignItems:
                        "center",
                    gap:
                        "20px",
                    flexWrap:
                        "wrap",
                    marginBottom:
                        "30px",
                }}
            >
                <div>

                    <h1>
                        Users
                    </h1>

                    <p>
                        Manage registered users.
                    </p>

                </div>

                <div>
                    <strong>
                        Total users:
                    </strong>{" "}
                    {users.length}
                </div>
            </div>

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
                <div
                    style={{
                        border:
                            "1px solid #fca5a5",
                        background:
                            "#fef2f2",
                        color:
                            "#991b1b",
                        borderRadius:
                            "10px",
                        padding:
                            "15px",
                        marginBottom:
                            "20px",
                    }}
                >
                    <strong>
                        Error:
                    </strong>{" "}
                    {error}
                </div>
            )}

            {/* =================================================
                SEARCH
            ================================================= */}

            <div
                style={{
                    marginBottom:
                        "25px",
                }}
            >
                <input
                    type="text"
                    placeholder="Search name, username, email or city..."
                    value={search}
                    onChange={(event) =>
                        setSearch(
                            event.target.value
                        )
                    }
                    style={{
                        width:
                            "100%",
                        maxWidth:
                            "600px",
                        padding:
                            "12px",
                        border:
                            "1px solid #ccc",
                        borderRadius:
                            "8px",
                        fontSize:
                            "16px",
                        boxSizing:
                            "border-box",
                    }}
                />
            </div>

            {/* =================================================
                COUNT
            ================================================= */}

            <p>
                Showing{" "}
                <strong>
                    {
                        filteredUsers.length
                    }
                </strong>{" "}
                of{" "}
                <strong>
                    {users.length}
                </strong>{" "}
                users
            </p>

            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredUsers.length ===
                0 ? (

                <div
                    style={{
                        border:
                            "1px solid #ddd",
                        borderRadius:
                            "10px",
                        padding:
                            "30px",
                        marginTop:
                            "20px",
                    }}
                >

                    <h3>
                        No users found.
                    </h3>

                    <p>
                        {users.length ===
                            0
                            ? "No registered users found."
                            : "Try another search."}
                    </p>

                </div>

            ) : (

                <div
                    style={{
                        display:
                            "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(320px, 1fr))",
                        gap:
                            "20px",
                        marginTop:
                            "20px",
                    }}
                >

                    {filteredUsers.map(
                        (user) => {

                            const isEditing =
                                editingId ===
                                user._id;

                            return (
                                <div
                                    key={
                                        user._id
                                    }
                                    style={{
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "12px",
                                        padding:
                                            "20px",
                                        background:
                                            "#fff",
                                        boxShadow:
                                            "0 4px 14px rgba(0,0,0,0.04)",
                                    }}
                                >

                                    {/* =================================================
                                        USER HEADER
                                    ================================================= */}

                                    <div
                                        style={{
                                            display:
                                                "flex",
                                            justifyContent:
                                                "space-between",
                                            alignItems:
                                                "flex-start",
                                            gap:
                                                "15px",
                                            marginBottom:
                                                "20px",
                                        }}
                                    >

                                        <div>

                                            <h2
                                                style={{
                                                    margin:
                                                        "0 0 5px",
                                                }}
                                            >
                                                {
                                                    user.firstName
                                                }{" "}
                                                {
                                                    user.lastName
                                                }
                                            </h2>

                                            <p
                                                style={{
                                                    margin:
                                                        0,
                                                    color:
                                                        "#666",
                                                }}
                                            >
                                                @
                                                {
                                                    user.username
                                                }
                                            </p>

                                        </div>

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap:
                                                    "5px",
                                                alignItems:
                                                    "flex-end",
                                            }}
                                        >

                                            <span>
                                                {user.isAdmin
                                                    ? "👑 Admin"
                                                    : "👤 User"}
                                            </span>

                                            <span>
                                                {user.isVerified
                                                    ? "✅ Verified"
                                                    : "⚠️ Not verified"}
                                            </span>

                                        </div>

                                    </div>

                                    {/* =================================================
                                        EDIT MODE
                                    ================================================= */}

                                    {isEditing ? (

                                        <div
                                            style={{
                                                display:
                                                    "flex",
                                                flexDirection:
                                                    "column",
                                                gap:
                                                    "12px",
                                            }}
                                        >

                                            <input
                                                name="firstName"
                                                placeholder="First name"
                                                value={
                                                    editData.firstName ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="lastName"
                                                placeholder="Last name"
                                                value={
                                                    editData.lastName ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="username"
                                                placeholder="Username"
                                                value={
                                                    editData.username ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="email"
                                                type="email"
                                                placeholder="Email"
                                                value={
                                                    editData.email ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="address"
                                                placeholder="Address"
                                                value={
                                                    editData.address ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="postalCode"
                                                placeholder="Postal code"
                                                value={
                                                    editData.postalCode ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="city"
                                                placeholder="City"
                                                value={
                                                    editData.city ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <input
                                                name="country"
                                                placeholder="Country"
                                                value={
                                                    editData.country ||
                                                    ""
                                                }
                                                onChange={
                                                    handleChange
                                                }
                                            />

                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="isAdmin"
                                                    checked={
                                                        Boolean(
                                                            editData.isAdmin
                                                        )
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />{" "}
                                                Admin
                                            </label>

                                            <label>
                                                <input
                                                    type="checkbox"
                                                    name="isVerified"
                                                    checked={
                                                        Boolean(
                                                            editData.isVerified
                                                        )
                                                    }
                                                    onChange={
                                                        handleChange
                                                    }
                                                />{" "}
                                                Verified
                                            </label>

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "10px",
                                                    marginTop:
                                                        "10px",
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSave(
                                                            user._id
                                                        )
                                                    }
                                                    disabled={
                                                        savingId ===
                                                        user._id
                                                    }
                                                >
                                                    {savingId ===
                                                        user._id
                                                        ? "Saving..."
                                                        : "Save"}
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleCancel
                                                    }
                                                >
                                                    Cancel
                                                </button>

                                            </div>

                                        </div>

                                    ) : (

                                        <>
                                            {/* =================================================
                                                VIEW MODE
                                            ================================================= */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    flexDirection:
                                                        "column",
                                                    gap:
                                                        "10px",
                                                }}
                                            >

                                                <p>
                                                    <strong>
                                                        Email:
                                                    </strong>{" "}
                                                    {
                                                        user.email
                                                    }
                                                </p>

                                                <p>
                                                    <strong>
                                                        Address:
                                                    </strong>{" "}
                                                    {
                                                        user.address ||
                                                        "-"
                                                    }
                                                </p>

                                                <p>
                                                    <strong>
                                                        Postal code:
                                                    </strong>{" "}
                                                    {
                                                        user.postalCode ||
                                                        "-"
                                                    }
                                                </p>

                                                <p>
                                                    <strong>
                                                        City:
                                                    </strong>{" "}
                                                    {
                                                        user.city ||
                                                        "-"
                                                    }
                                                </p>

                                                <p>
                                                    <strong>
                                                        Country:
                                                    </strong>{" "}
                                                    {
                                                        user.country ||
                                                        "-"
                                                    }
                                                </p>

                                                <p>
                                                    <strong>
                                                        Created:
                                                    </strong>{" "}
                                                    {user.createdAt
                                                        ? new Date(
                                                            user.createdAt
                                                        ).toLocaleDateString(
                                                            "sv-SE"
                                                        )
                                                        : "-"}

                                                </p>

                                            </div>

                                            {/* =================================================
                                                ACTIONS
                                            ================================================= */}

                                            <div
                                                style={{
                                                    display:
                                                        "flex",
                                                    gap:
                                                        "10px",
                                                    flexWrap:
                                                        "wrap",
                                                    marginTop:
                                                        "20px",
                                                }}
                                            >

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleEdit(
                                                            user
                                                        )
                                                    }
                                                    disabled={
                                                        savingId ===
                                                        user._id ||
                                                        deletingId ===
                                                        user._id
                                                    }
                                                    style={{
                                                        padding:
                                                            "10px 15px",
                                                        border:
                                                            "1px solid #ccc",
                                                        borderRadius:
                                                            "8px",
                                                        cursor:
                                                            "pointer",
                                                    }}
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(
                                                            user
                                                        )
                                                    }
                                                    disabled={
                                                        deletingId ===
                                                        user._id
                                                    }
                                                    style={{
                                                        padding:
                                                            "10px 15px",
                                                        border:
                                                            "none",
                                                        borderRadius:
                                                            "8px",
                                                        cursor:
                                                            "pointer",
                                                        background:
                                                            "#dc2626",
                                                        color:
                                                            "#fff",
                                                    }}
                                                >
                                                    {deletingId ===
                                                        user._id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>

                                            </div>

                                        </>
                                    )}

                                </div>
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
}

export default Users;