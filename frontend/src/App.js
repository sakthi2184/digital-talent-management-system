import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskManager from "./pages/TaskManager";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { ToastContainer } from "react-toastify";
import NotFound from "./pages/NotFound";

const Protected = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!localStorage.getItem("token")) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{ borderRadius: "12px" }}
      />
      <Routes>
        <Route path="/" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/tasks" element={<Protected><TaskManager /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;