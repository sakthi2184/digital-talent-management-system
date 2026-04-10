import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async e => {
    e.preventDefault();
    if (!email) { setError("Email is required"); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError("Enter a valid email address"); return; }
    setError("");
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset email sent!");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
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
          }}>🔑</div>
          <div className="auth-title">Forgot Password</div>
          <div className="auth-subtitle">
            {sent ? "Check your email inbox" : "Enter your email to receive a reset link"}
          </div>
        </div>

        {sent ? (
          <div>
            <div style={{
              background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)",
              borderRadius: "12px", padding: "20px", textAlign: "center", marginBottom: "20px"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>📧</div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#16a34a", marginBottom: "6px" }}>
                Reset email sent!
              </div>
              <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                We sent a password reset link to <strong>{email}</strong>.
                Please check your inbox and spam folder.
              </div>
            </div>
            <div style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center" }}>
              Didn't receive it?{" "}
              <button onClick={() => setSent(false)}
                style={{ background: "none", border: "none", color: "var(--accent)", cursor: "pointer", fontWeight: 500, fontSize: "13px" }}>
                Try again
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <input
              type="email"
              className="input-custom"
              placeholder="Email Address"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(""); }}
              style={{ borderColor: error ? "#dc2626" : undefined, marginBottom: "4px" }}
            />
            {error && (
              <div style={{ fontSize: "12px", color: "#dc2626", marginBottom: "12px", paddingLeft: "4px" }}>
                ⚠ {error}
              </div>
            )}
            <button type="submit" className="btn-primary-custom" disabled={loading} style={{ marginTop: "8px" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span className="spinner"></span> Sending...
                </span>
              ) : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="divider" />
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
          Remember your password?{" "}
          <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}