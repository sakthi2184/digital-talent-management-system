import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard"); 

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-dark">
      <form className="p-4 bg-white rounded shadow" style={{width:"350px"}} onSubmit={submit}>
        
        <h3 className="text-center mb-3">Login</h3>

        <input
          name="email"
          className="form-control mb-2"
          placeholder="Email"
          onChange={handleChange}
        />

        <input
          name="password"
          type="password"
          className="form-control mb-3"
          placeholder="Password"
          onChange={handleChange}
        />

        <button className="btn btn-primary w-100">Login</button>

        <p className="mt-3 text-center">
          Don't have an account?{" "}
          <Link to="/">Create Account</Link>
        </p>
      </form>
    </div>
  );
}