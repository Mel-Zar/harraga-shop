import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// pages
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

// Product pages
import Home from "./pages/Home/Home";
import CreateProduct from "./pages/Admin/CreateProduct";

// 🔥 protected test
import { getProtectedData } from "./services/protectedService";

import Navbar from "./components/Navbar/Navbar";
import Products from "./pages/Products/Products";
import Product from "./pages/Product/Product";
import Footer from "./components/Footer/Footer";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";

// 👑 Admin
import Orders from "./pages/Admin/Orders";
import OrderDetail from "./pages/Admin/OrderDetail";
import Users from "./pages/Admin/Users";

// 👤 Account
import Profile from "./pages/Account/Profile";
import MyOrders from "./pages/Account/MyOrders";
import OrderDetails from "./pages/Account/OrderDetails";
import EditProfile from "./pages/Account/EditProfile";
import ChangePassword from "./pages/Account/ChangePassword";
import AddressBook from "./pages/Account/AddressBook";

// 🔥 ROUTES
import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  // =========================
  // 🔐 TEST PROTECTED ROUTE
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (
      !token ||
      token === "null" ||
      token === "undefined"
    ) {
      return;
    }

    getProtectedData()
      .then((data) => {
        console.log(
          "✅ PROTECTED DATA:",
          data
        );
      })
      .catch((err) => {
        console.log(
          "❌ PROTECTED ERROR:",
          err.message
        );
      });
  }, []);

  return (
    <Router>
      <div>
        {/* =========================
            🔥 NAVBAR
        ========================= */}
        <Navbar />

        {/* =========================
            📍 ROUTES
        ========================= */}
        <Routes>

          {/* =========================
              🏠 HOME
          ========================= */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* =========================
              🔐 AUTH
          ========================= */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              ✉️ EMAIL VERIFY
          ========================= */}
          <Route
            path="/verify-email/:userId/:token"
            element={<VerifyEmail />}
          />

          {/* =========================
              🔑 FORGOT PASSWORD
          ========================= */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* =========================
              🔑 RESET PASSWORD
          ========================= */}
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* =========================
              🛍️ PRODUCTS
          ========================= */}
          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<Product />}
          />

          {/* =========================
              🛒 CART
          ========================= */}
          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* =========================
              💳 CHECKOUT
              LOGIN REQUIRED
          ========================= */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* =========================
              👤 ACCOUNT
          ========================= */}

          {/* PROFILE */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* MY ORDERS */}
          <Route
            path="/profile/orders"
            element={
              <ProtectedRoute>
                <MyOrders />
              </ProtectedRoute>
            }
          />

          {/* SINGLE CUSTOMER ORDER */}
          <Route
            path="/profile/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetails />
              </ProtectedRoute>
            }
          />

          {/* EDIT PROFILE */}
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            }
          />

          {/* CHANGE PASSWORD */}
          <Route
            path="/profile/password"
            element={
              <ProtectedRoute>
                <ChangePassword />
              </ProtectedRoute>
            }
          />

          {/* ADDRESS BOOK */}
          <Route
            path="/profile/address"
            element={
              <ProtectedRoute>
                <AddressBook />
              </ProtectedRoute>
            }
          />

          {/* =========================
              👑 ADMIN ROUTES
          ========================= */}

          {/* CREATE PRODUCT */}
          <Route
            path="/admin/create"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />

          {/* ALL ORDERS */}
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <Orders />
              </AdminRoute>
            }
          />

          {/* ADMIN ORDER DETAILS */}
          <Route
            path="/admin/orders/:id"
            element={
              <AdminRoute>
                <OrderDetail />
              </AdminRoute>
            }
          />

          {/* =========================
              👥 ADMIN USERS
          ========================= */}
          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

        </Routes>

        {/* =========================
            🦶 FOOTER
        ========================= */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;