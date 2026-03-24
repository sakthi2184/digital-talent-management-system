import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(`Welcome back, ${res.data.user.name}!`);
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
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
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: "22px"
          }}>🎯</div>
          <div className="auth-title">Welcome Back</div>
          <div className="auth-subtitle">Sign in to your account</div>
        </div>

        <form onSubmit={submit}>
          <input
            name="email"
            type="email"
            className="input-custom"
            placeholder="Email Address"
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            className="input-custom"
            placeholder="Password"
            onChange={handleChange}
          />

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
          Don't have an account?{" "}
          <Link to="/" className="auth-link">Create Account</Link>
        </p>

      </div>
    </div>
  );
}