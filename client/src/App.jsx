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
import CreateProduct from "./pages/CreateProduct/CreateProduct";

// 🔥 protected test
import { getProtectedData } from "./services/protectedService";
import Navbar from "./components/Navbar/Navbar";

function App() {

  // =========================
  // 🔐 TEST PROTECTED ROUTE
  // =========================
  useEffect(() => {
    getProtectedData()
      .then((data) => console.log("✅ PROTECTED DATA:", data))
      .catch((err) => console.log("❌ PROTECTED ERROR:", err.message));
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

          {/* AUTH */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* EMAIL VERIFY */}
          <Route
            path="/verify-email/:userId/:token"
            element={<VerifyEmail />}
          />

          {/* FORGOT / RESET PASSWORD */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* PRODUCTS */}
          <Route
            path="/products"
            element={<Home />}
          />

          <Route
            path="/products/create"
            element={<CreateProduct />}
          />

        </Routes>
      </div>
    </Router>
  );
}

export default App;