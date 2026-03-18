import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

function Register() {
  const navigate = useNavigate(); // ✅ INSIDE

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = () => {
    if (name && email && password) {
      alert("Registered Successfully");
      navigate("/"); // back to login
    } else {
      alert("Fill all fields");
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-box">
        <h2>Create Account</h2>

        <input placeholder="Name" onChange={(e)=>setName(e.target.value)} />
        <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
        <input placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />

        <button onClick={handleRegister}>Register</button>

        <p onClick={() => navigate("/")} style={{cursor:"pointer"}}>
          Already have account? Login
        </p>
      </div>
    </div>
  );
}

export default Register;