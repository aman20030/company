// BrandCard.js

import React from "react";
import "./BrandCard.css";

// 👇 Hum function ko bata rahe hain ki use 'logo' aur 'name' props milenge
export default function BrandCard({ logo, name }) {
  return (
    <div className="brand-card">
      {/* 👇 Yahan hardcoded "Image" ki jagah 'logo' prop use hoga */}
       <img
        src={logo || "https://via.placeholder.com/150"}
        alt={name}
        className="brand-img"
      />

      <div className="brand-info">
        {/* 👇 Yahan hardcoded "Brand Name" ki jagah 'name' prop use hoga */}
        <h4>{name}</h4>
        <p>Active Client</p>
      </div>
    </div>
  );
}