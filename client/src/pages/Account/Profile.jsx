import React from "react";

function Profile() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>My Profile</h1>

            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <p>Name: {user.firstName} {user.lastName}</p>
            <p>Admin: {user.isAdmin ? "Yes" : "No"}</p>
        </div>
    );
}

export default Profile;