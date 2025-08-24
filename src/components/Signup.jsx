import React from "react";
import "./Signup.css";
import { FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="signup-container">
      {/* Logo */}
      <h1 className="app-logo">
        Khud <span>पे</span>
      </h1>

      {/* Form Wrapper with Border */}
      <div className="form-wrapper">
        {/* Tabs */}
        <div className="tab-buttons">
          <button className="active">Sign Up</button>
          <FaUserCircle className="profile-icon" />
          <button onClick={() => navigate("/login")}>Login</button>
        </div>

        {/* Form */}
        <form className="signup-form">
          <input type="text" placeholder="Mobile Number" />
          <input type="password" placeholder="Password" />
          <input type="text" placeholder="OTP" />
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

      {/* Scrolling offers */}
      <p className="scrolling-offers">Scrolling offers</p>

      {/* Footer */}
      <p className="footer">© Khud Pay all right reserved</p>
    </div>
  );
}
