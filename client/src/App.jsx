import { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

// =====================================================
// PUBLIC / PRODUCT PAGES
// =====================================================

import Home from "./pages/Home/Home";
import Products from "./pages/Products/Products";
import Product from "./pages/Product/Product";

// =====================================================
// CART / CHECKOUT
// =====================================================

import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";

// =====================================================
// ADMIN
// =====================================================

import CreateProduct from "./pages/Admin/CreateProduct";
import Dashboard from "./pages/Admin/Dashboard";
import Orders from "./pages/Admin/Orders";
import OrderDetail from "./pages/Admin/OrderDetail";
import Users from "./pages/Admin/Users";

// =====================================================
// ACCOUNT
// =====================================================

import Profile from "./pages/Account/Profile";
import MyOrders from "./pages/Account/MyOrders";
import OrderDetails from "./pages/Account/OrderDetails";
import EditProfile from "./pages/Account/EditProfile";
import ChangePassword from "./pages/Account/ChangePassword";
import AddressBook from "./pages/Account/AddressBook";

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// =====================================================
// ROUTES
// =====================================================

import AdminRoute from "./routes/AdminRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import UserRoute from "./routes/UserRoute";

// =====================================================
// SERVICES
// =====================================================

import { getProtectedData } from "./services/protectedService";

// =====================================================
// APP
// =====================================================

function App() {

  // =================================================
  // 🔐 OPTIONAL PROTECTED CONNECTION TEST
  // =================================================

  useEffect(() => {
    const token =
      localStorage.getItem("token");

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
      <div className="app">

        {/* =================================================
                    🔥 NAVBAR
                ================================================= */}

        <Navbar />

        {/* =================================================
                    📍 ROUTES
                ================================================= */}

        <Routes>

          {/* =================================================
                        🏠 HOME
                    ================================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* =================================================
                        🔐 AUTH
                    ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =================================================
                        ✉️ EMAIL VERIFY
                    ================================================= */}

          <Route
            path="/verify-email/:userId/:token"
            element={<VerifyEmail />}
          />

          {/* =================================================
                        🔑 FORGOT PASSWORD
                    ================================================= */}

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* =================================================
                        🔑 RESET PASSWORD
                    ================================================= */}

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* =================================================
                        🛍️ PRODUCTS
                        PUBLIC
                    ================================================= */}

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<Product />}
          />

          {/* =================================================
                        🛒 CART
                        PUBLIC
                    ================================================= */}

          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* =================================================
                        💳 CHECKOUT
                        LOGIN REQUIRED
                    ================================================= */}

          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            }
          />

          {/* =================================================
                        👤 USER ACCOUNT
                        NORMAL USER ONLY
                    ================================================= */}

          <Route
            path="/profile"
            element={
              <UserRoute>
                <Profile />
              </UserRoute>
            }
          />

          <Route
            path="/profile/orders"
            element={
              <UserRoute>
                <MyOrders />
              </UserRoute>
            }
          />

          <Route
            path="/profile/orders/:id"
            element={
              <UserRoute>
                <OrderDetails />
              </UserRoute>
            }
          />

          <Route
            path="/profile/edit"
            element={
              <UserRoute>
                <EditProfile />
              </UserRoute>
            }
          />

          <Route
            path="/profile/password"
            element={
              <UserRoute>
                <ChangePassword />
              </UserRoute>
            }
          />

          <Route
            path="/profile/address"
            element={
              <UserRoute>
                <AddressBook />
              </UserRoute>
            }
          />

          {/* =================================================
                        👑 ADMIN
                    ================================================= */}

          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <Dashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/create"
            element={
              <AdminRoute>
                <CreateProduct />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <Orders />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders/:id"
            element={
              <AdminRoute>
                <OrderDetail />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <AdminRoute>
                <Products />
              </AdminRoute>
            }
          />

          {/* =================================================
                        404
                    ================================================= */}

          <Route
            path="*"
            element={
              <div
                style={{
                  maxWidth: "1200px",
                  margin: "80px auto",
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <h1>
                  404
                </h1>

                <p>
                  Page not found.
                </p>
              </div>
            }
          />

        </Routes>

        {/* =================================================
                    🦶 FOOTER
                ================================================= */}

        <Footer />

      </div>
    </Router>
  );
}

export default App;