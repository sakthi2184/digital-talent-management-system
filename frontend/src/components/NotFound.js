import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="auth-bg">
      <div style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ fontSize: "80px", marginBottom: "16px" }}>🔍</div>
        <div style={{ fontSize: "72px", fontWeight: 700, color: "var(--accent)", marginBottom: "8px" }}>404</div>
        <div style={{ fontSize: "24px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "12px" }}>
          Page Not Found
        </div>
        <div style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "32px", maxWidth: "360px", margin: "0 auto 32px" }}>
          The page you're looking for doesn't exist or has been moved.
        </div>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/dashboard" style={{
            padding: "12px 28px", borderRadius: "10px", textDecoration: "none",
            background: "linear-gradient(135deg, var(--accent), var(--accent-dark))",
            color: "white", fontSize: "14px", fontWeight: 600
          }}>Go to Dashboard</Link>
          <Link to="/login" style={{
            padding: "12px 28px", borderRadius: "10px", textDecoration: "none",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--text-primary)", fontSize: "14px", fontWeight: 600
          }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}