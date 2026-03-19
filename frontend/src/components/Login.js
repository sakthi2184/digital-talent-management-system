import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ✅ ADD THIS FUNCTION (this is what I meant earlier)
  const handleLogin = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      // store token
      localStorage.setItem("token", res.data.token);

      alert(res.data.message);

      // redirect to dashboard
      navigate("/dashboard");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p>Please login to continue</p>

        <input
          type="email"
          placeholder="Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* ✅ connect button to function */}
        <button onClick={handleLogin}>Login</button>

        <p
          onClick={() => navigate("/register")}
          style={{ cursor: "pointer", marginTop: "10px" }}
        >
          Don't have an account? Register
        </p>
      </div>
    </div>
  );
}

export default Login;