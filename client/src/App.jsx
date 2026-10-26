import { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// =====================================================
// AUTH PAGES
// =====================================================

import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import RegisterCaptcha from "./pages/Register/RegisterCaptcha";
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
// CUSTOMER SERVICE
// =====================================================

import CustomerService from "./pages/CustomerService/CustomerService";

// =====================================================
// CART / CHECKOUT
// =====================================================

import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";

// =====================================================
// PAYMENT PAGES
// =====================================================

import PaymentSuccess from "./pages/PaymentSuccess/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel/PaymentCancel";

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
// APP LAYOUT
// =====================================================

function AppLayout() {
  const location = useLocation();
  const isCaptchaPage = location.pathname === "/register/captcha";

  return (
    <div className={`app${isCaptchaPage ? " app--captcha" : ""}`}>
      <Navbar />

      <div
        className={
          isCaptchaPage
            ? "captcha-page-layout"
            : "app-content"
        }
      >
        <Routes>
          {/* HOME */}
          <Route path="/" element={<Home />} />

          {/* AUTH */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/register/captcha"
            element={<RegisterCaptcha />}
          />

          {/* EMAIL VERIFICATION */}
          <Route
            path="/verify-email/:userId/:token"
            element={<VerifyEmail />}
          />

          {/* PASSWORD */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* CUSTOMER SERVICE */}
          <Route
            path="/kundservice"
            element={<CustomerService />}
          />

          {/* PRODUCTS */}
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<Product />} />

          {/* CART / CHECKOUT */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          {/* PAYMENT */}
          <Route
            path="/payment/success"
            element={<PaymentSuccess />}
          />
          <Route
            path="/payment/cancel"
            element={<PaymentCancel />}
          />

          {/* USER ACCOUNT */}
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

          {/* ADMIN */}
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
            path="/admin/products/create"
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

          {/* 404 */}
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
                <h1>404</h1>
                <p>Page not found.</p>
              </div>
            }
          />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

// =====================================================
// APP
// =====================================================

function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || token === "null" || token === "undefined") {
      return;
    }

    getProtectedData()
      .then((data) => {
        console.log("✅ PROTECTED DATA:", data);
      })
      .catch((err) => {
        console.log("❌ PROTECTED ERROR:", err.message);
      });
  }, []);

  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
