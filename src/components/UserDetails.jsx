import React, { useState } from "react";
import "./UserDetailsForm.css";
import { FaUserCircle } from "react-icons/fa"; // icon import

export default function UserForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function validate() {
    const err = {};
    if (!form.firstName.trim()) err.firstName = "First name required";
    if (!form.lastName.trim()) err.lastName = "Last name required";
    if (!form.dob) err.dob = "Date of birth required";
    if (!/^[0-9]{10}$/.test(form.mobile)) err.mobile = "Enter 10 digit mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) err.email = "Enter a valid email";
    if (form.password.length < 6) err.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) err.confirmPassword = "Passwords do not match";
    return err;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    setSubmitted(true);
    if (Object.keys(v).length === 0) {
      alert("Form submitted successfully!\n" + JSON.stringify(form, null, 2));
      setForm({ firstName: "", lastName: "", dob: "", mobile: "", email: "", password: "", confirmPassword: "" });
      setSubmitted(false);
    }
  }

  return (
    <div className="uf-page">
      <form className="uf-card" onSubmit={handleSubmit} noValidate>
        
        {/* Small profile icon in top-right */}
        <div className="uf-small-icon" title="Profile">
          <FaUserCircle size={28} />
        </div>

        <h2 className="uf-title">User Details</h2>

        <div className="uf-row">
          <label className="uf-field">
            <span>First name</span>
            <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" />
            {submitted && errors.firstName && <small className="uf-error">{errors.firstName}</small>}
          </label>

          <label className="uf-field">
            <span>Last name</span>
            <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" />
            {submitted && errors.lastName && <small className="uf-error">{errors.lastName}</small>}
          </label>
        </div>

        <div className="uf-row">
          <label className="uf-field full">
            <span>Date of birth</span>
            <input type="date" name="dob" value={form.dob} onChange={handleChange} />
            {submitted && errors.dob && <small className="uf-error">{errors.dob}</small>}
          </label>

          <label className="uf-field">
            <span>Mobile</span>
            <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="10 digit mobile" inputMode="numeric" />
            {submitted && errors.mobile && <small className="uf-error">{errors.mobile}</small>}
          </label>
        </div>

        <label className="uf-field full">
          <span>Email</span>
          <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          {submitted && errors.email && <small className="uf-error">{errors.email}</small>}
        </label>

        <div className="uf-row">
          <label className="uf-field">
            <span>New password</span>
            <div className="uf-passwrap">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
              />
              <button type="button" className="uf-passbtn" onClick={() => setShowPassword((s) => !s)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {submitted && errors.password && <small className="uf-error">{errors.password}</small>}
          </label>

          <label className="uf-field">
            <span>Confirm password</span>
            <input
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              type={showPassword ? "text" : "password"}
            />
            {submitted && errors.confirmPassword && <small className="uf-error">{errors.confirmPassword}</small>}
          </label>
        </div>

        <div className="uf-actions">
          <button className="uf-submit" type="submit">Save</button>
          <button type="button" className="uf-reset" onClick={() => { 
            setForm({ firstName: "", lastName: "", dob: "", mobile: "", email: "", password: "", confirmPassword: "" });
            setErrors({});
            setSubmitted(false);
          }}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
