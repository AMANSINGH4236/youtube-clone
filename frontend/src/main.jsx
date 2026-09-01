import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { router } from "./App.jsx";
import "./styles/global.css";
import {Toaster} from "react-hot-toast"

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <RouterProvider router={router} />
    <Toaster/>
  </AuthProvider>
);