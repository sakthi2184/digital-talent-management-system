import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields are required");
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
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
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">Join the talent management platform</div>
        </div>

        <form onSubmit={submit}>
          <input
            name="name"
            className="input-custom"
            placeholder="Full Name"
            onChange={handleChange}
          />
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider" />

        <p style={{ textAlign: "center", fontSize: "14px", color: "#64748b" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>

      </div>
    </div>
  );
}