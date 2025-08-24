import React from "react";
import "./Login.css";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="login-container">
      {/* Logo */}
      <h1 className="app-logo">
        Khud <span>पे</span>
      </h1>

      {/* Form Wrapper with Border */}
      <div className="form-wrapper">
        {/* Tabs */}
        <div className="tab-buttons">
          <button onClick={() => navigate("/signup")}>Sign Up</button>
          <FaUserCircle className="profile-icon" />
          <button className="active">Login</button>
        </div>

        {/* Form */}
        <form className="login-form">
          <input type="text" placeholder="Username/Mobile" />
          <input type="password" placeholder="Password" />
           <Link to="/forgot-password" className="forgot-link">Forget Password?</Link>
          <button type="submit" className="submit-btn">Submit</button>
        </form>
      </div>

      {/* Google Login */}
      <button className="google-btn">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
          alt="Google"
        />
        Login with Google
      </button>

      {/* Footer */}
      <p className="footer">© Khud Pay all right reserved</p>
    </div>
  );
}
