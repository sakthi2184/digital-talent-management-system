import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({ name:"", email:"", password:"" });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/auth/register", form);
      alert("Registered Successfully");
      window.location = "/login";
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div className="d-flex vh-100 justify-content-center align-items-center bg-dark">
      <form onSubmit={submit} className="p-4 bg-white rounded shadow" style={{width:"350px"}}>
        <h3 className="text-center mb-3">Create Account</h3>

        <input name="name" className="form-control mb-2" placeholder="Name" onChange={handleChange}/>
        <input name="email" className="form-control mb-2" placeholder="Email" onChange={handleChange}/>
        <input name="password" type="password" className="form-control mb-3" placeholder="Password" onChange={handleChange}/>

        <button className="btn btn-dark w-100">Register</button>

        <p className="mt-2 text-center">
          Already have account? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}