import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTheme } from "../ThemeContext";

export default function Profile() {
    const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");
  const isAdmin = user?.role === "admin";
  const auth = { headers: { Authorization: `Bearer ${token}` } };

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", password: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    axios.get("http://localhost:5000/api/auth/profile", auth)
      .then(res => {
        setProfile(res.data);
        setForm({ name: res.data.name, password: "" });
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await axios.put("http://localhost:5000/api/auth/profile",
        { name: form.name, ...(form.password && { password: form.password }) },
        auth
      );
      const updatedUser = { ...user, name: res.data.name };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      toast.success("Profile updated successfully!");
      setForm({ ...form, password: "" });
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const logout = () => { localStorage.clear(); navigate("/login"); };

  return (
    <div style={{ display: "flex" }}>

      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">Talent<span>MS</span></div>
        <nav style={{ flex: 1 }}>
          <Link to="/dashboard" className="nav-item">
            <span>📊</span> Dashboard
          </Link>
          <Link to="/tasks" className="nav-item">
            <span>✅</span> Tasks
          </Link>
          <Link to="/profile" className="nav-item active">
            <span>👤</span> Profile
          </Link>
          {isAdmin && (
            <Link to="/admin" className="nav-item">
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
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="page-title">Profile</div>

        {loading ? (
          <div style={{ color: "#64748b", fontSize: "14px" }}>Loading profile...</div>
        ) : (
          <div style={{ maxWidth: "580px" }}>

            {/* Avatar Card */}
            <div style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "20px",
              display: "flex",
              alignItems: "center",
              gap: "20px"
            }}>
              <div style={{
                width: "72px", height: "72px", borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "28px", fontWeight: 700, color: "white", flexShrink: 0
              }}>
                {profile?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                {profile?.name}
              </div>
                <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "8px" }}>
                  {profile?.email}
                </div>
                <span style={{
                  padding: "3px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
                  background: isAdmin ? "rgba(102,126,234,0.15)" : "rgba(34,197,94,0.15)",
                  color: isAdmin ? "#667eea" : "#22c55e"
                }}>
                  {profile?.role}
                </span>
              </div>
            </div>

            {/* Stats Row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "12px", marginBottom: "20px"
            }}>
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px", padding: "16px"
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Member Since</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {profile?.createdAt ? new Date(profile?.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  }) : "N/A"}
                </div>
              </div>
              <div style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px", padding: "16px"
              }}>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>Account Type</div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {isAdmin ? "🛡️ Administrator" : "👤 Standard User"}
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="form-card">
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#fff", marginBottom: "20px" }}>
                ✏️ Edit Profile
              </div>
              <form onSubmit={submit}>
                <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block" }}>
                  Full Name
                </label>
                <input
                  className="input-custom"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />

                <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block" }}>
                  Email Address
                </label>
                <input
                  className="input-custom"
                  value={profile?.email}
                  disabled
                  style={{ opacity: 0.5, cursor: "not-allowed" }}
                />

                <div style={{
                  height: "1px", background: "rgba(255,255,255,0.06)", margin: "8px 0 20px"
                }} />

                <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px", display: "block" }}>
                  New Password <span style={{ color: "#475569" }}>(leave blank to keep current)</span>
                </label>
                <input
                  type="password"
                  className="input-custom"
                  placeholder="New password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />

                <button
                  type="submit"
                  className="btn-primary-custom"
                  style={{ width: "auto", padding: "10px 28px" }}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}