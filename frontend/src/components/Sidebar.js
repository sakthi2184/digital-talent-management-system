import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";
  const auth = { headers: { Authorization: `Bearer ${token}` } };
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (isAdmin && token) {
      axios.get("http://localhost:5000/api/tasks/pending-approval", auth)
        .then(res => setPendingCount(res.data.length))
        .catch(() => {});
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path ? "nav-item active" : "nav-item";
  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Talent<span>MS</span></div>
      <nav style={{ flex: 1 }}>
        <Link to="/dashboard" className={isActive("/dashboard")}><span>📊</span> Dashboard</Link>
        <Link to="/tasks" className={isActive("/tasks")}><span>✅</span> Tasks</Link>
        <Link to="/profile" className={isActive("/profile")}><span>👤</span> Profile</Link>
        {isAdmin && (
          <Link to="/admin" className={isActive("/admin")} style={{ position: "relative" }}>
            <span>🛡️</span> Admin
            {pendingCount > 0 && (
              <span style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "#dc2626", color: "white", borderRadius: "50%",
                width: "20px", height: "20px", fontSize: "11px", fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>{pendingCount}</span>
            )}
          </Link>
        )}
      </nav>
      <div style={{ marginTop: "auto" }}>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <div className="user-info">
          <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <div>
            <div className="user-name">{user?.name}</div>
            <div className="user-role">{user?.role}</div>
          </div>
          <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
        </div>
      </div>
    </div>
  );
}