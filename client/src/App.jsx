
import { useEffect, lazy, Suspense } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

// =====================================================
// AUTH PAGES - LAZY LOADING
// =====================================================

const Login = lazy(() => import("./pages/Login/Login"));
const Register = lazy(() => import("./pages/Register/Register"));
const RegisterCaptcha = lazy(() => import("./pages/Register/RegisterCaptcha"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword/ResetPassword"));

// =====================================================
// PUBLIC / PRODUCT PAGES
// =====================================================

const Home = lazy(() => import("./pages/Home/Home"));
const Products = lazy(() => import("./pages/Products/Products"));
const Product = lazy(() => import("./pages/Product/Product"));

// =====================================================
// CUSTOMER SERVICE
// =====================================================

const CustomerService = lazy(() => import("./pages/CustomerService/CustomerService"));

// =====================================================
// CART / CHECKOUT
// =====================================================

const Cart = lazy(() => import("./pages/Cart/Cart"));
const Checkout = lazy(() => import("./pages/Checkout/Checkout"));

// =====================================================
// PAYMENT
// =====================================================

const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel/PaymentCancel"));

// =====================================================
// ADMIN
// =====================================================

const CreateProduct = lazy(() => import("./pages/Admin/CreateProduct"));
const Dashboard = lazy(() => import("./pages/Admin/Dashboard"));
const Orders = lazy(() => import("./pages/Admin/Orders"));
const OrderDetail = lazy(() => import("./pages/Admin/OrderDetail"));
const Users = lazy(() => import("./pages/Admin/Users"));

// =====================================================
// ACCOUNT
// =====================================================

const Profile = lazy(() => import("./pages/Account/Profile"));
const MyOrders = lazy(() => import("./pages/Account/MyOrders"));
const OrderDetails = lazy(() => import("./pages/Account/OrderDetails"));
const EditProfile = lazy(() => import("./pages/Account/EditProfile"));
const ChangePassword = lazy(() => import("./pages/Account/ChangePassword"));
const AddressBook = lazy(() => import("./pages/Account/AddressBook"));

// =====================================================
// COMPONENTS
// =====================================================

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

// =====================================================
// ROUTES
// =====================================================

import AdminRoute from "./routes/AdminRoute";
import UserRoute from "./routes/UserRoute";

// =====================================================
// SERVICES
// =====================================================

import { getProtectedData } from "./services/protectedService";

// =====================================================
// LOADING COMPONENT
// =====================================================

function PageLoader() {
  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "16px",
      }}
    >
      Loading...
    </div>
  );
}

// =====================================================
// APP LAYOUT
// =====================================================

function AppLayout() {
  const location = useLocation();
  const isCaptchaPage = location.pathname === "/register/captcha";

  return (
    <div className={`app${isCaptchaPage ? " app--captcha" : ""}`}>

      <Navbar />

      <main
        className={
          isCaptchaPage
            ? "captcha-page-layout"
            : "app-content"
        }
      >
        <Suspense fallback={<PageLoader />}>
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
        </Suspense>
      </main>

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
