import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// pages
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// 🔥 protected test
import { getProtectedData } from "./services/protectedService";
import Navbar from "./components/Navbar/Navbar";
import VerifyEmail from "./pages/VerifyEmail/VerifyEmail";

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
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:userId/:token" element={<VerifyEmail />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
