import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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
import Orders from "./pages/Admin/Orders";
import OrderDetails from "./pages/Admin/OrderDetails";

// 🔥 NEW
import AdminRoute from "./routes/AdminRoute";

function App() {
  // =========================
  // 🔐 TEST PROTECTED ROUTE
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) return;

    getProtectedData()
      .then((data) =>
        console.log("✅ PROTECTED DATA:", data)
      )
      .catch((err) =>
        console.log(
          "❌ PROTECTED ERROR:",
          err.message
        )
      );
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

          {/* HOME */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* AUTH */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* EMAIL VERIFY */}
          <Route
            path="/verify-email/:userId/:token"
            element={<VerifyEmail />}
          />

          {/* FORGOT PASSWORD */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* RESET PASSWORD */}
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* PRODUCTS */}
          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/products/:id"
            element={<Product />}
          />

          {/* =========================
              🔥 ADMIN ROUTES
          ========================= */}

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
                <OrderDetails />
              </AdminRoute>
            }
          />

          {/* CART */}
          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/checkout"
            element={<Checkout />}
          />

        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;