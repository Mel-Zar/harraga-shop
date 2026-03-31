import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

// pages
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// 🔥 protected test
import { getProtectedData } from "./services/protectedService";

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
        <nav style={{ display: "flex", gap: "20px", padding: "20px" }}>
          <h1>Harraga</h1>

          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
        </nav>

        {/* =========================
           📍 ROUTES
        ========================= */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
