import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const submit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      } else {
        localStorage.removeItem("rememberMe");
      }
      toast.success(`Welcome back, ${res.data.user.name}!`);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      setErrors({ password: err.response?.data?.message || "Invalid email or password" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{
            width: "52px", height: "52px", borderRadius: "14px",
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px"
          }}>🎯</div>
          <div className="auth-title">Welcome Back</div>
          <div className="auth-subtitle">Sign in to your account</div>
        </div>

        <form onSubmit={submit} noValidate>

          <div style={{ marginBottom: "4px" }}>
            <input
              name="email"
              type="email"
              className="input-custom"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              style={{
                marginBottom: "4px",
                borderColor: errors.email ? "#dc2626" : undefined
              }}
            />
            {errors.email && (
              <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px", paddingLeft: "4px" }}>
                ⚠ {errors.email}
              </div>
            )}
          </div>

          <div style={{ marginBottom: "4px" }}>
            <input
              name="password"
              type="password"
              className="input-custom"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              style={{
                marginBottom: "4px",
                borderColor: errors.password ? "#dc2626" : undefined
              }}
            />
            {errors.password && (
              <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px", paddingLeft: "4px" }}>
                ⚠ {errors.password}
              </div>
            )}
          </div>

          {/* Remember Me */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0 16px" }}>
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={e => setRememberMe(e.target.checked)}
              style={{ width: "16px", height: "16px", accentColor: "var(--accent)", cursor: "pointer" }}
            />
            <label htmlFor="remember" style={{ fontSize: "13px", color: "var(--text-secondary)", cursor: "pointer" }}>
              Remember me for 7 days
            </label>
          </div>

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="spinner"></span> Signing in...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          Don't have an account?{" "}
          <Link to="/" className="auth-link">Create Account</Link>
        </p>
      </div>
    </div>
  );
}