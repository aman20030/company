import React from "react";
import "./BrandFormModal.css";

export default function BrandFormModal({ onClose }) {
  return (
    <div className="modal-overlay-model">
      <div className="modal-content-model">
        {/* Close Button */}
        <button className="close-btn" onClick={onClose}>×</button>

        <h3>Add Brand Details</h3>

        <form className="brand-form-model">
          <label>Brand Name</label>
          <input type="text" placeholder="Enter brand name" />

          <label>Partner Since</label>
          <input type="text" placeholder="YYYY" />

          <label>Brand Image</label>
          <input type="file" />

          <button type="submit" className="submit-btn-model">Save</button>
        </form>
      </div>
    </div>
  );
}
