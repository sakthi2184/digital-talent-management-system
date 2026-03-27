import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const isActive = (path) => location.pathname === path ? "nav-item active" : "nav-item";

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Talent<span>MS</span></div>

      <nav style={{ flex: 1 }}>
        <Link to="/dashboard" className={isActive("/dashboard")}>
          <span>📊</span> Dashboard
        </Link>
        <Link to="/tasks" className={isActive("/tasks")}>
          <span>✅</span> Tasks
        </Link>
        <Link to="/profile" className={isActive("/profile")}>
          <span>👤</span> Profile
        </Link>
        {isAdmin && (
          <Link to="/admin" className={isActive("/admin")}>
            <span>🛡️</span> Admin
          </Link>
        )}
      </nav>

      <div style={{ marginTop: "auto" }}>
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <span>{theme === "dark" ? "☀️" : "🌙"}</span>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
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