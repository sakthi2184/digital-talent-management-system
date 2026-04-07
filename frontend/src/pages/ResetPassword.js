import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/auth/reset-password/${token}`)
      .then(res => {
        setTokenValid(true);
        setUserEmail(res.data.email);
      })
      .catch(() => setTokenValid(false))
      .finally(() => setVerifying(false));
  }, [token]);

  const validate = () => {
    const newErrors = {};
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (!form.confirm) newErrors.confirm = "Please confirm your password";
    else if (form.password !== form.confirm) newErrors.confirm = "Passwords do not match";
    return newErrors;
  };

  const submit = async e => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password: form.password
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrors({ password: err.response?.data?.message || "Error resetting password" });
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
          }}>🔐</div>
          <div className="auth-title">Reset Password</div>
          <div className="auth-subtitle">
            {verifying ? "Verifying your link..." :
             !tokenValid ? "Invalid or expired link" :
             success ? "Password changed!" :
             `Reset password for ${userEmail}`}
          </div>
        </div>

        {/* Verifying */}
        {verifying && (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-secondary)" }}>
            <span className="spinner" style={{ borderTopColor: "var(--accent)", borderColor: "var(--border)" }}></span>
            <span style={{ marginLeft: "10px" }}>Verifying link...</span>
          </div>
        )}

        {/* Invalid token */}
        {!verifying && !tokenValid && (
          <div>
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "20px"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>❌</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#dc2626", marginBottom: "6px" }}>
                Link expired or invalid
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                This reset link has expired or already been used. Please request a new one.
              </div>
            </div>
            <Link to="/forgot-password" className="btn-primary-custom"
              style={{ display: "block", textAlign: "center", textDecoration: "none" }}>
              Request New Link
            </Link>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={{
            background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: "12px", padding: "20px", textAlign: "center"
          }}>
            <div style={{ fontSize: "32px", marginBottom: "8px" }}>✅</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a", marginBottom: "6px" }}>
              Password reset successfully!
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Redirecting you to login...
            </div>
          </div>
        )}

        {/* Reset form */}
        {!verifying && tokenValid && !success && (
          <form onSubmit={submit} noValidate>
            <div>
              <input
                type="password"
                className="input-custom"
                placeholder="New Password"
                value={form.password}
                onChange={e => { setForm({ ...form, password: e.target.value }); setErrors({ ...errors, password: "" }); }}
                style={{ marginBottom: "4px", borderColor: errors.password ? "#dc2626" : undefined }}
              />
              {errors.password && (
                <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px", paddingLeft: "4px" }}>
                  ⚠ {errors.password}
                </div>
              )}
            </div>
            <div>
              <input
                type="password"
                className="input-custom"
                placeholder="Confirm New Password"
                value={form.confirm}
                onChange={e => { setForm({ ...form, confirm: e.target.value }); setErrors({ ...errors, confirm: "" }); }}
                style={{ marginBottom: "4px", borderColor: errors.confirm ? "#dc2626" : undefined }}
              />
              {errors.confirm && (
                <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "10px", paddingLeft: "4px" }}>
                  ⚠ {errors.confirm}
                </div>
              )}
            </div>
            <button type="submit" className="btn-primary-custom" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span className="spinner"></span> Resetting...
                </span>
              ) : "Reset Password"}
            </button>
          </form>
        )}

        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          <Link to="/login" className="auth-link">Back to Sign In</Link>
        </p>
      </div>
    </div>
  );
}