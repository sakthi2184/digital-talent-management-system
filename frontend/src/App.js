import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TaskManager from "./pages/TaskManager";
import { ToastContainer } from "react-toastify";

const Protected = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/login" />;
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
        <Route path="/dashboard" element={
          <Protected>
            <Dashboard />
          </Protected>
        } />
        <Route path="/tasks" element={
          <Protected>
            <TaskManager />
          </Protected>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;