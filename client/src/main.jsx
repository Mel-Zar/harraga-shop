import ReactDOM from "react-dom/client";
import App from "./App";

// =========================
// 🎨 STYLES (SASS)
// =========================
import "./styles/main.scss";

// =========================
// 🛒 CART CONTEXT
// =========================
import { CartProvider } from "./context/CartProvider";

// =========================
// 🔔 TOAST NOTIFICATIONS
// =========================
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// =========================
// 🚀 RENDER APP
// =========================
ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <CartProvider>
    <App />

    <ToastContainer
      position="top-right"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
    />
  </CartProvider>
);
