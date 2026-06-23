import ReactDOM from "react-dom/client";
import App from "./App";

import { CartProvider } from "./context/CartProvider";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <CartProvider>
    <App />
  </CartProvider>
);