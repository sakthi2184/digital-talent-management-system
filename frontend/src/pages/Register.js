import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = "Full name is required";
    else if (form.name.length < 2) newErrors.name = "Name must be at least 2 characters";
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
      await axios.post("http://localhost:5000/api/auth/register", form);
      toast.success("Account created successfully!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setErrors({ email: err.response?.data?.message || "Registration failed" });
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
          <div className="auth-title">Create Account</div>
          <div className="auth-subtitle">Join the talent management platform</div>
        </div>

        <form onSubmit={submit} noValidate>

          <div>
            <input
              name="name"
              className="input-custom"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              style={{
                marginBottom: "4px",
                borderColor: errors.name ? "#dc2626" : undefined
              }}
            />
            {errors.name && (
              <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px", paddingLeft: "4px" }}>
                ⚠ {errors.name}
              </div>
            )}
          </div>

          <div>
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

          <div>
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

          <button
            type="submit"
            className="btn-primary-custom"
            disabled={loading}
            style={{ marginTop: "8px" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <span className="spinner"></span> Creating Account...
              </span>
            ) : "Create Account"}
          </button>
        </form>

        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}