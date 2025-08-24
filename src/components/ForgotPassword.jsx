import React, { useState } from "react";
/*import "./ForgotPassword.css";*/

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!email) {
      alert("Please enter your email");
      return;
    }
    // API call to send OTP
    console.log("OTP sent to:", email);
    setStep(2);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== "1234") { // just for demo
      alert("Invalid OTP");
      return;
    }
    setStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    console.log("Password reset successfully!");
    alert("Password reset successfully!");
    // redirect to login
  };

  return (
    <div className="forgot-container">
      <h1 className="app-logo">
        Khud <span>पे</span>
      </h1>

      <div className="form-wrapper">
        <h2>Forgot Password</h2>

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="submit-btn">Send OTP</button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button type="submit" className="submit-btn">Verify OTP</button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="submit" className="submit-btn">Reset Password</button>
          </form>
        )}
      </div>
    </div>
  );
}
